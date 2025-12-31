"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Clock, User, Download, Filter, FileText, Loader2, AlertCircle } from "lucide-react";
import ApplicantDrawer from "@/components/ApplicantDrawer"; 

export default function JobApplicantsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuth();
  
  const [job, setJob] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // New Error State
  const [activeTab, setActiveTab] = useState("all"); 
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    if (token && id) fetchData();
  }, [token, id]);

  const fetchData = async () => {
    try {
        // Handle "null" or invalid ID string immediately
        if (!id || id === 'null' || id === 'undefined') {
            setError("Invalid Job ID");
            setLoading(false);
            return;
        }

        const jobRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}`);
        
        if (!jobRes.ok) {
            // Instead of throwing and crashing, set UI error state
            setError("Job not found");
            setLoading(false);
            return;
        }

        const jobData = await jobRes.json();
        setJob(jobData);

        const appRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}/applicants`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (appRes.ok) {
            const appData = await appRes.json();
            setApplicants(Array.isArray(appData) ? appData : []);
        } else { setApplicants([]); }
    } catch (err) { 
        console.error(err); 
        setError("Failed to load job details");
    } 
    finally { setLoading(false); }
  };

  const handleDownload = async (e: any, appId: number) => {
    e.stopPropagation();
    setDownloadingId(appId);
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employer/applications/${appId}/resume`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            // Validating URL before opening to prevent "null" tab crash
            if (data.url && data.url.startsWith('http')) {
                window.open(data.url, '_blank');
            } else {
                alert("Resume file not valid.");
            }
        } else {
            alert("Resume not found.");
        }
    } catch (err) { alert("Download failed"); }
    finally { setDownloadingId(null); }
  };

  const handleDrawerClose = () => {
      if (selectedAppId) {
          setApplicants(prev => prev.map(a => a.application_id === selectedAppId ? { ...a, is_viewed: true } : a));
      }
      setSelectedAppId(null);
  };

  const filteredList = applicants.filter(a => {
      if (activeTab === "recommended") return a.match_score >= (job?.min_match_score || 70);
      if (activeTab === "rejected") return a.match_score < (job?.auto_reject_score || 30);
      return true; 
  });

  // --- NEW ERROR UI STATE ---
  if (error) {
    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md w-full">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                    <AlertCircle className="w-8 h-8"/>
                </div>
                <h2 className="text-xl font-black text-slate-900 mb-2">Job Not Found</h2>
                <p className="text-slate-500 mb-6 font-medium">The job posting you are looking for has been removed or the link is invalid.</p>
                <button 
                    onClick={() => router.push("/employer/jobs")} 
                    className="w-full py-3 bg-[#0F172A] text-white font-bold rounded-xl hover:bg-slate-800 transition"
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold gap-3"><Loader2 className="animate-spin"/> Loading workspace...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 font-sans">
        <div className="max-w-6xl mx-auto">
            <button onClick={() => router.push("/employer/jobs")} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-6 transition">
                <ArrowLeft className="w-4 h-4" /> Back to Jobs
            </button>

            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">{job?.title}</h1>
                    <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                        <span className="bg-slate-200 px-2 py-1 rounded text-slate-700 font-bold text-xs">{job?.location}</span>
                        <span>•</span>
                        <span>Posted {job?.posted_at ? new Date(job.posted_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                </div>
            </div>

            <div className="flex border-b border-slate-200 mb-6 gap-6">
                <TabButton label={`All Candidates (${applicants.length})`} active={activeTab === "all"} onClick={() => setActiveTab("all")} />
                <TabButton label="Recommended" count={applicants.filter(a => a.match_score >= (job?.min_match_score || 70)).length} active={activeTab === "recommended"} onClick={() => setActiveTab("recommended")} />
                <TabButton label="Low Match" count={applicants.filter(a => a.match_score < (job?.auto_reject_score || 30)).length} active={activeTab === "rejected"} onClick={() => setActiveTab("rejected")} />
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm min-h-[400px]">
                {filteredList.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                        <User className="w-12 h-12 mb-4 opacity-20"/>
                        <p>No candidates found in this category.</p>
                    </div>
                ) : (
                    <div>
                        {filteredList.map((app) => (
                            <div 
                                key={app.application_id} 
                                onClick={() => setSelectedAppId(app.application_id)}
                                className={`p-6 border-b border-slate-100 hover:bg-blue-50/50 cursor-pointer transition flex items-center justify-between group ${!app.is_viewed ? 'bg-blue-50/30' : ''}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-12 h-12 bg-[#0F172A] rounded-full flex items-center justify-center text-white font-bold text-lg">
                                            {app.name ? app.name.charAt(0) : '?'}
                                        </div>
                                        {!app.is_viewed && (
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 border-2 border-white rounded-full"></div>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <h4 className={`text-lg group-hover:text-blue-700 transition ${!app.is_viewed ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                                            {app.name}
                                        </h4>
                                        <div className="flex gap-2 mt-1">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 ${getScoreColor(app.match_score)}`}>
                                                <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                                                {app.match_score}% Match
                                            </span>
                                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-xs font-bold capitalize">{app.status}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-slate-400 font-bold flex items-center gap-1 mr-4">
                                        <Clock className="w-3 h-3"/> {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'N/A'}
                                    </span>
                                    
                                    <button 
                                        onClick={(e) => handleDownload(e, app.application_id)}
                                        className="p-2.5 border border-slate-200 rounded-lg text-slate-500 hover:text-[#0F172A] hover:bg-white hover:shadow-md transition bg-slate-50 relative"
                                        title="Download Resume"
                                    >
                                        {downloadingId === app.application_id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4"/>}
                                    </button>

                                    <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold bg-white group-hover:shadow-md transition">
                                        View
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        <ApplicantDrawer 
            isOpen={!!selectedAppId} 
            onClose={handleDrawerClose}
            applicationId={selectedAppId}
            token={token}
        />
    </div>
  );
}

function TabButton({ label, count, active, onClick }: any) {
    return (
        <button onClick={onClick} className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${active ? 'border-[#0F172A] text-[#0F172A]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
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