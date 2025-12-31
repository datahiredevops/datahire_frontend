"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Briefcase, MapPin, Calendar, ArrowRight, Plus, Search, MoreVertical, Copy, Edit, Trash2, Archive, XCircle, CheckCircle, Eye, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MyJobsPage() {
  const { token } = useAuth();
  const router = useRouter();
  
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filter, setFilter] = useState("All"); 
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [previewJob, setPreviewJob] = useState<any>(null);

  useEffect(() => {
    if (token) fetchJobs();
  }, [token]);

  const fetchJobs = async () => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employer/jobs`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setJobs(data);
        }
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    setOpenMenuId(null);
    if (!confirm(`Change status to ${newStatus}?`)) return;
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}/status?status=${newStatus}`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            fetchJobs();
            if (newStatus === "Archived") alert("Job moved to 'Deleted' tab.");
        }
    } catch (e) { alert("Action failed."); }
  };

  const handleDuplicate = async (id: number) => {
    setOpenMenuId(null);
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}/duplicate`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) fetchJobs(); 
    } catch (e) { alert("Duplicate failed"); }
  };

  // --- CALCULATE COUNTS (NEW) ---
  const counts = {
      All: jobs.filter(j => j.status !== "Archived").length,
      Published: jobs.filter(j => j.status === "Published").length,
      Draft: jobs.filter(j => j.status === "Draft").length,
      Closed: jobs.filter(j => j.status === "Closed").length,
      Deleted: jobs.filter(j => j.status === "Archived").length
  };

  // --- TABS CONFIG ---
  const tabs = [
      { id: "All", label: "All Jobs", count: counts.All },
      { id: "Published", label: "Active", count: counts.Published },
      { id: "Draft", label: "Draft", count: counts.Draft },
      { id: "Closed", label: "Closed", count: counts.Closed },
      { id: "Deleted", label: "Deleted", count: counts.Deleted }
  ];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase());
    
    if (filter === "All") return job.status !== "Archived" && matchesSearch;
    if (filter === "Deleted") return job.status === "Archived" && matchesSearch;
    return job.status === filter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8" onClick={() => setOpenMenuId(null)}>
        <div className="max-w-6xl mx-auto">
            
            {/* HEADER */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">My Jobs</h1>
                    <p className="text-slate-500 mt-1">Manage your active listings.</p>
                </div>
                <button 
                    onClick={() => router.push("/employer/jobs/create")} 
                    className="bg-[#0F172A] text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition flex items-center gap-2 shadow-lg shadow-slate-900/10"
                >
                    <Plus className="w-5 h-5"/> Post New Job
                </button>
            </div>

            {/* TOOLBAR */}
            <div className="bg-white p-2 rounded-xl border border-slate-200 mb-6 flex flex-col md:flex-row justify-between items-center shadow-sm gap-4">
                <div className="flex gap-1 overflow-x-auto w-full md:w-auto">
                    {tabs.map((tab) => (
                        <button 
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition whitespace-nowrap flex items-center gap-2 ${filter === tab.id ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            {tab.label}
                            <span className={`px-1.5 py-0.5 rounded text-xs ${filter === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'bg-slate-100 text-slate-500'}`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-auto mr-2">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400"/>
                    <input className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold w-full md:w-64 outline-none focus:ring-2 focus:ring-[#0F172A]" placeholder="Search jobs..." value={search} onChange={(e) => setSearch(e.target.value)}/>
                </div>
            </div>

            {/* JOBS LIST */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[300px]">
                <div className="flex flex-col">
                    {filteredJobs.map((job, index) => (
                        <div 
                            key={job.id} 
                            className={`p-6 hover:bg-slate-50 transition flex justify-between items-center group relative ${index !== filteredJobs.length - 1 ? 'border-b border-slate-100' : ''}`}
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-bold text-slate-900 text-lg">{job.title}</h3>
                                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full uppercase ${getStatusColor(job.status)}`}>{job.status}</span>
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 font-medium">
                                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {job.location}</span>
                                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> Posted {new Date(job.posted_at).toLocaleDateString()}</span>
                                    <button onClick={() => router.push(`/employer/jobs/${job.id}`)} className="flex items-center gap-1 text-slate-900 bg-slate-100 px-2 py-0.5 rounded ml-2 hover:bg-slate-200 transition">
                                        {job.applicant_count} Candidates <ArrowRight className="w-3 h-3 ml-1"/>
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => setPreviewJob(job)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-blue-600 transition" title="Preview"><Eye className="w-5 h-5"/></button>

                                <div className="relative">
                                    <button onClick={() => setOpenMenuId(openMenuId === job.id ? null : job.id)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition"><MoreVertical className="w-5 h-5"/></button>

                                    {openMenuId === job.id && (
                                        <div className="absolute right-0 top-10 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 animate-in fade-in zoom-in duration-200">
                                            <button onClick={() => router.push(`/employer/jobs/edit/${job.id}`)} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm font-bold text-slate-700 flex items-center gap-2"><Edit className="w-4 h-4"/> Edit Job</button>
                                            <button onClick={() => handleDuplicate(job.id)} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm font-bold text-slate-700 flex items-center gap-2"><Copy className="w-4 h-4"/> Duplicate</button>
                                            <div className="border-t border-slate-100 my-1"></div>
                                            {job.status === "Published" && (
                                                <button onClick={() => handleStatusChange(job.id, "Closed")} className="w-full text-left px-4 py-3 hover:bg-yellow-50 text-sm font-bold text-yellow-600 flex items-center gap-2"><XCircle className="w-4 h-4"/> Close Job</button>
                                            )}
                                            {job.status === "Closed" && (
                                                <button onClick={() => handleStatusChange(job.id, "Published")} className="w-full text-left px-4 py-3 hover:bg-green-50 text-sm font-bold text-green-600 flex items-center gap-2"><CheckCircle className="w-4 h-4"/> Re-Open</button>
                                            )}
                                            {job.status !== "Archived" ? (
                                                <button onClick={() => handleStatusChange(job.id, "Archived")} className="w-full text-left px-4 py-3 hover:bg-red-50 text-sm font-bold text-red-600 flex items-center gap-2"><Trash2 className="w-4 h-4"/> Delete</button>
                                            ) : (
                                                <button onClick={() => handleStatusChange(job.id, "Draft")} className="w-full text-left px-4 py-3 hover:bg-blue-50 text-sm font-bold text-blue-600 flex items-center gap-2"><Archive className="w-4 h-4"/> Restore</button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {filteredJobs.length === 0 && (
                    <div className="p-12 text-center text-slate-400">
                        <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-20"/>
                        {loading ? "Loading..." : "No jobs found."}
                    </div>
                )}
            </div>

            {/* PREVIEW MODAL */}
            {previewJob && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
                        <button onClick={() => setPreviewJob(null)} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition"><X className="w-5 h-5 text-slate-500"/></button>
                        <div className="p-8">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase mb-4 inline-block ${getStatusColor(previewJob.status)}`}>{previewJob.status}</span>
                            <h2 className="text-2xl font-black text-slate-900 mb-2">{previewJob.title}</h2>
                            <div className="flex items-center gap-4 text-sm text-slate-500 font-bold mb-6">
                                <span>{previewJob.location}</span> • 
                                <span>{previewJob.type}</span> • 
                                <span>{previewJob.remote}</span>
                            </div>
                            <hr className="border-slate-100 mb-6"/>
                            <div className="space-y-6">
                                <div><h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Description</h4><p className="text-slate-600 leading-relaxed whitespace-pre-line">{previewJob.description || "No description provided."}</p></div>
                                <div><h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Requirements</h4><p className="text-slate-600 leading-relaxed whitespace-pre-line">{previewJob.requirements || "No requirements listed."}</p></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}

function getStatusColor(status: string) {
    switch(status) {
        case "Published": return "bg-green-100 text-green-700";
        case "Draft": return "bg-yellow-100 text-yellow-700";
        case "Closed": return "bg-red-100 text-red-700";
        case "Archived": return "bg-slate-200 text-slate-500 line-through";
        default: return "bg-slate-100 text-slate-700";
    }
}