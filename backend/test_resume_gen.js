const dotenv = require('dotenv');
dotenv.config();

const systemPrompt = `You are an AI Career Navigator chatbot for CareerCraft. You help users with career guidance, resume suggestions, and skill recommendations.
Context: "Structured Resume Generation". Give professional, encouraging, and actionable advice.`;

const userDetails = {
  name: "John Doe",
  role: "Full Stack Engineer",
  experience: "2 years at TechCorp, built React apps",
  skills: "React, Node.js, JavaScript, Express",
  summary: "Enthusiastic engineer",
  github: "https://github.com/johndoe",
  cgpa: "9.0",
  coursework: "Data Structures, Database Management",
  projects: "Portfolio Website: Built using React and hosted on Vercel.",
  awards: "Best Employee of the Month"
};

const prompt = `Create a modern, ATS-friendly professional resume for a candidate. 
IMPORTANT: Return ONLY a JSON object with the following structure:
{
  "name": "...",
  "summary": "...",
  "targetRole": "...",
  "contact": { "address": "...", "phone": "...", "email": "...", "linkedin": "...", "github": "..." },
  "workHistory": [ { "date": "...", "role": "...", "company": "...", "location": "...", "points": ["...", "..."] } ],
  "education": [ { "date": "...", "degree": "...", "school": "...", "location": "...", "coursework": "...", "grade": "..." } ],
  "skills": ["...", "..."],
  "projects": [ { "name": "...", "date": "...", "description": "..." } ],
  "awards": ["...", "..."]
}
Candidate Info:
Name: ${userDetails.name}
Target Role: ${userDetails.role}
Experience: ${userDetails.experience}
Skills: ${userDetails.skills}
Provided Summary: ${userDetails.summary || "Generate one based on info."}
GitHub: ${userDetails.github || ""}
Education CGPA/Grade: ${userDetails.cgpa || ""}
Education Coursework: ${userDetails.coursework || ""}
Projects: ${userDetails.projects || ""}
Awards: ${userDetails.awards || ""}

TAILORING EXPECTATIONS:
`;

async function testResumeGeneration() {
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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    const reply = data.choices[0].message.content;
    console.log("=== RAW REPLY ===");
    console.log(reply);
    console.log("=================");

    const match = reply.match(/\{[\s\S]*\}/);
    if (!match) {
      console.log("NO JSON MATCH FOUND!");
    } else {
      const jsonStr = match[0];
      console.log("=== EXTRACTED JSON ===");
      console.log(jsonStr);
      console.log("======================");
      const parsed = JSON.parse(jsonStr);
      console.log("PARSED SUCCESSFUL:", parsed.name);
    }
  } catch (err) {
    console.error("Test Error:", err);
  }
}

testResumeGeneration();
