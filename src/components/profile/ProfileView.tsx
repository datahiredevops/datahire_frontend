"use client";
import { MapPin, Link as LinkIcon, Mail, Phone, Calendar, Building2, GraduationCap, Code, Award, Edit3, FileText, Download } from "lucide-react";

export default function ProfileView({ data, user, onEdit }: any) {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* --- 1. HEADER CARD --- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-[#0F172A] to-[#334155]"></div>
        
        {/* Edit Button (Top Right) */}
        <button 
            onClick={onEdit}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition border border-white/20"
        >
            <Edit3 className="w-4 h-4" /> Edit Profile
        </button>

        <div className="px-8 pb-8 -mt-12 relative">
            {/* Avatar */}
            <div className="w-28 h-28 bg-white rounded-full p-1.5 shadow-md">
                <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-3xl font-bold text-slate-400 border border-slate-200">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
            </div>

            {/* Basic Info */}
            <div className="mt-4">
                <h1 className="text-3xl font-bold text-slate-900">{user?.first_name} {user?.last_name}</h1>
                <p className="text-lg text-slate-700 font-medium mt-1">{data.headline}</p>
                
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
                    {data.city && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {data.city}, {data.state}</span>}
                    {data.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {data.phone}</span>}
                    <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {user?.email}</span>
                </div>

                <div className="flex gap-3 mt-5">
                    {data.linkedin_url && (
                        <a href={data.linkedin_url} target="_blank" className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1">
                            <LinkIcon className="w-3 h-3" /> LinkedIn
                        </a>
                    )}
                    {data.portfolio_url && (
                        <a href={data.portfolio_url} target="_blank" className="text-slate-700 font-bold text-sm hover:underline flex items-center gap-1">
                            <LinkIcon className="w-3 h-3" /> Portfolio
                        </a>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* --- 2. ABOUT --- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">About</h2>
        <p className="text-slate-600 whitespace-pre-line leading-relaxed">{data.summary || "No summary added."}</p>
      </div>

      {/* --- 3. SKILLS --- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Skills</h2>
        <div className="space-y-4">
            <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase mb-2">Primary Skills</h3>
                <div className="flex flex-wrap gap-2">
                    {data.skills.filter((s: any) => s.skill_type === "Primary").map((s: any, i: number) => (
                        <span key={i} className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-semibold border border-green-100">
                            {s.name}
                        </span>
                    ))}
                </div>
            </div>
            <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase mb-2">Secondary Skills</h3>
                <div className="flex flex-wrap gap-2">
                    {data.skills.filter((s: any) => s.skill_type === "Secondary").map((s: any, i: number) => (
                        <span key={i} className="bg-slate-50 text-slate-600 px-3 py-1 rounded-full text-sm border border-slate-100">
                            {s.name}
                        </span>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* --- 4. EXPERIENCE --- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Experience</h2>
        <div className="space-y-8 relative before:absolute before:left-[21px] before:top-10 before:bottom-0 before:w-[2px] before:bg-slate-100">
            {data.experience.map((exp: any, i: number) => (
                <div key={i} className="flex gap-4 relative">
                    <div className="w-11 h-11 bg-white border border-slate-200 rounded-full flex items-center justify-center shrink-0 z-10">
                        <Building2 className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">{exp.job_title}</h3>
                        <p className="text-slate-700 font-medium">{exp.company}</p>
                        <p className="text-sm text-slate-500 mb-2">{exp.start_date} - {exp.is_current ? "Present" : exp.end_date}</p>
                        <p className="text-slate-600 text-sm leading-relaxed">{exp.description}</p>
                    </div>
                </div>
            ))}
             {data.experience.length === 0 && <p className="text-slate-400 italic">No experience added.</p>}
        </div>
      </div>

      {/* --- 5. EDUCATION --- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Education</h2>
        <div className="space-y-6">
            {data.education.map((edu: any, i: number) => (
                <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center shrink-0">
                        <GraduationCap className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">{edu.school}</h3>
                        <p className="text-slate-700">{edu.degree}, {edu.field_of_study}</p>
                        <p className="text-sm text-slate-500">Graduated: {edu.grad_year}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* --- 6. PROJECTS & CERTS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Projects */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2"><Code className="w-5 h-5"/> Projects</h2>
              <div className="space-y-4">
                {data.projects.map((proj: any, i: number) => (
                    <div key={i} className="border-l-2 border-slate-200 pl-4">
                        <h3 className="font-bold text-slate-900">{proj.name}</h3>
                        <p className="text-xs font-mono text-blue-600 mb-1">{proj.technologies}</p>
                        <p className="text-sm text-slate-600 line-clamp-2">{proj.description}</p>
                    </div>
                ))}
              </div>
          </div>

          {/* Certs */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2"><Award className="w-5 h-5"/> Certifications</h2>
              <div className="space-y-4">
                {data.certifications.map((cert: any, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                        <div className="mt-1 w-2 h-2 bg-yellow-400 rounded-full shrink-0"></div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm">{cert.name}</h3>
                            <p className="text-xs text-slate-500">{cert.issuing_org} • {cert.issue_date}</p>
                        </div>
                    </div>
                ))}
              </div>
          </div>
      </div>

    </div>
  );
}