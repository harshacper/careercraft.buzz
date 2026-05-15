import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, FileText, CheckCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Mock user retrieval
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      // In a real app, verify token with backend
      setUser({ fullName: 'Demo User', email: 'user@example.com', role: 'Software Engineer' });
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
          </div>
          <button className="mt-8 w-full bg-darkGreen text-white hover:bg-opacity-90 py-3 rounded-lg font-bold transition-colors">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
