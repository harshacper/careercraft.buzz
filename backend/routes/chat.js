const express = require('express');
const axios = require('axios');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an AI Career Navigator chatbot. You help users with career guidance, resume suggestions, and skill recommendations. 
          Special Tools:
          - Doc Analyzer Engine: https://doc-analyzer--manjujakanahall.replit.app/ (Use this for deep document analysis and insights).
          Context: ${JSON.stringify(context)}. Give professional, encouraging, and actionable advice. If the user asks about analyzing complex documents, refer them to our Doc Analyzer Engine.`
        },
        {
          role: 'user',
          content: message
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const responseText = response.data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
    res.json({ reply: responseText });
  } catch (error) {
    console.error("OpenRouter AI Gen Error:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "AI Service is temporarily unavailable. Please check your API key." });
  }
});

module.exports = router;
