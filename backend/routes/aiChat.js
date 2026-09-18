const express = require('express');
const router = express.Router();
const aiProvider = require('../services/aiProvider');
const { executeTool } = require('../services/aiTools');
const { ConversationSession } = require('../models/appointmentModels');
const jwt = require('jsonwebtoken');

// Simple In-memory IP rate limiter to prevent API abuse
const requestCounts = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 60; // 60 requests per minute

const rateLimiter = (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
  const now = Date.now();

  const record = requestCounts.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW_MS;
  } else {
    record.count += 1;
  }

  requestCounts.set(ip, record);

  if (record.count > MAX_REQUESTS_PER_MINUTE) {
    return res.status(429).json({
      error: 'Too many requests. Please wait a moment before sending more messages.'
    });
  }

  next();
};

// Optional auth token parser
const extractSessionUser = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      if (token && token !== 'admin_authenticated') {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        return decoded;
      }
    } catch (e) {
      // Ignored
    }
  }
  return null;
};

// POST /api/ai/chat
router.post('/chat', rateLimiter, async (req, res) => {
  try {
    const { message, sessionId, conversationHistory = [], context = {} } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    const sessionUser = req.body.user || extractSessionUser(req);

    // If sessionId provided, persist/update session memory
    if (sessionId) {
      try {
        const [session] = await ConversationSession.findOrCreate({
          where: { sessionId },
          defaults: {
            sessionId,
            contextData: { history: [], lastActivity: new Date() }
          }
        });

        const currentCtx = session.contextData || {};
        currentCtx.lastMessage = message;
        currentCtx.lastActivity = new Date();
        session.contextData = currentCtx;
        await session.save();
      } catch (err) {
        // Non-fatal error for session persistence
      }
    }

    const result = await aiProvider.processChat({
      message: message.trim(),
      conversationHistory,
      sessionUser,
      context
    });

    res.json(result);
  } catch (error) {
    console.error('AI Chat Router Error:', error);
    res.status(500).json({
      error: 'CareerCraft AI encountered a temporary issue. Please try again or contact support.'
    });
  }
});

// POST /api/ai/tool - Controlled server-side tool execution
router.post('/tool', async (req, res) => {
  try {
    const { toolName, args } = req.body;
    if (!toolName) {
      return res.status(400).json({ error: 'toolName is required.' });
    }

    const sessionUser = req.body.user || extractSessionUser(req);
    const result = await executeTool(toolName, args, sessionUser);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
