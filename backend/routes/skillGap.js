const express = require('express');
const axios = require('axios');
const router = express.Router();
const Groq = require('groq-sdk');
const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY
});

router.post('/analyze', async (req, res) => {
  const { resumeContent, resumeFileName, jdContent, jdFileName } = req.body;

  try {
    const resumeText = Buffer.from(resumeContent || '', 'base64').toString('utf-8');
    const jdText = Buffer.from(jdContent || '', 'base64').toString('utf-8');

    const prompt = `Analyze the following resume and Job Description (JD). 
    Identify the skill gaps, provide a matching score, and calculate the estimated ATS (Applicant Tracking System) Score of the resume for different types of companies in India (Service-based, Product-based, and Startups). Also, provide a detailed plan on how the student can learn and cover these missing skills.
    
    Resume: ${resumeText}
    JD: ${jdText}
    
    Return ONLY a JSON object in this exact format, with no markdown formatting or extra text:
    {
      "overallScore": 75,
      "atsScores": [
        {"companyType": "Service-based (TCS, Infosys, Wipro)", "score": 85},
        {"companyType": "Product-based (Google, Amazon, Microsoft)", "score": 60},
        {"companyType": "Top Startups (Cred, Razorpay, Flipkart)", "score": 70}
      ],
      "skillGap": [
        {"skill": "React", "matchPercentage": 90},
        {"skill": "Node.js", "matchPercentage": 40}
      ],
      "missingSkills": [
        {"skill": "System Design", "reason": "Required for senior architecture", "diff": "Hard"},
        {"skill": "AWS", "reason": "Needed for deployment", "diff": "Medium"}
      ],
      "insights": "Your profile is strong in frontend, but needs more backend and cloud experience to be fully job-ready for this role.",
      "learningPlan": [
        {"skill": "System Design", "resources": "Read 'Designing Data-Intensive Applications', practice on LeetCode System Design.", "estimatedTime": "4 weeks"},
        {"skill": "AWS", "resources": "Take AWS Cloud Practitioner course on Udemy or Coursera.", "estimatedTime": "2 weeks"}
      ]
    }`;

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'openai/gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    let content = response.data.choices[0].message.content;
    content = content.replace(/^```json/m, '').replace(/^```/m, '').trim();
    const result = JSON.parse(content);
    res.json(result);
  } catch (error) {
    console.error('OpenRouter API Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to analyze skill gap and generate learning plan.' });
  }
});

module.exports = router;
