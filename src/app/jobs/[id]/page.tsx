"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { MapPin, Briefcase, DollarSign, Clock, ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function JobDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [job, setJob] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  // 1. Fetch Job Details
  useEffect(() => {
    if (!id) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}`)
      .then(res => res.json())
      .then(data => setJob(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  // 2. Fetch AI Match Score (Once job & user are ready)
  useEffect(() => {
    if (job && user?.id) {
        setAnalyzing(true);
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}/match/${user.id}`)
            .then(res => res.json())
            .then(data => {
                if (!data.error) setAnalysis(data);
            })
            .catch(err => console.error("AI Error:", err))
            .finally(() => setAnalyzing(false));
    }
  }, [job, user]);

  if (loading) return <div className="flex h-screen items-center justify-center">Loading Job...</div>;
  if (!job) return <div>Job not found</div>;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar />
      <main className="ml-20 lg:ml-64 flex-1 p-8 flex gap-8">
        
        {/* --- LEFT: JOB DETAILS --- */}
        <div className="flex-1 space-y-6">
            
            {/* Back Button */}
            <Link href="/jobs" className="flex items-center gap-2 text-slate-500 hover:text-[#0F172A] font-bold text-sm mb-2">
                <ArrowLeft className="w-4 h-4" /> Back to Jobs
            </Link>

            {/* Header Card */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start">
                    <div className="flex gap-5">
                        <img src={job.logo} className="w-16 h-16 object-contain rounded-lg border border-slate-100 p-1" />
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
                            <p className="text-lg text-slate-600 font-medium">{job.company}</p>
                            <div className="flex gap-4 mt-3 text-sm text-slate-500">
                                <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {job.location}</span>
                                <span className="flex items-center gap-1"><Briefcase className="w-4 h-4"/> {job.type}</span>
                                <span className="flex items-center gap-1"><DollarSign className="w-4 h-4"/> {job.salary}</span>
                            </div>
                        </div>
                    </div>
                    <button className="bg-[#0F172A] text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-blue-900/20">
                        Apply Now
                    </button>
                </div>
            </div>

            {/* Description */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">About the Role</h3>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line">{job.description}</p>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">Requirements</h3>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line">{job.requirements}</p>
                </div>
            </div>
        </div>

        {/* --- RIGHT: AI SCORECARD --- */}
        <div className="w-96 space-y-6">
            
            {/* MATCH SCORE CARD */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-8">
                
                <h3 className="font-bold text-slate-900 mb-6">AI Match Analysis</h3>
                
                {analyzing ? (
                    <div className="text-center py-10">
                        <div className="animate-spin w-8 h-8 border-4 border-[#0F172A] border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p className="text-slate-500 text-sm">Analyzing your resume...</p>
                    </div>
                ) : analysis ? (
                    <>
                        {/* Score Circle */}
                        <div className="flex justify-center mb-6">
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="64" cy="64" r="60" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                                    <circle cx="64" cy="64" r="60" stroke={analysis.matchScore > 80 ? "#16a34a" : "#ca8a04"} strokeWidth="8" fill="transparent" 
                                        strokeDasharray={2 * Math.PI * 60}
                                        strokeDashoffset={2 * Math.PI * 60 * (1 - analysis.matchScore / 100)}
                                        className="transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <div className="absolute text-center">
                                    <span className="text-4xl font-bold text-slate-900">{analysis.matchScore}%</span>
                                    <p className="text-xs text-slate-500 font-bold uppercase mt-1">Match</p>
                                </div>
                            </div>
                        </div>

                        {/* Breakdown */}
                        <div className="flex justify-between text-center mb-6 border-b border-slate-100 pb-6">
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{analysis.breakdown?.exp}%</p>
                                <p className="text-xs text-slate-500">Experience</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{analysis.breakdown?.skill}%</p>
                                <p className="text-xs text-slate-500">Skills</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{analysis.breakdown?.industry}%</p>
                                <p className="text-xs text-slate-500">Industry</p>
                            </div>
                        </div>

                        {/* Analysis Text */}
                        <div className="space-y-4">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    <span className="font-bold text-slate-900">Why: </span>
                                    {analysis.reason}
                                </p>
                            </div>

                            {/* Missing Skills */}
                            {analysis.skills && analysis.matched_skills && (
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Missing Skills</p>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.skills.filter((s: string) => !analysis.matched_skills.includes(s)).slice(0, 5).map((s: string) => (
                                            <span key={s} className="px-2 py-1 bg-red-50 text-red-600 text-xs font-bold rounded border border-red-100">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* OPTIMIZE BUTTON */}
                        <button className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 hover:opacity-90 transition">
                            <Sparkles className="w-4 h-4" /> Optimize Resume
                        </button>
                    </>
                ) : (
                    <div className="text-center text-slate-500">
                        Could not analyze match. (Upload a resume first)
                    </div>
                )}
            </div>

        </div>

      </main>
    </div>
  );
}