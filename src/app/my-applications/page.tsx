"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  Loader2, Briefcase, MapPin, Calendar, 
  CheckCircle, XCircle, Clock, PlayCircle, Layers, Video
} from "lucide-react";

export default function MyApplicationsPage() {
  const { token, user } = useAuth(); // Added user to check ID
  const router = useRouter();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    console.log("🟢 MyApplications Page Loaded");
    console.log("User:", user);
    console.log("Token:", token ? "Exists" : "Missing");

    if (token) fetchApplications();
    else setLoading(false);
  }, [token]);

  const fetchApplications = async () => {
    try {
      console.log("🚀 Fetching applications...");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/my-applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Response Status:", res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log("✅ Data Received:", data);
        setApps(data);
      } else {
        console.error("❌ Failed to fetch:", await res.text());
      }
    } catch (err) {
      console.error("❌ Network Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredApps = apps.filter((app) => {
    if (activeTab === "Interviews") {
        return ["AI Interview", "Interviewed", "Scheduling"].includes(app.status);
    }
    if (activeTab === "Offers") {
        return app.status === "Offer";
    }
    return true; 
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AI Interview": return <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 border border-purple-200"><PlayCircle className="w-3 h-3"/> Action Required</span>;
      case "Interviewed": return <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 border border-purple-100"><CheckCircle className="w-3 h-3"/> Interview Done</span>;
      case "Shortlisted": return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 border border-blue-200"><Layers className="w-3 h-3"/> Shortlisted</span>;
      case "Scheduling": return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 border border-orange-200"><Video className="w-3 h-3"/> Meeting Scheduled</span>;
      case "Offer": return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 border border-green-200"><CheckCircle className="w-3 h-3"/> Offer Received!</span>;
      case "Rejected": return <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 border border-red-100"><XCircle className="w-3 h-3"/> Rejected</span>;
      default: return <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 border border-slate-200"><Clock className="w-3 h-3"/> {status}</span>;
    }
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-slate-400 w-8 h-8"/>
            <p className="text-slate-400 font-bold text-sm">Syncing applications...</p>
        </div>
    </div>
  );

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#F8FAFC] p-8">
      <div className="max-w-7xl"> 
        {/* HEADER */}
        <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Applications</h1>
            <p className="text-slate-500 font-medium">Track your status and manage interviews.</p>
        </div>

        {/* TABS */}
        <div className="flex border-b border-slate-200 mb-8 gap-8">
            {["All", "Interviews", "Offers"].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
                        activeTab === tab 
                        ? "border-[#0F172A] text-[#0F172A]" 
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                >
                    {tab}
                    {tab === "Interviews" && apps.filter(a => a.status === "AI Interview").length > 0 && (
                        <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-pulse shadow-sm">
                            {apps.filter(a => a.status === "AI Interview").length}
                        </span>
                    )}
                </button>
            ))}
        </div>

        {/* LIST */}
        <div className="space-y-4 pb-20">
            {filteredApps.length === 0 ? (
                <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                    <Briefcase className="w-16 h-16 mx-auto text-slate-200 mb-4"/>
                    <p className="text-slate-400 font-bold text-lg">No applications found.</p>
                    <p className="text-slate-400 text-sm mb-6">Start applying to jobs to see them here.</p>
                    <button 
                        onClick={() => router.push("/jobs")} 
                        className="bg-[#0F172A] text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200"
                    >
                        Browse New Jobs
                    </button>
                </div>
            ) : (
                filteredApps.map((app) => (
                <div key={app.id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all group flex flex-col md:flex-row justify-between items-center gap-6">
                    
                    {/* JOB INFO */}
                    <div className="flex-1 w-full md:w-auto">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-xl font-bold text-slate-900">{app.job_title}</h3>
                            {getStatusBadge(app.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500 font-medium flex-wrap">
                            <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded"><Briefcase className="w-4 h-4 text-slate-400"/> {app.company_name}</span>
                            <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded"><MapPin className="w-4 h-4 text-slate-400"/> {app.location}</span>
                            <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded"><Calendar className="w-4 h-4 text-slate-400"/> Applied {new Date(app.applied_at).toLocaleDateString()}</span>
                        </div>
                    </div>

                    {/* ACTION AREA */}
                    <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                        
                        {/* START INTERVIEW BUTTON */}
                        {app.status === "AI Interview" && !app.interview_score && (
                            <button 
                                onClick={() => router.push(`/interview/${app.id}`)}
                                className="bg-[#0F172A] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-purple-600 transition shadow-lg shadow-purple-100 animate-pulse w-full md:w-auto justify-center"
                            >
                                <PlayCircle className="w-5 h-5"/> Start AI Interview
                            </button>
                        )}

                        {/* VIEW SCORE */}
                        {app.interview_score > 0 && (
                            <div className="text-right px-4">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Interview Score</span>
                                <span className="text-2xl font-black text-slate-900">{app.interview_score}%</span>
                            </div>
                        )}

                        {/* STATUS MSG */}
                        {(app.status === "Scheduling" || app.status === "Offer" || app.status === "Applied") && (
                            <div className="bg-slate-50 px-4 py-2 rounded-lg text-xs font-bold text-slate-500 border border-slate-100">
                                {app.status === "Applied" ? "Application Sent" : "Check Email"}
                            </div>
                        )}

                    </div>
                </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
}