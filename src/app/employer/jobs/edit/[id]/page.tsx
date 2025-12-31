"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ChevronRight, AlertCircle, Loader2, Plus, X, ChevronLeft, Calendar } from "lucide-react";

export default function EditJobPage() {
  const router = useRouter();
  const { id } = useParams();
  const { token } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    type: "Full-time",
    remote: "On-site",
    salary_range: "",
    description: "",
    requirements: "",
    benefits: "",
    min_match_score: 70,
    auto_reject_score: 30,
    application_deadline: "",
    screening_questions: [""]
  });

  // --- FETCH JOB DETAILS ---
  useEffect(() => {
    if (token && id) fetchJobDetails();
  }, [token, id]);

  const fetchJobDetails = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Job not found");
      
      const data = await res.json();
      
      let formattedDeadline = "";
      if (data.application_deadline) {
        formattedDeadline = new Date(data.application_deadline).toISOString().split('T')[0];
      }

      setFormData({
        title: data.title || "",
        location: data.location || "",
        type: data.type || "Full-time",
        remote: data.remote || "On-site",
        salary_range: data.salary_range || "",
        description: data.description || "",
        requirements: data.requirements || "",
        benefits: data.benefits || "",
        min_match_score: data.min_match_score || 70,
        auto_reject_score: data.auto_reject_score || 30,
        application_deadline: formattedDeadline,
        screening_questions: data.screening_questions && data.screening_questions.length > 0 ? data.screening_questions : [""]
      });
    } catch (err) {
      setError("Failed to load job details.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const updateQuestion = (index: number, value: string) => {
    const newQ = [...formData.screening_questions];
    newQ[index] = value;
    setFormData({ ...formData, screening_questions: newQ });
  };

  // --- HANDLE UPDATE (Now accepts status) ---
  const handleUpdate = async (status: string) => {
    setSaving(true); setError("");
    
    const payload = {
        ...formData,
        min_match_score: Number(formData.min_match_score),
        auto_reject_score: Number(formData.auto_reject_score),
        application_deadline: formData.application_deadline ? new Date(formData.application_deadline).toISOString() : null,
        screening_questions: formData.screening_questions.filter(q => q.trim() !== ""),
        status: status // <--- Updates status to "Draft" or "Published"
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}`, {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to update job");
      }
      
      router.push("/employer/jobs");
      
    } catch (err: any) { 
        setError(err.message); 
        setSaving(false); 
    }
  };

  const inputClass = "w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 text-sm font-bold focus:ring-2 focus:ring-[#0F172A] focus:border-[#0F172A] outline-none transition-all placeholder:text-slate-400";
  const labelClass = "text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block";

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold gap-3"><Loader2 className="animate-spin"/> Loading job...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8">
            <button onClick={() => router.push('/employer/jobs')} className="text-slate-400 hover:text-slate-900 flex items-center gap-1 text-sm font-bold mb-4 transition">
                <ChevronLeft className="w-4 h-4"/> Cancel Edit
            </button>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Edit Job</h1>
        </div>

        {/* STEPS */}
        <div className="flex items-center gap-4 mb-8">
            <div className={`flex items-center gap-2 text-sm font-bold ${step === 1 ? 'text-[#0F172A]' : 'text-slate-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 1 ? 'bg-[#0F172A] text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
                Job Details
            </div>
            <div className="h-0.5 w-12 bg-slate-200"></div>
            <div className={`flex items-center gap-2 text-sm font-bold ${step === 2 ? 'text-[#0F172A]' : 'text-slate-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 2 ? 'bg-[#0F172A] text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
                AI Configuration
            </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden p-8">
            {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 font-bold text-sm"><AlertCircle className="w-5 h-5"/> {error}</div>}

            {/* STEP 1: BASICS */}
            {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className={labelClass}>Job Title</label><input name="title" className={inputClass} value={formData.title} onChange={handleChange} /></div>
                        <div><label className={labelClass}>Location</label><input name="location" className={inputClass} value={formData.location} onChange={handleChange} /></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className={labelClass}>Employment Type</label>
                            <select name="type" className={inputClass} value={formData.type} onChange={handleChange}>
                                <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Remote Policy</label>
                            <select name="remote" className={inputClass} value={formData.remote} onChange={handleChange}>
                                <option>On-site</option><option>Remote</option><option>Hybrid</option>
                            </select>
                        </div>
                        <div><label className={labelClass}>Salary Range</label><input name="salary_range" className={inputClass} value={formData.salary_range} onChange={handleChange} /></div>
                    </div>

                    <div><label className={labelClass}>Job Description</label><textarea name="description" className={`${inputClass} min-h-[150px]`} value={formData.description} onChange={handleChange} /></div>
                    <div><label className={labelClass}>Requirements</label><textarea name="requirements" className={`${inputClass} min-h-[120px]`} value={formData.requirements} onChange={handleChange} /></div>

                    <button onClick={() => setStep(2)} className="w-full py-4 bg-[#0F172A] text-white font-bold text-lg rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-2 mt-4">
                        Next Step <ChevronRight className="w-5 h-5"/>
                    </button>
                </div>
            )}

            {/* STEP 2: AI CONFIG */}
            {step === 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right duration-300">
                    <div>
                        <div className="flex items-center gap-2 mb-2"><Calendar className="w-4 h-4 text-slate-500" /><label className={labelClass.replace("mb-2","mb-0")}>Listing End Date</label></div>
                        <input type="date" name="application_deadline" className={inputClass} value={formData.application_deadline} onChange={handleChange} />
                    </div>

                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div><label className={labelClass}>Shortlist ({formData.min_match_score}%)</label><input type="range" name="min_match_score" min="50" max="95" value={formData.min_match_score} onChange={handleChange} className="w-full accent-green-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none" /></div>
                            <div><label className={labelClass}>Auto-Reject ({formData.auto_reject_score}%)</label><input type="range" name="auto_reject_score" min="0" max="50" value={formData.auto_reject_score} onChange={handleChange} className="w-full accent-red-500 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none" /></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-end mb-4"><label className={labelClass}>Screening Questions</label><button onClick={() => setFormData({...formData, screening_questions: [...formData.screening_questions, ""]})} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"><Plus className="w-4 h-4"/> Add Question</button></div>
                        <div className="space-y-3">
                            {formData.screening_questions.map((q, i) => (
                                <div key={i} className="flex gap-2">
                                    <input className={inputClass} placeholder={`Question ${i+1}`} value={q} onChange={(e) => updateQuestion(i, e.target.value)} />
                                    <button onClick={() => { const newQ = formData.screening_questions.filter((_, idx) => idx !== i); setFormData({...formData, screening_questions: newQ}); }} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition border-2 border-transparent hover:border-red-100"><X className="w-5 h-5"/></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* TWO BUTTONS: SAVE DRAFT vs PUBLISH CHANGES */}
                    <div className="flex gap-4 pt-6 border-t border-slate-100 mt-6">
                        <button 
                            onClick={() => setStep(1)} 
                            className="px-6 py-4 font-bold text-slate-500 hover:text-slate-900 bg-slate-100 rounded-xl transition"
                        >
                            Back
                        </button>
                        
                        <button 
                            onClick={() => handleUpdate("Draft")} 
                            disabled={saving} 
                            className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold text-lg rounded-xl hover:bg-slate-50 transition flex items-center justify-center gap-2"
                        >
                            {saving ? <Loader2 className="animate-spin"/> : "Save as Draft"}
                        </button>

                        <button 
                            onClick={() => handleUpdate("Published")} 
                            disabled={saving} 
                            className="flex-1 py-4 bg-[#0F172A] text-white font-bold text-lg rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
                        >
                            {saving ? <Loader2 className="animate-spin"/> : "Publish Changes"}
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}