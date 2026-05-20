const express = require('express');
const axios = require('axios');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY || 'sk-live-1889fb001dd834fc177a479403022025e6ce542849a6013b34ec42748f9f8c6c';

    const systemPrompt = `You are an AI Career Navigator chatbot for CareerCraft. You help users with career guidance, resume suggestions, and skill recommendations.
Context: ${JSON.stringify(context)}. Give professional, encouraging, and actionable advice.`;

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }],
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
      }
    );

    const responseText = response.data?.content?.[0]?.text || "I'm sorry, I couldn't generate a response.";
    res.json({ reply: responseText });
  } catch (error) {
    console.error("Anthropic Claude API Error:", error.response?.data || error.message || error);
    res.status(500).json({ error: "AI Service is temporarily unavailable. Please try again later." });
  }
});

module.exports = router;
