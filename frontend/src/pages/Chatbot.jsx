import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, User, Bot, Loader2, Sparkles, Target, Zap, Building2, 
  FileText, Calendar, RotateCcw, ArrowRight, CheckCircle2, 
  MessageSquare, Compass, ShieldCheck 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ErrorBoundary from '../components/ErrorBoundary';

const QUICK_PROMPTS = [
  { label: '🎯 ATS Resume Tips', prompt: 'How do I optimize my resume for Applicant Tracking Systems (ATS)?' },
  { label: '⚡ Skill Gap Roadmap', prompt: 'How can I do a 360° skill gap analysis for a Full Stack Developer role?' },
  { label: '🏢 Top Tech Interview Prep', prompt: 'What are the key preparation steps for tech interviews at Google, Amazon, and top startups?' },
  { label: '📅 Book 1-on-1 Consultation', prompt: 'I want to book a career consultation appointment.' },
  { label: '📄 Resume Action Words', prompt: 'Give me high-impact action verbs and metrics examples for my software engineer resume bullets.' },
  { label: '🚀 Switch to Product Companies', prompt: 'What roadmap should I follow to transition from a service-based IT company to a product-based tech firm?' }
];

const FormattedMessage = ({ content, onLinkClick }) => {
  if (!content) return null;

  // Split into lines for basic markdown parsing
  const lines = content.split('\n');

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-2" />;

        // Header 1 / 2 / 3
        if (trimmed.startsWith('### ')) {
          return <h4 key={idx} className="text-sm font-bold text-gray-900 mt-2">{trimmed.slice(4)}</h4>;
        }
        if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
          return <h3 key={idx} className="text-base font-black text-gray-900 mt-3">{trimmed.replace(/^#+\s*/, '')}</h3>;
        }

        // Bullet point
        const isBullet = trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ');
        const bulletText = isBullet ? trimmed.replace(/^[\*\-\•]\s*/, '') : trimmed;

        // Numbered list item
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        const isNumbered = Boolean(numMatch);
        const itemText = isNumbered ? numMatch[2] : bulletText;

        // Parse inline bold, code, and markdown links [text](/path)
        const parseInline = (text) => {
          const parts = [];
          let remaining = text;
          let partKey = 0;

          // Regex matching: [link text](url), **bold**, `code`
          const regex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`)/g;
          let match;
          let lastIndex = 0;

          while ((match = regex.exec(remaining)) !== null) {
            if (match.index > lastIndex) {
              parts.push(remaining.substring(lastIndex, match.index));
            }

            if (match[2] && match[3]) {
              // Markdown link
              const linkText = match[2];
              const linkUrl = match[3];
              parts.push(
                <button
                  key={partKey++}
                  onClick={() => onLinkClick(linkUrl)}
                  className="text-[#1f83c6] font-bold underline hover:text-[#20235b] transition-colors cursor-pointer inline-flex items-center gap-0.5 mx-0.5"
                >
                  {linkText}
                </button>
              );
            } else if (match[4]) {
              // Bold
              parts.push(<strong key={partKey++} className="font-bold text-gray-900">{match[4]}</strong>);
            } else if (match[5]) {
              // Inline code
              parts.push(<code key={partKey++} className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-xs font-mono">{match[5]}</code>);
            }

            lastIndex = regex.lastIndex;
          }

          if (lastIndex < remaining.length) {
            parts.push(remaining.substring(lastIndex));
          }

          return parts.length > 0 ? parts : text;
        };

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-[#1f83c6] font-bold text-xs mt-1">•</span>
              <span className="flex-1">{parseInline(bulletText)}</span>
            </div>
          );
        }

        if (isNumbered) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-[#20235b] font-bold text-xs mt-0.5 bg-blue-50 px-1.5 py-0.5 rounded-full">{numMatch[1]}</span>
              <span className="flex-1">{parseInline(numMatch[2])}</span>
            </div>
          );
        }

        return <p key={idx}>{parseInline(trimmed)}</p>;
      })}
    </div>
  );
};

const ChatbotInner = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 'msg-welcome',
      role: 'bot',
      content: "👋 **Hello! I'm your AI Career Navigator.**\n\nI can help you build an ATS-optimized resume, analyze skill gaps for target roles, explore 100+ company hiring portals, or schedule a 1-on-1 mentorship session.\n\nWhat would you like to accomplish today?",
      suggestedActions: ['Explore CareerCraft', 'Resume Builder', 'ATS Score', 'Book Appointment']
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleLinkNavigation = (path) => {
    if (typeof path === 'string' && path.startsWith('/')) {
      navigate(path);
    } else if (typeof path === 'string' && (path.startsWith('http://') || path.startsWith('https://'))) {
      window.open(path, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSendPrompt = async (promptText) => {
    const textToSend = (promptText || input).trim();
    if (!textToSend || loading) return;

    setInput('');
    const userMsgId = `user-${Date.now()}`;
    setMessages(prev => [...prev, { id: userMsgId, role: 'user', content: textToSend }]);
    setLoading(true);

    try {
      const res = await api.post('/chat', { 
        message: textToSend,
        context: "User looking for career guidance, resume suggestions, interview preparation and appointment booking.",
        conversationHistory: messages.map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.content }))
      });
      
      const reply = res.data?.reply || "I'm here to help you accelerate your tech career. What role or skill are you targeting?";
      const suggestedActions = res.data?.suggestedActions || null;

      setMessages(prev => [
        ...prev, 
        { 
          id: `bot-${Date.now()}`, 
          role: 'bot', 
          content: reply,
          suggestedActions 
        }
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      // Resilient knowledge-base fallback response
      setMessages(prev => [
        ...prev, 
        { 
          id: `bot-fb-${Date.now()}`, 
          role: 'bot', 
          content: "**CareerCraft** helps you build ATS-compliant resumes, find high-paying jobs across 100+ companies, and analyze your technical skill gaps.\n\nYou can explore our features using the links below:",
          suggestedActions: ['Resume Builder', 'ATS Score', 'Explore Companies', 'Book Appointment']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `msg-welcome-${Date.now()}`,
        role: 'bot',
        content: "💬 **Conversation cleared.** How else can I assist your career journey today?",
        suggestedActions: ['Explore CareerCraft', 'Resume Builder', 'ATS Score', 'Book Appointment']
      }
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 min-h-[calc(100vh-160px)] flex flex-col">
      {/* Header Banner */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-[#20235b] to-[#1f83c6] text-white p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">AI Career Navigator</h1>
              <span className="inline-flex items-center gap-1 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active AI
              </span>
            </div>
            <p className="text-xs md:text-sm text-blue-100 font-medium mt-0.5">
              Personalized career guidance, ATS resume insights, skill gap roadmaps & 1-on-1 mentorship.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleClearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10 cursor-pointer"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear Chat
          </button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden flex flex-col min-h-[500px]">
        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/50">
          {messages.map((msg) => (
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id} 
              className={`flex gap-3 md:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`w-9 h-9 md:w-10 md:h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-[#20235b] text-white' 
                  : 'bg-gradient-to-br from-[#20235b] to-[#1f83c6] text-white'
              }`}>
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] md:max-w-[75%] rounded-3xl p-4 md:p-5 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-[#20235b] text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 border border-gray-200/80 rounded-tl-none'
              }`}>
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed">{msg.content}</p>
                ) : (
                  <div>
                    <FormattedMessage content={msg.content} onLinkClick={handleLinkNavigation} />
                    
                    {/* Suggested Action Chips inside bot message */}
                    {Array.isArray(msg.suggestedActions) && msg.suggestedActions.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                        {msg.suggestedActions.map((action, aIdx) => (
                          <button
                            key={aIdx}
                            onClick={() => handleSendPrompt(action)}
                            className="text-xs font-bold px-3 py-1.5 bg-blue-50 text-[#1f83c6] hover:bg-[#1f83c6] hover:text-white rounded-xl border border-blue-100 transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                          >
                            <Sparkles className="w-3 h-3" />
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Typing / Loading Indicator */}
          {loading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 md:gap-4 items-center"
            >
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-gradient-to-br from-[#20235b] to-[#1f83c6] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Bot size={18} />
              </div>
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#1f83c6]" />
                <span className="text-xs font-bold text-gray-500">CareerCraft AI is formulating advice...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggested Prompts Toolbar */}
        <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-[#1f83c6]" /> Suggested:
          </span>
          {QUICK_PROMPTS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSendPrompt(item.prompt)}
              disabled={loading}
              className="shrink-0 text-xs font-semibold px-3 py-1.5 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-[#1f83c6] border border-gray-200 hover:border-blue-200 rounded-full transition-all cursor-pointer disabled:opacity-50"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-gray-200">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt();
            }} 
            className="relative flex items-center"
          >
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about resumes, ATS scoring, interview prep, or type 'Book Appointment'..." 
              className="w-full bg-gray-50 rounded-2xl py-4 pl-5 pr-14 outline-none border border-gray-200 focus:border-[#1f83c6] focus:bg-white focus:ring-4 focus:ring-[#1f83c6]/15 transition-all text-sm font-medium text-gray-800 shadow-inner"
              disabled={loading}
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim()}
              className="absolute right-2.5 bg-gradient-to-r from-[#20235b] to-[#1f83c6] text-white p-3 rounded-xl hover:opacity-90 disabled:opacity-40 transition-all shadow-md cursor-pointer flex items-center justify-center"
              aria-label="Send Message"
            >
              <Send size={16} />
            </button>
          </form>
          <p className="text-center text-[11px] text-gray-400 font-medium mt-2">
            CareerCraft AI provides tailored advice grounded in verified hiring standards.
          </p>
        </div>
      </div>
    </div>
  );
};

const Chatbot = () => {
  return (
    <ErrorBoundary>
      <ChatbotInner />
    </ErrorBoundary>
  );
};

export default Chatbot;
