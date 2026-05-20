import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import api from '../utils/api';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '', email: '', phoneNumber: '', password: '', confirmPassword: '', gender: '', qualification: '', experience: ''
  });
  const [error, setError] = useState('');
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    try {
      const { confirmPassword, ...signupData } = formData;
      const res = await api.post('/auth/signup', signupData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  const handleGoogleAccountSelect = async (selectedEmail, name) => {
    setGoogleLoading(true);
    // Simulate brief authorization delay
    setTimeout(async () => {
      try {
        const res = await api.post('/auth/google-login', { email: selectedEmail, fullName: name });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data));
        setIsGoogleModalOpen(false);
        setGoogleLoading(false);
        navigate('/dashboard');
      } catch (err) {
        setError(err.response?.data?.message || 'Google Sign-In failed');
        setGoogleLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative">
      <div className="glassmorphism w-full max-w-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-black mb-8">Create an Account</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-semibold border border-red-200">{error}</div>}
        <form onSubmit={handleSignup} className="grid md:grid-cols-2 gap-6">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-black mb-2">Full Name</label>
            <input name="fullName" onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-black focus:ring-2 focus:ring-black/20" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-black mb-2">Email Address</label>
            <input type="email" name="email" onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-black focus:ring-2 focus:ring-black/20" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-black mb-2">Phone Number</label>
            <input name="phoneNumber" onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-black focus:ring-2 focus:ring-black/20" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-black mb-2">Gender</label>
            <select name="gender" onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-black focus:ring-2 focus:ring-black/20 bg-white">
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-black mb-2">Qualification</label>
            <input name="qualification" onChange={handleChange} placeholder="e.g. B.Tech" className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-black focus:ring-2 focus:ring-black/20" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-black mb-2">Job Experience</label>
            <input name="experience" onChange={handleChange} placeholder="e.g. 2 Years as Software Engineer" className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-black focus:ring-2 focus:ring-black/20" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-black mb-2">Password</label>
            <input type="password" name="password" onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-black focus:ring-2 focus:ring-black/20" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-black mb-2">Confirm Password</label>
            <input type="password" name="confirmPassword" onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-black focus:ring-2 focus:ring-black/20" />
          </div>
          <div className="col-span-2 mt-4">
            <button type="submit" className="w-full bg-black text-white py-4 rounded-lg font-bold hover:bg-opacity-90 transition-all text-lg">
              Create Account
            </button>
          </div>
        </form>

        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-xs font-bold uppercase tracking-wider">Or</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <button 
          type="button"
          onClick={() => setIsGoogleModalOpen(true)}
          className="w-full bg-white text-gray-700 border border-gray-300 py-3.5 rounded-lg font-bold hover:bg-gray-50 hover:shadow-sm transition-all flex items-center justify-center gap-3"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p className="mt-6 text-center text-black">
          Already have an account? <Link to="/login" className="text-black font-semibold hover:underline">Log in</Link>
        </p>
      </div>

      {/* Google Account Picker Modal */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100 p-6">
            <div className="flex flex-col items-center mb-6">
              <svg viewBox="0 0 24 24" width="36" height="36" xmlns="http://www.w3.org/2000/svg" className="mb-3">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <h3 className="font-bold text-gray-800 text-lg">Sign in with Google</h3>
              <p className="text-xs text-gray-500 mt-1">to continue to CareerSteps</p>
            </div>

            {googleLoading ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#4285F4] mb-3" />
                <span className="text-xs font-semibold text-gray-500">Connecting to Google...</span>
              </div>
            ) : (
              <div className="space-y-3">
                <button 
                  onClick={() => handleGoogleAccountSelect('harsha8453@gmail.com', 'Harsha Vardhana')}
                  className="w-full p-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-left flex items-center gap-3 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-darkGreen text-white font-bold flex items-center justify-center text-sm">H</div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">Harsha Vardhana</div>
                    <div className="text-[11px] text-gray-400">harsha8453@gmail.com</div>
                  </div>
                </button>
                
                <button 
                  onClick={() => handleGoogleAccountSelect('careercraft.test@gmail.com', 'Test User')}
                  className="w-full p-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-left flex items-center gap-3 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">T</div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">Test User</div>
                    <div className="text-[11px] text-gray-400">careercraft.test@gmail.com</div>
                  </div>
                </button>

                <div className="pt-4 border-t border-gray-100 flex justify-between">
                  <button 
                    onClick={() => setIsGoogleModalOpen(false)}
                    className="text-xs font-bold text-gray-400 hover:text-gray-600"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleGoogleAccountSelect('guest.professional@gmail.com', 'Guest Professional')}
                    className="text-xs font-bold text-[#4285F4] hover:underline"
                  >
                    Use guest account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
