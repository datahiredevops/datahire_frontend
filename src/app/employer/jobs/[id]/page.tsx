"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Clock, User, Download, Filter } from "lucide-react";

export default function JobApplicantsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuth();
  
  const [job, setJob] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); 

  useEffect(() => {
    if (token && id) fetchData();
  }, [token, id]);

  const fetchData = async () => {
    try {
        // 1. Get Job Details
        const jobRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}`);
        if (!jobRes.ok) throw new Error("Job not found");
        const jobData = await jobRes.json();
        setJob(jobData);

        // 2. Get Candidates
        const appRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}/applicants`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (appRes.ok) {
            const appData = await appRes.json();
            setApplicants(Array.isArray(appData) ? appData : []);
        } else {
            setApplicants([]);
        }
    } catch (err) { 
        console.error(err); 
        setApplicants([]); 
    } finally { 
        setLoading(false); 
    }
  };

  // Filter Logic
  const filteredList = applicants.filter(a => {
      if (activeTab === "recommended") return a.match_score >= (job?.min_match_score || 70);
      if (activeTab === "rejected") return a.match_score < (job?.auto_reject_score || 30);
      return true; // "all"
  });

  if (loading) return <div className="p-12 text-center text-slate-400">Loading workspace...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 font-sans">
        <div className="max-w-6xl mx-auto">
            
            {/* HEADER */}
            <button onClick={() => router.push("/employer/jobs")} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-6 transition">
                <ArrowLeft className="w-4 h-4" /> Back to Jobs
            </button>

            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">{job?.title}</h1>
                    <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                        <span className="bg-slate-200 px-2 py-1 rounded text-slate-700 font-bold text-xs">{job?.location}</span>
                        <span>•</span>
                        <span>Posted {new Date(job?.posted_at).toLocaleDateString()}</span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 shadow-sm flex items-center gap-2 hover:bg-slate-50">
                        <Download className="w-4 h-4"/> Export CSV
                    </button>
                </div>
            </div>

            {/* TABS */}
            <div className="flex border-b border-slate-200 mb-6 gap-6">
                <TabButton label={`All Candidates (${applicants.length})`} active={activeTab === "all"} onClick={() => setActiveTab("all")} />
                <TabButton label="Recommended" count={applicants.filter(a => a.match_score >= (job?.min_match_score || 70)).length} active={activeTab === "recommended"} onClick={() => setActiveTab("recommended")} />
                <TabButton label="Low Match" count={applicants.filter(a => a.match_score < (job?.auto_reject_score || 30)).length} active={activeTab === "rejected"} onClick={() => setActiveTab("rejected")} />
            </div>

            {/* CANDIDATE LIST */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm min-h-[400px]">
                {filteredList.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                        <User className="w-12 h-12 mb-4 opacity-20"/>
                        <p>No candidates found in this category.</p>
                    </div>
                ) : (
                    <div>
                        {filteredList.map((app) => (
                            <div key={app.application_id} className="p-6 border-b border-slate-100 hover:bg-slate-50 transition flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#0F172A] rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        {app.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-lg">{app.name}</h4>
                                        <div className="flex gap-2 mt-1">
                                            {/* AI SCORE */}
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 ${getScoreColor(app.match_score)}`}>
                                                <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                                                {app.match_score}% Match
                                            </span>
                                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-xs font-bold capitalize">{app.status}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                                        <Clock className="w-3 h-3"/> Applied {new Date(app.applied_at).toLocaleDateString()}
                                    </span>
                                    <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold hover:bg-white hover:shadow-md transition bg-slate-50">
                                        View Application
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}

function TabButton({ label, count, active, onClick }: any) {
    return (
        <button 
            onClick={onClick}
            className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${active ? 'border-[#0F172A] text-[#0F172A]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
            {label}
            {count !== undefined && <span className={`px-2 py-0.5 rounded-full text-xs ${active ? 'bg-[#0F172A] text-white' : 'bg-slate-200 text-slate-600'}`}>{count}</span>}
        </button>
    )
}

function getScoreColor(score: number) {
    if (score >= 80) return "bg-green-100 text-green-700";
    if (score >= 50) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
}