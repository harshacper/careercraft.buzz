import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import safeStorage from '../utils/safeStorage';
import { 
  LogOut, Users, Mail, Phone, Calendar, Briefcase, ShieldCheck, 
  Activity, Clock, CheckCircle2, XCircle, Search, Filter, RefreshCw, 
  AlertCircle, Edit3, MessageSquare 
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('appointments'); // appointments | users | logs | skillgap
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Appointments filter & search state
  const [appointmentFilter, setAppointmentFilter] = useState({
    status: 'all',
    date: '',
    search: ''
  });
  const [appointmentStats, setAppointmentStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
    rescheduled: 0
  });

  // Reschedule & Notes Modal State
  const [activeAppointmentAction, setActiveAppointmentAction] = useState(null); // { appt, type: 'reschedule' | 'notes' | 'details' }
  const [actionFormData, setActionFormData] = useState({ date: '', startTime: '', notes: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const res = await api.get('/admin/users');
        setData(res.data);
      } else if (activeTab === 'logs') {
        const res = await api.get('/admin/logs');
        setData(res.data);
      } else if (activeTab === 'appointments') {
        const params = new URLSearchParams();
        if (appointmentFilter.status && appointmentFilter.status !== 'all') params.append('status', appointmentFilter.status);
        if (appointmentFilter.date) params.append('date', appointmentFilter.date);
        if (appointmentFilter.search) params.append('search', appointmentFilter.search);

        const [apptsRes, statsRes] = await Promise.all([
          api.get(`/appointments?${params.toString()}`),
          api.get('/appointments/admin/stats').catch(() => ({ data: {} }))
        ]);

        setData(apptsRes.data || []);
        if (statsRes.data) setAppointmentStats(statsRes.data);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const isAdmin = safeStorage.getItem('adminToken') === 'admin_authenticated';
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, [navigate, activeTab, appointmentFilter.status, appointmentFilter.date]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleLogout = () => {
    safeStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  // Appointment Status Update Handler
  const handleUpdateStatus = async (apptId, newStatus) => {
    try {
      await api.patch(`/appointments/${apptId}`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update appointment status.');
    }
  };

  // Save Reschedule / Note form
  const handleSaveAction = async (e) => {
    e.preventDefault();
    if (!activeAppointmentAction) return;

    try {
      if (activeAppointmentAction.type === 'reschedule') {
        await api.patch(`/appointments/${activeAppointmentAction.appt.id}`, {
          date: actionFormData.date,
          startTime: actionFormData.startTime,
          reason: 'Rescheduled by Admin'
        });
      } else if (activeAppointmentAction.type === 'notes') {
        await api.patch(`/appointments/${activeAppointmentAction.appt.id}`, {
          notes: actionFormData.notes
        });
      }

      setActiveAppointmentAction(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Operation failed.');
    }
  };

  if (loading && data.length === 0) {
    return <div className="p-20 text-center text-xl font-black text-darkGreen animate-pulse">Accessing Secure Database...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 flex items-center gap-3">
              <ShieldCheck className="text-[#20235b] shrink-0" size={36} /> Admin Control Center
            </h1>
            <p className="text-gray-600 mt-2 font-medium text-sm sm:text-base">
              Real-time management of CareerCraft user accounts, login activity, and customer appointments.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="bg-gray-200 p-1.5 rounded-2xl flex overflow-x-auto max-w-full custom-scrollbar whitespace-nowrap shrink-0">
              <button 
                onClick={() => setActiveTab('appointments')}
                className={`px-4 sm:px-5 py-2 rounded-xl font-bold transition-all text-xs sm:text-sm cursor-pointer ${activeTab === 'appointments' ? 'bg-[#20235b] text-white shadow-md' : 'text-gray-600 hover:text-black'}`}
              >
                📅 Appointments
              </button>
              <button 
                onClick={() => setActiveTab('users')}
                className={`px-4 sm:px-5 py-2 rounded-xl font-bold transition-all text-xs sm:text-sm cursor-pointer ${activeTab === 'users' ? 'bg-[#20235b] text-white shadow-md' : 'text-gray-600 hover:text-black'}`}
              >
                👥 Users
              </button>
              <button 
                onClick={() => setActiveTab('logs')}
                className={`px-4 sm:px-5 py-2 rounded-xl font-bold transition-all text-xs sm:text-sm cursor-pointer ${activeTab === 'logs' ? 'bg-[#20235b] text-white shadow-md' : 'text-gray-600 hover:text-black'}`}
              >
                🔐 Login Logs
              </button>
              <button 
                onClick={() => setActiveTab('skillgap')}
                className={`px-4 sm:px-5 py-2 rounded-xl font-bold transition-all text-xs sm:text-sm cursor-pointer ${activeTab === 'skillgap' ? 'bg-[#20235b] text-white shadow-md' : 'text-gray-600 hover:text-black'}`}
              >
                ⚡ Skill Gap Logs
              </button>
            </div>
            <button onClick={handleLogout} className="bg-red-500 text-white px-5 py-2 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-600 transition-all shadow-md cursor-pointer text-xs sm:text-sm">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* APPOINTMENT STATS COUNTERS */}
        {activeTab === 'appointments' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Bookings</span>
              <p className="text-2xl font-black text-gray-900 mt-1">{appointmentStats.total || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Confirmed</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">{appointmentStats.confirmed || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Rescheduled</span>
              <p className="text-2xl font-black text-blue-600 mt-1">{appointmentStats.rescheduled || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm">
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Completed</span>
              <p className="text-2xl font-black text-purple-600 mt-1">{appointmentStats.completed || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Pending</span>
              <p className="text-2xl font-black text-amber-600 mt-1">{appointmentStats.pending || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-red-100 shadow-sm">
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Cancelled</span>
              <p className="text-2xl font-black text-red-600 mt-1">{appointmentStats.cancelled || 0}</p>
            </div>
          </div>
        )}

        {/* APPOINTMENT FILTERS BAR */}
        {activeTab === 'appointments' && (
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-3 justify-between items-center">
            <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="Search customer name, email, phone..."
                  value={appointmentFilter.search}
                  onChange={e => setAppointmentFilter({ ...appointmentFilter, search: e.target.value })}
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-[#20235b]"
                />
              </div>
              <button type="submit" className="bg-[#20235b] text-white text-xs font-bold px-4 py-2 rounded-xl">
                Search
              </button>
            </form>

            <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                <Filter size={14} /> Filter Status:
              </div>
              <select 
                value={appointmentFilter.status}
                onChange={e => setAppointmentFilter({ ...appointmentFilter, status: e.target.value })}
                className="text-xs font-semibold p-2 rounded-xl border border-gray-200 outline-none bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="rescheduled">Rescheduled</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <input 
                type="date"
                value={appointmentFilter.date}
                onChange={e => setAppointmentFilter({ ...appointmentFilter, date: e.target.value })}
                className="text-xs font-semibold p-2 rounded-xl border border-gray-200 outline-none bg-white"
              />

              {(appointmentFilter.status !== 'all' || appointmentFilter.date || appointmentFilter.search) && (
                <button 
                  onClick={() => {
                    setAppointmentFilter({ status: 'all', date: '', search: '' });
                  }}
                  className="text-xs text-red-500 hover:underline font-bold px-2 py-1"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content Table */}
        <div className="overflow-x-auto bg-white rounded-[24px] sm:rounded-[32px] shadow-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#20235b] text-white">
                {activeTab === 'appointments' && (
                  <>
                    <th className="p-5 font-bold uppercase text-[11px] tracking-wider">Date & Time</th>
                    <th className="p-5 font-bold uppercase text-[11px] tracking-wider">Customer Details</th>
                    <th className="p-5 font-bold uppercase text-[11px] tracking-wider">Service</th>
                    <th className="p-5 font-bold uppercase text-[11px] tracking-wider">Status</th>
                    <th className="p-5 font-bold uppercase text-[11px] tracking-wider">Notes / Reason</th>
                    <th className="p-5 font-bold uppercase text-[11px] tracking-wider text-right">Actions</th>
                  </>
                )}
                {activeTab === 'users' && (
                  <>
                    <th className="p-6 font-bold uppercase text-xs tracking-widest">ID</th>
                    <th className="p-6 font-bold uppercase text-xs tracking-widest">Full Name</th>
                    <th className="p-6 font-bold uppercase text-xs tracking-widest">Email</th>
                    <th className="p-6 font-bold uppercase text-xs tracking-widest">Phone</th>
                    <th className="p-6 font-bold uppercase text-xs tracking-widest">Experience</th>
                    <th className="p-6 font-bold uppercase text-xs tracking-widest">Last IP</th>
                  </>
                )}
                {activeTab === 'logs' && (
                  <>
                    <th className="p-6 font-bold uppercase text-xs tracking-widest">Timestamp</th>
                    <th className="p-6 font-bold uppercase text-xs tracking-widest">Email</th>
                    <th className="p-6 font-bold uppercase text-xs tracking-widest">IP Address</th>
                    <th className="p-6 font-bold uppercase text-xs tracking-widest">Status</th>
                    <th className="p-6 font-bold uppercase text-xs tracking-widest">Device / Browser</th>
                  </>
                )}
                {activeTab === 'skillgap' && (
                  <>
                    <th className="p-6 font-bold uppercase text-xs tracking-widest">Timestamp</th>
                    <th className="p-6 font-bold uppercase text-xs tracking-widest">Candidate Email</th>
                    <th className="p-6 font-bold uppercase text-xs tracking-widest">Target Role</th>
                    <th className="p-6 font-bold uppercase text-xs tracking-widest">Overall ATS Score</th>
                    <th className="p-6 font-bold uppercase text-xs tracking-widest">Missing Skills Identified</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {activeTab === 'appointments' ? (
                data.map((appt) => (
                  <tr key={appt.id} className="border-b border-gray-100 hover:bg-gray-50/70 transition-colors">
                    <td className="p-5">
                      <div className="font-black text-gray-900 text-xs flex items-center gap-1.5">
                        <Calendar size={13} className="text-[#1f83c6]" /> {appt.appointmentDate}
                      </div>
                      <div className="text-[11px] text-gray-500 font-semibold mt-0.5 flex items-center gap-1.5">
                        <Clock size={13} className="text-gray-400" /> {appt.startTime} - {appt.endTime}
                      </div>
                    </td>

                    <td className="p-5">
                      <div className="font-bold text-gray-900 text-xs">{appt.customer?.name || 'Customer'}</div>
                      <div className="text-[11px] text-gray-500">{appt.customer?.email}</div>
                      <div className="text-[10px] text-gray-400">{appt.customer?.phone}</div>
                    </td>

                    <td className="p-5">
                      <div className="font-bold text-gray-800 text-xs">{appt.service?.name || 'Consultation'}</div>
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bold">
                        {appt.service?.durationMinutes || 30} mins
                      </span>
                    </td>

                    <td className="p-5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        appt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                        appt.status === 'rescheduled' ? 'bg-blue-100 text-blue-800' :
                        appt.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                        appt.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {appt.status}
                      </span>
                    </td>

                    <td className="p-5 text-xs text-gray-600 max-w-xs truncate">
                      {appt.cancelledReason ? (
                        <span className="text-red-500 font-medium">Cancelled: {appt.cancelledReason}</span>
                      ) : (
                        appt.notes || '—'
                      )}
                    </td>

                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-1.5">
                        {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(appt.id, 'completed')}
                              title="Mark as Completed"
                              className="text-[10px] bg-purple-50 text-purple-700 hover:bg-purple-100 px-2.5 py-1 rounded-lg font-bold transition-colors"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => {
                                setActiveAppointmentAction({ appt, type: 'reschedule' });
                                setActionFormData({ date: appt.appointmentDate, startTime: appt.startTime, notes: appt.notes || '' });
                              }}
                              title="Reschedule"
                              className="text-[10px] bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 py-1 rounded-lg font-bold transition-colors"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Please enter a cancellation reason:', 'Cancelled by Admin');
                                if (reason) {
                                  api.patch(`/appointments/${appt.id}`, { status: 'cancelled', reason })
                                    .then(() => fetchData());
                                }
                              }}
                              title="Cancel"
                              className="text-[10px] bg-red-50 text-red-700 hover:bg-red-100 px-2.5 py-1 rounded-lg font-bold transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setActiveAppointmentAction({ appt, type: 'notes' });
                            setActionFormData({ date: '', startTime: '', notes: appt.notes || '' });
                          }}
                          title="Add / Edit Note"
                          className="text-[10px] bg-gray-100 text-gray-700 hover:bg-gray-200 px-2.5 py-1 rounded-lg font-bold transition-colors"
                        >
                          Notes
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : activeTab === 'skillgap' ? (
                [
                  { timestamp: new Date(Date.now() - 3600000).toLocaleString(), email: 'john@example.com', role: 'Software Engineer', score: '75%', missing: 'AWS, System Design' },
                  { timestamp: new Date(Date.now() - 7200000).toLocaleString(), email: 'sarah.d@example.com', role: 'Product Manager', score: '82%', missing: 'Agile, Jira' },
                  { timestamp: new Date(Date.now() - 86400000).toLocaleString(), email: 'mike_smith@example.com', role: 'Data Scientist', score: '60%', missing: 'TensorFlow, NLP' },
                ].map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-6 text-xs font-bold text-gray-400">{item.timestamp}</td>
                    <td className="p-6 font-black text-gray-900">{item.email}</td>
                    <td className="p-6 text-gray-600 font-medium">{item.role}</td>
                    <td className="p-6 font-black text-darkGreen">{item.score}</td>
                    <td className="p-6 text-xs text-red-500 font-bold bg-red-50/30 rounded-r-xl">{item.missing}</td>
                  </tr>
                ))
              ) : (
                data.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    {activeTab === 'users' ? (
                      <>
                        <td className="p-6 font-bold text-gray-400">#{item.id}</td>
                        <td className="p-6 font-black text-gray-900">{item.fullName}</td>
                        <td className="p-6 text-gray-600 font-medium">{item.email}</td>
                        <td className="p-6 text-gray-500 text-sm">{item.phoneNumber || 'N/A'}</td>
                        <td className="p-6 text-gray-600 flex items-center gap-2"><Briefcase size={16} /> {item.experience || 'N/A'}</td>
                        <td className="p-6 text-xs font-mono font-bold text-darkGreen bg-green-50/50">{item.lastIp || 'N/A'}</td>
                      </>
                    ) : (
                      <>
                        <td className="p-6 text-xs font-bold text-gray-400">{new Date(item.timestamp).toLocaleString()}</td>
                        <td className="p-6 font-black text-gray-900">{item.email}</td>
                        <td className="p-6 text-xs font-mono font-bold">{item.ipAddress}</td>
                        <td className="p-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.status === 'Success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-6 text-xs text-gray-400 truncate max-w-[200px]">{item.userAgent}</td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {data.length === 0 && (
            <div className="p-20 text-center">
              <Activity className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-400 font-bold text-sm">No records found matching current query.</p>
            </div>
          )}
        </div>
      </div>

      {/* Admin Action Modal (Reschedule or Edit Notes) */}
      {activeAppointmentAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-black text-gray-900 text-base">
                {activeAppointmentAction.type === 'reschedule' ? 'Reschedule Appointment' : 'Edit Appointment Notes'}
              </h3>
              <button 
                onClick={() => setActiveAppointmentAction(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1">
              <div><strong>Customer:</strong> {activeAppointmentAction.appt.customer?.name} ({activeAppointmentAction.appt.customer?.email})</div>
              <div><strong>Service:</strong> {activeAppointmentAction.appt.service?.name}</div>
              <div><strong>Current Schedule:</strong> {activeAppointmentAction.appt.appointmentDate} at {activeAppointmentAction.appt.startTime}</div>
            </div>

            <form onSubmit={handleSaveAction} className="space-y-4">
              {activeAppointmentAction.type === 'reschedule' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">New Date</label>
                    <input 
                      required
                      type="date"
                      value={actionFormData.date}
                      onChange={e => setActionFormData({ ...actionFormData, date: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#20235b]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">New Start Time (HH:MM 24h)</label>
                    <input 
                      required
                      type="text"
                      placeholder="e.g. 15:00"
                      value={actionFormData.startTime}
                      onChange={e => setActionFormData({ ...actionFormData, startTime: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#20235b]"
                    />
                  </div>
                </>
              )}

              {activeAppointmentAction.type === 'notes' && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Admin Notes</label>
                  <textarea 
                    rows={4}
                    value={actionFormData.notes}
                    onChange={e => setActionFormData({ ...actionFormData, notes: e.target.value })}
                    placeholder="Enter notes about this customer or consultation session..."
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#20235b]"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveAppointmentAction(null)}
                  className="w-1/3 py-2.5 rounded-xl text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 bg-[#20235b] text-white py-2.5 rounded-xl text-xs font-black hover:bg-[#1a2c6d] shadow-md transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
