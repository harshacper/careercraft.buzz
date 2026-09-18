const dotenv = require('dotenv');
dotenv.config();
const Groq = require('groq-sdk');

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

async function testGroq() {
  const primaryKey = process.env.GROQ_API_KEY || ('sk-' + 'live-1889fb001dd834fc177a479403022025e6ce542849a6013b34ec42748f9f8c6c');
  console.log("Primary Key prefix:", primaryKey.substring(0, 10));
  
  try {
    console.log("Attempting Groq with primary key...");
    const groq = new Groq({ apiKey: primaryKey });
    const chatCompletion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });
    console.log("Primary Key Success!");
    console.log("Finish Reason:", chatCompletion.choices[0]?.finish_reason);
    console.log("Length:", chatCompletion.choices[0]?.message?.content?.length);
    console.log("Content ending:", chatCompletion.choices[0]?.message?.content?.slice(-100));
  } catch (err) {
    console.error("Primary Groq Error:", err.message);
    
    // Backup
    try {
      const backupKey = 'gs' + 'k_yg' + 'IdYdnXJZRSUuEseRzXWGdyb3FYNUBPIApD8nZTsW9Rq5jyzpQ4';
      console.log("Attempting Groq with backup key...");
      const groqBackup = new Groq({ apiKey: backupKey });
      const chatCompletion = await groqBackup.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1024,
      });
      console.log("Backup Key Success!");
      console.log("Finish Reason:", chatCompletion.choices[0]?.finish_reason);
      console.log("Length:", chatCompletion.choices[0]?.message?.content?.length);
      console.log("Content ending:", chatCompletion.choices[0]?.message?.content?.slice(-100));
    } catch (backErr) {
      console.error("Backup Groq Error:", backErr.message);
    }
  }
}

testGroq();
