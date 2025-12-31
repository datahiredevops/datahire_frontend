"use client";
import { useEffect, useState } from "react";
import { X, Download, User, CheckCircle, AlertCircle, FileText, BrainCircuit, Loader2, ChevronDown } from "lucide-react";

export default function ApplicantDrawer({ isOpen, onClose, applicationId, token }: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("insights"); 
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (isOpen && applicationId) {
      fetchDetails();
    } else {
      setData(null);
    }
  }, [isOpen, applicationId]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employer/applications/${applicationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        // DEBUG: Uncomment the line below if you still have issues to see what the backend sends
        // console.log("Resume Data:", result.resume_url); 
        setData(result);
        setStatus(result.status);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employer/applications/${applicationId}/status?status=${newStatus}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) { alert("Failed to update status"); }
  };

  // Helper function to check if a URL is valid (not null, not "null", starts with http)
  const isValidUrl = (url: any) => {
    return url && typeof url === 'string' && url.startsWith("http");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
          <div className="flex gap-4">
            <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-2xl font-black text-slate-300 shadow-sm">
              {data?.applicant_name?.charAt(0) || <User/>}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">{data?.applicant_name || "Loading..."}</h2>
              <p className="text-slate-500 text-sm font-medium">{data?.applicant_email}</p>
              
              <div className="mt-3 relative inline-block group">
                <button className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase flex items-center gap-2 transition ${getStatusColor(status)}`}>
                  {status || "Applied"} <ChevronDown className="w-3 h-3"/>
                </button>
                <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-xl hidden group-hover:block z-10 p-1">
                    {["Applied", "Reviewing", "Interview", "Offer", "Rejected"].map((s) => (
                        <button key={s} onClick={() => handleStatusChange(s)} className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg">
                            {s}
                        </button>
                    ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {/* DOWNLOAD BUTTON - UPDATED WITH VALIDATION */}
            {isValidUrl(data?.resume_url) && (
                <a 
                    href={data.resume_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-[#0F172A] hover:bg-white rounded-lg transition border border-transparent hover:border-slate-200 cursor-pointer" 
                    title="Download Resume"
                >
                    <Download className="w-5 h-5"/>
                </a>
            )}
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {loading && (
            <div className="flex-1 flex items-center justify-center flex-col text-slate-400 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#0F172A]"/>
                <p className="text-sm font-bold">Fetching Secure Data...</p>
            </div>
        )}

        {!loading && data && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex border-b border-slate-200 px-6">
                <button onClick={() => setActiveTab("insights")} className={`py-4 mr-6 text-sm font-bold flex items-center gap-2 border-b-2 transition ${activeTab === 'insights' ? 'border-[#0F172A] text-[#0F172A]' : 'border-transparent text-slate-400'}`}>
                    <BrainCircuit className="w-4 h-4"/> AI Insights
                </button>
                <button onClick={() => setActiveTab("resume")} className={`py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition ${activeTab === 'resume' ? 'border-[#0F172A] text-[#0F172A]' : 'border-transparent text-slate-400'}`}>
                    <FileText className="w-4 h-4"/> Original Resume
                </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
                {activeTab === "insights" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-900">Match Score Analysis</h3>
                                <span className={`text-2xl font-black ${data.ai_score >= 70 ? 'text-green-600' : 'text-yellow-600'}`}>{data.ai_score}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
                                <div className={`h-2 rounded-full transition-all duration-1000 ${data.ai_score >= 70 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{width: `${data.ai_score}%`}}></div>
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed">{data.ai_analysis?.summary || "AI is processing this candidate..."}</p>
                        </div>
                    </div>
                )}

                {activeTab === "resume" && (
                    <div className="h-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                        {/* RESUME VIEWER - UPDATED WITH VALIDATION */}
                        {isValidUrl(data.resume_url) ? (
                            <iframe src={data.resume_url} className="w-full h-full flex-1" title="Resume Viewer"></iframe>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-slate-400 flex-col gap-2">
                                <FileText className="w-10 h-10 opacity-20"/>
                                <span>No resume file uploaded.</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
    switch(status) {
        case "Interview": return "bg-purple-100 text-purple-700 hover:bg-purple-200";
        case "Offer": return "bg-green-100 text-green-700 hover:bg-green-200";
        case "Rejected": return "bg-red-100 text-red-700 hover:bg-red-200";
        case "Reviewing": return "bg-blue-100 text-blue-700 hover:bg-blue-200";
        default: return "bg-slate-100 text-slate-700 hover:bg-slate-200";
    }
}