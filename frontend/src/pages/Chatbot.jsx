import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, User, Bot, Loader2, Sparkles, Target, Zap, Building2, 
  FileText, Calendar, RotateCcw, ArrowRight, CheckCircle2, 
  MessageSquare, Compass, ShieldCheck, Copy, Check 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ErrorBoundary from '../components/ErrorBoundary';

const PROMPT_SUGGESTIONS = [
  { label: '🇮🇳 Jobs in India', prompt: 'What are the most in-demand tech and non-tech jobs present in India right now, along with salary expectations?' },
  { label: '🚀 Full Stack Roadmap', prompt: 'Create a comprehensive 6-month learning roadmap to become a Job-Ready Full Stack Developer (React, Node, Cloud).' },
  { label: '🎯 ATS Resume Secrets', prompt: 'How do Applicant Tracking Systems (ATS) rank resumes and what exact keywords and formats guarantee a high score?' },
  { label: '💻 Coding Interview Patterns', prompt: 'What are the top 10 algorithmic problem patterns asked in FAANG and high-growth startup coding rounds?' },
  { label: '🏢 Service to Product Switch', prompt: 'What is the exact strategy and portfolio required to transition from a service-based IT company (like TCS, Infosys) to a high-paying product company?' },
  { label: '⚡ System Design Basics', prompt: 'Explain the core system design concepts every software engineer must know for backend interviews.' }
];

