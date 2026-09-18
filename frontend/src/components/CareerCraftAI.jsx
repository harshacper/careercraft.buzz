import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, X, Send, Sparkles, Calendar, Clock, User, Mail, Phone, CheckCircle, 
  ChevronRight, RefreshCw, AlertCircle, ExternalLink, Minimize2, Maximize2,
  CalendarCheck, ArrowRight, ShieldCheck, HelpCircle, Loader2, FileText,
  Target, Zap, Building2, CreditCard, ChevronDown, ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import safeStorage from '../utils/safeStorage';

const DEFAULT_SERVICES = [
  {
    id: '11111111-1111-1111-1111-111111111101',
    name: 'Resume Consultation & Review',
    description: '1-on-1 resume audit, bullet-point optimization, and ATS pass-rate review.',
    durationMinutes: 30,
    price: 0,
    currency: 'INR'
  },
  {
    id: '11111111-1111-1111-1111-111111111102',
    name: '1-on-1 Career Strategy & Roadmap',
    description: 'Personalized career roadmap session for landing product & startup roles.',
    durationMinutes: 45,
    price: 0,
    currency: 'INR'
  },
  {
    id: '11111111-1111-1111-1111-111111111103',
    name: 'Mock Technical & HR Interview',
    description: 'Realistic interview simulation with behavioral & technical feedback.',
    durationMinutes: 60,
    price: 0,
    currency: 'INR'
  },
  {
    id: '11111111-1111-1111-1111-111111111104',
    name: 'ATS Optimization & Job Match Advice',
    description: 'Direct alignment of your resume with target company job descriptions.',
    durationMinutes: 30,
    price: 0,
    currency: 'INR'
  },
  {
    id: '11111111-1111-1111-1111-111111111105',
    name: 'Skill Gap Analysis & Transition Plan',
    description: 'Detailed breakdown of missing technical skills and project recommendations.',
    durationMinutes: 45,
    price: 0,
    currency: 'INR'
  }
];

const generateSlotsForDate = (dateStr) => {
  const slots = [
    { startTime: '09:00', endTime: '09:30', startDisplay: '9:00 AM' },
    { startTime: '09:30', endTime: '10:00', startDisplay: '9:30 AM' },
    { startTime: '10:00', endTime: '10:30', startDisplay: '10:00 AM' },
    { startTime: '10:30', endTime: '11:00', startDisplay: '10:30 AM' },
    { startTime: '11:00', endTime: '11:30', startDisplay: '11:00 AM' },
    { startTime: '11:30', endTime: '12:00', startDisplay: '11:30 AM' },
    { startTime: '12:00', endTime: '12:30', startDisplay: '12:00 PM' },
    { startTime: '12:30', endTime: '13:00', startDisplay: '12:30 PM' },
    // Lunch break 13:00 - 14:00 skipped
    { startTime: '14:00', endTime: '14:30', startDisplay: '2:00 PM' },
    { startTime: '14:30', endTime: '15:00', startDisplay: '2:30 PM' },
    { startTime: '15:00', endTime: '15:30', startDisplay: '3:00 PM' },
    { startTime: '15:30', endTime: '16:00', startDisplay: '3:30 PM' },
    { startTime: '16:00', endTime: '16:30', startDisplay: '4:00 PM' },
    { startTime: '16:30', endTime: '17:00', startDisplay: '4:30 PM' },
    { startTime: '17:00', endTime: '17:30', startDisplay: '5:00 PM' },
    { startTime: '17:30', endTime: '18:00', startDisplay: '5:30 PM' },
  ];
  return slots;
};

const QUICK_ACTIONS = [
  { label: 'Explore CareerCraft', icon: <Sparkles className="w-3.5 h-3.5" />, query: 'explore careercraft' },
  { label: 'Resume Builder', icon: <FileText className="w-3.5 h-3.5" />, query: 'resume builder' },
  { label: 'ATS Score', icon: <Target className="w-3.5 h-3.5" />, query: 'ats score' },
  { label: 'Skill Gap Analysis', icon: <Zap className="w-3.5 h-3.5" />, query: 'skill gap analysis' },
  { label: 'Job Search', icon: <Building2 className="w-3.5 h-3.5" />, query: 'job search' },
  { label: 'Book Appointment', icon: <Calendar className="w-3.5 h-3.5 text-blue-600" />, query: 'book appointment', isSpecial: true },
  { label: 'Contact Support', icon: <HelpCircle className="w-3.5 h-3.5" />, query: 'contact support' },
];

