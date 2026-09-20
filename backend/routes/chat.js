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
      reply: "I am ready to assist you with any questions. Please try sending your query again!",
      provider: 'default'
    });
  }
});

module.exports = router;
