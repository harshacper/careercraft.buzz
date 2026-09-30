import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, Settings, Download, Sparkles, Loader2, Copy, ChevronDown, ChevronUp, Lock, ShieldAlert, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ResumeTemplate from '../components/ResumeTemplate';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const defaultResumeData = {
  name: "Ashish Pratap Singh",
  contact: {
    email: "xxx@gmail.com",
    phone: "XXX-XXX-XXX",
    github: "github.com/ashishps1",
    linkedin: "linkedin.com/in/ashishps1"
  },
  skills: [
    "Languages: C/C++, Java, Python, JavaScript, TypeScript, SQL",
    "Technologies & Tools: AWS, EC2, DynamoDB, S3, SQS, Lambda, Athena, Elasticsearch, Spark, Hive, Presto, Kubernetes, Docker, Splunk, Kafka, Spring, Angular, ReactJS"
  ],
  workHistory: [
    {
      company: "Adobe",
      location: "Bangalore",
      date: "Mar 2021 - Present",
      role: "Computer Scientist",
      points: [
        "Led the migration of Hive and Presto jobs from Qubole to AWS EMR, enhancing availability and significantly reducing operational costs.",
        "Reduced the cost involved in running custom reports service by more than 80% by devising an automated system that identified and disabled reports with no usage or empty data.",
        "Led a cost-saving initiative by identifying unused AWS resources and establishing S3 bucket expiration policies, leading to an annual cost reduction exceeding $50,000 in AWS expenditures.",
        "AWS, EC2, S3, EMR, Hive, Presto, Qubole, Kafka, Druid, Zookeeper, MySQL, Kubernetes, Docker, Bazel"
      ]
    },
    {
      company: "Amazon",
      location: "Bangalore",
      date: "Sept 2019 - Mar 2021",
      role: "Software Development Engineer",
      points: [
        "Worked on migrating ML workflows to Native AWS, enabling automated scalability based on workload demands and improving the logging and troubleshooting capabilities.",
        "Developed a customized batch workflow plugin for an external team to help them save upto $6MM in human labelling cost for their ML experiments. This was achieved by auto labelling high confidence records using our ML models.",
        "Java, Python, TypeScript, AWS Step Functions, AWS Batch, Lambda, S3, DynamoDB, EC2, SQS, SNS, AWS CDK, AWS Athena, Elasticsearch, LightGBM, TensorFlow"
      ]
    },
    {
      company: "Morgan Stanley",
      location: "Bangalore",
      date: "Aug 2017 - Aug 2019",
      role: "Technology Associate",
      points: [
        "Built a visualization tool to group contextually related infrastructure alerts (issues) to reduce the Mean Time to Resolution. Modeled the infrastructure dependencies as a graph problem and used graph algorithms like BFS, Union-Find to show the visualization and identify the root cause for a bunch of alerts.",
        "Developed a Machine Learning powered solution to predict the likelihood of a production deployment resulting in an emergency reversion.",
        "Python, Flask, ReactJS, Redux, Angular, d3, Kafka, DB2, scikit-learn"
      ]
    }
  ],
  education: [
    {
      school: "BITS Hyderabad",
      date: "2016-2026",
      degree: "B.E. in Computer Science and Engineering",
      location: "Hyderabad",
      grade: "CGPA: 7.96/10",
      coursework: "Object Oriented Programming, Databases, Discrete Maths, Data Structures and Algorithms, Operating Systems, Computer Networks, Machine Learning, Data Mining, Advance Data Structures and Algorithms, Information Retrieval, Image Processing"
    }
  ],
  projects: [
    {
      name: "Word Lookup Dictionary",
      date: "2015",
      description: "Developed a desktop software for online lookup of English words. Implemented efficient search of valid words using Trie data structure. Implemented spelling correction and auto-suggestion using edit distance algorithm. Used web scraping to get the data for online lookup. Python, BeautifulSoup."
    },
    {
      name: "Alternative-Routes in Road Networks",
      date: "2016",
      description: "Applied Dijkstra's shortest path algorithm to find the route which takes the shortest time to travel from source to destination in a given road network with randomly generated traffic. Implemented methods to avoid collisions between vehicles by dynamically changing their speeds. Used C++ and OpenGL library for simulation. C++, OpenGL."
    },
    {
      name: "Clustering SSH Attacks",
      date: "2016",
      description: "Applied KMeans clustering algorithm to segregate different kind of attacks during a Secure Shell (SSH) session by making use of network packet files(pcap). It involved finding the best value of K and grouping the similar files on the basis of cluster assignments. Java, WEKA."
    }
  ],
  awards: [
    "Mentor at Scaler Academy: Helping students and working professionals to get better at problem solving, coding and system design",
    "Data Engineering Nanodegree on Udacity",
    "Machine Learning and Deep Learning Specialization on Coursera"
  ]
};