const CareerCraftAI = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Active Main View: 'chat' | 'booking' | 'my-bookings'
  const [activeTab, setActiveTab] = useState('chat');

  // Chat conversation state
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: "Hi 👋 I'm CareerCraft AI.\nI can help you understand CareerCraft, answer your questions, and book an appointment.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      showQuickActions: true
    }
  ]);

  // Appointment Booking State
  const getDefaultDate = () => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    if (t.getDay() === 0) t.setDate(t.getDate() + 1);
    return t.toISOString().split('T')[0];
  };

  const [bookingState, setBookingState] = useState({
    step: 1, // 1: Service, 2: Date & Slot, 3: Details, 4: Confirmed
    services: DEFAULT_SERVICES,
    selectedService: DEFAULT_SERVICES[0],
    selectedDate: getDefaultDate(),
    availableSlots: generateSlotsForDate(getDefaultDate()),
    loadingSlots: false,
    selectedSlot: null,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    notes: '',
    confirmedBooking: null,
    error: null,
    submitting: false
  });

  // My Appointments list
  const [myAppointments, setMyAppointments] = useState([]);
  const [loadingMyAppointments, setLoadingMyAppointments] = useState(false);

  // Reschedule state
  const [rescheduleData, setRescheduleData] = useState({
    appointmentId: null,
    serviceId: null,
    date: getDefaultDate(),
    slot: null,
    slots: generateSlotsForDate(getDefaultDate()),
    loading: false,
    saving: false
  });

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, isOpen, activeTab]);

  // Sync user details
  useEffect(() => {
    const userStr = safeStorage.getItem('user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setCurrentUser(u);
        setBookingState(prev => ({
          ...prev,
          customerName: u.fullName || u.name || prev.customerName,
          customerEmail: u.email || prev.customerEmail,
          customerPhone: u.phoneNumber || prev.customerPhone
        }));
      } catch (e) {}
    }
  }, [isOpen]);

  // Fetch services from API with fallback
  const fetchServices = async () => {
    try {
      const res = await api.get('/appointments/services');
      if (res.data && res.data.length > 0) {
        setBookingState(prev => ({
          ...prev,
          services: res.data,
          selectedService: prev.selectedService || res.data[0]
        }));
      }
    } catch (err) {
      console.warn('Using default services fallback:', err.message);
    }
  };

  // Start booking wizard
  const startBookingFlow = (preselectedService = null) => {
    setActiveTab('booking');
    const defaultDate = getDefaultDate();
    setBookingState(prev => ({
      ...prev,
      step: 1,
      selectedDate: defaultDate,
      selectedSlot: null,
      selectedService: preselectedService || prev.selectedService || DEFAULT_SERVICES[0],
      availableSlots: generateSlotsForDate(defaultDate),
      error: null,
      confirmedBooking: null
    }));
    fetchServices();
  };

  // Fetch slots for selected date & service
  const fetchSlots = async (serviceId, dateStr) => {
    if (!dateStr) return;
    setBookingState(prev => ({ ...prev, loadingSlots: true, error: null }));

    try {
      const res = await api.get(`/appointments/availability?serviceId=${serviceId || ''}&date=${dateStr}`);
      if (res.data && res.data.slots) {
        setBookingState(prev => ({
          ...prev,
          availableSlots: res.data.slots,
          loadingSlots: false,
          error: !res.data.isWorkingDay ? (res.data.reason || 'Not a working day') : (res.data.slots.length === 0 ? 'No slots remaining for this date. Please pick another date.' : null)
        }));
        return;
      }
    } catch (err) {
      // Fallback slots
    }

    // Client-side fallback slots
    const targetDate = new Date(`${dateStr}T00:00:00`);
    if (targetDate.getDay() === 0) {
      setBookingState(prev => ({
        ...prev,
        availableSlots: [],
        loadingSlots: false,
        error: 'Sunday is a non-working day. Please pick Monday to Saturday.'
      }));
    } else {
      setBookingState(prev => ({
        ...prev,
        availableSlots: generateSlotsForDate(dateStr),
        loadingSlots: false,
        error: null
      }));
    }
  };

  const handleSelectService = (service) => {
    setBookingState(prev => ({ ...prev, selectedService: service, step: 2 }));
    fetchSlots(service.id, bookingState.selectedDate);
  };

  const handleDateChange = (newDate) => {
    setBookingState(prev => ({ ...prev, selectedDate: newDate, selectedSlot: null }));
    if (bookingState.selectedService) {
      fetchSlots(bookingState.selectedService.id, newDate);
    }
  };

  const handleSelectSlot = (slot) => {
    setBookingState(prev => ({ ...prev, selectedSlot: slot, step: 3 }));
  };

  // Confirm booking
  const handleConfirmBooking = async (e) => {
    e?.preventDefault();
    if (!bookingState.customerName || !bookingState.customerEmail) {
      setBookingState(prev => ({ ...prev, error: 'Please enter your Name and Email.' }));
      return;
    }
    if (!bookingState.selectedSlot) {
      setBookingState(prev => ({ ...prev, error: 'Please select an appointment time slot.' }));
      return;
    }

    setBookingState(prev => ({ ...prev, submitting: true, error: null }));

    try {
      const res = await api.post('/appointments', {
        customerName: bookingState.customerName,
        customerEmail: bookingState.customerEmail,
        customerPhone: bookingState.customerPhone || 'N/A',
        serviceId: bookingState.selectedService?.id,
        appointmentDate: bookingState.selectedDate,
        startTime: bookingState.selectedSlot.startTime,
        notes: bookingState.notes || 'Booked via CareerCraft AI'
      });

      const appointment = res.data.appointment;
      setBookingState(prev => ({
        ...prev,
        submitting: false,
        step: 4,
        confirmedBooking: appointment
      }));

      // Add confirmation message to chat
      setMessages(prev => [
        ...prev,
        {
          id: `confirm-${Date.now()}`,
          role: 'assistant',
          content: `✅ **Appointment Confirmed!**\n\n**Service:** ${appointment.service?.name || bookingState.selectedService?.name}\n**Date:** ${appointment.appointmentDate}\n**Time:** ${appointment.startTime} - ${appointment.endTime} IST\n**Name:** ${appointment.customer?.name || bookingState.customerName}\n**Status:** Confirmed\n\nA confirmation email has been dispatched to harshasubhash123@gmail.com and ${bookingState.customerEmail}.`,
          appointmentCard: appointment,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setBookingState(prev => ({
        ...prev,
        submitting: false,
        error: err.response?.data?.error || 'Failed to confirm appointment. That slot might have just been taken.'
      }));
    }
  };

  // Fetch logged in user's appointments
  const fetchMyAppointments = async () => {
    setActiveTab('my-bookings');
    const email = currentUser?.email || bookingState.customerEmail;
    if (!email) {
      return;
    }
    setLoadingMyAppointments(true);
    try {
      const res = await api.get(`/appointments/my?email=${encodeURIComponent(email)}`);
      setMyAppointments(res.data || []);
    } catch (err) {
      console.warn('Error loading my appointments:', err);
    } finally {
      setLoadingMyAppointments(false);
    }
  };

  // Reschedule actions
  const openRescheduleModal = async (appt) => {
    const defaultDate = getDefaultDate();
    setRescheduleData({
      appointmentId: appt.id,
      serviceId: appt.serviceId || appt.service?.id,
      date: defaultDate,
      slot: null,
      slots: generateSlotsForDate(defaultDate),
      loading: false,
      saving: false
    });
  };

  const handleRescheduleDateChange = async (newDate) => {
    setRescheduleData(prev => ({ ...prev, date: newDate, slot: null, loading: true }));
    try {
      const res = await api.get(`/appointments/availability?serviceId=${rescheduleData.serviceId || ''}&date=${newDate}`);
      setRescheduleData(prev => ({
        ...prev,
        slots: res.data.slots || generateSlotsForDate(newDate),
        loading: false
      }));
    } catch (e) {
      setRescheduleData(prev => ({
        ...prev,
        slots: generateSlotsForDate(newDate),
        loading: false
      }));
    }
  };

  const submitReschedule = async () => {
    if (!rescheduleData.slot || !rescheduleData.date) {
      alert('Please select a new date and time slot.');
      return;
    }
    setRescheduleData(prev => ({ ...prev, saving: true }));
    try {
      await api.patch(`/appointments/${rescheduleData.appointmentId}`, {
        date: rescheduleData.date,
        startTime: rescheduleData.slot.startTime,
        reason: 'Rescheduled via CareerCraft AI'
      });

      alert('Appointment rescheduled successfully!');
      setRescheduleData({ appointmentId: null, serviceId: null, date: '', slot: null, slots: [], loading: false, saving: false });
      fetchMyAppointments();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reschedule.');
      setRescheduleData(prev => ({ ...prev, saving: false }));
    }
  };

  // Cancel an appointment
  const handleCancelAppointment = async (apptId) => {
    const confirmCancel = window.confirm('Are you sure you want to cancel this appointment?');
    if (!confirmCancel) return;

    try {
      await api.delete(`/appointments/${apptId}`, {
        data: { reason: 'Cancelled by customer via CareerCraft AI' }
      });
      alert('Appointment cancelled successfully.');
      fetchMyAppointments();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel appointment.');
    }
  };

  // Main chat message sender
  const handleSend = async (textToSend) => {
    const msgText = (textToSend || input).trim();
    if (!msgText || loading) return;

    setInput('');
    setActiveTab('chat');

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: msgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const lower = msgText.toLowerCase().trim();

    // Check for appointment booking intent
    if (lower.includes('book appointment') || lower.includes('want to book an appointment') || lower === 'book appointment') {
      startBookingFlow();
      setLoading(false);
      return;
    }

    if (lower.includes('my appointment') || lower.includes('my bookings')) {
      fetchMyAppointments();
      setLoading(false);
      return;
    }

    // Instant Client-side Knowledge Base for zero-latency response
    const CLIENT_KNOWLEDGE = {
      'ats score': {
        reply: "**ATS Resume Analyzer** 🎯\n\nApplicant Tracking Systems filter out up to 75% of resumes before a human recruiter sees them. With CareerCraft:\n\n1. Visit the **[ATS Analyzer](/resume)**.\n2. Upload your existing resume (.pdf or .docx).\n3. Receive your overall score, missing keywords, and actionable tips to boost your interview callbacks!\n\nWould you like help preparing your resume?",
        suggestedActions: ['Open ATS Analyzer', 'Resume Builder', 'Book Appointment']
      },
      'resume builder': {
        reply: "**AI Resume Intelligence & Builder** 📄\n\nOur builder allows you to craft high-impact, ATS-friendly resumes in minutes:\n\n1. Go to the **[Resume Builder](/resume)**.\n2. Choose **AI Builder**.\n3. Enter your target role, experience, and skills.\n4. Optionally enter a target company (e.g. Google, Amazon) or paste a Job Description to auto-tailor your resume.\n5. Click **Download PDF** to export your formatted resume!\n\nWould you like to start building or book a resume review session?",
        suggestedActions: ['Open Resume Builder', 'Book Appointment', 'ATS Score']
      },
      'explore careercraft': {
        reply: "**Welcome to CareerCraft!** 🚀\n\nCareerCraft is your all-in-one AI career development platform. Here is what you can do:\n\n- 📄 **[AI Resume Builder](/resume)**: Build ATS-optimized resumes tailored for high-paying roles.\n- 🎯 **[ATS Score Analyzer](/resume)**: Scan your resume and get immediate keyword optimization.\n- ⚡ **[360° Skill Gap Roadmap](/resume)**: Compare your skills with target job descriptions.\n- 🏢 **[Top 100+ Companies](/companies)**: Explore verified career portals from Big Tech to top startups.\n- 📅 **Book a 1-on-1 Consultation**: Get personalized mentorship from career advisors.\n\nWhat would you like to explore today?",
        suggestedActions: ['Resume Builder', 'ATS Score', 'Skill Gap Analysis', 'Job Search', 'Book Appointment']
      },
      'skill gap analysis': {
        reply: "**360° Skill Gap Roadmap** ⚡\n\nOur AI compares your resume directly against the job description for your dream role:\n\n- Identifies missing technical and soft skills\n- Calculates match percentages for Service-based, Product-based, and Startup companies\n- Delivers a personalized week-by-week learning roadmap with book and course recommendations!\n\nCheck it out now in the **[Resume Hub](/resume)**.",
        suggestedActions: ['Open Resume Hub', 'Job Search', 'Book Appointment']
      },
      'job search': {
        reply: "**Top 100+ Companies Directory** 🏢\n\nExplore curated career opportunities across:\n\n- **Big Tech**: Google, Microsoft, Apple, Amazon, Meta, Netflix, Tesla, NVIDIA\n- **IT & Software**: TCS, Infosys, Wipro, Oracle, IBM, Accenture\n- **Top Startups**: Flipkart, Cred, Razorpay, Swiggy, Zomato\n\n👉 Browse all opportunities on the **[Companies Page](/companies)**! You can even generate a resume pre-customized for any company with a single click.",
        suggestedActions: ['Explore Companies', 'Resume Builder', 'Book Appointment']
      },
      'contact support': {
        reply: "**CareerCraft Support & Contact** 💬\n\nWe are here to help you succeed!\n\n- 📧 **Email**: `support@careercraft.buzz`\n- 📞 **Phone**: `+91 93802 68436`\n- 🕒 **Hours**: Monday to Saturday, 9:00 AM - 6:00 PM IST\n- 📍 **Location**: Bangalore, Karnataka, India\n\nYou can also book a live 1-on-1 consultation session with our advisors right here in the chat!",
        suggestedActions: ['Book Appointment', 'Explore CareerCraft', 'Pricing']
      }
    };

    if (CLIENT_KNOWLEDGE[lower]) {
      const match = CLIENT_KNOWLEDGE[lower];
      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: match.reply,
          suggestedActions: match.suggestedActions,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setLoading(false);
      return;
    }

    try {
      let reply = '';
      let suggestedActions = null;
      let isBookingPrompt = false;

      try {
        const res = await api.post('/ai/chat', {
          message: msgText,
          sessionId: safeStorage.getItem('ai_session_id') || `session_${Date.now()}`,
          conversationHistory: messages.map(m => ({ role: m.role, content: m.content })),
          user: currentUser
        });
        reply = res.data?.reply;
        suggestedActions = res.data?.suggestedActions;
        isBookingPrompt = res.data?.isBookingPrompt;
      } catch (aiErr) {
        // Fallback to /chat route
        const fallbackRes = await api.post('/chat', {
          message: msgText,
          context: 'CareerCraft career advisor'
        });
        reply = fallbackRes.data?.reply;
      }

      if (!reply) {
        reply = "**CareerCraft** helps you build ATS-friendly resumes, analyze skill gaps, and explore 100+ top company hiring portals. You can also book 1-on-1 career consultation appointments right here in the chat!";
      }

      const botMsg = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: reply,
        suggestedActions,
        isBookingPrompt,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);

      if (isBookingPrompt) {
        fetchServices();
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-fallback-${Date.now()}`,
          role: 'assistant',
          content: "**CareerCraft** is an AI-powered career platform designed to help you scale your future with ATS resume building, skill gap roadmaps, and 1-on-1 consultation appointments.\n\nHow can I help you today?",
          suggestedActions: ['Resume Builder', 'ATS Score', 'Book Appointment', 'Contact Support'],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = (path) => {
    if (path.startsWith('/')) {
      navigate(path);
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    }
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right) */}
      <div className="fixed bottom-5 right-5 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0, y: 20 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setIsOpen(true); setIsMinimized(false); }}
              className="group relative flex items-center gap-3 bg-gradient-to-r from-[#20235b] to-[#1f83c6] text-white px-5 py-3.5 rounded-full shadow-2xl hover:shadow-[#1f83c6]/30 border border-white/20 transition-all duration-300 cursor-pointer"
              aria-label="Open CareerCraft AI Assistant"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white animate-pulse" />
                </div>
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#20235b] rounded-full"></span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold tracking-tight text-white/90 leading-none">AI Assistant</span>
                <span className="text-sm font-black tracking-wide text-white leading-tight">CareerCraft AI</span>
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Main Floating Assistant Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '64px' : 'auto'
            }}
            exit={{ opacity: 0, y: 40, scale: 0.94 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`fixed bottom-5 right-5 z-50 w-[94vw] sm:w-[420px] md:w-[450px] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden ${
              isMinimized ? 'h-16' : 'h-[620px] max-h-[88vh]'
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#20235b] via-[#1a2c6d] to-[#1f83c6] text-white px-5 py-3.5 flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#20235b] rounded-full"></span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
                    CareerCraft AI
                  </h3>
                  <p className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    Online • Ready to help
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                  title={isMinimized ? 'Expand' : 'Minimize'}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Navigation Bar */}
                <div className="bg-gray-100 border-b border-gray-200 px-3 py-2 flex items-center justify-between text-xs font-bold shrink-0">
                  <button 
                    onClick={() => setActiveTab('chat')}
                    className={`px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                      activeTab === 'chat' 
                        ? 'bg-white text-[#20235b] shadow-sm border border-gray-200' 
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    💬 AI Chat
                  </button>
                  <button 
                    onClick={() => startBookingFlow()}
                    className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'booking' 
                        ? 'bg-[#1f83c6] text-white shadow-sm' 
                        : 'bg-blue-50 text-[#1f83c6] hover:bg-blue-100'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" /> Book Appointment
                  </button>
                  <button 
                    onClick={fetchMyAppointments}
                    className={`px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                      activeTab === 'my-bookings' 
                        ? 'bg-white text-[#20235b] shadow-sm border border-gray-200' 
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    📋 My Bookings
                  </button>
                </div>

                {/* VIEW 1: INTERACTIVE APPOINTMENT BOOKING WIZARD */}
                {activeTab === 'booking' ? (
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-4">
                      {/* Booking Steps Header */}
                      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-blue-50 text-[#1f83c6] flex items-center justify-center font-bold text-xs">
                            {bookingState.step}
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                              {bookingState.step === 1 && '1. Choose Consultation Service'}
                              {bookingState.step === 2 && '2. Select Date & Time Slot'}
                              {bookingState.step === 3 && '3. Enter Your Details'}
                              {bookingState.step === 4 && '4. Appointment Confirmed!'}
                            </h4>
                            <p className="text-[10px] text-gray-400">Step {bookingState.step} of 4</p>
                          </div>
                        </div>

                        {bookingState.step > 1 && bookingState.step < 4 && (
                          <button
                            onClick={() => setBookingState(prev => ({ ...prev, step: prev.step - 1 }))}
                            className="text-xs font-bold text-[#1f83c6] hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <ChevronLeft size={14} /> Back
                          </button>
                        )}
                      </div>

                      {/* STEP 1: Select Service */}
                      {bookingState.step === 1 && (
                        <div className="space-y-2.5">
                          <p className="text-xs text-gray-600 font-medium">Select the consultation service you would like to book:</p>
                          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
                            {(bookingState.services || DEFAULT_SERVICES).map(srv => (
                              <button
                                key={srv.id}
                                type="button"
                                onClick={() => handleSelectService(srv)}
                                className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-[#1f83c6] hover:bg-blue-50/50 transition-all flex justify-between items-center group cursor-pointer bg-white"
                              >
                                <div className="space-y-0.5">
                                  <h5 className="text-xs font-bold text-gray-900 group-hover:text-[#1f83c6]">{srv.name}</h5>
                                  <p className="text-[11px] text-gray-500 line-clamp-1">{srv.description}</p>
                                </div>
                                <span className="text-[10px] font-black bg-gray-100 text-gray-700 px-2 py-1 rounded-lg shrink-0 group-hover:bg-[#1f83c6] group-hover:text-white transition-colors ml-2">
                                  {srv.durationMinutes} mins
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* STEP 2: Select Date & Available Time Slot */}
                      {bookingState.step === 2 && (
                        <div className="space-y-3.5">
                          <div className="bg-blue-50/80 p-2.5 rounded-xl border border-blue-100 flex justify-between items-center">
                            <div>
                              <span className="text-xs font-bold text-[#20235b]">{bookingState.selectedService?.name}</span>
                              <p className="text-[10px] text-gray-500">{bookingState.selectedService?.durationMinutes} Minutes Consultation</p>
                            </div>
                            <button 
                              onClick={() => setBookingState(prev => ({ ...prev, step: 1 }))}
                              className="text-[11px] text-[#1f83c6] font-bold hover:underline cursor-pointer"
                            >
                              Change
                            </button>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1">Select Consultation Date (Mon - Sat)</label>
                            <input 
                              type="date"
                              min={new Date().toISOString().split('T')[0]}
                              value={bookingState.selectedDate}
                              onChange={(e) => handleDateChange(e.target.value)}
                              className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#1f83c6] bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                              Select Time Slot (IST):
                            </label>

                            {bookingState.loadingSlots ? (
                              <div className="p-6 text-center flex flex-col items-center">
                                <Loader2 className="w-5 h-5 animate-spin text-[#1f83c6] mb-1.5" />
                                <span className="text-xs text-gray-400 font-medium">Checking live availability...</span>
                              </div>
                            ) : bookingState.error ? (
                              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium border border-red-100">
                                {bookingState.error}
                              </div>
                            ) : (
                              <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto p-1 custom-scrollbar">
                                {(bookingState.availableSlots || []).map(slot => (
                                  <button
                                    key={slot.startTime}
                                    type="button"
                                    onClick={() => handleSelectSlot(slot)}
                                    className={`text-xs font-bold py-2 px-1 rounded-xl border transition-all cursor-pointer ${
                                      bookingState.selectedSlot?.startTime === slot.startTime
                                        ? 'bg-[#1f83c6] text-white border-[#1f83c6] shadow-sm'
                                        : 'bg-white text-gray-800 border-gray-200 hover:bg-blue-50 hover:border-[#1f83c6]'
                                    }`}
                                  >
                                    {slot.startDisplay || slot.startTime}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* STEP 3: Customer Details & Booking Confirmation */}
                      {bookingState.step === 3 && (
                        <form onSubmit={handleConfirmBooking} className="space-y-3.5">
                          <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-100 space-y-1 text-xs">
                            <div className="font-bold text-[#20235b]">{bookingState.selectedService?.name}</div>
                            <div className="text-gray-600 flex items-center gap-1.5">
                              <Calendar size={13} className="text-[#1f83c6]" /> {bookingState.selectedDate} at {bookingState.selectedSlot?.startDisplay || bookingState.selectedSlot?.startTime} IST
                            </div>
                          </div>

                          {bookingState.error && (
                            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-200">
                              {bookingState.error}
                            </div>
                          )}

                          <div className="space-y-2.5">
                            <div>
                              <label className="block text-[11px] font-bold text-gray-700 mb-0.5">Your Full Name *</label>
                              <input 
                                required
                                type="text"
                                placeholder="e.g. Harsha Subhash"
                                value={bookingState.customerName}
                                onChange={e => setBookingState({ ...bookingState, customerName: e.target.value })}
                                className="w-full text-xs p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#1f83c6] bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-gray-700 mb-0.5">Email Address *</label>
                              <input 
                                required
                                type="email"
                                placeholder="harshasubhash123@gmail.com"
                                value={bookingState.customerEmail}
                                onChange={e => setBookingState({ ...bookingState, customerEmail: e.target.value })}
                                className="w-full text-xs p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#1f83c6] bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-gray-700 mb-0.5">Phone Number</label>
                              <input 
                                type="tel"
                                placeholder="+91 93802 68436"
                                value={bookingState.customerPhone}
                                onChange={e => setBookingState({ ...bookingState, customerPhone: e.target.value })}
                                className="w-full text-xs p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#1f83c6] bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-gray-700 mb-0.5">Discussion Topic / Goal (Optional)</label>
                              <input 
                                type="text"
                                placeholder="e.g. Need resume audit for Google SDE application"
                                value={bookingState.notes}
                                onChange={e => setBookingState({ ...bookingState, notes: e.target.value })}
                                className="w-full text-xs p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#1f83c6] bg-white"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={bookingState.submitting}
                            className="w-full bg-gradient-to-r from-[#20235b] to-[#1f83c6] text-white text-xs font-black py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                          >
                            {bookingState.submitting ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Confirming & Sending Email...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4" /> Confirm Appointment
                              </>
                            )}
                          </button>
                        </form>
                      )}

                      {/* STEP 4: Success Confirmed */}
                      {bookingState.step === 4 && (
                        <div className="p-4 text-center space-y-3">
                          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle size={28} />
                          </div>
                          <h4 className="text-sm font-black text-gray-900">Appointment Confirmed!</h4>
                          <p className="text-xs text-gray-600">
                            A confirmation email has been dispatched to <strong>harshasubhash123@gmail.com</strong> and <strong>{bookingState.customerEmail}</strong>.
                          </p>

                          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-left text-xs space-y-1 my-2">
                            <div><strong>Service:</strong> {bookingState.selectedService?.name}</div>
                            <div><strong>Date:</strong> {bookingState.selectedDate}</div>
                            <div><strong>Time:</strong> {bookingState.selectedSlot?.startDisplay || bookingState.selectedSlot?.startTime} IST</div>
                            <div><strong>Name:</strong> {bookingState.customerName}</div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => startBookingFlow()}
                              className="flex-1 py-2.5 bg-gray-100 text-gray-800 text-xs font-bold rounded-xl hover:bg-gray-200 cursor-pointer"
                            >
                              Book Another
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveTab('chat')}
                              className="flex-1 py-2.5 bg-[#20235b] text-white text-xs font-bold rounded-xl hover:bg-[#1a2c6d] cursor-pointer"
                            >
                              Back to Chat
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : activeTab === 'my-bookings' ? (
                  /* VIEW 2: MY BOOKINGS MANAGER */
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                      <div>
                        <h4 className="font-black text-gray-900 text-sm">Your Consultation Bookings</h4>
                        <p className="text-[11px] text-gray-500">Manage or reschedule upcoming sessions.</p>
                      </div>
                      <button 
                        onClick={() => setActiveTab('chat')} 
                        className="text-xs font-bold text-[#1f83c6] hover:underline cursor-pointer"
                      >
                        Back to Chat
                      </button>
                    </div>

                    {loadingMyAppointments ? (
                      <div className="p-8 text-center flex flex-col items-center">
                        <Loader2 className="w-6 h-6 animate-spin text-[#1f83c6] mb-2" />
                        <span className="text-xs text-gray-500 font-medium">Loading your appointments...</span>
                      </div>
                    ) : myAppointments.length === 0 ? (
                      <div className="p-8 text-center bg-white rounded-2xl border border-gray-200">
                        <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs font-bold text-gray-700">No appointments found.</p>
                        <p className="text-[11px] text-gray-400 mt-1 mb-4">Book your 1-on-1 career consultation in seconds.</p>
                        <button 
                          onClick={() => startBookingFlow()}
                          className="bg-[#20235b] text-white text-xs font-black px-4 py-2 rounded-xl hover:bg-[#1a2c6d] transition-colors cursor-pointer"
                        >
                          Book an Appointment Now
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {myAppointments.map(appt => (
                          <div key={appt.id} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                  appt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                                  appt.status === 'rescheduled' ? 'bg-blue-100 text-blue-800' :
                                  appt.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {appt.status}
                                </span>
                                <h5 className="text-xs font-bold text-gray-900 mt-1">{appt.service?.name || 'Career Consultation'}</h5>
                              </div>
                              <span className="text-[10px] text-gray-400 font-mono">#{appt.id.slice(0, 8)}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-[#1f83c6]" />
                                <span className="font-semibold">{appt.appointmentDate}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-[#1f83c6]" />
                                <span className="font-semibold">{appt.startTime} - {appt.endTime}</span>
                              </div>
                            </div>

                            {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                              <div className="flex gap-2 pt-1">
                                <button
                                  onClick={() => openRescheduleModal(appt)}
                                  className="flex-1 text-[11px] font-bold py-1.5 bg-blue-50 text-[#1f83c6] hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                                >
                                  Reschedule
                                </button>
                                <button
                                  onClick={() => handleCancelAppointment(appt.id)}
                                  className="flex-1 text-[11px] font-bold py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reschedule Inline Modal */}
                    {rescheduleData.appointmentId && (
                      <div className="bg-white p-4 rounded-2xl border-2 border-[#1f83c6] shadow-lg space-y-3">
                        <div className="flex justify-between items-center">
                          <h5 className="text-xs font-black text-gray-900">Reschedule Appointment</h5>
                          <button onClick={() => setRescheduleData({ appointmentId: null })} className="text-gray-400 text-xs font-bold cursor-pointer">✕</button>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Select New Date</label>
                          <input 
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            value={rescheduleData.date}
                            onChange={(e) => handleRescheduleDateChange(e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-gray-200 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Select Available Time Slot</label>
                          <div className="grid grid-cols-3 gap-1.5 max-h-28 overflow-y-auto p-1">
                            {rescheduleData.slots.map(s => (
                              <button
                                key={s.startTime}
                                type="button"
                                onClick={() => setRescheduleData(prev => ({ ...prev, slot: s }))}
                                className={`text-[10px] py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
                                  rescheduleData.slot?.startTime === s.startTime 
                                    ? 'bg-[#1f83c6] text-white border-[#1f83c6]' 
                                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                                }`}
                              >
                                {s.startTime}
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          disabled={!rescheduleData.slot || rescheduleData.saving}
                          onClick={submitReschedule}
                          className="w-full bg-[#20235b] text-white text-xs font-black py-2 rounded-xl disabled:opacity-50 cursor-pointer"
                        >
                          {rescheduleData.saving ? 'Saving...' : 'Confirm Reschedule'}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* VIEW 3: CHAT CONVERSATION */
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/40">
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-start gap-2.5 max-w-[88%]">
                          {msg.role !== 'user' && (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#20235b] to-[#1f83c6] text-white flex items-center justify-center shrink-0 text-xs shadow-sm mt-0.5">
                              <Bot size={15} />
                            </div>
                          )}

                          <div
                            className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                              msg.role === 'user'
                                ? 'bg-gradient-to-r from-[#20235b] to-[#1f83c6] text-white rounded-tr-none'
                                : 'bg-white text-gray-800 border border-gray-150 rounded-tl-none'
                            }`}
                          >
                            <div className="whitespace-pre-wrap font-sans space-y-1.5">
                              {msg.content.split('\n').map((line, lIdx) => {
                                if (line.startsWith('**') && line.endsWith('**')) {
                                  return <p key={lIdx} className="font-bold text-gray-900">{line.replace(/\*\*/g, '')}</p>;
                                }
                                return <p key={lIdx}>{line}</p>;
                              })}
                            </div>

                            {/* Internal Links Navigation */}
                            {msg.role !== 'user' && (
                              <div className="mt-2 flex flex-wrap gap-1.5 pt-1.5 border-t border-gray-100">
                                {msg.content.includes('/resume') && (
                                  <button onClick={() => handleLinkClick('/resume')} className="text-[10px] font-bold text-[#1f83c6] hover:underline flex items-center gap-0.5 cursor-pointer">
                                    Open Resume Builder <ExternalLink size={10} />
                                  </button>
                                )}
                                {msg.content.includes('/companies') && (
                                  <button onClick={() => handleLinkClick('/companies')} className="text-[10px] font-bold text-[#1f83c6] hover:underline flex items-center gap-0.5 cursor-pointer">
                                    Open Companies <ExternalLink size={10} />
                                  </button>
                                )}
                                {msg.content.includes('/payment') && (
                                  <button onClick={() => handleLinkClick('/payment')} className="text-[10px] font-bold text-[#1f83c6] hover:underline flex items-center gap-0.5 cursor-pointer">
                                    Open Pricing <ExternalLink size={10} />
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Booking reference card */}
                            {msg.appointmentCard && (
                              <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-[11px] text-emerald-950 space-y-1">
                                <div className="font-bold text-emerald-900 flex items-center gap-1">
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Booking Reference #{msg.appointmentCard.id.slice(0, 8)}
                                </div>
                                <div>Service: {msg.appointmentCard.service?.name}</div>
                                <div>Date: {msg.appointmentCard.appointmentDate} at {msg.appointmentCard.startTime}</div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Quick Action Chips */}
                        {msg.showQuickActions && (
                          <div className="mt-3 w-full pl-9 flex flex-wrap gap-1.5">
                            {QUICK_ACTIONS.map(action => (
                              <button
                                key={action.label}
                                onClick={() => handleSend(action.query)}
                                className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                                  action.isSpecial 
                                    ? 'bg-blue-50 border-blue-200 text-[#1f83c6] hover:bg-blue-100 hover:scale-105'
                                    : 'bg-white border-gray-200 text-gray-700 hover:border-[#1f83c6] hover:text-[#1f83c6]'
                                }`}
                              >
                                {action.icon}
                                <span>{action.label}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Dynamic suggested actions from AI */}
                        {msg.suggestedActions && !msg.showQuickActions && (
                          <div className="mt-2 w-full pl-9 flex flex-wrap gap-1.5">
                            {msg.suggestedActions.map((sAction, sIdx) => (
                              <button
                                key={sIdx}
                                onClick={() => handleSend(sAction)}
                                className="text-[10px] font-bold px-2.5 py-1 bg-white border border-gray-200 rounded-full text-gray-700 hover:border-[#1f83c6] hover:text-[#1f83c6] transition-colors cursor-pointer"
                              >
                                {sAction}
                              </button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}

                    {loading && (
                      <div className="flex items-center gap-2.5 text-xs text-gray-400 pl-1">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#20235b] to-[#1f83c6] text-white flex items-center justify-center shrink-0">
                          <Bot size={15} />
                        </div>
                        <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-150 flex items-center gap-1.5 shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-[#1f83c6] animate-bounce"></span>
                          <span className="w-2 h-2 rounded-full bg-[#1f83c6] animate-bounce delay-100"></span>
                          <span className="w-2 h-2 rounded-full bg-[#1f83c6] animate-bounce delay-200"></span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}

                {/* Bottom Input Bar */}
                {activeTab === 'chat' && (
                  <div className="p-3 bg-white border-t border-gray-200 shrink-0">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                      }}
                      className="relative flex items-center"
                    >
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask CareerCraft AI or type 'Book Appointment'..."
                        disabled={loading}
                        className="w-full bg-gray-50 rounded-full py-3 pl-4 pr-12 text-xs outline-none border border-gray-200 focus:border-[#1f83c6] focus:bg-white focus:ring-2 focus:ring-[#1f83c6]/20 transition-all font-medium text-gray-800"
                      />
                      <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="absolute right-1.5 bg-gradient-to-r from-[#20235b] to-[#1f83c6] text-white p-2 rounded-full hover:opacity-90 disabled:opacity-40 transition-all shadow-sm cursor-pointer"
                        aria-label="Send Message"
                      >
                        <Send size={14} />
                      </button>
                    </form>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CareerCraftAI;
