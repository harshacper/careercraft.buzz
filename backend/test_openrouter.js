const dotenv = require('dotenv');
dotenv.config();

console.log("OPENROUTER_API_KEY:", process.env.OPENROUTER_API_KEY ? "Present" : "Missing");
console.log("GROQ_API_KEY:", process.env.GROQ_API_KEY ? "Present" : "Missing");

async function testOpenRouter() {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        max_tokens: 2048,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Hello, respond with a short sentence.' }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    console.log("OpenRouter Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("OpenRouter Test Error:", err);
  }
}

testOpenRouter();
