"use client";
import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { Search, Filter, Loader2, User, Check, Briefcase } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

// Separate the content to use Suspense
function ApplicantsContent() {
  const { token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams(); // Reads the URL params
  
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // --- NEW: READ URL PARAM ON MOUNT ---
  useEffect(() => {
    const statusFromUrl = searchParams.get("status");
    if (statusFromUrl) {
        setStatusFilter(statusFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    if (token) fetchApplicants();
  }, [token]);

  const fetchApplicants = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employer/applicants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setApplicants(data);
      }
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const filteredList = applicants.filter(app => {
    const query = search.toLowerCase();
    const matchesSearch = 
        (app.name && app.name.toLowerCase().includes(query)) ||
        (app.email && app.email.toLowerCase().includes(query)) ||
        (app.job_title && app.job_title.toLowerCase().includes(query));

    // Case insensitive filter matching
    const matchesFilter = statusFilter === "All" || app.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  const statuses = ["All", "Applied", "Reviewing", "Interview", "Offer", "Rejected"];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 font-sans" onClick={() => setIsFilterOpen(false)}>
        <div className="max-w-6xl mx-auto">
            
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">All Applicants</h1>
                    <p className="text-slate-500 mt-1 font-medium">A unified view of candidates across all job postings.</p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400"/>
                        <input 
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#0F172A] transition shadow-sm"
                            placeholder="Search by name, email or job..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    
                    <div className="relative">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsFilterOpen(!isFilterOpen); }}
                            className={`px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition shadow-sm ${statusFilter !== 'All' ? 'text-[#0F172A] border-[#0F172A]' : 'text-slate-600'}`}
                        >
                            <Filter className="w-4 h-4"/> 
                            {statusFilter === "All" ? "Filter" : statusFilter}
                        </button>

                        {isFilterOpen && (
                            <div className="absolute right-0 top-12 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                {statuses.map((s) => (
                                    <button 
                                        key={s}
                                        onClick={() => setStatusFilter(s)}
                                        className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center justify-between"
                                    >
                                        {s}
                                        {statusFilter === s && <Check className="w-4 h-4 text-[#0F172A]"/>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50/50 border-b border-slate-200 text-xs font-black text-slate-400 uppercase tracking-wider">
                    <div className="col-span-4 pl-2">Candidate</div>
                    <div className="col-span-3">Applied For</div>
                    <div className="col-span-2 text-center">AI Score</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-1 text-right pr-2">Date</div>
                </div>

                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-[#0F172A]"/>
                        <p className="font-bold text-sm">Loading applicants...</p>
                    </div>
                )}

                {!loading && filteredList.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
                        <User className="w-12 h-12 opacity-20"/>
                        <p className="font-bold">No applicants found.</p>
                        {(search || statusFilter !== "All") && <button onClick={() => {setSearch(""); setStatusFilter("All"); router.push('/employer/applicants')}} className="text-blue-600 text-sm font-bold hover:underline">Clear filters</button>}
                    </div>
                )}

                {!loading && filteredList.map((app) => (
                    <div 
                        key={app.id} 
                        onClick={() => router.push(`/employer/jobs/${app.job_title ? '' : ''}1`)} 
                        className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 hover:bg-slate-50 items-center transition cursor-pointer group"
                    >
                        <div className="col-span-4 flex items-center gap-3 pl-2">
                            <div className="relative">
                                <div className="w-10 h-10 bg-[#0F172A] rounded-full flex items-center justify-center text-white font-bold">
                                    {app.name ? app.name.charAt(0) : <User className="w-5 h-5"/>}
                                </div>
                                {/* UNREAD INDICATOR DOT */}
                                {!app.is_viewed && (
                                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-500 border-2 border-white rounded-full"></div>
                                )}
                            </div>
                            <div className="overflow-hidden">
                                <h4 className={`truncate group-hover:text-blue-700 transition ${!app.is_viewed ? 'font-black text-slate-900' : 'font-medium text-slate-900'}`}>{app.name}</h4>
                                <p className="text-xs text-slate-500 font-bold truncate">{app.email}</p>
                            </div>
                        </div>

                        <div className="col-span-3">
                             <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <Briefcase className="w-4 h-4 text-slate-400"/>
                                <span className="truncate">{app.job_title}</span>
                             </div>
                        </div>

                        <div className="col-span-2 flex justify-center">
                            <span className={`px-2 py-1 rounded text-xs font-black ${getScoreColor(app.score)}`}>
                                {app.score}% Match
                            </span>
                        </div>

                        <div className="col-span-2 flex justify-center">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getStatusColor(app.status)}`}>
                                {app.status}
                            </span>
                        </div>

                        <div className="col-span-1 text-right text-xs font-bold text-slate-400 pr-2">
                            {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'N/A'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
}

// Wrap in Suspense boundary for useSearchParams
export default function AllApplicantsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ApplicantsContent />
    </Suspense>
  );
}

function getStatusColor(status: string) {
    switch(status) {
        case "Interview": return "bg-purple-100 text-purple-700";
        case "Offer": return "bg-green-100 text-green-700";
        case "Rejected": return "bg-red-100 text-red-700";
        case "Reviewing": return "bg-blue-100 text-blue-700";
        default: return "bg-slate-100 text-slate-700";
    }
}

function getScoreColor(score: number) {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 50) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
}