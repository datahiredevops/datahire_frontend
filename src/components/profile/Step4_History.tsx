"use client";
import { useState } from "react";
import { Plus, Trash2, Building2, GraduationCap, Calendar } from "lucide-react";

export default function Step4_History({ data, update }: any) {
  // Local state for forms
  const [showExpForm, setShowExpForm] = useState(false);
  const [showEduForm, setShowEduForm] = useState(false);

  // Temporary state for new entries
  const [newExp, setNewExp] = useState({
    job_title: "", company: "", location: "", start_date: "", end_date: "", description: "", is_current: false
  });
  const [newEdu, setNewEdu] = useState({
    school: "", degree: "", field_of_study: "", grad_year: ""
  });

  // --- WORK EXPERIENCE HANDLERS ---
  const addExperience = () => {
    if (!newExp.job_title || !newExp.company) return alert("Job Title and Company are required");
    update({ ...data, experience: [...data.experience, newExp] });
    setNewExp({ job_title: "", company: "", location: "", start_date: "", end_date: "", description: "", is_current: false });
    setShowExpForm(false);
  };

  const removeExperience = (index: number) => {
    update({ ...data, experience: data.experience.filter((_: any, i: number) => i !== index) });
  };

  // --- EDUCATION HANDLERS ---
  const addEducation = () => {
    if (!newEdu.school || !newEdu.degree) return alert("School and Degree are required");
    update({ ...data, education: [...data.education, newEdu] });
    setNewEdu({ school: "", degree: "", field_of_study: "", grad_year: "" });
    setShowEduForm(false);
  };

  const removeEducation = (index: number) => {
    update({ ...data, education: data.education.filter((_: any, i: number) => i !== index) });
  };

  return (
    <div className="space-y-8">
      
      {/* --- WORK EXPERIENCE SECTION --- */}
      <div>
        <div className="flex justify-between items-center mb-4">
            <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5" /> Work Experience
                </h2>
                <p className="text-sm text-slate-500">Add your relevant past jobs.</p>
            </div>
            <button onClick={() => setShowExpForm(!showExpForm)} className="text-sm font-bold text-[#0F172A] border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition">
                {showExpForm ? "Cancel" : "+ Add Job"}
            </button>
        </div>

        {/* List of Added Jobs */}
        <div className="space-y-3 mb-4">
            {data.experience.map((exp: any, idx: number) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-between items-start">
                    <div>
                        <h4 className="font-bold text-slate-900">{exp.job_title}</h4>
                        <p className="text-sm text-slate-600">{exp.company} • {exp.start_date} - {exp.is_current ? "Present" : exp.end_date}</p>
                    </div>
                    <button onClick={() => removeExperience(idx)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
            ))}
            {data.experience.length === 0 && !showExpForm && (
                <p className="text-sm text-slate-400 italic">No work experience added.</p>
            )}
        </div>

        {/* Add Job Form */}
        {showExpForm && (
            <div className="bg-white border border-slate-300 p-4 rounded-xl shadow-sm space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Job Title" className="border p-2 rounded outline-none focus:ring-2 focus:ring-[#0F172A]" value={newExp.job_title} onChange={(e) => setNewExp({...newExp, job_title: e.target.value})} />
                    <input placeholder="Company" className="border p-2 rounded outline-none focus:ring-2 focus:ring-[#0F172A]" value={newExp.company} onChange={(e) => setNewExp({...newExp, company: e.target.value})} />
                    
                    {/* START DATE (Now uses type="month" for calendar) */}
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input 
                            type="month" 
                            placeholder="Start Date" 
                            className="border p-2 pl-10 rounded w-full outline-none focus:ring-2 focus:ring-[#0F172A] text-slate-700 placeholder-transparent" 
                            value={newExp.start_date} 
                            onChange={(e) => setNewExp({...newExp, start_date: e.target.value})} 
                        />
                    </div>

                    <div className="flex gap-2">
                        {/* END DATE (Now uses type="month" for calendar) */}
                        <div className="relative flex-1">
                            <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${newExp.is_current ? 'text-slate-200' : 'text-slate-400'}`} />
                            <input 
                                type="month"
                                disabled={newExp.is_current} 
                                className="border p-2 pl-10 rounded w-full outline-none focus:ring-2 focus:ring-[#0F172A] disabled:bg-slate-100 disabled:text-slate-400 text-slate-700" 
                                value={newExp.end_date} 
                                onChange={(e) => setNewExp({...newExp, end_date: e.target.value})} 
                            />
                        </div>
                        <label className="flex items-center gap-1 text-xs whitespace-nowrap cursor-pointer select-none">
                            <input type="checkbox" checked={newExp.is_current} onChange={(e) => setNewExp({...newExp, is_current: e.target.checked})} className="accent-[#0F172A] w-4 h-4"/> Current
                        </label>
                    </div>
                </div>
                <textarea placeholder="Description & Achievements..." className="w-full border p-2 rounded h-20 outline-none focus:ring-2 focus:ring-[#0F172A]" value={newExp.description} onChange={(e) => setNewExp({...newExp, description: e.target.value})} />
                <button onClick={addExperience} className="w-full bg-[#0F172A] text-white font-bold py-2 rounded-lg hover:bg-slate-800">Save Job</button>
            </div>
        )}
      </div>

      <hr className="border-slate-200" />

      {/* --- EDUCATION SECTION --- */}
      <div>
        <div className="flex justify-between items-center mb-4">
            <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" /> Education
                </h2>
                <p className="text-sm text-slate-500">Your degrees and schools.</p>
            </div>
            <button onClick={() => setShowEduForm(!showEduForm)} className="text-sm font-bold text-[#0F172A] border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition">
                {showEduForm ? "Cancel" : "+ Add School"}
            </button>
        </div>

        {/* List of Added Education */}
        <div className="space-y-3 mb-4">
            {data.education.map((edu: any, idx: number) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-between items-start">
                    <div>
                        <h4 className="font-bold text-slate-900">{edu.school}</h4>
                        <p className="text-sm text-slate-600">{edu.degree} in {edu.field_of_study} ({edu.grad_year})</p>
                    </div>
                    <button onClick={() => removeEducation(idx)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
            ))}
            {data.education.length === 0 && !showEduForm && (
                <p className="text-sm text-slate-400 italic">No education added.</p>
            )}
        </div>

        {/* Add Education Form */}
        {showEduForm && (
            <div className="bg-white border border-slate-300 p-4 rounded-xl shadow-sm space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <input placeholder="School / University" className="border p-2 rounded outline-none focus:ring-2 focus:ring-[#0F172A]" value={newEdu.school} onChange={(e) => setNewEdu({...newEdu, school: e.target.value})} />
                    <input placeholder="Degree (e.g. BS, MS)" className="border p-2 rounded outline-none focus:ring-2 focus:ring-[#0F172A]" value={newEdu.degree} onChange={(e) => setNewEdu({...newEdu, degree: e.target.value})} />
                    <input placeholder="Field of Study" className="border p-2 rounded outline-none focus:ring-2 focus:ring-[#0F172A]" value={newEdu.field_of_study} onChange={(e) => setNewEdu({...newEdu, field_of_study: e.target.value})} />
                    <input placeholder="Graduation Year" className="border p-2 rounded outline-none focus:ring-2 focus:ring-[#0F172A]" value={newEdu.grad_year} onChange={(e) => setNewEdu({...newEdu, grad_year: e.target.value})} />
                </div>
                <button onClick={addEducation} className="w-full bg-[#0F172A] text-white font-bold py-2 rounded-lg hover:bg-slate-800">Save Education</button>
            </div>
        )}
      </div>

    </div>
  );
}