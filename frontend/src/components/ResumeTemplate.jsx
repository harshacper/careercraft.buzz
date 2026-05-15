import React from 'react';
import { Mail, Phone, MapPin, Link, GraduationCap, Briefcase, User, Star } from 'lucide-react';

const ResumeTemplate = ({ data }) => {
  if (!data) return null;

  return (
    <div id="resume-content" className="w-[210mm] min-h-[297mm] bg-white text-[#333] shadow-2xl mx-auto flex font-sans">
      
      {/* Left Column - Soft Pink Background */}
      <div className="w-[35%] bg-[#fdf8f8] p-10 border-r border-[#faecec] flex flex-col gap-10">
        
        {/* Header (Name & Role) */}
        <div>
          <h1 className="text-5xl font-black tracking-tight text-[#2c3e50] uppercase leading-[1.1] mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            {data.name ? data.name.split(' ').map((n, i) => <div key={i}>{n}</div>) : <div>RHODA<br/>JACKSON</div>}
          </h1>
          <div className="inline-block bg-[#ffcccc] text-[#ef4444] px-4 py-2 rounded-xl font-bold text-lg">
            {data.targetRole || data.summary?.split(' ')[0] || 'Graphic Designer'}
          </div>
        </div>

        {/* Contact Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#ffcccc] p-2 rounded-full text-[#ef4444]"><User size={18} /></div>
            <h2 className="text-xl font-black uppercase tracking-widest text-[#2c3e50]">Contact</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-[#fca5a5]" />
              <span className="text-sm font-medium text-[#4b5563]">{data.contact?.email || 'rhodajackson@email.com'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-[#fca5a5]" />
              <span className="text-sm font-medium text-[#4b5563]">{data.contact?.phone || '(123) 456-7890'}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-[#fca5a5]" />
              <span className="text-sm font-medium text-[#4b5563]">{data.contact?.address || 'Denver, CO'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Link size={16} className="text-[#fca5a5]" />
              <span className="text-sm font-medium text-[#3b82f6] underline">LinkedIn</span>
            </div>
          </div>
        </section>

        {/* Education Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#ffcccc] p-2 rounded-full text-[#ef4444]"><GraduationCap size={18} /></div>
            <h2 className="text-xl font-black uppercase tracking-widest text-[#2c3e50]">Education</h2>
          </div>
          <div className="space-y-6">
            {(data.education || [
              { degree: 'B.F.A.', major: 'Visual Arts', school: 'University of Chicago', date: '2016 - 2020', location: 'Chicago, IL' }
            ]).map((edu, i) => (
              <div key={i} className="flex flex-col gap-1">
                <h3 className="font-bold text-[#4b5563]">{edu.degree}</h3>
                <p className="text-[#4b5563]">{edu.major || edu.degree.split(':')[1] || 'Major'}</p>
                <p className="font-bold text-[#ef4444]">{edu.school}</p>
                <div className="flex items-center gap-2 text-xs font-bold text-[#9ca3af] mt-1">
                  <div className="flex items-center gap-1"><span className="text-[#fca5a5]">📅</span> {edu.date}</div>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#9ca3af]">
                   <div className="flex items-center gap-1"><MapPin size={12} className="text-[#fca5a5]" /> {edu.location || 'Location'}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#ffcccc] p-2 rounded-full text-[#ef4444]"><Star size={18} /></div>
            <h2 className="text-xl font-black uppercase tracking-widest text-[#2c3e50]">Skills</h2>
          </div>
          <ul className="list-disc list-inside text-sm space-y-3 text-[#4b5563] font-medium ml-1">
            {(data.skills || [
              'Adobe Photoshop', 'Adobe Illustrator', 'Adobe After Effects', 'Adobe InDesign', 'Adobe Premiere Pro', 'HTML / CSS'
            ]).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </section>

      </div>

      {/* Right Column - White Background */}
      <div className="w-[65%] p-10 flex flex-col gap-8">
        
        {/* Work Experience */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-[#ffcccc] p-2 rounded-full text-[#ef4444]"><User size={18} fill="currentColor" /></div>
            <h2 className="text-2xl font-black uppercase tracking-widest text-[#2c3e50]">Work Experience</h2>
          </div>

          <div className="space-y-10">
            {(data.workHistory || [
              {
                role: 'Graphic Designer',
                company: 'Mozilla',
                date: '2023 - current',
                location: 'Denver, CO',
                points: [
                  'Worked with editorial, product marketing, social, and creative teams to design marketing video assets, which improved ad performance by 19%',
                  'Created graphic design standards for motion graphic assets, which improved brand consistency for six teams',
                  'Designed over 124 static and video assets, utilizing different styles and approaches, nearly all of which were included in public campaign efforts'
                ]
              },
              {
                role: 'Junior Graphic Designer',
                company: 'Carta Healthcare',
                date: '2021 - 2023',
                location: 'Austin, TX',
                points: [
                  'Collaborated with Marketing, PR, and Social Media teams to design graphics, boosting social engagement by 32%',
                  'Used HTML and CSS to create a high-fidelity mockup, highlighting custom graphics for a product before its launch to 412 hospitals',
                  'Implemented an A/B testing framework for digital ads, which slashed cost per acquisition by 18%'
                ]
              }
            ]).map((job, i) => (
              <div key={i}>
                <h3 className="text-xl font-black text-[#2c3e50] mb-1">{job.role}</h3>
                <p className="font-bold text-[#ef4444] text-lg mb-2">{job.company}</p>
                <div className="flex items-center gap-6 text-sm font-bold text-[#9ca3af] mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[#fca5a5]">📅</span> {job.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-[#fca5a5]" /> {job.location || 'Remote'}
                  </div>
                </div>
                <ul className="list-disc list-outside ml-5 text-sm space-y-3 text-[#4b5563] leading-relaxed">
                  {job.points.map((p, idx) => {
                    // Randomly bold some parts to mimic the design if not explicitly provided
                    // The prompt usually returns plain text, so we'll leave it as is or bold key metrics
                    const boldedText = p.replace(/(\d+%|\$\d+[a-zA-Z]*|\d+)/g, '<strong class="font-black text-[#2c3e50]">$1</strong>');
                    return <li key={idx} dangerouslySetInnerHTML={{ __html: boldedText }} />
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default ResumeTemplate;
