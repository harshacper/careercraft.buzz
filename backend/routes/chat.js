const express = require('express');
const router = express.Router();
const aiProvider = require('../services/aiProvider');

router.post('/', async (req, res) => {
  try {
    const { message, context, conversationHistory } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const result = await aiProvider.processChat({
      message: message.trim(),
      conversationHistory: Array.isArray(conversationHistory) ? conversationHistory : [],
      context: context || {}
    });

    res.json({
      reply: result.reply,
      suggestedActions: result.suggestedActions || null,
      isBookingPrompt: result.isBookingPrompt || false,
      provider: result.provider || 'default'
    });
  } catch (error) {
    console.error("Chat Router Error:", error.message);
    res.json({
      reply: "**CareerCraft** is an AI career platform helping you build ATS-optimized resumes, analyze skill gaps, and explore 100+ top company hiring portals. How can I assist your career today?",
      suggestedActions: ['Resume Builder', 'ATS Score', 'Book Appointment']
    });
  }
});

module.exports = router;

module.exports = router;
