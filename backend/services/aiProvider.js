/**
 * Unified AI Provider Engine for CareerCraft AI
 * Orchestrates LLM reasoning, website knowledge grounding, and controlled tool execution.
 */

const axios = require('axios');
const Groq = require('groq-sdk');
const { toolDefinitions, executeTool } = require('./aiTools');
const { websiteKnowledge } = require('../knowledge/websiteKnowledge');

const SYSTEM_INSTRUCTIONS = `You are "CareerCraft AI", the official AI customer support and appointment booking assistant for CareerCraft (CareerCraft.buzz).

PERSONALITY & TONE:
- Friendly, professional, concise, encouraging, and career-focused.
- Helpful to students, job seekers, and career switchers.
- Never pretend to be a human employee; always identify as CareerCraft AI.
- Grounded strictly in real CareerCraft features. Never invent prices, plans, or features not in knowledge base.
- If information is not available, state that clearly and offer support contact details.

CAREERCRAFT WEBSITE KNOWLEDGE SUMMARY:
- Platform: CareerCraft.buzz (Scale Your Future with AI Career Intelligence).
- Features:
  1. AI Resume Builder (/resume) - tailored for specific target companies & JDs, high-res PDF downloads.
  2. ATS Resume Analyzer (/resume) - percentage score, missing keywords, company benchmark breakdown.
  3. 360° Skill Gap Roadmap (/resume) - week-by-week learning plan with courses & books.
  4. Top 100+ Companies Directory (/companies) - Big Tech, IT & Startups with direct job links.
  5. Pricing (/payment) - Free Tier (₹0), Single Resume Unlock (₹50 one-time), Monthly Unlimited Pro (₹150/mo).
  6. 1-on-1 Consultation Appointments - Resume review (30m), Career Strategy (45m), Mock Interview (60m), ATS Optimization (30m), Skill Gap Plan (45m).
  7. Auth (/login, /signup) - Email/Password & Google Sign-In.
  8. Support: support@careercraft.buzz, +91 93802 68436, Mon-Sat 9AM-6PM IST.

APPOINTMENT BOOKING WORKFLOW:
1. Ask what service they need (or list the 5 consultation options).
2. Ask for preferred date (YYYY-MM-DD) and check available slots using get_available_slots.
3. Show available slots to the user.
4. Collect customer name, email, and phone (if not already logged in/provided).
5. Once slot and details are selected, call book_appointment.
6. Provide a clear confirmation message with service, date, time, customer name, and status.

Keep responses concise, markdown formatted, and provide links (e.g. [Resume Builder](/resume), [Pricing](/payment), [Companies](/companies)) where helpful.`;

class AIProvider {
  constructor() {
    this.openRouterKey = process.env.OPENROUTER_API_KEY || '';
    this.groqKey = process.env.GROQ_API_KEY || '';
    this.geminiKey = process.env.GEMINI_API_KEY || '';
    this.customApiKey = process.env.AI_API_KEY || '';
    this.customModel = process.env.AI_MODEL || '';
  }

  /**
   * Process a chat session message with context and tool calling
   */
  async processChat({ message, conversationHistory = [], sessionUser = null, context = {} }) {
    // 1. Check for deterministic intent shortcuts (for ultra-fast and reliable responses)
    const quickIntent = this.handleQuickIntents(message, sessionUser, context);
    if (quickIntent) {
      return quickIntent;
    }

    // Build message thread
    const messages = [
      { role: 'system', content: SYSTEM_INSTRUCTIONS }
    ];

    if (sessionUser) {
      messages.push({
        role: 'system',
        content: `Current User Info: Name: "${sessionUser.fullName || sessionUser.name}", Email: "${sessionUser.email}", Role: "${sessionUser.role || 'Aspiring Professional'}". The user is logged in, so you do not need to repeatedly ask for their name and email.`
      });
    }

    // Add recent conversation history (max 8 messages for memory context)
    const recent = conversationHistory.slice(-8);
    for (const msg of recent) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    }

    // Add current user message
    messages.push({ role: 'user', content: message });

    // 2. Try Groq first for ultra-fast response (~200ms latency)
    if (this.groqKey) {
      try {
        const groq = new Groq({ apiKey: this.groqKey });
        const chatCompletion = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages,
          temperature: 0.5,
          max_tokens: 800
        });

