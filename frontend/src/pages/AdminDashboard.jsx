import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogOut, Users, Mail, Phone, Calendar, Briefcase, ShieldCheck, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users'); // users | logs
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = localStorage.getItem('adminToken') === 'admin_authenticated';
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const endpoint = activeTab === 'users' ? '/api/admin/users' : '/api/admin/logs';
        const res = await axios.get(`http://localhost:5000${endpoint}`);
        setData(res.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  if (loading) return <div className="p-20 text-center text-xl font-black text-darkGreen animate-pulse">Accessing Secure SQL Database...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
              <ShieldCheck className="text-darkGreen" size={40} /> Admin Control Center
            </h1>
            <p className="text-gray-600 mt-2 font-medium">Real-time surveillance of SQL user data and login activities.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-gray-200 p-1 rounded-2xl flex">
              <button 
                onClick={() => setActiveTab('users')}
                className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'users' ? 'bg-white shadow-md text-darkGreen' : 'text-gray-500'}`}
              >
                Users
              </button>
              <button 
                onClick={() => setActiveTab('logs')}
                className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'logs' ? 'bg-white shadow-md text-darkGreen' : 'text-gray-500'}`}
              >
                Login Logs
              </button>
              <button 
                onClick={() => setActiveTab('skillgap')}
                className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'skillgap' ? 'bg-white shadow-md text-darkGreen' : 'text-gray-500'}`}
              >
                Skill Gap Logs
              </button>
            </div>
            <button onClick={handleLogout} className="bg-red-500 text-white px-6 py-2 rounded-2xl font-bold flex items-center gap-2 hover:bg-red-600 transition-all shadow-lg">
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="overflow-x-auto bg-white rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-darkGreen text-white">
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
              {activeTab === 'skillgap' ? (
                // Mock data for skillgap
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
          {data.length === 0 && activeTab !== 'skillgap' && (
            <div className="p-24 text-center">
              <Activity className="mx-auto text-gray-200 mb-4" size={64} />
              <p className="text-gray-400 font-bold">No records found in the SQL database.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
