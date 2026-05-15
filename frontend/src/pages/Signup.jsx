import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '', email: '', phoneNumber: '', password: '', gender: '', qualification: '', experience: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', formData);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="glassmorphism w-full max-w-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-black mb-8">Create an Account</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-semibold border border-red-200">{error}</div>}
        <form onSubmit={handleSignup} className="grid md:grid-cols-2 gap-6">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-black mb-2">Full Name</label>
            <input name="fullName" onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border outline-none focus:border-black focus:ring-2" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-black mb-2">Email Address</label>
            <input type="email" name="email" onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border outline-none focus:border-black focus:ring-2" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-black mb-2">Phone Number</label>
            <input name="phoneNumber" onChange={handleChange} className="w-full px-4 py-3 rounded-lg border outline-none focus:border-black focus:ring-2" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-black mb-2">Password</label>
            <input type="password" name="password" onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border outline-none focus:border-black focus:ring-2" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-black mb-2">Gender</label>
            <select name="gender" onChange={handleChange} className="w-full px-4 py-3 rounded-lg border outline-none focus:border-black focus:ring-2">
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-black mb-2">Qualification</label>
            <input name="qualification" onChange={handleChange} placeholder="e.g. B.Tech" className="w-full px-4 py-3 rounded-lg border outline-none focus:border-black focus:ring-2" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-black mb-2">Job Experience</label>
            <input name="experience" onChange={handleChange} placeholder="e.g. 2 Years as Software Engineer" className="w-full px-4 py-3 rounded-lg border outline-none focus:border-black focus:ring-2" />
          </div>
          <div className="col-span-2 mt-4">
            <button type="submit" className="w-full bg-black text-white py-4 rounded-lg font-bold hover:bg-opacity-90 transition-all text-lg">
              Create Account
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-black">
          Already have an account? <Link to="/login" className="text-black font-semibold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
