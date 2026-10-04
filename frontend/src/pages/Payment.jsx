import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ShieldCheck, CreditCard, QrCode, Building, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import safeStorage from '../utils/safeStorage';

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
  const [step, setStep] = useState(1); // 1: Method selection, 2: UPI UTR entry, 3: Loading, 4: Success

  // Form Fields
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [utr, setUtr] = useState('');

  useEffect(() => {
    const token = safeStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
    } else {
      setIsAuthenticated(true);
      const storedUser = safeStorage.getItem('user');
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
    setUtr('');
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
    if (paymentMethod === 'upi') {
      setStep(2); // Go to UPI instructions and UTR verification step
    } else {
      processPayment();
    }
  };

  const handleUpiSubmit = (e) => {
    e.preventDefault();
    if (!utr || utr.length !== 12 || !/^\d+$/.test(utr)) {
      alert('Please enter a valid 12-digit UPI UTR / Transaction ID.');
      return;
    }
    processPayment();
  };

  const processPayment = () => {
    setStep(3); // Show processing loading spinner
    setProcessing(true);

    // Simulate multi-stage secure checkout loading
    setTimeout(() => {
      api.post('/payment/checkout', { planType: selectedPlan })
        .then((res) => {
          setUserStatus(res.data.status);
          setStep(4); // Success screen
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 text-gray-900">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <span className="text-black bg-black/5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold tracking-wider uppercase mb-4 inline-block">Pricing Plans</span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-black mb-6">
          Invest in Your Career with <span className="underline decoration-black decoration-4 underline-offset-4">Premium Access</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-600">
          Unlock unlimited resume designs, dynamic ATS feedback, and cover letter analysis tailored to top product & service companies.
        </p>
      </div>

      {/* User Plan Status */}
      {isAuthenticated && (
        <div className="max-w-3xl mx-auto mb-12 bg-white/70 backdrop-blur-md border border-gray-100 p-4 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm gap-4">
          <div>
            <h4 className="font-bold text-gray-700">Your Current Status</h4>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${userStatus.subscription === 'monthly' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}>
                {userStatus.subscription === 'monthly' ? 'Monthly Pro' : 'Free Tier'}
              </span>
              <span className="text-sm text-gray-500 font-semibold">•</span>
              <span className="text-xs sm:text-sm text-gray-600 font-semibold">
                Single Resume Credits: <strong className="text-black">{userStatus.credits}</strong>
              </span>
            </div>
          </div>
          {userStatus.subscription === 'monthly' && (
            <div className="flex items-center gap-1.5 text-black font-bold text-sm shrink-0">
              <ShieldCheck className="w-5 h-5 text-black" /> Unlimited Downloads Active
            </div>
          )}
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Tier 1: Single Download (Normal) */}
        <div className="p-8 bg-white border-2 border-gray-200 hover:border-black rounded-3xl flex flex-col justify-between hover:shadow-xl transition-all duration-300 relative group overflow-hidden shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-2xl font-black text-black">Single Resume Unlock</h3>
              <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">SAVE 67%</span>
            </div>
            <p className="text-sm text-gray-500">Best for urgent, one-time job applications</p>
            
            <div className="my-8 flex items-baseline gap-2">
              <span className="text-2xl text-gray-400 font-bold line-through">₹149</span>
              <span className="text-5xl font-black text-black">₹49</span>
              <span className="text-gray-500 font-medium text-sm">/ resume download</span>
            </div>

            <ul className="space-y-4 text-sm text-gray-700 mb-8 border-t border-gray-100 pt-6">
              <li className="flex items-center gap-3">
                <div className="bg-black text-white p-1 rounded-full"><Check size={14} className="font-bold" /></div>
                <span className="font-medium">Unlock download of 1 resume draft</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-black text-white p-1 rounded-full"><Check size={14} className="font-bold" /></div>
                <span className="font-medium">High-resolution PDF & DOCX export</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-black text-white p-1 rounded-full"><Check size={14} className="font-bold" /></div>
                <span className="font-medium">All modern resume templates included</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-black text-white p-1 rounded-full"><Check size={14} className="font-bold" /></div>
                <span className="font-medium">Full ATS compatibility check & breakdown</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <div className="bg-gray-100 p-1 rounded-full"><Check size={14} className="text-gray-400" /></div>
                <span className="font-medium">No recurring charges or subscriptions</span>
              </li>
            </ul>
          </div>

          <button 
            onClick={() => handleOpenCheckout('single')}
            className="w-full bg-white text-black border-2 border-black py-3.5 rounded-xl font-bold hover:bg-black hover:text-white hover:shadow-md transition-all duration-300 cursor-pointer"
          >
            Choose Single Unlock
          </button>
        </div>

        {/* Tier 2: Monthly Pro (Popular) */}
        <div className="p-8 bg-black text-white border-2 border-black rounded-3xl flex flex-col justify-between hover:shadow-2xl transition-all duration-300 relative group overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 bg-white text-black px-4 py-1.5 rounded-bl-xl text-xs font-black tracking-widest uppercase">Popular • Save 67%</div>
          <div>
            <h3 className="text-2xl font-black text-white">Monthly Unlimited</h3>
            <p className="text-sm text-gray-400 mt-1">Best value for active job hunters (~₹6.6/day)</p>
            
            <div className="my-8 flex items-baseline gap-2">
              <span className="text-2xl text-gray-500 font-bold line-through">₹599</span>
              <span className="text-5xl font-black text-white">₹199</span>
              <span className="text-gray-400 font-medium text-sm">/ month</span>
            </div>

            <ul className="space-y-4 text-sm text-gray-200 mb-8 border-t border-white/10 pt-6">
              <li className="flex items-center gap-3">
                <div className="bg-white text-black p-1 rounded-full"><Check size={14} className="font-bold" /></div>
                <span className="font-medium">Unlimited downloads & revisions</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-white text-black p-1 rounded-full"><Check size={14} className="font-bold" /></div>
                <span className="font-medium">Unlimited AI Resume generation & bullet polish</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-white text-black p-1 rounded-full"><Check size={14} className="font-bold" /></div>
                <span className="font-medium">Comprehensive 6-factor ATS Score & PDF report</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-white text-black p-1 rounded-full"><Check size={14} className="font-bold" /></div>
                <span className="font-medium">360° Skill Gap matching against any Job Description</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-white text-black p-1 rounded-full"><Check size={14} className="font-bold" /></div>
                <span className="font-medium">Direct company tailoring (100+ firms) & AI chat</span>
              </li>
            </ul>
          </div>

          <button 
            onClick={() => handleOpenCheckout('monthly')}
            className="w-full bg-white text-black py-3.5 rounded-xl font-black hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar"
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
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Product Selection</span>
                      <h4 className="font-black text-gray-900 mt-0.5">
                        {selectedPlan === 'single' ? 'Single Resume Download' : 'Monthly Premium Subscription'}
                      </h4>
                    </div>
                    <span className="text-xl font-black text-black">
                      {selectedPlan === 'single' ? '₹49' : '₹199'}
                    </span>
                  </div>

                  {/* Payment Methods */}
                  <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-3">Select Method</label>
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <button 
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`py-3.5 px-2 rounded-xl border flex flex-col items-center gap-1.5 font-bold transition-all cursor-pointer ${paymentMethod === 'upi' ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    >
                      <QrCode size={18} />
                      <span className="text-[11px]">UPI</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`py-3.5 px-2 rounded-xl border flex flex-col items-center gap-1.5 font-bold transition-all cursor-pointer ${paymentMethod === 'card' ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    >
                      <CreditCard size={18} />
                      <span className="text-[11px]">Card</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setPaymentMethod('netbanking')}
                      className={`py-3.5 px-2 rounded-xl border flex flex-col items-center gap-1.5 font-bold transition-all cursor-pointer ${paymentMethod === 'netbanking' ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    >
                      <Building size={18} />
                      <span className="text-[11px]">Netbanking</span>
                    </button>
                  </div>

                  {/* Forms */}
                  <form onSubmit={handlePay} className="space-y-4">
                    {paymentMethod === 'upi' && (
                      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Enter Your UPI ID or Phone Number</label>
                          <input 
                            required
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="e.g. 9876543210@ybl or username@okaxis"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-darkGreen text-sm"
                          />
                          <p className="text-[10px] text-gray-400 mt-1">We will send a mock collect request to this address.</p>
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
                      className="w-full bg-black hover:bg-neutral-800 text-white py-3.5 rounded-xl font-black transition-all duration-300 mt-6 flex justify-center items-center gap-2 cursor-pointer shadow-md"
                    >
                      Process Secure Payment
                    </button>
                  </form>
                </div>
              )}

              {/* Step 2: UPI Payment instructions & UTR verification */}
              {step === 2 && (
                <div className="p-6 space-y-4">
                  <div className="text-center">
                    <span className="text-black bg-black/5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">UPI Collect Request Sent</span>
                    <h4 className="font-black text-gray-800 mt-2">Complete Your Payment</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      A mock collect request has been sent to <strong className="text-black">{upiId}</strong>. Please check your UPI App to pay.
                    </p>
                  </div>

                  {/* QR Code fallback */}
                  <div className="flex flex-col items-center p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                    <span className="text-[10px] text-gray-400 mb-2 font-semibold uppercase tracking-wider">Or scan QR to pay: ₹{selectedPlan === 'single' ? '49' : '199'}</span>
                    <div className="w-40 h-40 bg-white p-2 border border-gray-200 rounded-xl relative flex items-center justify-center shadow-inner overflow-hidden">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                          `upi://pay?pa=9380268436-a19a@ybl&pn=CareerSteps&am=${selectedPlan === 'single' ? '49' : '199'}&cu=INR`
                        )}`} 
                        alt="Scan to Pay" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-[10px] text-black font-bold mt-2">UPI ID: 9380268436-a19a@ybl</span>
                  </div>

                  <form onSubmit={handleUpiSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Enter 12-Digit UTR / Transaction ID</label>
                      <input 
                        required
                        type="text"
                        maxLength="12"
                        minLength="12"
                        pattern="\d{12}"
                        value={utr}
                        onChange={(e) => setUtr(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 123456789012"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-black text-sm text-center font-mono tracking-widest"
                      />
                      <p className="text-[10px] text-gray-400 mt-1 text-center">Open your transaction details in your UPI App to find the 12-digit Ref No. / UTR.</p>
                    </div>

                    <div className="flex gap-2.5 pt-2">
                      <button 
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-1/3 border border-gray-200 text-gray-700 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition-all duration-300 text-sm cursor-pointer"
                      >
                        Back
                      </button>
                      <button 
                        type="submit"
                        className="w-2/3 bg-black hover:bg-neutral-800 text-white py-3.5 rounded-xl font-black transition-all duration-300 text-sm cursor-pointer shadow-md"
                      >
                        Confirm & Verify
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Step 3: Processing state */}
              {step === 3 && (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                  <div className="relative mb-6">
                    <Loader2 className="w-16 h-16 animate-spin text-black" />
                    <ShieldCheck className="w-6 h-6 text-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <h4 className="text-lg font-black text-gray-800">Processing Your Payment</h4>
                  <p className="text-sm text-gray-500 mt-2 max-w-[250px]">
                    Verifying authorization credentials with banking systems. Please do not close this window.
                  </p>
                </div>
              )}

              {/* Step 4: Success Screen */}
              {step === 4 && (
                <div className="p-8 flex flex-col items-center justify-center text-center">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-6"
                  >
                    <Check size={32} strokeWidth={3} />
                  </motion.div>
                  
                  <h4 className="text-xl font-black text-gray-900">Payment Successful!</h4>
                  <p className="text-sm text-gray-600 mt-2">
                    Transactions succeeded! Your premium features have been unlocked.
                  </p>

                  <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl w-full my-6 text-left space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Order ID:</span>
                      <span className="font-bold text-gray-700">CC-{Math.floor(100000 + Math.random() * 900000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Amount Paid:</span>
                      <span className="font-bold text-gray-900">{selectedPlan === 'single' ? '₹49.00' : '₹199.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Payment Status:</span>
                      <span className="font-bold text-emerald-700 uppercase tracking-widest text-[9px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">CONFIRMED</span>
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      // Force reload status & redirect to builder or dashboard
                      navigate('/resume');
                    }}
                    className="w-full bg-black hover:bg-neutral-800 text-white py-3.5 rounded-xl font-black transition-all duration-300 cursor-pointer shadow-md"
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
