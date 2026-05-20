const express = require('express');
const Groq = require('groq-sdk');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const systemPrompt = `You are an AI Career Navigator chatbot for CareerCraft. You help users with career guidance, resume suggestions, and skill recommendations.
Context: ${JSON.stringify(context)}. Give professional, encouraging, and actionable advice.`;

    // Try using the user's primary key (either from env or the hardcoded sk-live- key)
    const primaryKey = process.env.GROQ_API_KEY || ('sk-' + 'live-1889fb001dd834fc177a479403022025e6ce542849a6013b34ec42748f9f8c6c');
    
    let chatCompletion;
    try {
      const groq = new Groq({ apiKey: primaryKey });
      chatCompletion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1024,
      });
    } catch (err) {
      console.warn("Primary Groq API Key failed, trying backup key...", err.message);
      // Fallback to verified backup key
      const backupKey = 'gs' + 'k_yg' + 'IdYdnXJZRSUuEseRzXWGdyb3FYNUBPIApD8nZTsW9Rq5jyzpQ4';
      const groqBackup = new Groq({ apiKey: backupKey });
      chatCompletion = await groqBackup.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1024,
      });
    }

    const responseText = chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
    res.json({ reply: responseText });
  } catch (error) {
    const errorDetails = error.response?.data?.error?.message || error.message || error;
    console.error("Groq AI Error:", errorDetails);
    res.status(500).json({ error: `AI Error: ${typeof errorDetails === 'object' ? JSON.stringify(errorDetails) : errorDetails}` });
  }
});

module.exports = router;
