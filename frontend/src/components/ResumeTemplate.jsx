import React from 'react';
import { Mail, Phone } from 'lucide-react';

const GithubIcon = ({ size = 16, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ size = 16, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

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

const ResumeTemplate = ({ data }) => {
  // Merge input data with defaults
  const resumeData = data && Object.keys(data).length > 0 ? {
    ...defaultResumeData,
    ...data,
    contact: { ...defaultResumeData.contact, ...data.contact },
    // Only override arrays if they are present and have items
    skills: data.skills && data.skills.length > 0 ? data.skills : defaultResumeData.skills,
    workHistory: data.workHistory && data.workHistory.length > 0 ? data.workHistory : defaultResumeData.workHistory,
    education: data.education && data.education.length > 0 ? data.education : defaultResumeData.education,
    projects: data.projects && data.projects.length > 0 ? data.projects : defaultResumeData.projects,
    awards: data.awards && data.awards.length > 0 ? data.awards : defaultResumeData.awards,
  } : defaultResumeData;

  const renderSkills = (skills) => {
    if (!skills || skills.length === 0) return null;

    const categories = [];
    const plainSkills = [];

    skills.forEach((skill) => {
      if (typeof skill !== 'string') return;
      const colonIndex = skill.indexOf(':');
      if (colonIndex !== -1 && !skill.startsWith('http')) {
        categories.push(skill);
      } else {
        plainSkills.push(skill);
      }
    });

    return (
      <div className="space-y-1.5 text-[10pt] leading-relaxed text-slate-800">
        {/* Render category-based skills */}
        {categories.map((catSkill) => {
          const colonIndex = catSkill.indexOf(':');
          const prefix = catSkill.substring(0, colonIndex + 1);
          const content = catSkill.substring(colonIndex + 1);
          return (
            <div key={catSkill}>
              <span className="font-bold">{prefix}</span>{content}
            </div>
          );
        })}

        {/* Render plain skills inline, separated by commas */}
        {plainSkills.length > 0 && (
          <div>
            <span className="font-bold">Skills: </span>
            {plainSkills.join(', ')}
          </div>
        )}
      </div>
    );
  };

  const formatPoint = (point) => {
    if (!point) return '';
    // Bold percentages, dollar amounts, and other key numbers/metrics to make it look premium
    const boldedText = point.replace(/(\d+%\s*|\$\d+[a-zA-Z]*|\d+\s*(?:years|months|million|billion|hr|k|M|B)?)/g, '<strong class="font-semibold text-slate-900">$1</strong>');
    return <span dangerouslySetInnerHTML={{ __html: boldedText }} />;
  };

  return (
    <div id="resume-content" className="w-[210mm] min-h-[297mm] bg-white text-[#333] shadow-2xl mx-auto p-12 flex flex-col font-sans text-left">
      
      {/* Header (Name & Contact details row) */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 mb-3 font-serif">
          {resumeData.name}
        </h1>
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-sm text-slate-700">
          {resumeData.contact?.email && (
            <span className="flex items-center gap-1.5">
              <Mail size={13} className="text-slate-800" />
              <a href={`mailto:${resumeData.contact.email}`} className="text-slate-900 underline hover:text-black">{resumeData.contact.email}</a>
            </span>
          )}
          {resumeData.contact?.email && resumeData.contact?.phone && <span className="text-slate-400">|</span>}
          {resumeData.contact?.phone && (
            <span className="flex items-center gap-1.5">
              <Phone size={13} className="text-slate-800" />
              <span className="text-slate-800">{resumeData.contact.phone}</span>
            </span>
          )}
        </div>
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-sm text-slate-700 mt-1.5">
          {resumeData.contact?.github && (
            <span className="flex items-center gap-1.5">
              <GithubIcon size={13} className="text-slate-800" />
              <a href={`https://${resumeData.contact.github}`} target="_blank" rel="noopener noreferrer" className="text-slate-900 underline hover:text-black">{resumeData.contact.github}</a>
            </span>
          )}
          {resumeData.contact?.github && resumeData.contact?.linkedin && <span className="text-slate-400">|</span>}
          {resumeData.contact?.linkedin && (
            <span className="flex items-center gap-1.5">
              <LinkedinIcon size={13} className="text-slate-800" />
              <a href={`https://${resumeData.contact.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-slate-900 underline hover:text-black">{resumeData.contact.linkedin}</a>
            </span>
          )}
        </div>
      </div>

      {/* Skills Section */}
      <section className="mb-5">
        <h2 className="text-lg font-bold text-slate-800 tracking-wide uppercase font-sans">Skills</h2>
        <div className="border-b border-slate-300 w-full mt-0.5 mb-2"></div>
        {renderSkills(resumeData.skills)}
      </section>

      {/* Work Experience Section */}
      <section className="mb-5">
        <h2 className="text-lg font-bold text-slate-800 tracking-wide uppercase font-sans">Work Experience</h2>
        <div className="border-b border-slate-300 w-full mt-0.5 mb-2.5"></div>
        <div className="space-y-4.5">
          {resumeData.workHistory && resumeData.workHistory.map((job, idx) => (
            <div key={idx} className="flex flex-col">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-slate-900 text-[11pt]">{job.company}{job.location ? `, ${job.location}` : ''}</span>
                <span className="text-slate-700 text-[10pt]">{job.date}</span>
              </div>
              <div className="text-[10pt] italic text-indigo-700 font-semibold mb-1">
                {job.role}
              </div>
              <ul className="list-disc list-outside pl-5 space-y-1 text-slate-800 text-[10pt] leading-relaxed">
                {job.points && job.points.map((pt, pIdx) => (
                  <li key={pIdx}>
                    {formatPoint(pt)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Education Section */}
      <section className="mb-5">
        <h2 className="text-lg font-bold text-slate-800 tracking-wide uppercase font-sans">Education</h2>
        <div className="border-b border-slate-300 w-full mt-0.5 mb-2.5"></div>
        <div className="space-y-3">
          {resumeData.education && resumeData.education.map((edu, idx) => (
            <div key={idx} className="flex flex-col">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-slate-900 text-[11pt]">{edu.school}</span>
                <span className="text-slate-700 text-[10pt]">{edu.date}</span>
              </div>
              <div className="flex justify-between items-baseline text-[10pt] mb-1">
                <span className="italic text-indigo-700 font-semibold">{edu.degree}</span>
                {edu.grade && <span className="font-bold italic text-indigo-700">{edu.grade}</span>}
              </div>
              {edu.coursework && (
                <div className="text-[10pt] text-slate-800 leading-relaxed mt-1">
                  <span className="font-bold">Relevant Coursework:</span> {edu.coursework}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Project Work Section */}
      <section className="mb-5">
        <h2 className="text-lg font-bold text-slate-800 tracking-wide uppercase font-sans">Project Work</h2>
        <div className="border-b border-slate-300 w-full mt-0.5 mb-2.5"></div>
        <ul className="list-disc list-outside pl-5 space-y-2 text-[10pt] text-slate-800 leading-relaxed">
          {resumeData.projects && resumeData.projects.map((proj, idx) => (
            <li key={idx}>
              <span className="font-bold">{proj.name} {proj.date ? `(${proj.date})` : ''}:</span>{' '}
              {formatPoint(proj.description || proj.desc || '')}
            </li>
          ))}
        </ul>
      </section>

      {/* Awards and Certificates Section */}
      <section className="mb-2">
        <h2 className="text-lg font-bold text-slate-800 tracking-wide uppercase font-sans">Awards and Certificates</h2>
        <div className="border-b border-slate-300 w-full mt-0.5 mb-2.5"></div>
        <ul className="list-disc list-outside pl-5 space-y-1.5 text-[10pt] text-slate-800 leading-relaxed">
          {resumeData.awards && resumeData.awards.map((award, idx) => {
            if (typeof award !== 'string') return null;
            const colonIndex = award.indexOf(':');
            if (colonIndex !== -1) {
              const prefix = award.substring(0, colonIndex + 1);
              const content = award.substring(colonIndex + 1);
              return (
                <li key={idx}>
                  <span className="font-bold">{prefix}</span>{content}
                </li>
              );
            }
            return (
              <li key={idx}>
                {award}
              </li>
            );
          })}
        </ul>
      </section>

    </div>
  );
};

export default ResumeTemplate;
