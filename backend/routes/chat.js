const express = require('express');
const Groq = require('groq-sdk');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const chatCompletion = await groq.chat.completions.create({
      model: 'llama3-70b-8192',
      messages: [
        {
          role: 'system',
          content: `You are an AI Career Navigator chatbot for CareerCraft. You help users with career guidance, resume suggestions, and skill recommendations.
          Context: ${JSON.stringify(context)}. Give professional, encouraging, and actionable advice.`
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
    res.json({ reply: responseText });
  } catch (error) {
    console.error("Groq AI Error:", error.message || error);
    res.status(500).json({ error: "AI Service is temporarily unavailable. Please try again later." });
  }
});

module.exports = router;
