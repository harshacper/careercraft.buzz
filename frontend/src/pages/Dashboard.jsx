import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, FileText, CheckCircle, TrendingUp, BookOpen, ChevronRight, CreditCard, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userStatus, setUserStatus] = useState({ subscription: 'none', credits: 0 });

  useEffect(() => {
    // Mock user retrieval
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        // Fallback or fetch from API
        setUser({ fullName: 'User', email: '...', role: 'Aspiring Professional' });
      }

      // Fetch subscription status
      api.get('/payment/status')
        .then(res => {
          setUserStatus(res.data);
        })
        .catch(err => console.error("Error loading subscription status:", err));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!user) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex justify-between items-end mb-10 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Welcome, {user.fullName}</h1>
          <p className="text-gray-600 mt-2">Here's your career progress snapshot.</p>
        </div>
        <button onClick={handleLogout} className="text-red-500 hover:text-red-700 flex items-center gap-2 font-medium">
          <LogOut size={20} /> Logout
        </button>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="glassmorphism p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><User /> Profile Details</h2>
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Name</span>
              <span className="font-medium">{user.fullName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Email</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Current Role</span>
              <span className="font-medium">{user.role}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Active Plan</span>
              <span className="font-bold text-darkGreen flex items-center gap-1">
                {userStatus.subscription === 'monthly' ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Pro Member
                  </>
                ) : (
                  'Free Tier'
                )}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Resume Credits</span>
              <span className="font-bold">{userStatus.credits} remaining</span>
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button className="flex-1 bg-darkGreen text-white hover:bg-opacity-90 py-3 rounded-lg font-bold transition-colors">
              Edit Profile
            </button>
            {userStatus.subscription !== 'monthly' && (
              <button 
                onClick={() => navigate('/payment')}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
              >
                <CreditCard size={18} /> Get Premium
              </button>
            )}
          </div>
        </div>

        {/* Learning Resources Card */}
        <div className="mt-8 glassmorphism p-8 border-l-8 border-darkGreen">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="text-darkGreen" /> Learning Resources</h2>
            <button 
              onClick={() => navigate('/notes')}
              className="text-darkGreen font-bold flex items-center gap-1 hover:underline"
            >
              View All <ChevronRight size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white/50 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-gray-900">DSA Mastery</h3>
              <p className="text-sm text-gray-500">Essential for technical interviews.</p>
            </div>
            <div className="p-4 bg-white/50 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-gray-900">System Design</h3>
              <p className="text-sm text-gray-500">Design scalable architectures.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
