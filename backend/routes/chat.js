const express = require('express');
const { GoogleGenAI } = require('@google/genai');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const systemPrompt = `You are an AI Career Navigator chatbot for CareerCraft. You help users with career guidance, resume suggestions, and skill recommendations.
Context: ${JSON.stringify(context)}. Give professional, encouraging, and actionable advice.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `${systemPrompt}\n\nUser: ${message}`,
    });

    const responseText = response.text || "I'm sorry, I couldn't generate a response.";
    res.json({ reply: responseText });
  } catch (error) {
    console.error("Gemini AI Error:", error.message || error);
    res.status(500).json({ error: "AI Service is temporarily unavailable. Please try again later." });
  }
});

module.exports = router;
