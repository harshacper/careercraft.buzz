import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, User, Mail, Phone, CheckCircle, ChevronRight, 
  ChevronLeft, Loader2, Sparkles, ShieldCheck, HelpCircle, FileText,
  Target, Zap, Building2, AlertCircle, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
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

const BookAppointment = () => {
  const getDefaultDate = () => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    if (t.getDay() === 0) t.setDate(t.getDate() + 1);
    return t.toISOString().split('T')[0];
  };

  const [step, setStep] = useState(1);
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [selectedService, setSelectedService] = useState(DEFAULT_SERVICES[0]);
  const [selectedDate, setSelectedDate] = useState(getDefaultDate());
  const [availableSlots, setAvailableSlots] = useState(generateSlotsForDate(getDefaultDate()));
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Pre-fill user details if logged in
    const userStr = safeStorage.getItem('user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setCustomerName(u.fullName || u.name || '');
        setCustomerEmail(u.email || '');
        setCustomerPhone(u.phoneNumber || '');
      } catch (e) {}
    }

    // Fetch live services from backend
    const loadServices = async () => {
      try {
        const res = await api.get('/appointments/services');
        if (res.data && res.data.length > 0) {
          setServices(res.data);
          setSelectedService(res.data[0]);
        }
      } catch (err) {
        console.warn('Using default services fallback:', err);
      }
    };
    loadServices();
  }, []);

  const fetchSlots = async (serviceId, dateStr) => {
    if (!dateStr) return;
    setLoadingSlots(true);
    setError(null);

    try {
      const res = await api.get(`/appointments/availability?serviceId=${serviceId || ''}&date=${dateStr}`);
      if (res.data && res.data.slots) {
        setAvailableSlots(res.data.slots);
        setLoadingSlots(false);
        if (!res.data.isWorkingDay) {
          setError(res.data.reason || 'Selected date is not a working day. Please select Monday to Saturday.');
        } else if (res.data.slots.length === 0) {
          setError('No available slots remaining for this date. Please choose another date.');
        }
        return;
      }
    } catch (err) {
      // Fallback
    }

    const targetDate = new Date(`${dateStr}T00:00:00`);
    if (targetDate.getDay() === 0) {
      setAvailableSlots([]);
      setLoadingSlots(false);
      setError('Sunday is a non-working day. Please choose Monday to Saturday.');
    } else {
      setAvailableSlots(generateSlotsForDate(dateStr));
      setLoadingSlots(false);
      setError(null);
    }
  };

  const handleSelectService = (srv) => {
    setSelectedService(srv);
    setStep(2);
    fetchSlots(srv.id, selectedDate);
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setSelectedSlot(null);
    if (selectedService) {
      fetchSlots(selectedService.id, newDate);
    }
  };

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
    setStep(3);
  };

  const handleConfirm = async (e) => {
    e?.preventDefault();
    if (!customerName.trim() || !customerEmail.trim()) {
      setError('Please provide your Name and Email address.');
      return;
    }
    if (!selectedSlot) {
      setError('Please select an available time slot.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await api.post('/appointments', {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim() || 'N/A',
        serviceId: selectedService?.id,
        appointmentDate: selectedDate,
        startTime: selectedSlot.startTime,
        notes: notes.trim() || 'Booked via CareerCraft Web Booking Portal'
      });

      setConfirmedBooking(res.data.appointment);
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to book appointment. The slot may have just been reserved. Please select another slot.');
    } finally {
      setSubmitting(false);
    }
  };

  const restartBooking = () => {
    setStep(1);
    setSelectedSlot(null);
    setConfirmedBooking(null);
    setError(null);
    setSelectedDate(getDefaultDate());
    fetchSlots(selectedService?.id, getDefaultDate());
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-gray-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#1f83c6] text-xs sm:text-sm font-bold mb-4">
            <Calendar className="w-4 h-4" /> 
            <span>1-on-1 Live Expert Consultations</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#20235b] tracking-tight">
            Book an Appointment
          </h1>
          <p className="mt-3 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-medium">
            Schedule a personalized session with CareerCraft experts for resume review, ATS optimization, and career roadmap guidance.
          </p>
        </div>

        {/* Wizard Container */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Step Progress Indicators */}
          <div className="bg-gray-50 border-b border-gray-100 px-6 py-4">
            <div className="flex justify-between items-center max-w-2xl mx-auto">
              {[
                { num: 1, title: 'Service' },
                { num: 2, title: 'Date & Slot' },
                { num: 3, title: 'Your Details' },
                { num: 4, title: 'Confirmation' },
              ].map((s, idx) => (
                <div key={s.num} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-colors ${
                    step === s.num
                      ? 'bg-[#1f83c6] text-white shadow-md'
                      : step > s.num
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step > s.num ? <CheckCircle size={16} /> : s.num}
                  </div>
                  <span className={`text-xs font-bold hidden sm:inline ${
                    step === s.num ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {s.title}
                  </span>
                  {idx < 3 && <ChevronRight size={14} className="text-gray-300 ml-2 hidden sm:inline" />}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-10">
            {/* STEP 1: Select Service */}
            {step === 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-black text-gray-900">Step 1: Choose Your Consultation Service</h3>
                  <p className="text-xs text-gray-500 mt-1">Select the topic you want to discuss with our career advisors:</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map(srv => (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => handleSelectService(srv)}
                      className={`text-left p-5 rounded-2xl border-2 transition-all group flex flex-col justify-between cursor-pointer ${
                        selectedService?.id === srv.id
                          ? 'border-[#1f83c6] bg-blue-50/40 shadow-md'
                          : 'border-gray-100 hover:border-[#1f83c6]/60 bg-white hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-gray-900 group-hover:text-[#1f83c6] text-base transition-colors">
                            {srv.name}
                          </h4>
                          <span className="text-xs font-black bg-gray-100 text-gray-700 px-3 py-1 rounded-full shrink-0 group-hover:bg-[#1f83c6] group-hover:text-white transition-colors">
                            {srv.durationMinutes} mins
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          {srv.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs font-bold text-[#1f83c6]">
                        <span>Select this session</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2: Select Date & Time Slot */}
            {step === 2 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Step 2: Pick Date & Time Slot</h3>
                    <p className="text-xs text-gray-500 mt-1">Operating Hours: Monday – Saturday, 9:00 AM – 6:00 PM IST</p>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-[#1f83c6] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft size={16} /> Back to Services
                  </button>
                </div>

                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-blue-600 uppercase">Selected Service:</span>
                    <h4 className="font-black text-[#20235b] text-sm">{selectedService?.name}</h4>
                  </div>
                  <span className="text-xs font-bold bg-white text-[#20235b] px-3 py-1.5 rounded-xl border border-blue-200">
                    {selectedService?.durationMinutes} Minutes
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-gray-700 uppercase mb-2">
                      Select Date (Mon - Sat)
                    </label>
                    <input 
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={selectedDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-full text-sm font-semibold p-3.5 rounded-2xl border border-gray-200 outline-none focus:border-[#1f83c6] bg-white shadow-sm"
                    />
                    <p className="text-[11px] text-gray-400 mt-2">
                      Sundays are non-working days.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-700 uppercase mb-2">
                      Available Time Slots (IST)
                    </label>

                    {loadingSlots ? (
                      <div className="p-8 text-center flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-gray-200">
                        <Loader2 className="w-6 h-6 animate-spin text-[#1f83c6] mb-2" />
                        <span className="text-xs text-gray-500 font-medium">Checking live schedule...</span>
                      </div>
                    ) : error ? (
                      <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-semibold border border-red-200">
                        {error}
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="p-6 text-center bg-gray-50 text-gray-500 rounded-2xl text-xs font-semibold border border-gray-200">
                        No slots available for this date.
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1 custom-scrollbar">
                        {availableSlots.map(slot => (
                          <button
                            key={slot.startTime}
                            type="button"
                            onClick={() => handleSelectSlot(slot)}
                            className={`text-xs font-bold py-3 px-2 rounded-xl border transition-all cursor-pointer ${
                              selectedSlot?.startTime === slot.startTime
                                ? 'bg-[#1f83c6] text-white border-[#1f83c6] shadow-md scale-105'
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
              </motion.div>
            )}

            {/* STEP 3: Enter Details & Confirm */}
            {step === 3 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Step 3: Enter Your Contact Details</h3>
                    <p className="text-xs text-gray-500 mt-1">Confirmation & session details will be sent immediately to your email.</p>
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="text-xs font-bold text-[#1f83c6] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft size={16} /> Back to Slots
                  </button>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100 flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <div className="text-xs text-blue-600 font-bold uppercase">Consultation Summary:</div>
                    <div className="font-black text-[#20235b] text-base">{selectedService?.name}</div>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-700">
                    <span className="flex items-center gap-1.5"><Calendar size={14} className="text-[#1f83c6]" /> {selectedDate}</span>
                    <span className="flex items-center gap-1.5"><Clock size={14} className="text-[#1f83c6]" /> {selectedSlot?.startDisplay || selectedSlot?.startTime} IST</span>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-semibold border border-red-200">
                    {error}
                  </div>
                )}

                <form onSubmit={handleConfirm} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Your Full Name *</label>
                      <input 
                        required
                        type="text"
                        placeholder="e.g. Harsha Subhash"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        className="w-full text-sm p-3.5 rounded-2xl border border-gray-200 outline-none focus:border-[#1f83c6] bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
                      <input 
                        required
                        type="email"
                        placeholder="harshasubhash123@gmail.com"
                        value={customerEmail}
                        onChange={e => setCustomerEmail(e.target.value)}
                        className="w-full text-sm p-3.5 rounded-2xl border border-gray-200 outline-none focus:border-[#1f83c6] bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                      <input 
                        type="tel"
                        placeholder="+91 93802 68436"
                        value={customerPhone}
                        onChange={e => setCustomerPhone(e.target.value)}
                        className="w-full text-sm p-3.5 rounded-2xl border border-gray-200 outline-none focus:border-[#1f83c6] bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Specific Goal or Target Role (Optional)</label>
                      <input 
                        type="text"
                        placeholder="e.g. Google SDE-1 resume review & preparation"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        className="w-full text-sm p-3.5 rounded-2xl border border-gray-200 outline-none focus:border-[#1f83c6] bg-white"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-gradient-to-r from-[#20235b] to-[#1f83c6] text-white text-base font-black py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" /> Confirming Booking & Dispatching Email...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" /> Confirm Appointment & Dispatch Details
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STEP 4: Success Confirmed */}
            {step === 4 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="text-center py-8 space-y-6 max-w-xl mx-auto"
              >
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle size={44} />
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-gray-900">Appointment Confirmed!</h3>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                    A confirmation email has been dispatched to <strong>harshasubhash123@gmail.com</strong> and <strong>{customerEmail}</strong>.
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-left space-y-2.5 text-sm">
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500 font-bold">Booking Reference:</span>
                    <span className="font-mono font-black text-[#20235b]">#{confirmedBooking?.id?.slice(0, 8) || 'CONFIRMED'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-bold">Service:</span>
                    <span className="font-bold text-gray-900">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-bold">Date:</span>
                    <span className="font-bold text-gray-900">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-bold">Time Slot:</span>
                    <span className="font-bold text-gray-900">{selectedSlot?.startDisplay || selectedSlot?.startTime} IST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-bold">Customer:</span>
                    <span className="font-bold text-gray-900">{customerName}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <button
                    type="button"
                    onClick={restartBooking}
                    className="px-6 py-3.5 bg-gray-100 text-gray-800 font-bold rounded-2xl hover:bg-gray-200 transition-colors cursor-pointer text-sm"
                  >
                    Book Another Session
                  </button>
                  <Link
                    to="/dashboard"
                    className="px-8 py-3.5 bg-gradient-to-r from-[#20235b] to-[#1f83c6] text-white font-bold rounded-2xl hover:opacity-95 transition-opacity text-sm shadow-md"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
