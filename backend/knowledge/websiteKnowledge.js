/**
 * CareerCraft Ground-Truth Knowledge Base
 * Structured factual source for CareerCraft AI assistant to answer user inquiries accurately.
 */

const websiteKnowledge = {
  about: {
    name: "CareerCraft (CareerCraft.buzz)",
    tagline: "Scale Your Future with AI-Powered Career Intelligence",
    description: "CareerCraft is a premier career development and acceleration platform designed for students, fresh graduates, and experienced professionals. It provides AI-driven tools including intelligent resume generation, ATS scoring, 360° skill gap analysis, a directory of 100+ top tech companies, and 1-on-1 expert career consultation appointments.",
    targetAudience: "College students, entry-level job hunters, software engineers, product managers, and career switchers looking to break into leading product, service, or startup tech firms.",
    officialWebsite: "https://careercraft.buzz"
  },

  features: [
    {
      id: "resume-builder",
      title: "AI Resume Intelligence & Builder",
      route: "/resume",
      description: "An interactive resume creator that crafts ATS-optimized, high-impact resumes. Features AI prompt generation for role-specific achievements, structured sections (Summary, Experience, Education, Skills, Projects, Awards), and export to high-resolution A4 PDF.",
      keyCapabilities: [
        "One-click AI Summary generation based on your target role, skills, and experience",
        "Tailor resume for specific target companies (e.g., Google, Adobe, Amazon, Microsoft)",
        "Align resume content directly with any Job Description (JD) text",
        "High-definition PDF download with customizable typography and spacing",
        "Pre-built industry-standard sample data for immediate customization"
      ]
    },
    {
      id: "ats-analyzer",
      title: "ATS Resume Analyzer & Keyword Scorer",
      route: "/resume",
      description: "Upload your existing PDF or DOCX resume to instantly test Applicant Tracking System (ATS) compatibility.",
      keyCapabilities: [
        "Calculates overall ATS match percentage",
        "Identifies missing keywords and industry-standard skills",
        "Provides actionable improvement tips and bullet point strengthening suggestions",
        "Provides benchmark scores for Service-based, Product-based, and Startup companies"
      ]
    },
    {
      id: "skill-gap",
      title: "360° Skill Gap Roadmap",
      route: "/resume",
      description: "Deep AI comparison between candidate resumes and specific target Job Descriptions to pinpoint exact missing technologies.",
      keyCapabilities: [
        "Detects missing hard & soft skills",
        "Evaluates role compatibility match percentages",
        "Generates customized week-by-week learning roadmaps with recommended books, courses, and project ideas"
      ]
    },
    {
      id: "companies",
      title: "Top 100+ Companies & Job Directory",
      route: "/companies",
      description: "Curated directory of over 100 top employer companies with direct links to official career portals and instant resume tailoring.",
      categories: [
        "Big Tech (Google, Microsoft, Amazon, Apple, Meta, Netflix, Tesla, NVIDIA)",
        "IT & Software Giants (TCS, Infosys, Wipro, Oracle, IBM, Cognizant, Accenture)",
        "High-Growth Startups & Fintech (Cred, Razorpay, Flipkart, Swiggy, Zomato, PhonePe)"
      ],
      keyCapabilities: [
        "Search companies by name or industry tag",
        "Direct link to official career pages to apply for open roles",
        "One-click 'Create Tailored Resume' button to pre-fill the AI builder with the target company's culture and stack"
      ]
    },
    {
      id: "appointments",
      title: "1-on-1 Career Consultation & Expert Booking",
      route: "/chat",
      description: "Book live 1-on-1 video consultations with experienced career mentors and resume reviewers.",
      servicesOffered: [
        "Resume Consultation & Review (30 min)",
        "1-on-1 Career Strategy & Roadmap (45 min)",
        "Mock Technical & HR Interview (60 min)",
        "ATS Optimization & Job Match Advice (30 min)",
        "Skill Gap Analysis & Transition Plan (45 min)"
      ]
    }
  ],

  pricing: {
    overview: "CareerCraft offers accessible, student-friendly pricing with both pay-as-you-go and unlimited monthly options.",
    plans: [
      {
        id: "free",
        name: "Free Tier",
        price: "₹0",
        billing: "Free forever",
        features: [
          "Explore 100+ tech companies directory",
          "Access basic career chat advisor",
          "Test ATS scoring preview",
          "Preview resume layouts"
        ]
      },
      {
        id: "single",
        name: "Single Resume Unlock",
        price: "₹50",
        billing: "One-time payment per download",
        features: [
          "Unlock download of 1 resume draft",
          "High-resolution PDF export",
          "All resume templates and font options included",
          "No monthly recurring charges"
        ]
      },
      {
        id: "monthly",
        name: "Monthly Unlimited Pro",
        price: "₹150",
        billing: "Billed monthly",
        popular: true,
        features: [
          "Unlimited resume downloads & revisions",
          "Unlimited AI Resume builder & suggestions",
          "Full ATS Analyzer & scoring breakdowns",
          "Priority AI career chatbot answers",
          "Pro Member badge on dashboard"
        ]
      }
    ],
    paymentMethods: [
      "UPI (Instant QR code scan or 12-digit UTR verification)",
      "Credit / Debit Card (Visa, Mastercard, RuPay)",
      "Netbanking (All major Indian banks: SBI, HDFC, ICICI, Axis, Kotak)"
    ],
    pricingUrl: "/payment"
  },

  authentication: {
    signupUrl: "/signup",
    loginUrl: "/login",
    dashboardUrl: "/dashboard",
    methods: [
      "Standard Email & Password Registration (with full name, phone number, gender, qualification, and role)",
      "One-click Google Sign-in integration"
    ],
    accountBenefits: [
      "Save your career profile and active resume credits",
      "Track active subscriptions and past login activities",
      "Manage booked consultation appointments"
    ]
  },

  support: {
    email: "support@careercraft.buzz",
    phone: "+91 93802 68436",
    hours: "Monday to Saturday, 9:00 AM - 6:00 PM IST",
    location: "Bangalore, Karnataka, India",
    responseTimes: "Inquiries via chat are instant; email inquiries are typically answered within 2-4 hours."
  },

  faqs: [
    {
      q: "What is CareerCraft?",
      a: "CareerCraft (CareerCraft.buzz) is an AI-powered career navigator that helps job seekers build ATS-friendly resumes, identify skill gaps against job descriptions, explore top companies, and book 1-on-1 career consultation appointments."
    },
    {
      q: "How does the AI Resume Builder work?",
      a: "Navigate to the Resume tab (/resume), select 'AI Builder', enter your target role, experience, and skills. You can also paste a specific company name or Job Description to have the AI customize the entire resume. You can download the generated resume in high-resolution PDF format."
    },
    {
      q: "How can I check my ATS score?",
      a: "Go to /resume and select the 'ATS Analyzer' tab. Upload your resume PDF or DOCX to see your score, missing keywords, and specific tips to pass automated ATS filters."
    },
    {
      q: "How much does CareerCraft cost?",
      a: "Browsing companies and asking career questions is free. To download high-resolution resumes, you can choose Single Resume Unlock for ₹50 or Monthly Unlimited Pro for ₹150/month."
    },
    {
      q: "How do I book an appointment?",
      a: "You can book directly through me (CareerCraft AI)! Simply select 'Book Appointment' or tell me what service and date you prefer. You can also view available slots, confirm your booking, reschedule, or cancel at any time."
    },
    {
      q: "Is my payment safe?",
      a: "Yes. CareerCraft implements 100% encrypted, secure transactions supporting UPI, Cards, and Netbanking."
    }
  ]
};

