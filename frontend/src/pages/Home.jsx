import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Sparkles, Target, Zap } from 'lucide-react';
import heroImg from '../assets/hero-bg.png';

const Home = () => {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section with Background Image */}
      <section className="relative w-full h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImg} 
            alt="Career Hero" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-bold mb-6">
              <Sparkles className="text-yellow-400 w-4 h-4" /> 
              <span>AI-Powered Career Intelligence</span>
            </div>
            <h1 className="text-6xl lg:text-8xl font-black leading-tight mb-6 text-white">
              Scale Your <br/> <span>Future</span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mb-10 leading-relaxed font-medium">
              Navigate your career journey with an AI navigator. From resume analysis to skill gap roadmaps, we build your path to top-tier companies.
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <Link to="/signup" className="bg-white text-black px-10 py-5 rounded-2xl font-black text-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-3">
                Get Started Free <ArrowRight />
              </Link>
              <Link to="/companies" className="bg-transparent border-2 border-white/30 backdrop-blur-md text-white px-10 py-5 rounded-2xl font-black text-xl hover:bg-white/10 transition-all">
                Explore 100+ Jobs
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="w-full bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <p className="text-black font-black uppercase tracking-widest text-sm mb-12">Trusted by students at leading institutions</p>
          <div className="flex flex-wrap justify-center items-center gap-16 opacity-100">
            {['Google', 'Microsoft', 'Amazon', 'Meta', 'Netflix'].map(brand => (
              <span key={brand} className="text-4xl font-black tracking-tighter text-black">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full bg-softGray py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { 
                title: 'AI Resume Intelligence', 
                desc: 'Generate ATS-optimized resumes using achievement-based AI prompts tailored for high-paying roles.',
                icon: <Target className="w-8 h-8" />
              },
              { 
                title: '360° Skill Gap Roadmap', 
                desc: 'Detect missing skills for your dream job and get a personalized course roadmap to bridge the gap.',
                icon: <Zap className="w-8 h-8" />
              },
              { 
                title: 'Admin User Tracking', 
                desc: 'Secure SQL-backed system for managing your career progress and tracking improvements over time.',
                icon: <CheckCircle2 className="w-8 h-8" />
              }
            ].map((feat, idx) => (
              <motion.div 
                whileHover={{ y: -10 }}
                key={idx} 
                className="p-10 rounded-[40px] bg-white border border-gray-100 shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="w-16 h-16 bg-black text-white rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-black/20">
                  {feat.icon}
                </div>
                <h3 className="text-2xl font-black mb-4 text-black">{feat.title}</h3>
                <p className="text-black/70 leading-relaxed font-medium">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
