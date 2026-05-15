import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import axios from 'axios';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hello! I am your AI Career Navigator. How can I help you with your career today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/chat', { 
        message: userMessage,
        context: "User is an aspiring software engineer looking for career guidance."
      });
      
      setMessages(prev => [...prev, { role: 'bot', content: res.data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'bot', content: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 h-[85vh] flex flex-col">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-darkGreen">Career Advisor AI</h1>
        <p className="text-gray-600">Get personalized advice, resume tips, and interview prep.</p>
      </div>

      <div className="flex-grow glassmorphism rounded-2xl overflow-hidden flex flex-col shadow-xl border border-white/40">
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx} 
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-darkGreen text-white' : 'bg-softGray text-darkGreen border border-gray-200'}`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-darkGreen text-white rounded-tr-none' : 'bg-white border border-gray-100 rounded-tl-none shadow-sm'}`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-softGray flex items-center justify-center shrink-0">
                <Bot size={20} className="text-darkGreen" />
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center">
                <Loader2 className="w-5 h-5 animate-spin text-darkGreen" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white/50 border-t border-white/40">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your career..." 
              className="w-full bg-white rounded-full py-4 pl-6 pr-14 outline-none border border-gray-200 focus:border-darkGreen focus:ring-2 focus:ring-darkGreen/20 transition-all shadow-sm"
              disabled={loading}
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim()}
              className="absolute right-2 bg-darkGreen text-white p-3 rounded-full hover:bg-opacity-90 disabled:opacity-50 transition-all"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
