import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Code2, 
  Cpu, 
  Database, 
  Globe, 
  Layers, 
  Layout, 
  Terminal, 
  UserCheck, 
  Wrench,
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const notesCategories = [
  {
    title: "Core Programming",
    icon: <Code2 className="text-blue-500" />,
    links: [
      { name: "DSA Mastery", url: "https://www.geeksforgeeks.org/dsa/dsa-tutorial-learn-data-structures-and-algorithms/", desc: "Master algorithms and data structures." },
      { name: "Python Programming", url: "https://www.geeksforgeeks.org/python/python-programming-language-tutorial/", desc: "Learn Python from basic to advanced." },
      { name: "Java Fundamentals", url: "https://www.geeksforgeeks.org/java/java/", desc: "Comprehensive guide to Java development." },
      { name: "General Programming", url: "https://www.geeksforgeeks.org/tutorials/programming-language-tutorials/", desc: "Tutorials for various languages." },
    ]
  },
  {
    title: "Web & Modern Tech",
    icon: <Globe className="text-emerald-500" />,
    links: [
      { name: "Web Development", url: "https://www.geeksforgeeks.org/web-tech/web-technology/", desc: "Full-stack web technology guide." },
      { name: "System Design", url: "https://www.geeksforgeeks.org/system-design/system-design-tutorial/", desc: "Learn to design scalable systems." },
      { name: "DevOps Roadmap", url: "https://www.geeksforgeeks.org/devops/devops-tutorial/", desc: "Streamline development and operations." },
    ]
  },
  {
    title: "AI & Data Science",
    icon: <Cpu className="text-purple-500" />,
    links: [
      { name: "AI, ML & Data Science", url: "https://www.geeksforgeeks.org/machine-learning/ai-ml-and-data-science-tutorial-learn-ai-ml-and-data-science/", desc: "The ultimate 3-in-1 AI roadmap." },
      { name: "Machine Learning", url: "https://www.geeksforgeeks.org/machine-learning/machine-learning/", desc: "Deep dive into ML algorithms." },
    ]
  },
  {
    title: "Fundamentals & Data",
    icon: <Database className="text-orange-500" />,
    links: [
      { name: "Guide to Databases", url: "https://www.geeksforgeeks.org/sql/guide-to-databases/", desc: "SQL, NoSQL and database management." },
      { name: "CS Core Subjects", url: "https://www.geeksforgeeks.org/tutorials/articles-on-computer-science-subjects-gq/", desc: "OS, DBMS, CN, and more." },
    ]
  },
  {
    title: "Career & Tools",
    icon: <UserCheck className="text-rose-500" />,
    links: [
      { name: "Interview Prep", url: "https://www.geeksforgeeks.org/interview-prep/interview-corner/", desc: "Crack your next technical interview." },
      { name: "Tools Directory", url: "https://www.geeksforgeeks.org/websites-apps/software-and-tools-a-to-z-list/", desc: "Essential software and developer tools." },
    ]
  }
];

const Notes = () => {
  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-darkGreen/10 text-darkGreen font-bold text-sm mb-6"
          >
            <BookOpen size={16} />
            <span>LEARNING RESOURCES</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-black text-gray-900 mb-6"
          >
            Curated <span className="text-darkGreen">Knowledge</span> Hub
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Accelerate your career with premium hand-picked tutorials and study materials from across the tech landscape.
          </motion.p>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {notesCategories.map((category, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glassmorphism p-8 hover:shadow-2xl transition-all duration-500 group border border-white/40"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-white shadow-lg rounded-2xl group-hover:scale-110 transition-transform duration-500">
                  {category.icon}
                </div>
                <h2 className="text-2xl font-black text-gray-900">{category.title}</h2>
              </div>

              <div className="space-y-4">
                {category.links.map((link, lIdx) => (
                  <a 
                    key={lIdx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-white/50 hover:bg-darkGreen group/link rounded-2xl transition-all duration-300 border border-transparent hover:border-darkGreen/20 shadow-sm"
                  >
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 group-hover/link:text-white transition-colors">{link.name}</h3>
                      <p className="text-sm text-gray-500 group-hover/link:text-white/80 transition-colors line-clamp-1">{link.desc}</p>
                    </div>
                    <div className="ml-4 p-2 bg-gray-100 group-hover/link:bg-white/20 rounded-xl transition-colors">
                      <ExternalLink size={16} className="text-gray-400 group-hover/link:text-white" />
                    </div>
                  </a>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-20 p-12 bg-darkGreen rounded-[40px] text-center text-white relative overflow-hidden shadow-2xl"
        >
          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-4">Need personalized guidance?</h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">Use our AI Career Navigator to identify your specific skill gaps and get a custom learning roadmap tailored to your target job role.</p>
            <button 
              onClick={() => window.location.href = '/skill-gap'}
              className="bg-white text-darkGreen px-8 py-4 rounded-2xl font-black hover:scale-105 transition-all shadow-xl flex items-center gap-2 mx-auto"
            >
              Analyze My Skills <ChevronRight size={20} />
            </button>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        </motion.div>
      </div>
    </div>
  );
};

export default Notes;