const FormattedMessage = ({ content, onLinkClick }) => {
  const [copiedCode, setCopiedCode] = useState(null);

  if (!content) return null;

  const handleCopy = (codeText, idx) => {
    try {
      navigator.clipboard.writeText(codeText);
      setCopiedCode(idx);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (e) {}
  };

  // Split by code blocks first
  const segments = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 text-sm md:text-base leading-relaxed text-gray-800">
      {segments.map((segment, sIdx) => {
        if (segment.startsWith('```') && segment.endsWith('```')) {
          const rawCode = segment.slice(3, -3);
          const firstLineBreak = rawCode.indexOf('\n');
          const language = firstLineBreak > 0 ? rawCode.slice(0, firstLineBreak).trim() : '';
          const codeBody = firstLineBreak > 0 ? rawCode.slice(firstLineBreak + 1) : rawCode;

          return (
            <div key={sIdx} className="my-3 rounded-2xl bg-gray-900 text-gray-100 overflow-hidden border border-gray-800 shadow-lg text-xs md:text-sm">
              <div className="flex justify-between items-center px-4 py-2 bg-gray-800/80 text-gray-400 font-mono text-[11px] border-b border-gray-700/50">
                <span>{language || 'code'}</span>
                <button
                  onClick={() => handleCopy(codeBody, sIdx)}
                  className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedCode === sIdx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto font-mono text-xs md:text-sm leading-relaxed whitespace-pre">
                <code>{codeBody}</code>
              </pre>
            </div>
          );
        }

        // Regular Markdown lines
        const lines = segment.split('\n');

        return (
          <div key={sIdx} className="space-y-2">
            {lines.map((line, idx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={idx} className="h-1.5" />;

              // Headers
              if (trimmed.startsWith('### ')) {
                return <h4 key={idx} className="text-sm md:text-base font-bold text-gray-900 mt-3 mb-1">{trimmed.slice(4)}</h4>;
              }
              if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
                return <h3 key={idx} className="text-base md:text-lg font-black text-gray-900 mt-4 mb-1.5">{trimmed.replace(/^#+\s*/, '')}</h3>;
              }

              // Bullet point
              const isBullet = trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ');
              const bulletText = isBullet ? trimmed.replace(/^[\*\-\•]\s*/, '') : trimmed;

              // Numbered list
              const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
              const isNumbered = Boolean(numMatch);

              const parseInline = (text) => {
                const parts = [];
                let remaining = text;
                let partKey = 0;

                const regex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`)/g;
                let match;
                let lastIndex = 0;

                while ((match = regex.exec(remaining)) !== null) {
                  if (match.index > lastIndex) {
                    parts.push(remaining.substring(lastIndex, match.index));
                  }

                  if (match[2] && match[3]) {
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
                    parts.push(<strong key={partKey++} className="font-black text-gray-950">{match[4]}</strong>);
                  } else if (match[5]) {
                    parts.push(<code key={partKey++} className="bg-blue-50 text-[#1f83c6] px-1.5 py-0.5 rounded-md text-xs font-mono border border-blue-100">{match[5]}</code>);
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
                  <div key={idx} className="flex items-start gap-2.5 pl-2 my-1">
                    <span className="text-[#1f83c6] font-bold text-xs mt-1 shrink-0">•</span>
                    <span className="flex-1 leading-relaxed">{parseInline(bulletText)}</span>
                  </div>
                );
              }

              if (isNumbered) {
                return (
                  <div key={idx} className="flex items-start gap-2.5 pl-2 my-1">
                    <span className="text-[#20235b] font-bold text-xs mt-0.5 bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full shrink-0">{numMatch[1]}</span>
                    <span className="flex-1 leading-relaxed">{parseInline(numMatch[2])}</span>
                  </div>
                );
              }

              return <p key={idx} className="leading-relaxed">{parseInline(trimmed)}</p>;
            })}
          </div>
        );
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
      content: "👋 **Hello! I'm your AI Assistant.**\n\nAsk me anything! I can answer questions about the job landscape, write and debug code, design career roadmaps, optimize resumes for ATS, prepare you for interviews, or explain complex tech topics.\n\nHow can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    try {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (e) {}
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
      const historyPayload = messages.slice(-10).map(m => ({
        role: m.role === 'bot' ? 'assistant' : 'user',
        content: m.content
      }));

      let reply = '';
      let suggestedActions = null;

      try {
        const res = await api.post('/chat', { 
          message: textToSend,
          conversationHistory: historyPayload
        });
        reply = res.data?.reply;
        suggestedActions = res.data?.suggestedActions;
      } catch (err1) {
        // Fallback to /api/ai/chat
        const res2 = await api.post('/ai/chat', {
          message: textToSend,
          conversationHistory: historyPayload
        });
        reply = res2.data?.reply;
        suggestedActions = res2.data?.suggestedActions;
      }
      
      if (!reply || typeof reply !== 'string') {
        reply = "I'm ready to answer any questions you have. Please feel free to ask!";
      }

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
      setMessages(prev => [
        ...prev, 
        { 
          id: `bot-err-${Date.now()}`, 
          role: 'bot', 
          content: "I encountered a momentary connection issue. Please send your question again!"
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
        content: "💬 **New conversation started.** Ask me any question you like!"
      }
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 min-h-[calc(100vh-140px)] flex flex-col">
      {/* Header Banner */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-[#20235b] via-[#1a2c6d] to-[#1f83c6] text-white p-6 rounded-3xl shadow-xl border border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">AI Assistant</h1>
              <span className="inline-flex items-center gap-1 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ChatGPT-Powered
              </span>
            </div>
            <p className="text-xs md:text-sm text-blue-100 font-medium mt-0.5">
              Ask anything — careers, tech, jobs in India & globally, coding, algorithms, interviews, and general knowledge.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleClearChat}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/15 cursor-pointer shadow-sm"
            title="Start new conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New Chat
          </button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden flex flex-col min-h-[520px]">
        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/40">
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
              <div className={`max-w-[90%] md:max-w-[80%] rounded-3xl p-4 md:p-6 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-[#20235b] text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 border border-gray-200/90 rounded-tl-none shadow-xs'
              }`}>
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap text-sm md:text-base font-medium leading-relaxed">{msg.content}</p>
                ) : (
                  <div>
                    <FormattedMessage content={msg.content} onLinkClick={handleLinkNavigation} />
                    
                    {/* Suggested Action Chips inside bot message if present */}
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
              <div className="bg-white border border-gray-200 px-5 py-3.5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin text-[#1f83c6]" />
                <span className="text-xs md:text-sm font-semibold text-gray-600">Thinking and formulating response...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions Toolbar */}
        <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-[#1f83c6]" /> Suggested:
          </span>
          {PROMPT_SUGGESTIONS.map((item, idx) => (
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
        <div className="p-4 md:p-5 bg-white border-t border-gray-200">
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
              placeholder="Ask anything (e.g. jobs in India, write Python code, optimize resume, system design)..." 
              className="w-full bg-gray-50 rounded-2xl py-4 pl-5 pr-14 outline-none border border-gray-200 focus:border-[#1f83c6] focus:bg-white focus:ring-4 focus:ring-[#1f83c6]/15 transition-all text-sm md:text-base font-medium text-gray-800 shadow-inner"
              disabled={loading}
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim()}
              className="absolute right-2.5 bg-gradient-to-r from-[#20235b] to-[#1f83c6] text-white p-3 rounded-xl hover:opacity-90 disabled:opacity-40 transition-all shadow-md cursor-pointer flex items-center justify-center"
              aria-label="Send Message"
            >
              <Send size={18} />
            </button>
          </form>
          <p className="text-center text-[11px] text-gray-400 font-medium mt-2">
            Free AI Chat Assistant • Generates insights across tech, careers, coding, and general knowledge.
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
