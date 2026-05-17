import React, { useState } from 'react';
import { UploadCloud, FileText, Settings, Download, Sparkles, Loader2, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import ResumeTemplate from '../components/ResumeTemplate';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ResumeBuilder = () => {
  const [activeTab, setActiveTab] = useState('analyzer'); // analyzer | builder
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  
  // AI Builder State
  const [generating, setGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);
  const [suggesting, setSuggesting] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: '',
    role: '',
    experience: '',
    skills: '',
    summary: '',
    email: '',
    phone: '',
    address: '',
    linkedin: '',
    degree: '',
    school: '',
    eduDate: '',
    eduLocation: ''
  });

  const [expandedSection, setExpandedSection] = useState('basics'); // basics | contact | education

  const handleUpload = (e) => {
    e.preventDefault();
    if (!file) return;
    setAnalyzing(true);
    setTimeout(() => {
      setResult({
        score: 78,
        keywordsFound: ['JavaScript', 'React', 'Teamwork'],
        missingKeywords: ['Agile', 'Unit Testing', 'CI/CD'],
        suggestions: ['Quantify your achievements with numbers', 'Include action verbs at the beginning of bullet points']
      });
      setAnalyzing(false);
    }, 2000);
  };

  const handleSuggestSummary = async () => {
    if (!userDetails.role && !userDetails.skills && !userDetails.experience) {
      alert("Please provide at least a Target Role, Skills, or Experience before suggesting a summary.");
      return;
    }
    setSuggesting(true);
    try {
      const prompt = `Write a short, highly professional 3-sentence resume summary for a candidate. 
      Target Role: ${userDetails.role}
      Key Skills: ${userDetails.skills}
      Experience: ${userDetails.experience}
      Return ONLY the summary text, without any quotes or extra formatting.`;

      const res = await api.post('/chat', { 
        message: prompt,
        context: "Resume Summary Writer"
      });
      
      setUserDetails(prev => ({ ...prev, summary: res.data.reply.trim() }));
    } catch (err) {
      console.error(err);
      alert('Error suggesting summary.');
    } finally {
      setSuggesting(false);
    }
  };

  const handleGenerateAI = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const prompt = `Create a modern, ATS-friendly professional resume for a candidate. 
      IMPORTANT: Return ONLY a JSON object with the following structure:
      {
        "name": "...",
        "summary": "...",
        "targetRole": "...",
        "contact": { "address": "...", "phone": "...", "email": "...", "linkedin": "..." },
        "workHistory": [ { "date": "...", "role": "...", "company": "...", "location": "...", "points": ["...", "..."] } ],
        "education": [ { "date": "...", "degree": "...", "school": "...", "location": "..." } ],
        "skills": ["...", "..."]
      }
      Candidate Info:
      Name: ${userDetails.name}
      Target Role: ${userDetails.role}
      Experience: ${userDetails.experience}
      Skills: ${userDetails.skills}
      Provided Summary: ${userDetails.summary || "Generate one based on info."}`;

      const res = await api.post('/chat', { 
        message: prompt,
        context: "Structured Resume Generation"
      });
      
      const jsonStr = res.data.reply.match(/\{[\s\S]*\}/)[0];
      const parsedData = JSON.parse(jsonStr);

      // Force explicitly typed contact and education values so AI doesn't hallucinate them
      parsedData.contact = {
        email: userDetails.email || parsedData.contact?.email || '',
        phone: userDetails.phone || parsedData.contact?.phone || '',
        address: userDetails.address || parsedData.contact?.address || '',
        linkedin: userDetails.linkedin || parsedData.contact?.linkedin || ''
      };

      if (userDetails.degree || userDetails.school) {
        parsedData.education = [{
          degree: userDetails.degree || parsedData.education?.[0]?.degree || '',
          school: userDetails.school || parsedData.education?.[0]?.school || '',
          date: userDetails.eduDate || parsedData.education?.[0]?.date || '',
          location: userDetails.eduLocation || parsedData.education?.[0]?.location || ''
        }];
      }

      setGeneratedData(parsedData);
    } catch (err) {
      console.error(err);
      alert('Error generating resume. Please ensure the AI returns valid data.');
    } finally {
      setGenerating(false);
    }
  };

  const downloadPDF = async () => {
    const element = document.getElementById('resume-content');
    const canvas = await html2canvas(element, { scale: 2 });
    const data = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(data);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${userDetails.name || 'Resume'}_Generated.pdf`);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col items-center mb-10">
        <h1 className="text-4xl font-black text-darkGreen">AI Resume Intelligence</h1>
        <p className="text-gray-600 mt-2">Optimize your current resume or generate a new one from scratch.</p>
        
        <div className="flex gap-4 mt-8 bg-gray-200 p-1 rounded-2xl">
          <button onClick={()=>setActiveTab('analyzer')} className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab==='analyzer' ? 'bg-white shadow-xl text-darkGreen' : 'text-gray-600'}`}>ATS Analyzer</button>
          <button onClick={()=>setActiveTab('builder')} className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab==='builder' ? 'bg-white shadow-xl text-darkGreen' : 'text-gray-600'}`}>AI Builder</button>
        </div>
      </div>

      {activeTab === 'analyzer' ? (
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Analyzer View remains unchanged */}
          <div className="glassmorphism p-8 flex flex-col items-center justify-center border-dashed border-2 border-gray-300 min-h-[400px]">
            {!result ? (
              <form onSubmit={handleUpload} className="w-full flex flex-col items-center">
                <UploadCloud className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Upload your resume</h3>
                <p className="text-gray-500 mb-6 text-center">PDF or DOCX (max 5MB)</p>
                <input type="file" accept=".pdf,.docx" onChange={(e)=>setFile(e.target.files[0])} className="mb-6 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-darkGreen file:text-white hover:file:bg-opacity-90" />
                <button type="submit" disabled={!file || analyzing} className="bg-darkGreen text-white px-8 py-3 rounded-full font-bold hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2">
                  {analyzing ? 'Analyzing...' : 'Analyze Now'} <Settings size={18} className={analyzing ? 'animate-spin' : ''}/>
                </button>
              </form>
            ) : (
              <div className="text-center">
                <FileText className="w-16 h-16 text-darkGreen mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">{file?.name}</h3>
                <p className="text-green-600 font-medium mb-6">Successfully analyzed</p>
                <button onClick={()=>{setResult(null); setFile(null);}} className="text-gray-500 underline hover:text-gray-800">Analyze another file</button>
              </div>
            )}
          </div>

          <div className="glassmorphism p-8">
            <h2 className="text-2xl font-bold mb-6">Analysis Results</h2>
            {result ? (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="font-semibold text-gray-700">Overall ATS Score</span>
                  <div className="flex items-center gap-3">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 w-32">
                      <div className="bg-darkGreen h-2.5 rounded-full" style={{width: `${result.score}%`}}></div>
                    </div>
                    <span className="text-2xl font-bold text-darkGreen">{result.score}%</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wider">Missing Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.missingKeywords.map(k => <span key={k} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">{k}</span>)}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wider">Improvement Tips</h4>
                  <ul className="space-y-2 text-gray-600 text-sm list-disc list-inside">
                    {result.suggestions.map((s,i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-center">
                Upload a resume to see detailed insights and improvement suggestions.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-10">
           {/* Form Section */}
           <div className="lg:col-span-4 glassmorphism p-6 bg-white border border-gray-100 max-h-[800px] overflow-y-auto custom-scrollbar">
             <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2"><Sparkles className="text-darkGreen" /> AI Designer</h2>
             <form onSubmit={handleGenerateAI} className="space-y-4">
               
               {/* Basics & AI */}
               <div className="border border-gray-200 rounded-xl overflow-hidden">
                 <button type="button" onClick={() => setExpandedSection('basics')} className="w-full bg-gray-50 p-4 font-bold text-left flex justify-between items-center text-gray-800">
                   Basics & AI Generation {expandedSection === 'basics' ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                 </button>
                 {expandedSection === 'basics' && (
                   <div className="p-4 space-y-4 bg-white">
                     <div>
                       <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                       <input required value={userDetails.name} onChange={e => setUserDetails({...userDetails, name: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-darkGreen text-sm" placeholder="John Doe" />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-gray-700 mb-1">Target Role</label>
                       <input required value={userDetails.role} onChange={e => setUserDetails({...userDetails, role: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-darkGreen text-sm" placeholder="IT Specialist" />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-gray-700 mb-1">Key Skills</label>
                       <textarea required value={userDetails.skills} onChange={e => setUserDetails({...userDetails, skills: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-darkGreen h-20 text-sm" placeholder="Cybersecurity, Data Analysis..." />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-gray-700 mb-1">Experience Summary</label>
                       <textarea required value={userDetails.experience} onChange={e => setUserDetails({...userDetails, experience: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-darkGreen h-24 text-sm" placeholder="3 years as Systems Analyst..." />
                     </div>
                     <div>
                       <div className="flex justify-between items-end mb-1">
                         <label className="block text-xs font-bold text-gray-700">Professional Summary</label>
                         <button type="button" onClick={handleSuggestSummary} disabled={suggesting} className="text-[10px] font-bold bg-[#ffcccc] text-[#ef4444] px-2 py-1 rounded hover:bg-red-200 transition-all flex items-center gap-1">
                           {suggesting ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} AI Suggest
                         </button>
                       </div>
                       <textarea value={userDetails.summary} onChange={e => setUserDetails({...userDetails, summary: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-darkGreen h-20 text-sm" placeholder="Passionate IT specialist with..." />
                     </div>
                   </div>
                 )}
               </div>

               {/* Contact */}
               <div className="border border-gray-200 rounded-xl overflow-hidden">
                 <button type="button" onClick={() => setExpandedSection('contact')} className="w-full bg-gray-50 p-4 font-bold text-left flex justify-between items-center text-gray-800">
                   Contact Information {expandedSection === 'contact' ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                 </button>
                 {expandedSection === 'contact' && (
                   <div className="p-4 grid grid-cols-2 gap-4 bg-white">
                     <div className="col-span-2">
                       <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                       <input value={userDetails.email} onChange={e => setUserDetails({...userDetails, email: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-darkGreen text-sm" placeholder="john@example.com" />
                     </div>
                     <div className="col-span-2">
                       <label className="block text-xs font-bold text-gray-700 mb-1">Phone</label>
                       <input value={userDetails.phone} onChange={e => setUserDetails({...userDetails, phone: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-darkGreen text-sm" placeholder="(555) 123-4567" />
                     </div>
                     <div className="col-span-2">
                       <label className="block text-xs font-bold text-gray-700 mb-1">Address / Location</label>
                       <input value={userDetails.address} onChange={e => setUserDetails({...userDetails, address: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-darkGreen text-sm" placeholder="Denver, CO" />
                     </div>
                     <div className="col-span-2">
                       <label className="block text-xs font-bold text-gray-700 mb-1">LinkedIn Profile</label>
                       <input value={userDetails.linkedin} onChange={e => setUserDetails({...userDetails, linkedin: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-darkGreen text-sm" placeholder="linkedin.com/in/johndoe" />
                     </div>
                   </div>
                 )}
               </div>

               {/* Education */}
               <div className="border border-gray-200 rounded-xl overflow-hidden">
                 <button type="button" onClick={() => setExpandedSection('education')} className="w-full bg-gray-50 p-4 font-bold text-left flex justify-between items-center text-gray-800">
                   Education {expandedSection === 'education' ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                 </button>
                 {expandedSection === 'education' && (
                   <div className="p-4 grid grid-cols-2 gap-4 bg-white">
                     <div className="col-span-2">
                       <label className="block text-xs font-bold text-gray-700 mb-1">Degree</label>
                       <input value={userDetails.degree} onChange={e => setUserDetails({...userDetails, degree: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-darkGreen text-sm" placeholder="Bachelor of Science" />
                     </div>
                     <div className="col-span-2">
                       <label className="block text-xs font-bold text-gray-700 mb-1">University / School</label>
                       <input value={userDetails.school} onChange={e => setUserDetails({...userDetails, school: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-darkGreen text-sm" placeholder="University of Chicago" />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-gray-700 mb-1">Date</label>
                       <input value={userDetails.eduDate} onChange={e => setUserDetails({...userDetails, eduDate: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-darkGreen text-sm" placeholder="2016 - 2020" />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-gray-700 mb-1">Location</label>
                       <input value={userDetails.eduLocation} onChange={e => setUserDetails({...userDetails, eduLocation: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-darkGreen text-sm" placeholder="Chicago, IL" />
                     </div>
                   </div>
                 )}
               </div>

               <button type="submit" disabled={generating} className="w-full bg-darkGreen text-white py-4 rounded-xl font-black hover:shadow-lg transition-all flex justify-center items-center gap-2 mt-4">
                 {generating ? <Loader2 className="animate-spin" /> : 'Generate Live Preview'}
               </button>
             </form>
             
             {generatedData && (
               <button onClick={downloadPDF} className="mt-3 w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all flex justify-center items-center gap-2">
                 <Download size={20} /> Download PDF
               </button>
             )}
           </div>

           {/* Preview Section */}
           <div className="lg:col-span-8 bg-gray-200 p-8 rounded-3xl overflow-hidden flex justify-center border-4 border-white shadow-inner">
             {generatedData ? (
               <div className="scale-[0.85] origin-top">
                 <ResumeTemplate data={generatedData} />
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center text-center text-gray-400 py-40">
                 <FileText size={80} className="mb-6 opacity-20" />
                 <p className="text-xl font-bold">Your live resume preview will appear here.</p>
                 <p className="text-sm">Complete the form and click 'Generate' to see the magic.</p>
               </div>
             )}
           </div>
        </div>
      )}
    </div>
  );
};

export default ResumeBuilder;
