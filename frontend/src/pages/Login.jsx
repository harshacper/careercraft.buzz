import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="glassmorphism w-full max-w-md p-8">
        <h2 className="text-3xl font-bold text-center text-black mb-8">Welcome Back</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-semibold border border-red-200">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-black mb-2">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-black focus:ring-2 focus:ring-black/20 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-black focus:ring-2 focus:ring-black/20 outline-none transition-all"
            />
          </div>
          <button type="submit" className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all">
            Sign In
          </button>
        </form>
        <p className="mt-6 text-center text-black">
          Don't have an account? <Link to="/signup" className="text-black font-semibold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
