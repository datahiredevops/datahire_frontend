"use client";
import { useState } from "react";
import { Plus, Trash2, Code, Award, ExternalLink } from "lucide-react";

export default function Step5_Portfolio({ data, update }: any) {
  const [showProjForm, setShowProjForm] = useState(false);
  const [showCertForm, setShowCertForm] = useState(false);

  // Temp state for inputs
  const [newProj, setNewProj] = useState({
    name: "", description: "", technologies: "", link: "", role: ""
  });
  const [newCert, setNewCert] = useState({
    name: "", issuing_org: "", issue_date: "", expiration_date: ""
  });

  // --- PROJECT HANDLERS ---
  const addProject = () => {
    if (!newProj.name || !newProj.technologies) return alert("Project Name and Tech Stack are required");
    update({ ...data, projects: [...data.projects, newProj] });
    setNewProj({ name: "", description: "", technologies: "", link: "", role: "" });
    setShowProjForm(false);
  };

  const removeProject = (index: number) => {
    update({ ...data, projects: data.projects.filter((_: any, i: number) => i !== index) });
  };

  // --- CERTIFICATION HANDLERS ---
  const addCertification = () => {
    if (!newCert.name) return alert("Certification Name is required");
    update({ ...data, certifications: [...data.certifications, newCert] });
    setNewCert({ name: "", issuing_org: "", issue_date: "", expiration_date: "" });
    setShowCertForm(false);
  };

  const removeCertification = (index: number) => {
    update({ ...data, certifications: data.certifications.filter((_: any, i: number) => i !== index) });
  };

  return (
    <div className="space-y-8">
      
      {/* --- PROJECTS SECTION --- */}
      <div>
        <div className="flex justify-between items-center mb-4">
            <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Code className="w-5 h-5" /> Projects
                </h2>
                <p className="text-sm text-slate-500">Showcase your coding projects (GitHub, Apps).</p>
            </div>
            <button onClick={() => setShowProjForm(!showProjForm)} className="text-sm font-bold text-[#0F172A] border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition">
                {showProjForm ? "Cancel" : "+ Add Project"}
            </button>
        </div>

        {/* List */}
        <div className="space-y-3 mb-4">
            {data.projects.map((proj: any, idx: number) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-between items-start">
                    <div>
                        <h4 className="font-bold text-slate-900 flex items-center gap-2">
                            {proj.name} 
                            {proj.link && <a href={proj.link} target="_blank" className="text-blue-600 hover:underline"><ExternalLink className="w-3 h-3" /></a>}
                        </h4>
                        <p className="text-xs text-slate-500 font-mono bg-slate-200 inline-block px-1 rounded mb-1">{proj.technologies}</p>
                        <p className="text-sm text-slate-600">{proj.description}</p>
                    </div>
                    <button onClick={() => removeProject(idx)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
            ))}
            {data.projects.length === 0 && !showProjForm && <p className="text-sm text-slate-400 italic">No projects added.</p>}
        </div>

        {/* Form */}
        {showProjForm && (
            <div className="bg-white border border-slate-300 p-4 rounded-xl shadow-sm space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Project Name" className="border p-2 rounded" value={newProj.name} onChange={(e) => setNewProj({...newProj, name: e.target.value})} />
                    <input placeholder="Tech Stack (e.g. React, Python)" className="border p-2 rounded" value={newProj.technologies} onChange={(e) => setNewProj({...newProj, technologies: e.target.value})} />
                    <input placeholder="Project Link (GitHub)" className="col-span-2 border p-2 rounded" value={newProj.link} onChange={(e) => setNewProj({...newProj, link: e.target.value})} />
                </div>
                <textarea placeholder="Description: What did you build?" className="w-full border p-2 rounded h-20" value={newProj.description} onChange={(e) => setNewProj({...newProj, description: e.target.value})} />
                <button onClick={addProject} className="w-full bg-[#0F172A] text-white font-bold py-2 rounded-lg hover:bg-slate-800">Save Project</button>
            </div>
        )}
      </div>

      <hr className="border-slate-200" />

      {/* --- CERTIFICATIONS SECTION --- */}
      <div>
        <div className="flex justify-between items-center mb-4">
            <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Award className="w-5 h-5" /> Certifications
                </h2>
                <p className="text-sm text-slate-500">AWS, Google, Microsoft, etc.</p>
            </div>
            <button onClick={() => setShowCertForm(!showCertForm)} className="text-sm font-bold text-[#0F172A] border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition">
                {showCertForm ? "Cancel" : "+ Add Cert"}
            </button>
        </div>

        {/* List */}
        <div className="space-y-3 mb-4">
            {data.certifications.map((cert: any, idx: number) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-between items-start">
                    <div>
                        <h4 className="font-bold text-slate-900">{cert.name}</h4>
                        <p className="text-sm text-slate-600">{cert.issuing_org} • Issued: {cert.issue_date}</p>
                    </div>
                    <button onClick={() => removeCertification(idx)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
            ))}
            {data.certifications.length === 0 && !showCertForm && <p className="text-sm text-slate-400 italic">No certifications added.</p>}
        </div>

        {/* Form */}
        {showCertForm && (
            <div className="bg-white border border-slate-300 p-4 rounded-xl shadow-sm space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Certification Name" className="border p-2 rounded" value={newCert.name} onChange={(e) => setNewCert({...newCert, name: e.target.value})} />
                    <input placeholder="Issuing Organization" className="border p-2 rounded" value={newCert.issuing_org} onChange={(e) => setNewCert({...newCert, issuing_org: e.target.value})} />
                    <input placeholder="Issue Date" className="border p-2 rounded" value={newCert.issue_date} onChange={(e) => setNewCert({...newCert, issue_date: e.target.value})} />
                    <input placeholder="Expiration Date (Optional)" className="border p-2 rounded" value={newCert.expiration_date} onChange={(e) => setNewCert({...newCert, expiration_date: e.target.value})} />
                </div>
                <button onClick={addCertification} className="w-full bg-[#0F172A] text-white font-bold py-2 rounded-lg hover:bg-slate-800">Save Certification</button>
            </div>
        )}
      </div>

    </div>
  );
}