        const reply = chatCompletion.choices?.[0]?.message?.content;
        if (reply) {
          return {
            reply,
            provider: 'groq',
            model: 'llama-3.3-70b-versatile'
          };
        }
      } catch (err) {
        console.warn('Groq chat completion failed, trying OpenRouter fallback...', err.message);
      }
    }

    // 3. Try OpenRouter as fallback
    if (this.openRouterKey || this.customApiKey) {
      try {
        const apiKey = this.customApiKey || this.openRouterKey;
        const model = this.customModel || 'google/gemini-2.5-flash';

        const completion = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model,
            messages,
            temperature: 0.6,
            max_tokens: 800
          },
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 5000
          }
        );

        const reply = completion.data?.choices?.[0]?.message?.content;
        if (reply) {
          return {
            reply,
            provider: 'openrouter',
            model
          };
        }
      } catch (err) {
        console.warn('OpenRouter chat completion failed:', err.response?.data?.error || err.message);
      }
    }

    // 4. Fallback Rule-Based Grounded Engine (100% resilient)
    return this.fallbackEngine(message, sessionUser);
  }

  /**
   * Fast NLP matching for instant actions
   */
  handleQuickIntents(message, sessionUser, context) {
    const raw = (message || '').toLowerCase().trim();

    // Quick action: Explore CareerCraft
    if (raw === 'explore careercraft' || raw === 'explore') {
      return {
        reply: `**Welcome to CareerCraft!** 🚀\n\nCareerCraft is your all-in-one AI career development platform. Here is what you can do:\n\n- 📄 **[AI Resume Builder](/resume)**: Build ATS-optimized resumes tailored for high-paying roles.\n- 🎯 **[ATS Score Analyzer](/resume)**: Scan your resume and get immediate keyword optimization.\n- ⚡ **[360° Skill Gap Roadmap](/resume)**: Compare your skills with target job descriptions.\n- 🏢 **[Top 100+ Companies](/companies)**: Explore verified career portals from Big Tech to top startups.\n- 📅 **Book a 1-on-1 Consultation**: Get personalized mentorship from career advisors.\n\nWhat would you like to explore today?`,
        suggestedActions: ['Resume Builder', 'ATS Score', 'Skill Gap Analysis', 'Job Search', 'Book Appointment']
      };
    }

    // Quick action: Pricing
    if (raw === 'pricing' || raw === 'how much does it cost' || raw === 'plans') {
      return {
        reply: `**CareerCraft Pricing Plans:**\n\n- **Free Tier (₹0)**: Explore 100+ company directories, career advice chat, and ATS preview.\n- **Single Resume Unlock (₹50)**: One-time payment to download 1 high-resolution resume PDF.\n- **Monthly Unlimited Pro (₹150/mo)**: Unlimited resume downloads, full ATS scoring, and priority career AI.\n\n👉 View all plans on our **[Pricing Page](/payment)**.`,
        suggestedActions: ['Resume Builder', 'Book Appointment', 'Contact Support']
      };
    }

    // Quick action: Resume Builder
    if (raw === 'resume builder' || raw === 'how to build resume') {
      return {
        reply: `**AI Resume Intelligence & Builder** 📄\n\nOur builder allows you to craft high-impact, ATS-friendly resumes in minutes:\n\n1. Go to the **[Resume Builder](/resume)**.\n2. Choose **AI Builder**.\n3. Enter your target role, experience, and skills.\n4. Optionally enter a target company (e.g. Google, Amazon) or paste a Job Description to auto-tailor your resume.\n5. Click **Download PDF** to export your formatted resume!\n\nWould you like to start building or book a resume review session?`,
        suggestedActions: ['Go to Resume Builder', 'Book Appointment', 'ATS Score']
      };
    }

    // Quick action: ATS Score
    if (raw === 'ats score' || raw === 'check ats') {
      return {
        reply: `**ATS Resume Analyzer** 🎯\n\nApplicant Tracking Systems filter out up to 75% of resumes before a human recruiter sees them. With CareerCraft:\n\n1. Visit the **[ATS Analyzer](/resume)**.\n2. Upload your existing resume (.pdf or .docx).\n3. Receive your overall score, missing keywords, and actionable tips to boost your interview callbacks!\n\nWould you like help preparing your resume?`,
        suggestedActions: ['Test ATS Score', 'Resume Builder', 'Book Appointment']
      };
    }

    // Quick action: Skill Gap
    if (raw === 'skill gap analysis' || raw === 'skill gap') {
      return {
        reply: `**360° Skill Gap Roadmap** ⚡\n\nOur AI compares your resume directly against the job description for your dream role:\n\n- Identifies missing technical and soft skills\n- Calculates match percentages for Service-based, Product-based, and Startup companies\n- Delivers a personalized week-by-week learning roadmap with book and course recommendations!\n\nCheck it out now in the **[Resume Hub](/resume)**.`,
        suggestedActions: ['Resume Hub', 'Job Search', 'Book Appointment']
      };
    }

    // Quick action: Job Search / Companies
    if (raw === 'job search' || raw === 'explore companies' || raw === 'companies') {
      return {
        reply: `**Top 100+ Companies Directory** 🏢\n\nExplore curated career opportunities across:\n\n- **Big Tech**: Google, Microsoft, Apple, Amazon, Meta, Netflix, Tesla, NVIDIA\n- **IT & Software**: TCS, Infosys, Wipro, Oracle, IBM, Accenture\n- **Top Startups**: Flipkart, Cred, Razorpay, Swiggy, Zomato\n\n👉 Browse all opportunities on the **[Companies Page](/companies)**! You can even generate a resume pre-customized for any company with a single click.`,
        suggestedActions: ['Explore Companies', 'Resume Builder', 'Book Appointment']
      };
    }

    // Quick action: Contact Support
    if (raw === 'contact support' || raw === 'support' || raw === 'help') {
      return {
        reply: `**CareerCraft Support & Contact** 💬\n\nWe are here to help you succeed!\n\n- 📧 **Email**: \`${websiteKnowledge.support.email}\`\n- 📞 **Phone**: \`${websiteKnowledge.support.phone}\`\n- 🕒 **Hours**: ${websiteKnowledge.support.hours}\n- 📍 **Location**: ${websiteKnowledge.support.location}\n\nYou can also book a live 1-on-1 consultation session with our advisors right here in the chat!`,
        suggestedActions: ['Book Appointment', 'Explore CareerCraft', 'Pricing']
      };
    }

    // Quick action: Start Booking Appointment
    if (raw === 'book appointment' || raw === 'i want to book an appointment' || raw === 'appointment') {
      return {
        reply: `**Book a 1-on-1 Career Consultation** 📅\n\nI can help you schedule a live consultation with a career expert. Which service would you like to discuss?\n\n1. **Resume Consultation & Review** (30 mins)\n2. **1-on-1 Career Strategy & Roadmap** (45 mins)\n3. **Mock Technical & HR Interview** (60 mins)\n4. **ATS Optimization & Job Match Advice** (30 mins)\n5. **Skill Gap Analysis & Transition Plan** (45 mins)\n\nPlease select an option below or tell me your preferred service and date!`,
        isBookingPrompt: true,
        suggestedActions: [
          'Resume Consultation (30m)',
          'Career Strategy (45m)',
          'Mock Interview (60m)',
          'ATS Optimization (30m)',
          'Skill Gap Plan (45m)'
        ]
      };
    }

    return null;
  }

  /**
   * Deterministic Fallback Engine
   */
  fallbackEngine(message, sessionUser) {
    const raw = (message || '').toLowerCase();

    if (raw.includes('what is careercraft') || raw.includes('who are you') || raw.includes('about')) {
      return {
        reply: `**CareerCraft** is an AI-powered career platform designed to help students, developers, and professionals land their dream jobs. We provide AI resume generation, ATS scoring, skill gap analysis, a 100+ company directory, and 1-on-1 expert consultation appointments. What would you like to explore?`,
        suggestedActions: ['Resume Builder', 'ATS Score', 'Explore Companies', 'Book Appointment']
      };
    }

    if (raw.includes('appointment') || raw.includes('book') || raw.includes('consultation') || raw.includes('mentor')) {
      return {
        reply: `I can help you schedule an appointment! We offer 1-on-1 sessions for **Resume Consultation**, **Career Strategy**, **Mock Interviews**, **ATS Advice**, and **Skill Gap Planning**.\n\nWhat service and date would you prefer?`,
        isBookingPrompt: true,
        suggestedActions: ['Book Appointment', 'Resume Consultation (30m)', 'Mock Interview (60m)']
      };
    }

    if (raw.includes('resume') || raw.includes('cv') || raw.includes('builder')) {
      return {
        reply: `CareerCraft can help you create, optimize, and tailor your resume for top tech companies. Visit our **[Resume Builder](/resume)** to create ATS-friendly resumes or upload your current resume to the **ATS Analyzer**. Would you also like to book a 1-on-1 resume audit?`,
        suggestedActions: ['Resume Builder', 'ATS Score', 'Book Appointment']
      };
    }

    return {
      reply: `I'm here to help you navigate your career with CareerCraft! You can ask me about our **Resume Builder**, **ATS Score Analyzer**, **Skill Gap Roadmap**, **Top 100+ Companies Directory**, **Pricing**, or **Book a 1-on-1 Consultation Appointment**.\n\nHow can I assist you today?`,
      suggestedActions: ['Explore CareerCraft', 'Resume Builder', 'Book Appointment', 'Contact Support']
    };
  }
}

module.exports = new AIProvider();
