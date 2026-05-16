import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MessageSquare, Building2, BarChart, FileText, UserCircle, BookOpen } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="glassmorphism sticky top-0 z-50 mx-4 my-4 px-6 py-4 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2">
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
      <div className="hidden md:flex space-x-6 text-black font-medium">
        <Link to="/companies" className="hover:text-black flex items-center gap-1 transition-colors"><Building2 className="w-4 h-4"/> Companies</Link>
        <Link to="/resume" className="hover:text-black flex items-center gap-1 transition-colors"><FileText className="w-4 h-4"/> Resume</Link>
        <Link to="/notes" className="hover:text-black flex items-center gap-1 transition-colors"><BookOpen className="w-4 h-4"/> Notes</Link>
        <Link to="/chat" className="hover:text-black flex items-center gap-1 transition-colors"><MessageSquare className="w-4 h-4"/> AI Chat</Link>
      </div>
      <div className="flex gap-4 items-center">
        <Link to="/login" className="text-black font-semibold hover:opacity-80 transition-opacity">Login</Link>
        <Link to="/signup" className="bg-black text-white px-5 py-2 rounded-full font-semibold hover:shadow-lg transition-all">Sign Up</Link>
        <Link to="/dashboard" className="text-black hover:text-black"><UserCircle className="w-8 h-8"/></Link>
      </div>
    </nav>
  );
};

export default Navbar;