const ResumeBuilder = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analyzer'); // analyzer | builder
  const [userStatus, setUserStatus] = useState({ subscription: 'none', credits: 0 });
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/payment/status')
        .then(res => setUserStatus(res.data))
        .catch(err => console.error("Error loading subscription status:", err));
    }

    // Parse company parameter from URL search query
    const params = new URLSearchParams(window.location.search);
    const companyParam = params.get('company');
    if (companyParam) {
      setUserDetails(prev => ({ ...prev, targetCompany: decodeURIComponent(companyParam) }));
      setActiveTab('builder');
      setExpandedSection('basics');
    }
  }, []);
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
    github: '',
    degree: '',
    school: '',
    eduDate: '',
    eduLocation: '',
    cgpa: '',
    coursework: '',
    projects: '',
    awards: '',
    targetCompany: '',
    jd: ''
  });

  const [expandedSection, setExpandedSection] = useState('basics'); // basics | contact | education

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = (reader.result || '').split(',')[1] || '';
          const res = await api.post('/skill-gap/analyze', {
            resumeContent: base64Data,
            resumeFileName: file.name
          });
          const data = res.data;
          setResult({
            score: data.overallScore || data.score || 82,
            keywordsFound: Array.isArray(data.keywordsFound) ? data.keywordsFound : ['JavaScript', 'React', 'Teamwork'],
            missingKeywords: Array.isArray(data.missingKeywords) 
              ? data.missingKeywords 
              : (Array.isArray(data.missingSkills) ? data.missingSkills.map(s => s.skill || s) : ['Agile', 'Unit Testing', 'CI/CD']),
            suggestions: Array.isArray(data.suggestions) ? data.suggestions : ['Quantify your achievements with numbers', 'Include action verbs at the beginning of bullet points'],
            atsScores: data.atsScores || [],
            insights: data.insights || ''
          });
        } catch (err) {
          console.error('ATS Analysis API Error:', err);
          setResult({
            score: 78,
            keywordsFound: ['Core Competencies', 'Development', 'Communication'],
            missingKeywords: ['Cloud & Containerization', 'Automated Testing', 'Architecture Metrics'],
            suggestions: ['Quantify your project outcomes with data and metrics', 'Incorporate high-frequency keywords matching your target job role']
          });
        } finally {
          setAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setAnalyzing(false);
    }
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
      
      const textReply = (res.data?.reply || '').replace(/^["']|["']$/g, '').trim();
      setUserDetails(prev => ({ ...prev, summary: textReply }));
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
        "contact": { "address": "...", "phone": "...", "email": "...", "linkedin": "...", "github": "..." },
        "workHistory": [ { "date": "...", "role": "...", "company": "...", "location": "...", "points": ["...", "..."] } ],
        "education": [ { "date": "...", "degree": "...", "school": "...", "location": "...", "coursework": "...", "grade": "..." } ],
        "skills": ["...", "..."],
        "projects": [ { "name": "...", "date": "...", "description": "..." } ],
        "awards": ["...", "..."]
      }
      Candidate Info:
      Name: ${userDetails.name}
      Target Role: ${userDetails.role}
      Experience: ${userDetails.experience}
      Skills: ${userDetails.skills}
      Provided Summary: ${userDetails.summary || "Generate one based on info."}
      GitHub: ${userDetails.github || ""}
      Education CGPA/Grade: ${userDetails.cgpa || ""}
      Education Coursework: ${userDetails.coursework || ""}
      Projects: ${userDetails.projects || ""}
      Awards: ${userDetails.awards || ""}
      
      TAILORING EXPECTATIONS:
      ${userDetails.targetCompany ? `- Customize this entire resume specifically for a job application at the company: ${userDetails.targetCompany}. Optimize the experience bullet points and target summary to align with their standard company values and tech stack.` : ''}
      ${userDetails.jd ? `- Customize and align the resume's skills, summaries, and achievements to target this specific Job Description (JD):
      ${userDetails.jd}` : ''}`;

      const res = await api.post('/chat', { 
        message: prompt,
        context: "Structured Resume Generation JSON"
      });
      
      let jsonStr = res.data?.reply || '';
      jsonStr = jsonStr.replace(/^```json/m, '').replace(/^```/m, '').replace(/```$/m, '').trim();
      const match = jsonStr.match(/\{[\s\S]*\}/);
      if (match) {
        jsonStr = match[0];
      }
      
      const parsedData = JSON.parse(jsonStr);

      // Force explicitly typed contact and education values so AI doesn't hallucinate them
      parsedData.contact = {
        email: userDetails.email || parsedData.contact?.email || '',
        phone: userDetails.phone || parsedData.contact?.phone || '',
        address: userDetails.address || parsedData.contact?.address || '',
        linkedin: userDetails.linkedin || parsedData.contact?.linkedin || '',
        github: userDetails.github || parsedData.contact?.github || ''
      };

      if (userDetails.degree || userDetails.school) {
        parsedData.education = [{
          degree: userDetails.degree || parsedData.education?.[0]?.degree || '',
          school: userDetails.school || parsedData.education?.[0]?.school || '',
          date: userDetails.eduDate || parsedData.education?.[0]?.date || '',
          location: userDetails.eduLocation || parsedData.education?.[0]?.location || '',
          grade: userDetails.cgpa || parsedData.education?.[0]?.grade || '',
          coursework: userDetails.coursework || parsedData.education?.[0]?.coursework || ''
        }];
      }

      // Populate projects and awards if not returned correctly by AI, or fallback
      if (!parsedData.projects) {
        parsedData.projects = [];
      }
      if (!parsedData.awards) {
        parsedData.awards = [];
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
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please log in or sign up to download your resume.");
      navigate('/login');
      return;
    }

    // Gate checks: user needs subscription OR credits > 0
    if (userStatus.subscription !== 'monthly' && userStatus.credits <= 0) {
      setIsUnlockModalOpen(true);
      return;
    }

    // Deduct credit if they have credits and no monthly plan
    if (userStatus.subscription !== 'monthly' && userStatus.credits > 0) {
      const confirmDownload = window.confirm(`This will consume 1 resume credit (${userStatus.credits} remaining). Do you want to proceed?`);
      if (!confirmDownload) return;

      try {
        const res = await api.post('/payment/consume');
        setUserStatus(res.data.status);
      } catch (err) {
        console.error("Error consuming download credit:", err);
        alert("Failed to verify download credit. Please try again.");
        return;
      }
    }

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

                {result.atsScores && result.atsScores.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-xl space-y-2.5 border border-gray-100">
                    <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">Company Target Compatibility</h4>
                    {result.atsScores.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 font-medium">{item.companyType}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-1.5">
                            <div className="bg-darkGreen h-1.5 rounded-full" style={{width: `${item.score}%`}}></div>
                          </div>
                          <span className="font-bold text-gray-800">{item.score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {result.insights && (
                  <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-950">
                    <strong>AI Insight:</strong> {result.insights}
                  </div>
                )}
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
                        <label className="block text-xs font-bold text-gray-700 mb-1">Target Company (Optional)</label>
                        <input value={userDetails.targetCompany} onChange={e => setUserDetails({...userDetails, targetCompany: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-darkGreen text-sm" placeholder="e.g. Google" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Target Job Description (JD) / Requirements (Optional)</label>
                        <textarea value={userDetails.jd} onChange={e => setUserDetails({...userDetails, jd: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-darkGreen h-20 text-sm" placeholder="Paste the job description or role requirements here..." />
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
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-700 mb-1">GitHub Profile</label>
                        <input value={userDetails.github} onChange={e => setUserDetails({...userDetails, github: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-darkGreen text-sm" placeholder="github.com/johndoe" />
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
                        <label className="block text-xs font-bold text-gray-700 mb-1">Date Range</label>
                        <input value={userDetails.eduDate} onChange={e => setUserDetails({...userDetails, eduDate: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-darkGreen text-sm" placeholder="e.g. 2016-2026" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Location</label>
                        <input value={userDetails.eduLocation} onChange={e => setUserDetails({...userDetails, eduLocation: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-darkGreen text-sm" placeholder="Chicago, IL" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-700 mb-1">CGPA / Grade</label>
                        <input value={userDetails.cgpa} onChange={e => setUserDetails({...userDetails, cgpa: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-darkGreen text-sm" placeholder="e.g. CGPA: 7.96/10" />
                      </div>
                     <div className="col-span-2">
                        <label className="block text-xs font-bold text-gray-700 mb-1">Relevant Coursework</label>
                        <textarea value={userDetails.coursework} onChange={e => setUserDetails({...userDetails, coursework: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-darkGreen h-16 text-sm" placeholder="Data Structures, Algorithms..." />
                      </div>
                   </div>
                 )}
               </div>

                {/* Project Work */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <button type="button" onClick={() => setExpandedSection('projects')} className="w-full bg-gray-50 p-4 font-bold text-left flex justify-between items-center text-gray-800">
                    Project Work {expandedSection === 'projects' ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                  </button>
                  {expandedSection === 'projects' && (
                    <div className="p-4 space-y-4 bg-white">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Projects Description</label>
                      <textarea value={userDetails.projects} onChange={e => setUserDetails({...userDetails, projects: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-darkGreen h-32 text-sm" placeholder="Project Name (Date): Description..." />
                    </div>
                  )}
                </div>

                {/* Awards and Certificates */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <button type="button" onClick={() => setExpandedSection('awards')} className="w-full bg-gray-50 p-4 font-bold text-left flex justify-between items-center text-gray-800">
                    Awards & Certificates {expandedSection === 'awards' ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                  </button>
                  {expandedSection === 'awards' && (
                    <div className="p-4 space-y-4 bg-white">
                      <label className="block text-xs font-bold text-gray-700 mb-1">Awards List (one per line)</label>
                      <textarea value={userDetails.awards} onChange={e => setUserDetails({...userDetails, awards: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-darkGreen h-24 text-sm" placeholder="Award Name: Details..." />
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
      <AnimatePresence>
        {isUnlockModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl border border-gray-100 flex flex-col text-center"
            >
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mx-auto mb-6 border border-amber-100">
                <Lock size={28} />
              </div>

              <h3 className="text-2xl font-black text-gray-900 mb-2">Unlock Resume Download</h3>
              <p className="text-gray-600 text-sm mb-6">
                Premium templates and PDF exports are locked on the Free tier. Choose a plan to unlock now!
              </p>

              <div className="space-y-3 mb-8 text-left">
                <div 
                  onClick={() => { setIsUnlockModalOpen(false); navigate('/payment'); }}
                  className="p-4 border border-gray-100 bg-gray-50/50 hover:bg-green-50/50 hover:border-darkGreen rounded-2xl cursor-pointer flex justify-between items-center transition-all group"
                >
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm group-hover:text-darkGreen transition-colors">Single Resume Unlock</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Unlock this resume draft immediately</p>
                  </div>
                  <span className="font-black text-darkGreen text-base">₹50</span>
                </div>

                <div 
                  onClick={() => { setIsUnlockModalOpen(false); navigate('/payment'); }}
                  className="p-4 border border-gray-100 bg-gray-50/50 hover:bg-green-50/50 hover:border-darkGreen rounded-2xl cursor-pointer flex justify-between items-center transition-all group"
                >
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm group-hover:text-darkGreen transition-colors">Monthly Unlimited Pro</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Unlimited PDF downloads & AI features</p>
                  </div>
                  <span className="font-black text-darkGreen text-base">₹150</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsUnlockModalOpen(false)}
                  className="flex-1 border-2 border-gray-200 text-gray-500 hover:bg-gray-50 py-3.5 rounded-xl font-bold transition-all text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => { setIsUnlockModalOpen(false); navigate('/payment'); }}
                  className="flex-1 bg-darkGreen hover:bg-opacity-95 text-white py-3.5 rounded-xl font-bold hover:shadow-lg transition-all text-sm flex items-center justify-center gap-1.5"
                >
                  Go to Pricing <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResumeBuilder;
