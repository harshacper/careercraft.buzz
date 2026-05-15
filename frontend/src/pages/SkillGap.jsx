import React, { useState, useRef } from 'react';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { Target, BookOpen, Briefcase, Building2, TrendingUp, Download, AlertCircle, CheckCircle2, Star, Rocket, ChevronRight, FileText } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import jobsData from '../data/jobs.json';

const SkillGap = () => {
  const [analyzed, setAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);
  const reportRef = useRef();

  const [formData, setFormData] = useState({
    name: '',
    qualification: '',
    experience: '',
    skills: '',
    targetRole: 'Full Stack Developer'
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  const roleJDs = {
    'Full Stack Developer': 'Required skills: HTML, CSS, JavaScript, React, Node.js, Express, MongoDB/SQL, REST APIs, Git, Cloud deployment, System Design, Backend Architecture.',
    'Data Scientist': 'Required skills: Python, R, Machine Learning, Statistics, Data Visualization, SQL, Pandas, NumPy, Deep Learning, Big Data, Spark.',
    'Product Manager': 'Required skills: Product Lifecycle, Agile, User Research, Roadmapping, Stakeholder Management, Data Analysis, UX principles, Market Analysis.',
    'UI/UX Designer': 'Required skills: Figma, Adobe XD, User Research, Wireframing, Prototyping, Visual Design, Typography, Color Theory, Interaction Design.',
    'Cloud Engineer': 'Required skills: AWS, Azure, GCP, Docker, Kubernetes, Terraform, CI/CD, Networking, Security, Linux Administration, Infrastructure as Code.'
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let resumeBase64 = '';
      let resumeName = 'resume.txt';

      if (resumeFile) {
        resumeBase64 = await fileToBase64(resumeFile);
        resumeName = resumeFile.name;
      } else {
        // Fallback to text input if no file
        const textContent = `Name: ${formData.name}\nSkills: ${formData.skills}\nExperience: ${formData.experience}`;
        resumeBase64 = btoa(unescape(encodeURIComponent(textContent)));
      }

      const jdText = roleJDs[formData.targetRole] || roleJDs['Full Stack Developer'];
      const jdBase64 = btoa(unescape(encodeURIComponent(jdText)));

      console.log('Sending request to backend...');
      const response = await api.post('/skill-gap/analyze', {
        resumeContent: resumeBase64,
        resumeFileName: resumeName,
        jdContent: jdBase64,
        jdFileName: 'job_description.txt'
      });

      console.log('Analysis Result Received:', response.data);
      setAnalysisResult(response.data);
      setAnalyzed(true);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Failed to analyze skill gap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    const element = reportRef.current;
    const canvas = await html2canvas(element);
    const data = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(data);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('Skill_Gap_Report.pdf');
  };

  const chartData = [
    { name: 'Current Skills', value: 65, color: '#0B3D2E' },
    { name: 'Gap', value: 35, color: '#E5E7EB' },
  ];

  const barData = [
    { name: 'React', level: 90 },
    { name: 'Node.js', level: 40 },
    { name: 'System Design', level: 20 },
    { name: 'SQL', level: 55 },
    { name: 'Cloud/AWS', level: 15 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Rocket className="text-darkGreen animate-bounce w-16 h-16 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">AI is Analyzing your Career Path...</h2>
        <p className="text-gray-500">Comparing your skills with 10,000+ industry job descriptions.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 bg-gray-50 min-h-screen">
      {!analyzed ? (
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-extrabold text-darkGreen mb-4">Intelligent Skill Gap Analysis</h1>
            <p className="text-gray-600 text-lg">Upload your resume or fill in your details to generate a 360° career roadmap.</p>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glassmorphism p-10 bg-white shadow-2xl rounded-3xl border border-gray-100">
            <form onSubmit={handleAnalyze} className="grid md:grid-cols-2 gap-8">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-4 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-darkGreen/20 transition-all" placeholder="John Doe" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-bold text-gray-700 mb-2">Target Job Role</label>
                <select value={formData.targetRole} onChange={e => setFormData({...formData, targetRole: e.target.value})} className="w-full px-5 py-4 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-darkGreen/20 transition-all bg-white">
                  <option>Full Stack Developer</option>
                  <option>Data Scientist</option>
                  <option>Product Manager</option>
                  <option>UI/UX Designer</option>
                  <option>Cloud Engineer</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Current Skills (Comma Separated)</label>
                <textarea required value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} className="w-full px-5 py-4 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-darkGreen/20 transition-all h-32 resize-none" placeholder="HTML, CSS, React, Basic JS..." />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-bold text-gray-700 mb-2">Experience Level</label>
                <input value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} className="w-full px-5 py-4 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-darkGreen/20 transition-all" placeholder="e.g. 2 Years" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-bold text-gray-700 mb-2">Resume Upload (Optional)</label>
                <div 
                  onClick={() => document.getElementById('resume-upload').click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-darkGreen transition-all cursor-pointer bg-gray-50 flex flex-col items-center justify-center gap-1"
                >
                  <FileText className="text-gray-400" size={24} />
                  <span className="text-xs font-bold text-gray-600">
                    {resumeFile ? resumeFile.name : 'Choose File'}
                  </span>
                  <input 
                    id="resume-upload"
                    type="file" 
                    className="hidden" 
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => {
                      if(e.target.files[0]) setResumeFile(e.target.files[0]);
                    }}
                  />
                </div>
              </div>
              <div className="col-span-2">
                <button type="submit" className="w-full bg-darkGreen text-white py-5 rounded-2xl font-black text-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all flex justify-center items-center gap-3">
                  Start AI Analysis <Target size={24} />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      ) : (
        <div className="space-y-10" ref={reportRef}>
          {/* Header Stats */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="text-4xl font-black text-gray-900">Career Analysis Report</h2>
              <p className="text-gray-500 text-lg">Analysis for <span className="text-darkGreen font-bold">{formData.targetRole}</span> position.</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setAnalyzed(false)} className="px-6 py-3 border-2 border-gray-200 rounded-xl font-bold hover:bg-gray-100 transition-all">New Analysis</button>
              <button onClick={downloadPDF} className="bg-darkGreen text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-xl transition-all">
                <Download size={20} /> Download Report
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Visual Skill Gap Card */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 glassmorphism p-8 bg-white border border-gray-100 flex flex-col items-center">
              <h3 className="text-xl font-black text-darkGreen mb-6">Skill Readiness Score</h3>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{ name: 'Ready', value: analysisResult?.overallScore || 65, color: '#0B3D2E' }, { name: 'Gap', value: 100 - (analysisResult?.overallScore || 65), color: '#E5E7EB' }]} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center">
                <span className="text-5xl font-black text-darkGreen">
                  {analysisResult?.overallScore || 65}%
                </span>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-sm mt-2">Job Ready</p>
              </div>
            </motion.div>

            {/* Bars Analysis */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 glassmorphism p-8 bg-white border border-gray-100">
              <h3 className="text-xl font-black text-darkGreen mb-6">Skill Level vs Requirement</h3>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analysisResult?.skillGap?.map(s => ({ name: s.skill, level: s.matchPercentage || 50 })) || barData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="level" fill="#0B3D2E" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Gap Detection Card */}
            <div className="glassmorphism p-8 border-l-8 border-red-500 bg-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-red-100 p-3 rounded-full text-red-600"><AlertCircle /></div>
                <h3 className="text-2xl font-black">Identified Gaps</h3>
              </div>
              <div className="space-y-4">
                {(analysisResult?.missingSkills || [
                  { skill: 'System Design', reason: 'Critical for Senior roles', diff: 'Hard' },
                  { skill: 'Cloud (AWS/Azure)', level: 'Required for deployment', diff: 'Medium' },
                  { skill: 'Relational DBs', level: 'Fundamental for Backend', diff: 'Easy' }
                ]).map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                      <h4 className="font-bold text-gray-900">{typeof item === 'string' ? item : item.skill}</h4>
                      <p className="text-sm text-gray-500">{item.reason || item.level || 'Highly recommended for this role'}</p>
                    </div>
                    <span className="px-3 py-1 bg-white text-gray-700 text-xs font-black rounded-lg border border-gray-200">{item.diff || 'Required'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights Card */}
            <div className="glassmorphism p-8 border-l-8 border-darkGreen bg-darkGreen text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-white/20 p-3 rounded-full"><TrendingUp /></div>
                <h3 className="text-2xl font-black">AI Career Insights</h3>
              </div>
              <p className="text-gray-200 leading-relaxed italic mb-6">
                "{analysisResult?.insights || `To become job-ready for ${formData.targetRole} in 2 months, prioritize learning the missing core skills. 80% of hiring companies now look for proficiency in these areas.`}"
              </p>
              <div className="space-y-4">
                <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                  <span className="text-xs font-bold uppercase text-gray-300 tracking-wider">Fastest Path:</span>
                  <p className="font-bold mt-1">Focus on PostgreSQL and AWS Lambda integration.</p>
                </div>
              </div>
            </div>
          </div>

          {/* ATS Score Predictions */}
          <section>
            <h3 className="text-3xl font-black mb-8 flex items-center gap-3"><Target className="text-darkGreen" /> Resume ATS Predictor (India)</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {(analysisResult?.atsScores || [
                { companyType: "Service-based (TCS, Infosys)", score: 85 },
                { companyType: "Product-based (Google, Amazon)", score: 60 },
                { companyType: "Top Startups (Cred, Razorpay)", score: 70 }
              ]).map((ats, i) => (
                <div key={i} className="glassmorphism p-6 bg-white hover:shadow-2xl transition-all border border-gray-100 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black mb-4 border-4" style={{ borderColor: ats.score >= 80 ? '#22c55e' : ats.score >= 60 ? '#eab308' : '#ef4444', color: ats.score >= 80 ? '#22c55e' : ats.score >= 60 ? '#eab308' : '#ef4444' }}>
                    {ats.score}%
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">{ats.companyType}</h4>
                  <p className="text-sm text-gray-500 mt-2">Predicted ATS Match</p>
                </div>
              ))}
            </div>
          </section>

          {/* Personalized Learning Plan */}
          <section>
            <h3 className="text-3xl font-black mb-8 flex items-center gap-3"><BookOpen className="text-darkGreen" /> Personalized Learning Plan</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {(analysisResult?.learningPlan || [
                { skill: 'System Design', resources: "Read 'Designing Data-Intensive Applications', practice on LeetCode System Design.", estimatedTime: "4 weeks" },
                { skill: 'AWS Cloud', resources: "Take AWS Cloud Practitioner course on Udemy or Coursera.", estimatedTime: "2 weeks" },
                { skill: 'Node.js Basics', resources: "Complete the FreeCodeCamp Backend Development Certification.", estimatedTime: "3 weeks" }
              ]).map((plan, i) => (
                <div key={i} className="glassmorphism p-6 bg-white hover:shadow-2xl transition-all border border-gray-100 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <Star className="text-yellow-400" size={20} fill="#facc15" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{plan.estimatedTime}</span>
                  </div>
                  <h4 className="text-xl font-black mb-2 text-gray-900">{plan.skill}</h4>
                  <p className="text-sm text-gray-600 mb-6 flex-grow">{plan.resources}</p>
                  <a href={`https://www.google.com/search?q=learn+${encodeURIComponent(plan.skill)}`} target="_blank" rel="noreferrer" className="w-full bg-softGray py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-darkGreen hover:text-white transition-all mt-auto">
                    Search Resources <ChevronRight size={16} />
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* Job Matching & Companies */}
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Job Roles */}
            <div className="space-y-6">
              <h3 className="text-3xl font-black flex items-center gap-3"><Briefcase className="text-darkGreen" /> Job Match Matching</h3>
              {jobsData.map((job, i) => (
                <div key={i} className="glassmorphism p-6 bg-white flex justify-between items-center border border-gray-100">
                  <div className="flex-1 pr-4">
                    <h4 className="text-xl font-black text-gray-900 line-clamp-1">{job.title}</h4>
                    <p className="text-gray-500 font-bold">{job.company} • <span className="text-darkGreen">{job.match}% Match</span></p>
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">{job.description}</p>
                  </div>
                  <button className="bg-darkGreen text-white px-6 py-2 rounded-full font-bold hover:scale-105 transition-all whitespace-nowrap">Apply</button>
                </div>
              ))}
            </div>

            {/* Recommended Companies */}
            <div className="space-y-6">
              <h3 className="text-3xl font-black flex items-center gap-3"><Building2 className="text-darkGreen" /> Company Insights</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'Google', industry: 'Tech', level: 'High' },
                  { name: 'Microsoft', industry: 'Enterprise', level: 'Medium' },
                  { name: 'Amazon', industry: 'Cloud', level: 'High' },
                  { name: 'Meta', industry: 'Social', level: 'Medium' }
                ].map((co, i) => (
                  <div key={i} className="glassmorphism p-4 bg-white border border-gray-100 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-softGray rounded-full mb-3 flex items-center justify-center font-black text-darkGreen">{co.name[0]}</div>
                    <h4 className="font-black text-gray-900">{co.name}</h4>
                    <p className="text-xs text-gray-500">{co.industry}</p>
                    <div className="mt-2 text-xs font-bold text-darkGreen px-2 py-1 bg-green-50 rounded-full">Match: {co.level}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillGap;
