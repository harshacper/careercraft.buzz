import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MessageSquare, Building2, BarChart, FileText, UserCircle, BookOpen, CreditCard, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="glassmorphism sticky top-0 z-50 mx-4 my-4 px-6 py-4 flex justify-between items-center relative">
      <Link to="/" className="flex items-center gap-2 shrink-0">
        <svg width="45" height="45" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Bottom Step - Light Blue */}
          <path d="M10 65 L30 55 L50 65 L30 75 Z" fill="#42b0e3" />
          <path d="M10 65 L30 75 L30 95 L10 85 Z" fill="#2d9cdb" />
          <path d="M50 65 L30 75 L30 95 L50 85 Z" fill="#257ab7" />
          
          {/* Middle Step - Medium Blue */}
          <path d="M30 45 L50 35 L70 45 L50 55 Z" fill="#2d4cdb" />
          <path d="M30 45 L50 55 L50 75 L30 65 Z" fill="#223ab0" />
          <path d="M70 45 L50 55 L50 75 L70 65 Z" fill="#1b2d8c" />
          
          {/* Top Step - Dark Blue */}
          <path d="M50 25 L70 15 L90 25 L70 35 Z" fill="#2a2d75" />
          <path d="M50 25 L70 35 L70 55 L50 45 Z" fill="#1c1f54" />
          <path d="M90 25 L70 35 L70 55 L90 45 Z" fill="#13153d" />
        </svg>
        <div className="flex flex-col leading-none tracking-tight ml-1">
          <span className="text-[#20235b] text-2xl font-black">CAREER</span>
          <span className="text-[#1f83c6] text-2xl font-black">STEPS</span>
        </div>
      </Link>
      
      {/* Desktop Links */}
      <div className="hidden md:flex space-x-6 text-black font-medium">
        <Link to="/companies" className="hover:text-[#1f83c6] flex items-center gap-1 transition-colors"><Building2 className="w-4 h-4"/> Companies</Link>
        <Link to="/resume" className="hover:text-[#1f83c6] flex items-center gap-1 transition-colors"><FileText className="w-4 h-4"/> Resume</Link>
        <Link to="/chat" className="hover:text-[#1f83c6] flex items-center gap-1 transition-colors"><MessageSquare className="w-4 h-4"/> AI Chat</Link>
        <Link to="/payment" className="hover:text-[#1f83c6] flex items-center gap-1 transition-colors"><CreditCard className="w-4 h-4"/> Pricing</Link>
      </div>

      {/* Desktop CTA actions */}
      <div className="hidden md:flex gap-4 items-center">
        <Link to="/login" className="text-black font-semibold hover:opacity-80 transition-opacity">Login</Link>
        <Link to="/signup" className="bg-black text-white px-5 py-2 rounded-full font-semibold hover:shadow-lg transition-all">Sign Up</Link>
        <Link to="/dashboard" className="text-black hover:text-black"><UserCircle className="w-8 h-8"/></Link>
      </div>

      {/* Mobile actions and hamburger toggler */}
      <div className="md:hidden flex items-center gap-4">
        <Link to="/dashboard" className="text-black hover:text-[#1f83c6]"><UserCircle className="w-7 h-7"/></Link>
        <button onClick={() => setIsOpen(!isOpen)} className="text-black focus:outline-none p-1" aria-label="Toggle Navigation Menu">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown Panel */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 mt-2 mx-0 p-6 glassmorphism flex flex-col space-y-4 z-50 shadow-2xl animate-in fade-in slide-in-from-top-5 duration-200">
          <Link to="/companies" onClick={() => setIsOpen(false)} className="hover:text-[#1f83c6] flex items-center gap-2 py-2.5 font-bold border-b border-black/5"><Building2 className="w-5 h-5 text-gray-500"/> Companies</Link>
          <Link to="/resume" onClick={() => setIsOpen(false)} className="hover:text-[#1f83c6] flex items-center gap-2 py-2.5 font-bold border-b border-black/5"><FileText className="w-5 h-5 text-gray-500"/> Resume</Link>
          <Link to="/chat" onClick={() => setIsOpen(false)} className="hover:text-[#1f83c6] flex items-center gap-2 py-2.5 font-bold border-b border-black/5"><MessageSquare className="w-5 h-5 text-gray-500"/> AI Chat</Link>
          <Link to="/payment" onClick={() => setIsOpen(false)} className="hover:text-[#1f83c6] flex items-center gap-2 py-2.5 font-bold border-b border-black/5"><CreditCard className="w-5 h-5 text-gray-500"/> Pricing</Link>
          
          <div className="flex flex-col gap-3 pt-4">
            <Link to="/login" onClick={() => setIsOpen(false)} className="w-full text-center py-3 border border-black/15 rounded-2xl font-bold text-black hover:bg-black/5 transition-colors">Login</Link>
            <Link to="/signup" onClick={() => setIsOpen(false)} className="w-full text-center py-3 bg-black text-white rounded-2xl font-bold hover:opacity-90 transition-opacity">Sign Up</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
