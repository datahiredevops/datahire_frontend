"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Briefcase, ChevronRight, AlertCircle, Loader2, Sparkles, Plus, X, ChevronLeft, Calendar } from "lucide-react";

export default function CreateJobPage() {
  const router = useRouter();
  const { token } = useAuth(); // Now this works because we fixed AuthContext!
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
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
    // AI Config
    min_match_score: 70,
    auto_reject_score: 30,
    application_deadline: "", // <--- NEW FIELD
    screening_questions: [""]
  });

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const updateQuestion = (index: number, value: string) => {
    const newQ = [...formData.screening_questions];
    newQ[index] = value;
    setFormData({ ...formData, screening_questions: newQ });
  };

  const handleSubmit = async () => {
    setLoading(true); setError("");
    
    // 1. FORMAT DATA (Critical Fix for "Failed to post")
    // Pydantic hates empty strings for Dates/Ints, so we convert them to null
    const payload = {
        ...formData,
        min_match_score: Number(formData.min_match_score),
        auto_reject_score: Number(formData.auto_reject_score),
        application_deadline: formData.application_deadline ? new Date(formData.application_deadline).toISOString() : null,
        screening_questions: formData.screening_questions.filter(q => q.trim() !== "")
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      
      if (!res.ok) {
        // Show the actual error message from backend (e.g. "Validation Error")
        throw new Error(data.detail || "Failed to post job");
      }
      
      router.push("/employer/dashboard");
      
    } catch (err: any) { 
        console.error(err);
        setError(err.message); 
        setLoading(false); 
    }
  };

  // Reusable Classes
  const inputClass = "w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 text-sm font-bold focus:ring-2 focus:ring-[#0F172A] focus:border-[#0F172A] outline-none transition-all placeholder:text-slate-400";
  const labelClass = "text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block";

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8">
            <button onClick={() => router.back()} className="text-slate-400 hover:text-slate-900 flex items-center gap-1 text-sm font-bold mb-4 transition">
                <ChevronLeft className="w-4 h-4"/> Back to Dashboard
            </button>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Post a New Job</h1>
            <p className="text-slate-500 mt-2 font-medium">Create a listing to start the AI matching process.</p>
        </div>

        {/* STEPS INDICATOR */}
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
                        <div><label className={labelClass}>Job Title</label><input name="title" className={inputClass} placeholder="e.g. Senior React Developer" value={formData.title} onChange={handleChange} /></div>
                        <div><label className={labelClass}>Location</label><input name="location" className={inputClass} placeholder="e.g. Austin, TX" value={formData.location} onChange={handleChange} /></div>
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
                        <div><label className={labelClass}>Salary Range</label><input name="salary_range" className={inputClass} placeholder="$100k - $140k" value={formData.salary_range} onChange={handleChange} /></div>
                    </div>

                    <div><label className={labelClass}>Job Description</label><textarea name="description" className={`${inputClass} min-h-[150px] leading-relaxed`} placeholder="Describe the role and responsibilities..." value={formData.description} onChange={handleChange} /></div>
                    <div><label className={labelClass}>Requirements (Crucial for AI)</label><textarea name="requirements" className={`${inputClass} min-h-[120px] leading-relaxed`} placeholder="List specific skills (e.g. Python, AWS, 5+ years experience)..." value={formData.requirements} onChange={handleChange} /></div>

                    <button onClick={() => setStep(2)} disabled={!formData.title} className="w-full py-4 bg-[#0F172A] text-white font-bold text-lg rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-2 mt-4">
                        Next Step <ChevronRight className="w-5 h-5"/>
                    </button>
                </div>
            )}

            {/* STEP 2: AI CONFIG */}
            {step === 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right duration-300">
                    
                    {/* DEADLINE (NEW) */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            <label className={labelClass.replace("mb-2","mb-0")}>Listing End Date</label>
                        </div>
                        <input 
                            type="date" 
                            name="application_deadline" 
                            className={inputClass} 
                            value={formData.application_deadline} 
                            onChange={handleChange}
                        />
                        <p className="text-xs text-slate-400 mt-2 font-medium">Job will automatically close for new applicants after this date.</p>
                    </div>

                    {/* THRESHOLDS CARD */}
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center"><Sparkles className="w-5 h-5"/></div>
                            <div><h3 className="font-bold text-slate-900">AI Scoring Logic</h3><p className="text-xs text-slate-500">Define how the AI should filter candidates.</p></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className={labelClass}>Shortlist Threshold ({formData.min_match_score}%)</label>
                                <input type="range" name="min_match_score" min="50" max="95" value={formData.min_match_score} onChange={handleChange} className="w-full accent-green-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none" />
                                <p className="text-xs text-slate-500 mt-2 font-medium">Candidates above this score are marked "Recommended".</p>
                            </div>
                            <div>
                                <label className={labelClass}>Auto-Reject Threshold ({formData.auto_reject_score}%)</label>
                                <input type="range" name="auto_reject_score" min="0" max="50" value={formData.auto_reject_score} onChange={handleChange} className="w-full accent-red-500 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none" />
                                <p className="text-xs text-slate-500 mt-2 font-medium">Candidates below this score go to "Low Match".</p>
                            </div>
                        </div>
                    </div>

                    {/* QUESTIONS */}
                    <div>
                        <div className="flex justify-between items-end mb-4">
                            <label className={labelClass}>Screening Questions</label>
                            <button onClick={() => setFormData({...formData, screening_questions: [...formData.screening_questions, ""]})} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"><Plus className="w-4 h-4"/> Add Question</button>
                        </div>
                        <div className="space-y-3">
                            {formData.screening_questions.map((q, i) => (
                                <div key={i} className="flex gap-2">
                                    <input className={inputClass} placeholder={`Question ${i+1}`} value={q} onChange={(e) => updateQuestion(i, e.target.value)} />
                                    <button onClick={() => {
                                        const newQ = formData.screening_questions.filter((_, idx) => idx !== i);
                                        setFormData({...formData, screening_questions: newQ});
                                    }} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition border-2 border-transparent hover:border-red-100"><X className="w-5 h-5"/></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button onClick={() => setStep(1)} className="px-8 py-4 font-bold text-slate-500 hover:text-slate-900 bg-slate-100 rounded-xl hover:bg-slate-200 transition">Back</button>
                        <button onClick={handleSubmit} disabled={loading} className="w-full py-4 bg-[#0F172A] text-white font-bold text-lg rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="animate-spin"/> : "Post Job & Activate AI"}
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}