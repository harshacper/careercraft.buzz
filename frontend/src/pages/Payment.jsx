import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ShieldCheck, CreditCard, QrCode, Building, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const Payment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userStatus, setUserStatus] = useState({ subscription: 'none', credits: 0 });
  const [selectedPlan, setSelectedPlan] = useState(null); // 'single' | 'monthly'
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1); // 1: Method selection, 2: Loading, 3: Success

  // Form Fields
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
    } else {
      setIsAuthenticated(true);
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
      fetchStatus();
    }
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/payment/status');
      setUserStatus(res.data);
    } catch (err) {
      console.error('Failed to fetch subscription status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCheckout = (plan) => {
    if (!isAuthenticated) {
      alert('Please log in or sign up to upgrade to premium plans.');
      navigate('/login');
      return;
    }
    setSelectedPlan(plan);
    setIsCheckoutOpen(true);
    setStep(1);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handlePay = (e) => {
    e.preventDefault();
    if (paymentMethod === 'upi' && !upiId && step === 1) {
      // Allow QR pay too, so no strict validation if they scan QR
    }
    
    setStep(2);
    setProcessing(true);

    // Simulate multi-stage secure checkout loading
    setTimeout(() => {
      // Mock API call to update status
      api.post('/payment/checkout', { planType: selectedPlan })
        .then((res) => {
          setUserStatus(res.data.status);
          setStep(3);
          setProcessing(false);
        })
        .catch((err) => {
          console.error(err);
          alert('Failed to process payment. Please try again.');
          setStep(1);
          setProcessing(false);
        });
    }, 3000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-darkGreen" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 text-gray-900">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-darkGreen bg-green-50 px-4 py-1.5 rounded-full text-sm font-bold tracking-wider uppercase mb-4 inline-block">Pricing Plans</span>
        <h1 className="text-5xl font-black tracking-tight text-gray-900 mb-6">
          Invest in Your Career with <span className="bg-gradient-to-r from-darkGreen to-[#1f83c6] bg-clip-text text-transparent">Premium Access</span>
        </h1>
        <p className="text-lg text-gray-600">
          Unlock unlimited resume designs, dynamic ATS feedback, and cover letter analysis tailored to top product & service companies.
        </p>
      </div>

      {/* User Plan Status */}
      {isAuthenticated && (
        <div className="max-w-3xl mx-auto mb-12 bg-white/70 backdrop-blur-md border border-gray-100 p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <h4 className="font-bold text-gray-700">Your Current Status</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${userStatus.subscription === 'monthly' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-gray-100 text-gray-700'}`}>
                {userStatus.subscription === 'monthly' ? 'Monthly Pro' : 'Free Tier'}
              </span>
              <span className="text-sm text-gray-500 font-semibold">•</span>
              <span className="text-sm text-gray-600 font-semibold">
                Single Resume Credits: <strong className="text-darkGreen">{userStatus.credits}</strong>
              </span>
            </div>
          </div>
          {userStatus.subscription === 'monthly' && (
            <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm">
              <ShieldCheck className="w-5 h-5" /> Unlimited Downloads Active
            </div>
          )}
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Tier 1: Single Download */}
        <div className="glassmorphism p-8 bg-white border border-gray-100 flex flex-col justify-between hover:shadow-xl transition-all duration-300 relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div>
            <h3 className="text-2xl font-black text-gray-800">Single Resume Unlock</h3>
            <p className="text-sm text-gray-500 mt-1">Best for one-time job applications</p>
            
            <div className="my-8 flex items-baseline gap-1">
              <span className="text-5xl font-black text-gray-900">₹50</span>
              <span className="text-gray-500 font-medium text-sm">/ resume download</span>
            </div>

            <ul className="space-y-4 text-sm text-gray-600 mb-8 border-t border-gray-100 pt-6">
              <li className="flex items-center gap-3">
                <div className="bg-emerald-100 p-1 rounded-full"><Check size={14} className="text-emerald-600 font-bold" /></div>
                <span>Unlock download of 1 resume draft</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-emerald-100 p-1 rounded-full"><Check size={14} className="text-emerald-600 font-bold" /></div>
                <span>High-resolution PDF export</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-emerald-100 p-1 rounded-full"><Check size={14} className="text-emerald-600 font-bold" /></div>
                <span>All resume templates included</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <div className="bg-gray-100 p-1 rounded-full"><Check size={14} className="text-gray-400" /></div>
                <span>No monthly recurrences</span>
              </li>
            </ul>
          </div>

          <button 
            onClick={() => handleOpenCheckout('single')}
            className="w-full bg-white text-darkGreen border-2 border-darkGreen py-3.5 rounded-xl font-bold hover:bg-darkGreen hover:text-white hover:shadow-md transition-all duration-300"
          >
            Choose Single Unlock
          </button>
        </div>

        {/* Tier 2: Monthly Pro */}
        <div className="glassmorphism p-8 bg-[#092e20] text-white border border-[#0d442f] flex flex-col justify-between hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#1f83c6] text-white px-4 py-1.5 rounded-bl-xl text-xs font-black tracking-widest uppercase">Popular</div>
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#1f83c6]/10 rounded-full blur-2xl"></div>
          <div>
            <h3 className="text-2xl font-black">Monthly Unlimited</h3>
            <p className="text-sm text-green-200 mt-1">Best for active job hunters</p>
            
            <div className="my-8 flex items-baseline gap-1">
              <span className="text-5xl font-black">₹150</span>
              <span className="text-green-200 font-medium text-sm">/ month</span>
            </div>

            <ul className="space-y-4 text-sm text-green-50/90 mb-8 border-t border-green-800 pt-6">
              <li className="flex items-center gap-3">
                <div className="bg-[#1f83c6] p-1 rounded-full"><Check size={14} className="text-white font-bold" /></div>
                <span>Unlimited downloads & revisions</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-[#1f83c6] p-1 rounded-full"><Check size={14} className="text-white font-bold" /></div>
                <span>Unlimited AI Resume builder & summary suggests</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-[#1f83c6] p-1 rounded-full"><Check size={14} className="text-white font-bold" /></div>
                <span>Full ATS Analyzer & scoring breakdowns</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-[#1f83c6] p-1 rounded-full"><Check size={14} className="text-white font-bold" /></div>
                <span>Priority AI chatbot answers</span>
              </li>
            </ul>
          </div>

          <button 
            onClick={() => handleOpenCheckout('monthly')}
            className="w-full bg-[#1f83c6] text-white py-3.5 rounded-xl font-black hover:bg-opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Sparkles size={18} /> Go Pro Unlimited
          </button>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-16 text-center max-w-lg mx-auto">
        <div className="flex justify-center items-center gap-2 text-gray-500 font-medium text-sm mb-2">
          <ShieldCheck className="w-5 h-5 text-darkGreen" /> 100% Encrypted & Safe Mock Payments
        </div>
        <p className="text-xs text-gray-400">
          CareerCraft does not store card numbers. Purchases are simulated using advanced client-side sandbox environments.
        </p>
      </div>

      {/* Checkout Gateway Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 flex flex-col"
            >
              {/* Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="font-black text-gray-800 text-lg">Secure Sandbox Checkout</h3>
                  <p className="text-xs text-gray-500">CareerCraft Mock Gateway</p>
                </div>
                <button 
                  onClick={() => !processing && setIsCheckoutOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1"
                  disabled={processing}
                >
                  ✕
                </button>
              </div>

              {/* Step 1: Payment Selection */}
              {step === 1 && (
                <div className="p-6">
                  {/* Cart Summary */}
                  <div className="bg-green-50/50 border border-green-100 rounded-2xl p-4 mb-6 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-darkGreen uppercase tracking-wider">Product Selection</span>
                      <h4 className="font-black text-gray-800 mt-0.5">
                        {selectedPlan === 'single' ? 'Single Resume Download' : 'Monthly Premium Subscription'}
                      </h4>
                    </div>
                    <span className="text-xl font-black text-darkGreen">
                      {selectedPlan === 'single' ? '₹50' : '₹150'}
                    </span>
                  </div>

                  {/* Payment Methods */}
                  <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-3">Select Method</label>
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <button 
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`py-3.5 px-2 rounded-xl border flex flex-col items-center gap-1.5 font-bold transition-all ${paymentMethod === 'upi' ? 'border-darkGreen bg-green-50 text-darkGreen' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                    >
                      <QrCode size={18} />
                      <span className="text-[11px]">UPI</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`py-3.5 px-2 rounded-xl border flex flex-col items-center gap-1.5 font-bold transition-all ${paymentMethod === 'card' ? 'border-darkGreen bg-green-50 text-darkGreen' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                    >
                      <CreditCard size={18} />
                      <span className="text-[11px]">Card</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setPaymentMethod('netbanking')}
                      className={`py-3.5 px-2 rounded-xl border flex flex-col items-center gap-1.5 font-bold transition-all ${paymentMethod === 'netbanking' ? 'border-darkGreen bg-green-50 text-darkGreen' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                    >
                      <Building size={18} />
                      <span className="text-[11px]">Netbanking</span>
                    </button>
                  </div>

                  {/* Forms */}
                  <form onSubmit={handlePay} className="space-y-4">
                    {paymentMethod === 'upi' && (
                      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        {/* Fake QR code */}
                        <div className="flex flex-col items-center p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                          <div className="w-32 h-32 bg-white p-2 border border-gray-200 rounded-xl relative flex items-center justify-center shadow-inner">
                            {/* Visual QR simulation */}
                            <svg viewBox="0 0 100 100" className="w-full h-full text-gray-800">
                              <rect width="25" height="25" fill="currentColor"/>
                              <rect x="75" width="25" height="25" fill="currentColor"/>
                              <rect y="75" width="25" height="25" fill="currentColor"/>
                              <rect x="6" y="6" width="13" height="13" fill="white"/>
                              <rect x="81" y="6" width="13" height="13" fill="white"/>
                              <rect x="6" y="81" width="13" height="13" fill="white"/>
                              {/* Mock code bits */}
                              <rect x="35" y="10" width="10" height="5" fill="currentColor"/>
                              <rect x="55" y="15" width="5" height="15" fill="currentColor"/>
                              <rect x="40" y="30" width="20" height="5" fill="currentColor"/>
                              <rect x="10" y="45" width="15" height="10" fill="currentColor"/>
                              <rect x="30" y="50" width="10" height="15" fill="currentColor"/>
                              <rect x="50" y="45" width="15" height="5" fill="currentColor"/>
                              <rect x="70" y="55" width="20" height="10" fill="currentColor"/>
                              <rect x="80" y="35" width="10" height="10" fill="currentColor"/>
                              <rect x="80" y="75" width="10" height="15" fill="currentColor"/>
                              <rect x="45" y="75" width="15" height="10" fill="currentColor"/>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-[1px] opacity-0 hover:opacity-100 transition-opacity">
                              <span className="text-[10px] font-black text-darkGreen px-2 py-1 bg-green-50 rounded border border-green-200">SCAN TO PAY</span>
                            </div>
                          </div>
                          <span className="text-[10px] text-gray-400 mt-2 font-semibold uppercase tracking-wider">Scan using GPay, PhonePe, or Paytm</span>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Or Enter UPI ID</label>
                          <input 
                            required
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="username@okaxis"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-darkGreen text-sm"
                          />
                        </div>
                      </motion.div>
                    )}

                    {paymentMethod === 'card' && (
                      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Card Number</label>
                          <input 
                            required
                            type="text"
                            maxLength="19"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                            placeholder="4111 2222 3333 4444"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-darkGreen text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Cardholder Name</label>
                          <input 
                            required
                            type="text"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-darkGreen text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Expiry Date</label>
                            <input 
                              required
                              type="text"
                              maxLength="5"
                              placeholder="MM/YY"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-darkGreen text-sm text-center"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">CVV</label>
                            <input 
                              required
                              type="password"
                              maxLength="3"
                              placeholder="123"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-darkGreen text-sm text-center"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {paymentMethod === 'netbanking' && (
                      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Select Bank</label>
                          <select 
                            required
                            value={selectedBank} 
                            onChange={(e) => setSelectedBank(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-darkGreen text-sm bg-white"
                          >
                            <option value="">-- Choose Your Bank --</option>
                            <option value="sbi">State Bank of India (SBI)</option>
                            <option value="hdfc">HDFC Bank</option>
                            <option value="icici">ICICI Bank</option>
                            <option value="axis">Axis Bank</option>
                            <option value="kotak">Kotak Mahindra Bank</option>
                          </select>
                        </div>
                      </motion.div>
                    )}

                    {/* Pay Button */}
                    <button 
                      type="submit"
                      className="w-full bg-darkGreen text-white py-3.5 rounded-xl font-black hover:shadow-lg hover:shadow-green-100 transition-all duration-300 mt-6 flex justify-center items-center gap-2"
                    >
                      Process Secure Payment
                    </button>
                  </form>
                </div>
              )}

              {/* Step 2: Processing state */}
              {step === 2 && (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                  <div className="relative mb-6">
                    <Loader2 className="w-16 h-16 animate-spin text-darkGreen" />
                    <ShieldCheck className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <h4 className="text-lg font-black text-gray-800">Processing Your Payment</h4>
                  <p className="text-sm text-gray-500 mt-2 max-w-[250px]">
                    Verifying mock authorization credentials with banking systems. Please do not close this window.
                  </p>
                </div>
              )}

              {/* Step 3: Success Screen */}
              {step === 3 && (
                <div className="p-8 flex flex-col items-center justify-center text-center">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-6"
                  >
                    <Check size={32} strokeWidth={3} />
                  </motion.div>
                  
                  <h4 className="text-xl font-black text-emerald-600">Payment Successful!</h4>
                  <p className="text-sm text-gray-600 mt-2">
                    Mock transactions succeeded! Your features have been unlocked.
                  </p>

                  <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl w-full my-6 text-left space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Order ID:</span>
                      <span className="font-bold text-gray-700">CC-{Math.floor(100000 + Math.random() * 900000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Amount Paid:</span>
                      <span className="font-bold text-gray-700">{selectedPlan === 'single' ? '₹50.00' : '₹150.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Payment Status:</span>
                      <span className="font-bold text-emerald-600 uppercase tracking-widest text-[9px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">CONFIRMED</span>
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      // Force reload status & redirect to builder or dashboard
                      navigate('/resume');
                    }}
                    className="w-full bg-[#1f83c6] text-white py-3.5 rounded-xl font-black hover:shadow-lg transition-all duration-300"
                  >
                    Go to Resume Builder
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Payment;
