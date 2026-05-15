import React from 'react';
import { Mail, Link as LinkIcon, ExternalLink, MapPin, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-black text-white py-16 px-6 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand Section */}
        <div className="col-span-1 md:col-span-1">
          <Link to="/" className="text-2xl font-bold flex items-center gap-2 mb-6">
            <Briefcase className="w-8 h-8" />
            AI Career Navigator
          </Link>
          <p className="text-gray-400 font-medium leading-relaxed">
            Empowering the next generation of professionals with AI-driven career guidance, skill gap analysis, and ATS-optimized tools.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-black mb-6 uppercase tracking-wider">Platform</h4>
          <ul className="space-y-4 text-gray-400 font-medium">
            <li><Link to="/companies" className="hover:text-white transition-colors">Explore Companies</Link></li>
            <li><Link to="/skill-gap" className="hover:text-white transition-colors">Skill Gap Analysis</Link></li>
            <li><Link to="/resume" className="hover:text-white transition-colors">Resume Builder</Link></li>
            <li><Link to="/chat" className="hover:text-white transition-colors">AI Career Coach</Link></li>
          </ul>
        </div>

        {/* Contact Details */}
        <div>
          <h4 className="text-lg font-black mb-6 uppercase tracking-wider">Contact</h4>
          <ul className="space-y-4 text-gray-400 font-medium">
            <li className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-white" />
              <a href="mailto:harshasubhash123@gmail.com" className="hover:text-white transition-colors">harshasubhash123@gmail.com</a>
            </li>
            <li className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-white" />
              <span>Bengaluru, India</span>
            </li>
          </ul>
        </div>

        {/* Social & Professional */}
        <div>
          <h4 className="text-lg font-black mb-6 uppercase tracking-wider">Professional</h4>
          <div className="flex gap-4">
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 group">
              <LinkIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 group">
              <ExternalLink className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </a>
          </div>
          <p className="mt-6 text-sm text-gray-500 font-bold uppercase tracking-widest">
            Built for the future of work.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/10 mt-16 pt-8 flex flex-col md:row justify-between items-center text-gray-500 text-sm font-bold">
        <p>© {new Date().getFullYear()} AI Career Navigator. All rights reserved.</p>
        <div className="flex gap-8 mt-4 md:mt-0 uppercase tracking-widest">
          <a href="#" className="hover:text-white transition-colors text-[10px]">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors text-[10px]">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
