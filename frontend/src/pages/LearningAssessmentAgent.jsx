import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Sparkles, CheckCircle2, XCircle, AlertCircle, Clock, 
  HelpCircle, ChevronRight, ChevronDown, RotateCcw, ArrowRight, ArrowLeft, 
  Flag, Award, BarChart3, Download, FileText, Code2, Layers, Cpu, 
  Database, Network, Binary, Coffee, Terminal, Globe, Shield, Cloud, 
  Check, RefreshCw, Send, MessageSquare, User, Zap, Info, Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import api from '../utils/api';
import safeStorage from '../utils/safeStorage';

// Icon resolver for courses
const COURSE_ICONS = {
  Layers: Layers,
  Code2: Code2,
  Database: Database,
  Network: Network,
  Cpu: Cpu,
  Binary: Binary,
  Sparkles: Sparkles,
  Coffee: Coffee,
  Terminal: Terminal,
  Globe: Globe,
  Shield: Shield,
  Cloud: Cloud
};

const LearningAssessmentAgent = () => {
  // Main view state: 'config' | 'exam' | 'evaluating' | 'result' | 'history' | 'tutor'
  const [viewState, setViewState] = useState('config');
  const [activeTab, setActiveTab] = useState('agent'); // 'agent' | 'history' | 'tutor'

  // Curriculum data
  const [courses, setCourses] = useState([]);
  const [loadingCurriculum, setLoadingCurriculum] = useState(true);

  // Selection state
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [expandedModuleId, setExpandedModuleId] = useState(null);

  // Exam configuration state
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionType, setQuestionType] = useState('Mixed');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(20);
  const [marksPerQuestion, setMarksPerQuestion] = useState(5);
  const [isRandomized, setIsRandomized] = useState(false);

  // Active examination state
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(0);
  const [examStartedAt, setExamStartedAt] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Evaluation & Results state
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [evaluationStepText, setEvaluationStepText] = useState('Agent 2: Evaluating Technical Correctness...');

  // Assessment History
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // AI Tutor Doubt Chatbot state
  const [tutorMessages, setTutorMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am your AI Learning & Assessment Agent. Ask me any doubt about your syllabus, exam questions, code concepts, or study roadmaps.'
    }
  ]);
  const [tutorInput, setTutorInput] = useState('');
  const [tutorLoading, setTutorLoading] = useState(false);

  // Timer ref
  const timerRef = useRef(null);

  // Fetch curriculum on load
  useEffect(() => {
    fetchCurriculum();
    fetchHistory();
  }, []);

  const fetchCurriculum = async () => {
    try {
      setLoadingCurriculum(true);
      const res = await api.get('/assessment/curriculum');
      if (res.data?.courses && res.data.courses.length > 0) {
        setCourses(res.data.courses);
        setSelectedCourse(res.data.courses[0]);
        if (res.data.courses[0].modules?.[0]) {
          setSelectedModule(res.data.courses[0].modules[0]);
          setExpandedModuleId(res.data.courses[0].modules[0].id);
          setSelectedTopic(res.data.courses[0].modules[0].topics?.[0] || '');
        }
      }
    } catch (err) {
      console.warn('Using local curriculum fallback:', err);
    } finally {
      setLoadingCurriculum(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const userStr = safeStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const res = await api.get('/assessment/history', {
        params: { userId: user?.id || user?.email || 'guest' }
      });
      if (res.data?.history) {
        setHistoryList(res.data.history);
      }
    } catch (err) {
      console.warn('Could not fetch assessment history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Exam Countdown Timer
  useEffect(() => {
    if (viewState === 'exam' && timeRemainingSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [viewState, timeRemainingSeconds]);

  // Handle auto submit when time expires
  const handleAutoSubmit = () => {
    alert("Time has expired! Submitting your examination answers for AI evaluation now.");
    submitForEvaluation();
  };

  // Generate Questions via Agent 1
  const handleStartAssessment = async () => {
    if (!selectedCourse) {
      alert("Please select a course to begin.");
      return;
    }

    setGeneratingQuestions(true);
    try {
      const res = await api.post('/assessment/generate-questions', {
        courseName: selectedCourse.name,
        moduleName: selectedModule?.title || '',
        topicName: selectedTopic || selectedCourse.name,
        questionCount,
        difficulty,
        questionType,
        timeLimitMinutes,
        marksPerQuestion,
        isRandomized
      });

      if (res.data?.questions && res.data.questions.length > 0) {
        setQuestions(res.data.questions);
        setCurrentQIndex(0);
        setStudentAnswers({});
        setMarkedForReview({});
        setTimeRemainingSeconds(timeLimitMinutes * 60);
        setExamStartedAt(Date.now());
        setViewState('exam');
      } else {
        throw new Error("No questions were returned.");
      }
    } catch (err) {
      console.error("Question generation failed:", err);
      alert("Failed to generate questions. Please try again or select a different topic.");
    } finally {
      setGeneratingQuestions(false);
    }
  };

  // Answer handler
  const handleAnswerChange = (qId, answerValue) => {
    setStudentAnswers(prev => ({
      ...prev,
      [qId]: answerValue
    }));
  };

  // Toggle mark for review
  const toggleMarkForReview = (qId) => {
    setMarkedForReview(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  // Submit Exam and trigger Multi-Agent Evaluation
  const submitForEvaluation = async () => {
    setIsSubmitModalOpen(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setViewState('evaluating');

    // Simulate agent orchestration steps
    const stepTimer1 = setTimeout(() => {
      setEvaluationStepText("Agent 2 (Answer Evaluator): Analyzing semantic meaning & technical depth...");
    }, 1200);

    const stepTimer2 = setTimeout(() => {
      setEvaluationStepText("Agent 3 (Explanation Agent): Formulating detailed explanations & corrections...");
    }, 2500);

    const stepTimer3 = setTimeout(() => {
      setEvaluationStepText("Agent 4 & 5: Generating performance metrics & personalized study plan...");
    }, 3800);

    try {
      const userStr = safeStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const elapsedSeconds = examStartedAt ? Math.floor((Date.now() - examStartedAt) / 1000) : 0;

      const res = await api.post('/assessment/evaluate', {
        userId: user?.id || user?.email || 'guest',
        userEmail: user?.email || 'student@careercraft.buzz',
        courseName: selectedCourse.name,
        subjectName: selectedCourse.name,
        moduleName: selectedModule?.title || '',
        topicName: selectedTopic || selectedCourse.name,
        difficulty,
        questionType,
        timeLimitMinutes,
        timeTakenSeconds: elapsedSeconds,
        questions,
        studentAnswers
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      if (res.data?.data) {
        setEvaluationResult(res.data.data);
        setViewState('result');
        fetchHistory(); // refresh history
      } else {
        throw new Error("Invalid evaluation payload.");
      }
    } catch (err) {
      console.error("Evaluation failed:", err);
      alert("Evaluation failed. Please try submitting again.");
      setViewState('exam');
    }
  };

  // Send question/doubt to AI Tutor Chatbot
  const handleSendTutorMessage = async (e) => {
    e?.preventDefault();
    if (!tutorInput.trim() || tutorLoading) return;

    const userText = tutorInput.trim();
    setTutorMessages(prev => [...prev, { role: 'user', text: userText }]);
    setTutorInput('');
    setTutorLoading(true);

    try {
      const res = await api.post('/assessment/doubt', {
        doubt: userText,
        course: selectedCourse?.name || 'Computer Science',
        topic: selectedTopic || 'General Topic'
      });

      setTutorMessages(prev => [
        ...prev, 
        { role: 'assistant', text: res.data?.reply || 'Could not answer at this moment.' }
      ]);
    } catch (err) {
      setTutorMessages(prev => [
        ...prev, 
        { role: 'assistant', text: 'Error connecting to the AI Tutor. Please try asking again.' }
      ]);
    } finally {
      setTutorLoading(false);
    }
  };

  // Download PDF Report
  const downloadPdfReport = () => {
    if (!evaluationResult) return;
    try {
      const doc = new jsPDF();
      let y = 20;

      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text("CareerCraft AI - Assessment Report", 20, y);
      y += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Course: ${evaluationResult.courseName} | Topic: ${evaluationResult.topicName || 'Mixed'}`, 20, y);
      y += 6;
      doc.text(`Date: ${new Date().toLocaleDateString()} | Time Taken: ${Math.floor(evaluationResult.timeTakenSeconds / 60)}m ${evaluationResult.timeTakenSeconds % 60}s`, 20, y);
      y += 10;

      // Score Summary Box
      doc.setDrawColor(0);
      doc.setFillColor(245, 245, 245);
      doc.rect(20, y, 170, 28, 'FD');
      y += 8;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Score: ${evaluationResult.marksObtained} / ${evaluationResult.totalMarks} (${evaluationResult.percentage}%)`, 25, y);
      y += 7;
      doc.setFontSize(11);
      doc.text(`Performance Level: ${evaluationResult.performanceLevel} | Accuracy: ${evaluationResult.accuracy}%`, 25, y);
      y += 7;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Correct: ${evaluationResult.counts.correct} | Partial: ${evaluationResult.counts.partiallyCorrect} | Incorrect: ${evaluationResult.counts.incorrect} | Unanswered: ${evaluationResult.counts.unanswered}`, 25, y);
      y += 15;

      // Questions Breakdown
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text("Question-by-Question Evaluation:", 20, y);
      y += 8;

      (evaluationResult.detailedResults || []).forEach((q, idx) => {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`Q${idx + 1}: ${q.question.slice(0, 90)}... [${q.marksAwarded}/${q.marks} Marks]`, 20, y);
        y += 5;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Your Answer: ${(q.studentAnswer || 'N/A').slice(0, 95)}`, 25, y);
        y += 5;
        doc.text(`Expected: ${(q.correctAnswer || '').slice(0, 95)}`, 25, y);
        y += 5;
        doc.text(`Feedback: ${(q.explanation || '').slice(0, 100)}`, 25, y);
        y += 8;
      });

      doc.save(`CareerCraft_Assessment_${evaluationResult.courseName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Could not generate PDF report.");
    }
  };

  // Helper formatting for seconds to MM:SS
  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-black">
      {/* Top Banner / Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-black/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-black tracking-widest uppercase bg-black text-white px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <Sparkles size={12} /> AI AGENT ECOSYSTEM
            </span>
            <span className="text-xs font-bold text-neutral-500">• 12 Verified Engineering Courses</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">AI Learning & Assessment Agent</h1>
          <p className="text-sm text-neutral-600 mt-1 max-w-2xl">
            Autonomous AI teacher, examiner & evaluator. Generate curriculum-aligned exams, receive instant semantic grading, analyze mistake patterns, and study with personalized AI roadmaps.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 bg-neutral-100 p-1.5 rounded-2xl border border-neutral-200 shrink-0 self-start md:self-auto">
          <button
            onClick={() => { setActiveTab('agent'); if (viewState === 'history') setViewState('config'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'agent' ? 'bg-black text-white shadow-sm' : 'text-neutral-600 hover:text-black'}`}
          >
            <BookOpen size={14} /> Exam & Assessment
          </button>
          <button
            onClick={() => { setActiveTab('history'); setViewState('history'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'history' ? 'bg-black text-white shadow-sm' : 'text-neutral-600 hover:text-black'}`}
          >
            <BarChart3 size={14} /> Past Tests ({historyList.length})
          </button>
          <button
            onClick={() => { setActiveTab('tutor'); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'tutor' ? 'bg-black text-white shadow-sm' : 'text-neutral-600 hover:text-black'}`}
          >
            <MessageSquare size={14} /> AI Doubt Tutor
          </button>
        </div>
      </div>

      {/* VIEW: TUTOR DOUBT CHATBOT */}
      {activeTab === 'tutor' && (
        <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-sm max-w-4xl mx-auto flex flex-col h-[650px]">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center font-bold">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-black text-lg">AI Teacher & Doubt Solver</h3>
                <p className="text-xs text-neutral-500">Ask any conceptual doubt, code walkthrough, or study query</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('agent')}
              className="text-xs font-bold border border-neutral-300 px-3 py-1.5 rounded-xl hover:bg-neutral-100"
            >
              Back to Assessment →
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
            {tutorMessages.map((m, idx) => (
              <div 
                key={idx}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center shrink-0 font-bold text-xs">
                    AI
                  </div>
                )}
                <div 
                  className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user' 
                      ? 'bg-black text-white' 
                      : 'bg-neutral-100 text-neutral-900 border border-neutral-200'
                  }`}
                >
                  {m.text}
                </div>
                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-neutral-300 text-neutral-800 flex items-center justify-center shrink-0 font-bold text-xs">
                    <User size={14} />
                  </div>
                )}
              </div>
            ))}
            {tutorLoading && (
              <div className="flex gap-3 items-center text-xs text-neutral-500 font-bold animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center text-xs">AI</div>
                <span>AI Teacher is writing explanation...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendTutorMessage} className="pt-4 border-t border-neutral-200 flex gap-2">
            <input
              type="text"
              value={tutorInput}
              onChange={e => setTutorInput(e.target.value)}
              placeholder="Ask a question (e.g., 'Explain the difference between TCP and UDP', 'How to write Dijkstra algorithm?')..."
              className="flex-1 bg-neutral-50 border border-neutral-300 rounded-2xl px-4 py-3 text-sm outline-none focus:border-black transition-all"
            />
            <button
              type="submit"
              disabled={tutorLoading || !tutorInput.trim()}
              className="bg-black hover:bg-neutral-800 text-white px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Send size={16} /> Send
            </button>
          </form>
        </div>
      )}

      {/* VIEW: PREVIOUS ASSESSMENTS HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black">Student Assessment History</h2>
            <button
              onClick={() => { setActiveTab('agent'); setViewState('config'); }}
              className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-neutral-800 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Play size={14} /> Start New Assessment
            </button>
          </div>

          {loadingHistory ? (
            <div className="p-12 text-center text-neutral-400 font-bold">Loading past assessments...</div>
          ) : historyList.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-neutral-300 rounded-3xl p-12 text-center space-y-3">
              <Award size={48} className="mx-auto text-neutral-400" />
              <h3 className="font-black text-lg">No Assessments Recorded Yet</h3>
              <p className="text-sm text-neutral-500 max-w-md mx-auto">
                Select any course and module to take your first AI-evaluated exam. All your test attempts, percentage scores, and performance levels will appear here.
              </p>
              <button
                onClick={() => { setActiveTab('agent'); setViewState('config'); }}
                className="mt-2 bg-black text-white px-5 py-2.5 rounded-xl font-bold text-xs"
              >
                Launch First Exam →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {historyList.map((item, idx) => (
                <div key={idx} className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs hover:border-black transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800">
                        {item.course_name}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                        item.percentage >= 75 ? 'bg-emerald-100 text-emerald-800' : item.percentage >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.performance_level}
                      </span>
                    </div>
                    <h4 className="font-black text-base line-clamp-1">{item.topic_name || item.course_name}</h4>
                    <p className="text-xs text-neutral-500 mt-1">{item.module_name || 'Mixed Modules'}</p>

                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-3xl font-black text-black">{item.percentage}%</span>
                      <span className="text-xs text-neutral-500">({item.marks_obtained} / {item.total_marks} Marks)</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-100 flex justify-between items-center text-xs text-neutral-400">
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    <span>{Math.floor((item.time_taken_seconds || 0) / 60)}m spent</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW: CONFIGURATION STEP */}
      {activeTab === 'agent' && viewState === 'config' && (
        <div className="space-y-8">
          {/* Step 1: Select Course */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-black flex items-center justify-center">1</span>
              <h2 className="text-xl font-black">Select Engineering Course</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {courses.map(course => {
                const isSelected = selectedCourse?.id === course.id;
                const IconComponent = COURSE_ICONS[course.icon] || BookOpen;

                return (
                  <div
                    key={course.id}
                    onClick={() => {
                      setSelectedCourse(course);
                      if (course.modules?.[0]) {
                        setSelectedModule(course.modules[0]);
                        setExpandedModuleId(course.modules[0].id);
                        setSelectedTopic(course.modules[0].topics?.[0] || '');
                      }
                    }}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected 
                        ? 'border-black bg-black text-white shadow-md' 
                        : 'border-neutral-200 bg-white hover:border-neutral-400'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <IconComponent size={20} className={isSelected ? 'text-white' : 'text-black'} />
                        {isSelected && <CheckCircle2 size={16} className="text-white" />}
                      </div>
                      <h3 className="font-black text-sm leading-snug">{course.name}</h3>
                      <p className={`text-[11px] mt-1 line-clamp-2 ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        {course.description}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold mt-3 block ${isSelected ? 'text-neutral-400' : 'text-neutral-400'}`}>
                      {course.modules?.length || 5} Core Modules
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Select Subject Module and Topic */}
          {selectedCourse && (
            <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-black flex items-center justify-center">2</span>
                <h2 className="text-xl font-black">Choose Syllabus Module & Topic ({selectedCourse.name})</h2>
              </div>

              <div className="space-y-3">
                {selectedCourse.modules?.map((mod, idx) => {
                  const isExpanded = expandedModuleId === mod.id;
                  const isModSelected = selectedModule?.id === mod.id;

                  return (
                    <div 
                      key={mod.id || idx}
                      className={`border rounded-2xl overflow-hidden transition-all ${
                        isModSelected ? 'border-black bg-neutral-50/50' : 'border-neutral-200'
                      }`}
                    >
                      <button
                        onClick={() => {
                          setSelectedModule(mod);
                          setExpandedModuleId(isExpanded ? null : mod.id);
                        }}
                        className="w-full p-4 flex justify-between items-center text-left font-bold text-sm hover:bg-neutral-100 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-xs font-black px-2 py-0.5 rounded bg-neutral-200 text-neutral-800">
                            M{idx + 1}
                          </span>
                          {mod.title}
                        </span>
                        <ChevronDown size={18} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      {isExpanded && (
                        <div className="p-4 pt-1 bg-white border-t border-neutral-100">
                          <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Available Focus Topics:</p>
                          <div className="flex flex-wrap gap-2">
                            {mod.topics?.map((topic, tIdx) => {
                              const isTopicSelected = selectedTopic === topic;
                              return (
                                <button
                                  key={tIdx}
                                  onClick={() => setSelectedTopic(topic)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    isTopicSelected 
                                      ? 'bg-black text-white shadow-xs' 
                                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                  }`}
                                >
                                  {topic}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Configure AI Question Generation */}
          <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-black flex items-center justify-center">3</span>
              <h2 className="text-xl font-black">Configure AI Examiner Parameters</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Question Count */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Number of Questions
                </label>
                <div className="flex gap-2">
                  {[5, 10, 15, 20, 30].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setQuestionCount(cnt)}
                      className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                        questionCount === cnt 
                          ? 'bg-black text-white' 
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {cnt} Qs
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Level */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Difficulty Level
                </label>
                <div className="flex gap-2">
                  {['Easy', 'Medium', 'Hard', 'Mixed'].map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficulty(lvl)}
                      className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                        difficulty === lvl 
                          ? 'bg-black text-white' 
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Type */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Question Format
                </label>
                <select
                  value={questionType}
                  onChange={e => setQuestionType(e.target.value)}
                  className="w-full bg-neutral-100 border border-neutral-300 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-black cursor-pointer"
                >
                  <option value="Mixed">Mixed (MCQ, Short, Long, Coding)</option>
                  <option value="MCQ">Multiple Choice Questions (MCQ)</option>
                  <option value="Short Answer">Short Answer Questions</option>
                  <option value="Long Answer">Long Answer Questions</option>
                  <option value="Coding Questions">Coding Questions</option>
                  <option value="True/False">True / False Questions</option>
                  <option value="Fill in the Blanks">Fill in the Blanks</option>
                </select>
              </div>

              {/* Exam Duration */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Exam Duration
                </label>
                <div className="flex gap-2">
                  {[10, 20, 30, 60].map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setTimeLimitMinutes(mins)}
                      className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                        timeLimitMinutes === mins 
                          ? 'bg-black text-white' 
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Marks per question */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Marks Per Question
                </label>
                <div className="flex gap-2">
                  {[2, 5, 10].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMarksPerQuestion(m)}
                      className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                        marksPerQuestion === m 
                          ? 'bg-black text-white' 
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {m} Pts
                    </button>
                  ))}
                </div>
              </div>

              {/* Syllabus Scope */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Scope Coverage
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRandomized(false)}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      !isRandomized ? 'bg-black text-white font-black' : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    Topic-Focused
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRandomized(true)}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      isRandomized ? 'bg-black text-white font-black' : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    Randomized Across Course
                  </button>
                </div>
              </div>
            </div>

            {/* Launch CTA */}
            <div className="mt-8 pt-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-neutral-600">
                <span className="font-bold text-black">Selected Topic:</span> {selectedTopic || selectedCourse?.name} • 
                <span className="font-bold text-black ml-2">Total Exam Marks:</span> {questionCount * marksPerQuestion} Pts
              </div>
              <button
                onClick={handleStartAssessment}
                disabled={generatingQuestions}
                className="w-full sm:w-auto bg-black hover:bg-neutral-800 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {generatingQuestions ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Agent 1: Generating Questions...
                  </>
                ) : (
                  <>
                    Launch AI Examination <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: ACTIVE EXAMINATION MODE */}
      {viewState === 'exam' && questions.length > 0 && (
        <div className="space-y-6 max-w-5xl mx-auto">
          {/* Exam Header */}
          <div className="bg-white border-2 border-black rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-neutral-100 text-neutral-800">
                  {selectedCourse?.name}
                </span>
                <span className="text-neutral-400 text-xs">•</span>
                <span className="text-xs font-bold text-neutral-600">{questions[currentQIndex]?.topic}</span>
              </div>
              <h2 className="text-lg font-black">
                Question {currentQIndex + 1} of {questions.length}
              </h2>
            </div>

            {/* Timer and Submit Header Action */}
            <div className="flex items-center gap-3 shrink-0">
              <div className={`px-4 py-2 rounded-2xl font-mono font-black text-sm flex items-center gap-2 border ${
                timeRemainingSeconds < 300 
                  ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' 
                  : 'bg-neutral-100 text-black border-neutral-300'
              }`}>
                <Clock size={16} />
                {formatTimer(timeRemainingSeconds)}
              </div>

              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="bg-black hover:bg-neutral-800 text-white px-4 py-2 rounded-2xl font-bold text-xs cursor-pointer transition-all"
              >
                Submit Exam
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Question Display */}
            <div className="lg:col-span-3 bg-white border-2 border-black rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between min-h-[480px]">
              <div>
                {/* Question Metadata */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div className="flex gap-2">
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-800">
                      {questions[currentQIndex]?.type}
                    </span>
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-800">
                      {questions[currentQIndex]?.difficulty}
                    </span>
                  </div>
                  <span className="text-xs font-black text-neutral-600">
                    Worth: {questions[currentQIndex]?.marks || marksPerQuestion} Marks
                  </span>
                </div>

                {/* Question Prompt */}
                <h3 className="text-lg sm:text-xl font-bold leading-relaxed mb-6">
                  {questions[currentQIndex]?.question}
                </h3>

                {/* ANSWER INPUT WIDGETS */}
                {/* 1. MCQ Options */}
                {questions[currentQIndex]?.type === 'MCQ' && (
                  <div className="space-y-3">
                    {questions[currentQIndex]?.options?.map((opt, oIdx) => {
                      const isSelected = studentAnswers[questions[currentQIndex].id] === opt;
                      const optionLabel = String.fromCharCode(65 + oIdx);

                      return (
                        <div
                          key={oIdx}
                          onClick={() => handleAnswerChange(questions[currentQIndex].id, opt)}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                            isSelected 
                              ? 'border-black bg-neutral-100 font-bold' 
                              : 'border-neutral-200 hover:border-neutral-400 bg-white'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                            isSelected ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-700'
                          }`}>
                            {optionLabel}
                          </div>
                          <span className="text-sm leading-relaxed">{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 2. True / False */}
                {questions[currentQIndex]?.type === 'True/False' && (
                  <div className="grid grid-cols-2 gap-4">
                    {['True', 'False'].map(val => {
                      const isSelected = studentAnswers[questions[currentQIndex].id] === val;
                      return (
                        <div
                          key={val}
                          onClick={() => handleAnswerChange(questions[currentQIndex].id, val)}
                          className={`p-6 rounded-2xl border-2 text-center cursor-pointer font-black text-base transition-all ${
                            isSelected 
                              ? 'border-black bg-black text-white' 
                              : 'border-neutral-200 hover:border-neutral-400 bg-white'
                          }`}
                        >
                          {val}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 3. Fill in the Blanks */}
                {questions[currentQIndex]?.type === 'Fill in the Blanks' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-neutral-500">Your Answer:</label>
                    <input
                      type="text"
                      value={studentAnswers[questions[currentQIndex].id] || ''}
                      onChange={e => handleAnswerChange(questions[currentQIndex].id, e.target.value)}
                      placeholder="Type the missing word or phrase..."
                      className="w-full bg-neutral-50 border-2 border-neutral-300 rounded-2xl p-4 text-sm font-semibold outline-none focus:border-black transition-all"
                    />
                  </div>
                )}

                {/* 4. Short / Long Answer */}
                {(questions[currentQIndex]?.type === 'Short Answer' || questions[currentQIndex]?.type === 'Long Answer') && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-neutral-500">
                      <span>Write your complete answer below:</span>
                      <span>{studentAnswers[questions[currentQIndex].id]?.length || 0} characters</span>
                    </div>
                    <textarea
                      rows={questions[currentQIndex]?.type === 'Long Answer' ? 8 : 4}
                      value={studentAnswers[questions[currentQIndex].id] || ''}
                      onChange={e => handleAnswerChange(questions[currentQIndex].id, e.target.value)}
                      placeholder="Explain your understanding clearly, referencing key technical concepts and definitions..."
                      className="w-full bg-neutral-50 border-2 border-neutral-300 rounded-2xl p-4 text-sm outline-none focus:border-black transition-all resize-y"
                    />
                  </div>
                )}

                {/* 5. Coding Questions */}
                {questions[currentQIndex]?.type === 'Coding Questions' && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-neutral-500">
                      <span>Code Solution:</span>
                      <button 
                        type="button"
                        onClick={() => handleAnswerChange(questions[currentQIndex].id, questions[currentQIndex]?.codeTemplate || '')}
                        className="text-[11px] underline text-neutral-600 hover:text-black cursor-pointer"
                      >
                        Reset to Starter Code
                      </button>
                    </div>
                    <textarea
                      rows={10}
                      value={studentAnswers[questions[currentQIndex].id] !== undefined ? studentAnswers[questions[currentQIndex].id] : (questions[currentQIndex]?.codeTemplate || '')}
                      onChange={e => handleAnswerChange(questions[currentQIndex].id, e.target.value)}
                      placeholder="// Write your algorithm / function implementation here..."
                      className="w-full bg-neutral-900 text-emerald-400 font-mono text-xs p-4 rounded-2xl outline-none border-2 border-neutral-800 focus:border-black transition-all"
                      spellCheck="false"
                    />
                  </div>
                )}
              </div>

              {/* Question Footer Controls */}
              <div className="pt-6 mt-6 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => toggleMarkForReview(questions[currentQIndex].id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    markedForReview[questions[currentQIndex].id] 
                      ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <Flag size={14} /> 
                  {markedForReview[questions[currentQIndex].id] ? 'Marked for Review' : 'Mark for Review'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentQIndex === 0}
                    onClick={() => setCurrentQIndex(prev => prev - 1)}
                    className="px-4 py-2.5 rounded-xl border border-neutral-300 font-bold text-xs hover:bg-neutral-100 disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <ArrowLeft size={14} /> Previous
                  </button>

                  {currentQIndex < questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentQIndex(prev => prev + 1)}
                      className="px-5 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1"
                    >
                      Next <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsSubmitModalOpen(true)}
                      className="px-6 py-2.5 rounded-xl bg-black text-white hover:bg-neutral-800 font-black text-xs transition-all cursor-pointer"
                    >
                      Review & Submit
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Question Navigation Drawer */}
            <div className="bg-white border-2 border-black rounded-3xl p-5 shadow-sm space-y-4">
              <h4 className="font-black text-sm">Question Palette</h4>
              
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isAnswered = studentAnswers[q.id] && studentAnswers[q.id].toString().trim().length > 0;
                  const isMarked = markedForReview[q.id];
                  const isCurrent = currentQIndex === idx;

                  let bgColor = 'bg-neutral-100 text-neutral-700';
                  if (isMarked) bgColor = 'bg-amber-400 text-black font-black';
                  else if (isAnswered) bgColor = 'bg-black text-white font-black';

                  return (
                    <button
                      key={q.id || idx}
                      onClick={() => setCurrentQIndex(idx)}
                      className={`h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer relative ${bgColor} ${
                        isCurrent ? 'ring-2 ring-black ring-offset-2' : ''
                      }`}
                    >
                      {idx + 1}
                      {isMarked && (
                        <span className="w-2 h-2 rounded-full bg-red-600 absolute top-1 right-1" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="pt-4 border-t border-neutral-100 space-y-2 text-[11px] text-neutral-600">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-black inline-block" /> Answered
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-amber-400 inline-block" /> Marked for Review
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-neutral-100 border inline-block" /> Unanswered
                </div>
              </div>

              <div className="pt-2">
                <div className="text-xs text-neutral-500 font-bold mb-1">Answered Progress:</div>
                <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-black h-2 transition-all duration-300" 
                    style={{ width: `${(Object.keys(studentAnswers).filter(k => studentAnswers[k]?.toString().trim().length > 0).length / questions.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION SUBMISSION MODAL */}
      <AnimatePresence>
        {isSubmitModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-neutral-100 text-black flex items-center justify-center mx-auto mb-4 border border-neutral-300">
                <Award size={26} />
              </div>
              <h3 className="text-xl font-black mb-2">Ready to Submit Examination?</h3>
              <p className="text-xs text-neutral-600 mb-6">
                Your submitted answers will be immediately evaluated by the AI examiner agents against technical rubrics.
              </p>

              <div className="grid grid-cols-3 gap-2 bg-neutral-50 p-3 rounded-2xl border border-neutral-200 mb-6 text-xs">
                <div>
                  <span className="text-neutral-500 block">Total Qs</span>
                  <strong className="text-black text-sm">{questions.length}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block">Answered</span>
                  <strong className="text-black text-sm">
                    {Object.keys(studentAnswers).filter(k => studentAnswers[k]?.toString().trim().length > 0).length}
                  </strong>
                </div>
                <div>
                  <span className="text-neutral-500 block">Marked</span>
                  <strong className="text-amber-600 text-sm">
                    {Object.keys(markedForReview).filter(k => markedForReview[k]).length}
                  </strong>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="flex-1 border-2 border-neutral-200 py-3 rounded-xl font-bold text-xs hover:bg-neutral-100 cursor-pointer"
                >
                  Return to Exam
                </button>
                <button
                  type="button"
                  onClick={submitForEvaluation}
                  className="flex-1 bg-black hover:bg-neutral-800 text-white py-3 rounded-xl font-black text-xs cursor-pointer shadow-md"
                >
                  Confirm Submission
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIEW: EVALUATING LOADING STATE */}
      {viewState === 'evaluating' && (
        <div className="min-h-[450px] flex flex-col items-center justify-center text-center p-8">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full border-4 border-neutral-200 border-t-black animate-spin" />
            <Sparkles size={24} className="text-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h3 className="text-2xl font-black mb-2">AI Assessment Engine Active</h3>
          <p className="text-sm text-neutral-600 max-w-md animate-pulse">
            {evaluationStepText}
          </p>
          <div className="mt-8 flex gap-2 text-xs text-neutral-400 font-bold">
            <span>Agent 2: Evaluator</span> • <span>Agent 3: Explainer</span> • <span>Agent 4: Analyst</span> • <span>Agent 5: Learning Guide</span>
          </div>
        </div>
      )}

      {/* VIEW: COMPREHENSIVE RESULT DASHBOARD */}
      {viewState === 'result' && evaluationResult && (
        <div className="space-y-8 max-w-5xl mx-auto">
          {/* Result Hero Score Card */}
          <div className="bg-white border-2 border-black rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                  <span className="text-[10px] font-black uppercase bg-black text-white px-2.5 py-0.5 rounded-full">
                    {evaluationResult.courseName}
                  </span>
                  <span className="text-xs font-bold text-neutral-500">• {evaluationResult.topicName}</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
                  Assessment Complete
                </h2>
                <p className="text-sm text-neutral-600">
                  Performance Level: <strong className="text-black underline font-black">{evaluationResult.performanceLevel}</strong>
                </p>
              </div>

              {/* Large Score Meter */}
              <div className="flex items-center gap-6 shrink-0 bg-neutral-50 border border-neutral-200 p-6 rounded-3xl">
                <div className="text-center">
                  <span className="text-4xl sm:text-5xl font-black text-black">
                    {evaluationResult.percentage}%
                  </span>
                  <span className="block text-xs font-bold text-neutral-500 mt-1">
                    {evaluationResult.marksObtained} / {evaluationResult.totalMarks} Points
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-neutral-100 text-center">
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200">
                <span className="text-xs text-neutral-500 font-bold block">Correct</span>
                <strong className="text-lg font-black text-emerald-700">{evaluationResult.counts.correct}</strong>
              </div>
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200">
                <span className="text-xs text-neutral-500 font-bold block">Partially Correct</span>
                <strong className="text-lg font-black text-amber-700">{evaluationResult.counts.partiallyCorrect}</strong>
              </div>
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200">
                <span className="text-xs text-neutral-500 font-bold block">Incorrect</span>
                <strong className="text-lg font-black text-red-600">{evaluationResult.counts.incorrect}</strong>
              </div>
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200">
                <span className="text-xs text-neutral-500 font-bold block">Time Taken</span>
                <strong className="text-lg font-black text-black">
                  {Math.floor(evaluationResult.timeTakenSeconds / 60)}m {evaluationResult.timeTakenSeconds % 60}s
                </strong>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={downloadPdfReport}
                className="bg-black hover:bg-neutral-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Download size={14} /> Download PDF Assessment Report
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => { setActiveTab('tutor'); }}
                  className="border border-black hover:bg-neutral-100 text-black px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <MessageSquare size={14} /> Ask Doubt Tutor
                </button>
                <button
                  onClick={() => { setViewState('config'); }}
                  className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Take Another Assessment →
                </button>
              </div>
            </div>
          </div>

          {/* AI Learning Recommendations (Agent 4 & 5) */}
          <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xl font-black flex items-center gap-2">
              <Zap size={20} /> AI Learning Recommendations & Weakness Diagnosis
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl">
                <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-800 mb-2">Demonstrated Strong Topics</h4>
                <ul className="space-y-1.5 text-xs text-emerald-950">
                  {evaluationResult.recommendations?.strongTopics?.map((t, i) => (
                    <li key={i} className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 size={13} className="text-emerald-600" /> {t}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl">
                <h4 className="font-bold text-xs uppercase tracking-wider text-amber-800 mb-2">Topics Requiring Revision</h4>
                <ul className="space-y-1.5 text-xs text-amber-950">
                  {evaluationResult.recommendations?.recommendedRevisionTopics?.map((t, i) => (
                    <li key={i} className="flex items-center gap-1.5 font-medium">
                      <AlertCircle size={13} className="text-amber-600" /> {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl">
              <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-700 mb-2">Personalized Study Plan</h4>
              <ul className="space-y-1 text-xs text-neutral-800 list-disc list-inside">
                {evaluationResult.recommendations?.studyRecommendations?.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="space-y-4">
            <h3 className="text-xl font-black">Detailed Question Evaluation Breakdown</h3>

            {evaluationResult.detailedResults?.map((q, idx) => (
              <div 
                key={q.id || idx}
                className="bg-white border-2 border-neutral-200 rounded-3xl p-6 space-y-4 hover:border-black transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-neutral-500">Question {idx + 1} • {q.topic}</span>
                    <h4 className="text-base font-bold mt-1 text-neutral-900">{q.question}</h4>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                      q.marksAwarded === q.marks 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : q.marksAwarded > 0 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {q.marksAwarded} / {q.marks} Pts
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                    <span className="font-bold text-neutral-500 block mb-1">Your Submitted Answer:</span>
                    <p className="font-mono text-neutral-800 break-words">{q.studentAnswer || '(No answer provided)'}</p>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                    <span className="font-bold text-neutral-500 block mb-1">Model / Expected Solution:</span>
                    <p className="font-mono text-neutral-800 break-words">{q.correctAnswer}</p>
                  </div>
                </div>

                {/* Explanation and Improvement */}
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs space-y-2">
                  <div>
                    <strong className="text-neutral-900">AI Explanation:</strong>
                    <p className="text-neutral-700 mt-0.5">{q.explanation}</p>
                  </div>
                  {q.missingOrIncorrect && (
                    <div>
                      <strong className="text-red-700">Identified Gaps:</strong>
                      <p className="text-neutral-700 mt-0.5">{q.missingOrIncorrect}</p>
                    </div>
                  )}
                  {q.howToImprove && (
                    <div>
                      <strong className="text-black">How to Improve:</strong>
                      <p className="text-neutral-700 mt-0.5">{q.howToImprove}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningAssessmentAgent;