/**
 * Helper to query relevant facts by topic
 */
function getKnowledge(topic) {
  if (!topic || topic === 'all') return websiteKnowledge;
  const t = topic.toLowerCase();

  if (t.includes('price') || t.includes('cost') || t.includes('plan') || t.includes('sub')) {
    return { pricing: websiteKnowledge.pricing };
  }
  if (t.includes('resume') || t.includes('builder') || t.includes('pdf')) {
    return { resumeBuilder: websiteKnowledge.features.find(f => f.id === 'resume-builder') };
  }
  if (t.includes('ats') || t.includes('score') || t.includes('keyword')) {
    return { atsAnalyzer: websiteKnowledge.features.find(f => f.id === 'ats-analyzer') };
  }
  if (t.includes('skill') || t.includes('gap') || t.includes('roadmap')) {
    return { skillGap: websiteKnowledge.features.find(f => f.id === 'skill-gap') };
  }
  if (t.includes('company') || t.includes('job') || t.includes('hiring')) {
    return { companies: websiteKnowledge.features.find(f => f.id === 'companies') };
  }
  if (t.includes('appointment') || t.includes('consult') || t.includes('book') || t.includes('interview')) {
    return { appointments: websiteKnowledge.features.find(f => f.id === 'appointments') };
  }
  if (t.includes('contact') || t.includes('support') || t.includes('help') || t.includes('email') || t.includes('phone')) {
    return { support: websiteKnowledge.support };
  }
  if (t.includes('auth') || t.includes('login') || t.includes('signup') || t.includes('register')) {
    return { authentication: websiteKnowledge.authentication };
  }

  return websiteKnowledge;
}

module.exports = {
  websiteKnowledge,
  getKnowledge
};
