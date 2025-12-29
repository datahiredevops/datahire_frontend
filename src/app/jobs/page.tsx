"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { 
  MapPin, Clock, Briefcase, Ban, Heart, Building2, ChevronRight, Search, Sparkles, X, MessageCircle, Send, FileText, CheckCircle2, Eye 
} from "lucide-react";

interface Job {
  id: number;
  title: string;
  company: string;
  logo: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string;
  remote: string;
}

export default function JobBoard() {
  const { user } = useAuth();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const [jobScores, setJobScores] = useState<{[key: number]: number}>({});
  const [likedJobs, setLikedJobs] = useState<Set<number>>(new Set());
  const [appliedJobs, setAppliedJobs] = useState<Set<number>>(new Set());
  const [hiddenJobs, setHiddenJobs] = useState<Set<number>>(new Set());
  
  const [activeTab, setActiveTab] = useState<"recommended" | "liked" | "applied">("recommended");
  const [searchQuery, setSearchQuery] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);

  // 1. Initial Fetch
  useEffect(() => {
    async function init() {
        if (!user) return;
        try {
            const jobsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs`);
            const jobsData = await jobsRes.json();
            setJobs(jobsData);

            const savedRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/saved/${user.id}`);
            const savedIds = await savedRes.json();
            setLikedJobs(new Set(savedIds));

            const appliedRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/applied/${user.id}`);
            const appliedIds = await appliedRes.json();
            setAppliedJobs(new Set(appliedIds));

        } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    init();
  }, [user]);

  // 2. Calculate Displayed Jobs (Memoized)
  const displayedJobs = useMemo(() => {
    return jobs.filter(job => {
        if (hiddenJobs.has(job.id)) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matches = job.title.toLowerCase().includes(query) || job.company.toLowerCase().includes(query);
            if (!matches) return false;
        }
        if (activeTab === "liked") return likedJobs.has(job.id);
        if (activeTab === "applied") return appliedJobs.has(job.id);
        if (activeTab === "recommended") {
            if (appliedJobs.has(job.id)) return false;
            return true;
        }
        return true;
    });
  }, [jobs, activeTab, searchQuery, likedJobs, appliedJobs, hiddenJobs]);

  // 3. Smart Selection Logic
  useEffect(() => {
    if (displayedJobs.length > 0) {
        const isSelectedVisible = displayedJobs.find(j => j.id === selectedJobId);
        if (!selectedJobId || !isSelectedVisible) {
            setSelectedJobId(displayedJobs[0].id);
        }
    } else {
        setSelectedJobId(null);
    }
  }, [displayedJobs, selectedJobId]);

  const handleJobClick = (id: number) => {
    setSelectedJobId(id);
    setIsMobileDetailOpen(true);
  };

  const handleScoreLoad = (id: number, score: number) => {
    setJobScores(prev => ({ ...prev, [id]: score }));
  };

  const toggleLike = async (e: React.MouseEvent, jobId: number) => {
    e.stopPropagation();
    if (!user) return;
    const newLiked = new Set(likedJobs);
    if (newLiked.has(jobId)) newLiked.delete(jobId);
    else newLiked.add(jobId);
    setLikedJobs(newLiked);
    try { await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${jobId}/toggle-like?user_id=${user.id}`, { method: "POST" }); } catch (err) { console.error(err); }
  };

  const markApplied = (jobId: number) => {
    const newApplied = new Set(appliedJobs);
    newApplied.add(jobId);
    setAppliedJobs(newApplied);
  };

  const hideJob = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const newHidden = new Set(hiddenJobs);
    newHidden.add(id);
    setHiddenJobs(newHidden);
  };

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full ml-0 lg:ml-64 transition-all duration-300">
        
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 h-16">
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">JOBS</h1>
                <div className="hidden md:flex items-center gap-2">
                     <TabButton label="Recommended" active={activeTab === 'recommended'} onClick={() => setActiveTab('recommended')} />
                     <TabButton label="Liked" count={likedJobs.size} active={activeTab === 'liked'} onClick={() => setActiveTab('liked')} />
                     <TabButton label="Applied" count={appliedJobs.size} active={activeTab === 'applied'} onClick={() => setActiveTab('applied')} />
                </div>
            </div>
            
            <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="text" placeholder="Search..." 
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 bg-slate-100 border-none rounded-full text-xs font-medium focus:ring-2 focus:ring-black outline-none transition-all"
                />
            </div>
        </header>

        <div className="flex flex-1 overflow-hidden relative">
            
            <div className={`w-full md:w-[300px] lg:w-[340px] border-r border-slate-200 bg-white flex flex-col ${isMobileDetailOpen ? 'hidden md:flex' : 'flex'}`}>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {loading && <p className="text-center text-slate-400 mt-10">Loading jobs...</p>}
                    {!loading && displayedJobs.length === 0 && <p className="text-center text-slate-400 mt-10">No jobs found.</p>}
                    
                    {displayedJobs.map(job => (
                        <JobListItem 
                            key={job.id} 
                            job={job} 
                            isSelected={selectedJobId === job.id}
                            userId={user?.id}
                            isLiked={likedJobs.has(job.id)}
                            onClick={() => handleJobClick(job.id)}
                            onLike={(e: any) => toggleLike(e, job.id)}
                            onHide={(e: any) => hideJob(e, job.id)}
                            onScoreLoad={handleScoreLoad}
                        />
                    ))}
                </div>
            </div>

            <div className={`flex-1 bg-slate-50 flex flex-col overflow-hidden ${!isMobileDetailOpen ? 'hidden md:flex' : 'flex'}`}>
                {selectedJob ? (
                     <JobDetailView 
                        job={selectedJob} 
                        userId={user?.id} 
                        initialScore={jobScores[selectedJob.id] || 0}
                        isApplied={appliedJobs.has(selectedJob.id)} 
                        onAppliedSuccess={markApplied}
                        onBack={() => setIsMobileDetailOpen(false)}
                     />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400">Select a job to view details</div>
                )}
            </div>

            {/* This is the ONLY place FloatingMathi should exist */}
            <FloatingMathi userId={user?.id} isOpen={isChatOpen} setIsOpen={setIsChatOpen} />

        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function TabButton({ label, count, active, onClick }: any) {
    return (
        <button onClick={onClick} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${active ? 'bg-black text-white' : 'bg-transparent text-slate-500 hover:bg-slate-100'}`}>
            {label} {count !== undefined && <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${active ? 'bg-slate-700' : 'bg-slate-200 text-slate-600'}`}>{count}</span>}
        </button>
    )
}

function JobListItem({ job, isSelected, userId, isLiked, onClick, onLike, onHide, onScoreLoad }: any) {
    const [score, setScore] = useState<number | null>(null);

    useEffect(() => {
        if (!userId) return;
        const delay = (job.id % 5) * 500;
        const timer = setTimeout(() => {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${job.id}/simple-score/${userId}`)
                .then(res => res.json())
                .then(data => {
                    setScore(data.score);
                    onScoreLoad(job.id, data.score);
                })
                .catch(() => setScore(0));
        }, delay);
        return () => clearTimeout(timer);
    }, [job.id, userId]);

    return (
        <div onClick={onClick} className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${isSelected ? 'bg-slate-50 border-black shadow-sm ring-1 ring-black' : 'bg-white border-slate-100 hover:border-slate-300'}`}>
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-1">
                        <img src={job.logo} alt={job.company} className="object-contain w-full h-full" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight line-clamp-1">{job.title}</h3>
                        <p className="text-xs text-slate-500 font-medium">{job.company}</p>
                    </div>
                </div>
                {score !== null ? (
                    <div className={`px-2 py-1 rounded-md text-[10px] font-bold ${score >= 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {score}%
                    </div>
                ) : (
                    <div className="w-8 h-4 bg-slate-100 rounded animate-pulse"></div>
                )}
            </div>
            <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium mb-3">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {job.location}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {job.type}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <p className="text-[10px] text-slate-400">2d ago</p>
                <div className="flex gap-2">
                    <button onClick={onHide} className="text-slate-300 hover:text-red-400"><Ban className="w-3.5 h-3.5"/></button>
                    <button onClick={onLike} className={`${isLiked ? 'text-pink-500' : 'text-slate-300 hover:text-pink-400'}`}><Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`}/></button>
                </div>
            </div>
        </div>
    )
}

function JobDetailView({ job, userId, initialScore, isApplied, onAppliedSuccess, onBack }: any) {
    const [analysis, setAnalysis] = useState<any>(null);
    const [analyzing, setAnalyzing] = useState(false);
    
    const [optimizing, setOptimizing] = useState(false);
    const [optimizationResult, setOptimizationResult] = useState<any>(null); 
    
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [userResumes, setUserResumes] = useState<any[]>([]);
    const [loadingResumes, setLoadingResumes] = useState(false);

    const [appDetails, setAppDetails] = useState<any>(null);
    const [viewContent, setViewContent] = useState<string | null>(null);
    const [viewTitle, setViewTitle] = useState("Content");
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const [coverLetters, setCoverLetters] = useState<any[]>([]);
    const [selectedCoverLetter, setSelectedCoverLetter] = useState<number | null>(null);

    useEffect(() => {
        if (!userId) return;
        
        // --- RESET STATES ---
        setOptimizationResult(null); 
        setAnalysis(null);           
        setAppDetails(null);         

        setAnalyzing(true);
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${job.id}/optimized-status/${userId}`)
            .then(res => res.json())
            .then(data => {
                if (data.exists) setOptimizationResult(data);
                else return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${job.id}/match/${userId}`);
            })
            .then(res => { if(res) return res.json(); })
            .then(data => { if(data) setAnalysis(data); })
            .catch(err => console.error(err))
            .finally(() => setAnalyzing(false));

        if (isApplied) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${job.id}/application/${userId}`)
                .then(res => res.json())
                .then(data => { if(data.exists) setAppDetails(data); })
                .catch(console.error);
        }

    }, [job.id, userId, isApplied]);

    const handleOptimize = async () => {
        setOptimizing(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${job.id}/optimize/${userId}`, { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ current_score: finalScore }) 
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail);
            setOptimizationResult(data);
        } catch (err: any) { alert(err.message || "Optimization failed."); } finally { setOptimizing(false); }
    };

    const initiateApply = async () => {
        setLoadingResumes(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/resumes`);
            const data = await res.json();
            setUserResumes(data);

            const clRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/agent/${userId}/cover-letters`);
            const clData = await clRes.json();
            setCoverLetters(clData);

            setShowResumeModal(true);
        } catch(e) { console.error(e); } finally { setLoadingResumes(false); }
    };

    const confirmApply = async (resumeId: number) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${job.id}/apply`, {
                method: "POST", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    user_id: userId, 
                    resume_id: resumeId,
                    cover_letter_id: selectedCoverLetter 
                })
            });
            if(res.ok) {
                setShowResumeModal(false);
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${job.id}/application/${userId}`)
                    .then(r => r.json())
                    .then(d => setAppDetails(d));
                onAppliedSuccess(job.id);
            }
        } catch(err) { alert("Failed"); }
    };

    const handleViewResume = async (resumeId: number) => {
        if (!resumeId) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/resumes/${resumeId}/content`);
            const data = await res.json();
            setViewContent(data.content);
            setViewTitle("Resume Content");
            setIsViewModalOpen(true);
        } catch { alert("Could not load content"); }
    };

    const handleViewCoverLetter = async (letterId: number) => {
        if (!letterId) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/agent/cover-letter/${letterId}/content`);
            const data = await res.json();
            setViewContent(data.content);
            setViewTitle("Cover Letter Content");
            setIsViewModalOpen(true);
        } catch { alert("Could not load content"); }
    };

    const finalScore = optimizationResult ? optimizationResult.original_score : (initialScore || analysis?.matchScore || 0);
    const optimizedScore = optimizationResult ? optimizationResult.new_score : 0;

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
            <button onClick={onBack} className="md:hidden mb-4 text-sm font-bold text-slate-500 flex items-center gap-1"><ChevronRight className="rotate-180 w-4 h-4"/> Back to List</button>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8 border-b border-slate-200 pb-8">
                <div className="flex gap-5">
                    <div className="w-20 h-20 bg-white border border-slate-200 rounded-2xl flex items-center justify-center p-3 shadow-sm">
                        <img src={job.logo} alt={job.company} className="object-contain w-full h-full" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 mb-2">{job.title}</h1>
                        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
                            <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4"/> {job.company}</span>
                            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4"/> {job.location}</span>
                            <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4"/> {job.type}</span>
                        </div>
                    </div>
                </div>
                {/* Apply Button */}
                <button 
                    onClick={initiateApply}
                    disabled={isApplied || loadingResumes}
                    className={`px-8 py-3 font-bold rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 ${
                        isApplied 
                        ? "bg-slate-200 text-slate-500 cursor-not-allowed shadow-none" 
                        : "bg-[#4ADE80] hover:bg-[#22c55e] text-[#064e3b] shadow-green-200"
                    }`}
                >
                    {isApplied ? "Applied ✅" : loadingResumes ? "Loading..." : "Apply Now"}
                </button>
            </div>

            <div className="flex flex-col xl:flex-row gap-10">
                <div className="flex-1 space-y-8">
                    <section>
                        <h3 className="text-lg font-bold text-slate-900 mb-3">About the Role</h3>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm md:text-base">{job.description}</p>
                    </section>
                    <section>
                        <h3 className="text-lg font-bold text-slate-900 mb-3">Requirements</h3>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm md:text-base">{job.requirements}</p>
                    </section>
                </div>

                {/* AI Analysis & Application Status Column */}
                <div className="w-full xl:w-[320px] shrink-0">
                    
                    {/* --- APPLICATION STATUS CARD --- */}
                    {isApplied && appDetails && (
                        <div className="bg-green-50 border border-green-200 p-5 rounded-2xl mb-6 shadow-sm animate-in fade-in zoom-in duration-300">
                            <h4 className="text-green-800 font-bold flex items-center gap-2 mb-4">
                                <CheckCircle2 className="w-5 h-5"/> Application Sent
                            </h4>
                            <p className="text-xs text-green-700 mb-4 ml-1">
                                on {new Date(appDetails.applied_at).toLocaleDateString()}
                            </p>
                            
                            <div className="space-y-3">
                                {/* Resume Row */}
                                <div className="bg-white p-3 rounded-xl border border-green-100 flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                                            <FileText className="w-4 h-4 text-green-700"/>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Resume</p>
                                            <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                                                {appDetails.resume_name}
                                            </p>
                                        </div>
                                    </div>
                                    {appDetails.resume_id && (
                                        <button onClick={() => handleViewResume(appDetails.resume_id)} className="p-2 text-slate-400 hover:text-[#0F172A] hover:bg-slate-100 rounded-lg transition" title="View Resume">
                                            <Eye className="w-4 h-4"/>
                                        </button>
                                    )}
                                </div>

                                {/* Cover Letter Row (Optional) */}
                                {appDetails.cover_letter_id && (
                                    <div className="bg-white p-3 rounded-xl border border-green-100 flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                                <FileText className="w-4 h-4 text-blue-700"/>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Cover Letter</p>
                                                <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">Attached</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleViewCoverLetter(appDetails.cover_letter_id)} className="p-2 text-slate-400 hover:text-[#0F172A] hover:bg-slate-100 rounded-lg transition" title="View Letter">
                                            <Eye className="w-4 h-4"/>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-6">
                        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-600"/> AI Match Analysis
                        </h3>

                        <div className="space-y-6">
                            {optimizationResult ? (
                                <div className="bg-slate-900 rounded-xl p-5 text-white shadow-lg animate-in fade-in zoom-in duration-300">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">Optimization Result</p>
                                    <div className="flex items-center justify-center gap-4">
                                        <div className="flex flex-col items-center opacity-50">
                                            <span className="text-2xl font-bold text-slate-300 line-through">{finalScore}%</span>
                                            <span className="text-[10px]">Original</span>
                                        </div>
                                        <ChevronRight className="w-6 h-6 text-green-400" />
                                        <div className="flex flex-col items-center">
                                            <span className="text-4xl font-black text-[#4ADE80]">{optimizedScore}%</span>
                                            <span className="text-[10px] font-bold text-green-400">Optimized</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-700">
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            <span className="text-green-400 font-bold">Done! </span> 
                                            {optimizationResult.summary}
                                        </p>
                                        <p className="text-[10px] text-slate-500 mt-2 italic">Saved to Resume tab.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <div className="relative w-20 h-20 flex items-center justify-center">
                                        <svg className="w-full h-full -rotate-90"><circle cx="40" cy="40" r="36" stroke="#f1f5f9" strokeWidth="6" fill="none"/><circle cx="40" cy="40" r="36" stroke={finalScore >= 80 ? "#4ade80" : "#facc15"} strokeWidth="6" fill="none" strokeDasharray={2 * Math.PI * 36} strokeDashoffset={2 * Math.PI * 36 * (1 - finalScore / 100)} strokeLinecap="round" /></svg>
                                        <span className="absolute text-xl font-bold text-slate-900">{finalScore}%</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{finalScore >= 80 ? "Great Match" : "Potential Match"}</p>
                                        <p className="text-xs text-slate-500">Based on your profile</p>
                                    </div>
                                </div>
                            )}
                            
                            {analysis && !optimizationResult && (
                                <div className="flex justify-between py-2 border-t border-b border-slate-100">
                                    <MiniScore label="Experience" score={analysis.breakdown?.exp || 0} />
                                    <MiniScore label="Skills" score={analysis.breakdown?.skill || 0} />
                                    <MiniScore label="Industry" score={analysis.breakdown?.industry || 0} />
                                </div>
                            )}

                            {analyzing && !optimizationResult ? (
                                <div className="space-y-2 animate-pulse">
                                    <div className="h-24 bg-slate-100 rounded-xl"></div>
                                    <div className="h-3 bg-slate-100 rounded w-full"></div>
                                </div>
                            ) : (
                                analysis && !optimizationResult && (
                                    <>
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <p className="text-sm text-slate-600 leading-relaxed italic">"{analysis.reason}"</p>
                                        </div>
                                        {analysis.breakdown?.skill < 100 && (
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Skill Gaps</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {(analysis.skills || ["Docker", "Kubernetes"]).filter((s:string) => !(analysis.matched_skills || []).includes(s)).slice(0,3).map((gap: string) => (
                                                        <span key={gap} className="px-2 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-md border border-red-100">{gap}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <button 
                                            onClick={handleOptimize}
                                            disabled={analyzing || optimizing}
                                            className="w-full py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold rounded-xl shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            {optimizing ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    Optimizing...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-4 h-4 text-purple-200"/> Optimize Resume
                                                </>
                                            )}
                                        </button>
                                    </>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- RESUME SELECTION MODAL --- */}
            {showResumeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800">Complete Application</h3>
                            <button onClick={() => setShowResumeModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition"><X className="w-5 h-5"/></button>
                        </div>
                        
                        <div className="p-5 space-y-6">
                            
                            {/* 1. Cover Letter Dropdown */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cover Letter (Optional)</label>
                                <select 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none cursor-pointer"
                                    onChange={(e) => setSelectedCoverLetter(e.target.value ? parseInt(e.target.value) : null)}
                                >
                                    <option value="">No Cover Letter</option>
                                    {coverLetters.map(cl => (
                                        <option key={cl.id} value={cl.id}>{cl.title}</option>
                                    ))}
                                </select>
                            </div>

                            {/* 2. Resume Selection */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Resume to Apply</label>
                                <div className="max-h-[40vh] overflow-y-auto space-y-3">
                                    {userResumes.map(r => (
                                        <div key={r.id} onClick={() => confirmApply(r.id)} className="p-4 border border-slate-200 rounded-xl hover:border-[#0F172A] hover:bg-slate-50 cursor-pointer transition flex items-center gap-3 group">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${r.file_name.includes("Optimized") ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'}`}>
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900 group-hover:text-[#0F172A] truncate">{r.file_name}</p>
                                                <p className="text-xs text-slate-500">Uploaded {new Date(r.uploaded_at).toLocaleDateString()}</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#0F172A]"/>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* --- GENERIC VIEWER MODAL (Resume OR Cover Letter) --- */}
            {isViewModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-3xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800">{viewTitle}</h3>
                            <button onClick={() => setIsViewModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 font-mono text-sm text-slate-600 bg-white whitespace-pre-wrap leading-relaxed">
                            {viewContent || "Loading..."}
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
                            <button onClick={() => setIsViewModalOpen(false)} className="px-6 py-2 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition">Close</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

function MiniScore({ label, score }: { label: string, score: number }) {
    return (
        <div className="flex flex-col items-center gap-1">
             <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90"><circle cx="24" cy="24" r="20" stroke="#f1f5f9" strokeWidth="4" fill="none"/><circle cx="24" cy="24" r="20" stroke={score >= 70 ? "#3b82f6" : "#cbd5e1"} strokeWidth="4" fill="none" strokeDasharray={2 * Math.PI * 20} strokeDashoffset={2 * Math.PI * 20 * (1 - score / 100)} strokeLinecap="round" /></svg>
                <span className="absolute text-[10px] font-bold text-slate-900">{score}%</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">{label}</span>
        </div>
    )
}

function FloatingMathi({ userId, isOpen, setIsOpen }: any) {
    const [messages, setMessages] = useState<{role: 'user'|'bot', text: string}[]>([{ role: 'bot', text: "Hi! I'm Mathi. Need help with this job?" }]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if(isOpen) endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    const send = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!input.trim()) return;
        const msg = input;
        setMessages(p => [...p, { role: 'user', text: msg }]);
        setInput("");
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/agent/chat`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId, message: msg })
            });
            const data = await res.json();
            setMessages(p => [...p, { role: 'bot', text: data.response }]);
        } catch {
            setMessages(p => [...p, { role: 'bot', text: "Error connecting." }]);
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
            {isOpen && (
                <div className="w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
                    <div className="p-4 bg-[#0F172A] text-white flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-lg">🦜</div>
                            <div>
                                <h3 className="font-bold text-sm">Mathi</h3>
                                <p className="text-[10px] opacity-80">AI Career Coach</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)}><X className="w-5 h-5 opacity-70 hover:opacity-100"/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                        {messages.map((m, i) => (
                            <div key={i} className={`p-3 rounded-xl text-xs max-w-[85%] leading-relaxed ${m.role === 'user' ? 'bg-white text-slate-800 ml-auto rounded-tr-none shadow-sm' : 'bg-[#0F172A] text-white mr-auto rounded-tl-none'}`}>
                                {m.text}
                            </div>
                        ))}
                        {loading && <div className="text-xs text-slate-400 italic ml-2">Mathi is typing...</div>}
                        <div ref={endRef}></div>
                    </div>
                    <form onSubmit={send} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask anything..." className="flex-1 bg-slate-50 border-none rounded-lg text-xs px-3 focus:ring-1 focus:ring-black outline-none"/>
                        <button type="submit" disabled={loading} className="p-2 bg-[#0F172A] text-white rounded-lg"><Send className="w-3.5 h-3.5"/></button>
                    </form>
                </div>
            )}
            
            <div className="flex items-center gap-3">
                 {!isOpen && (
                    <div className="bg-white px-4 py-2 rounded-full shadow-lg border border-slate-100 transition-all hover:scale-105 cursor-pointer" onClick={() => setIsOpen(true)}>
                        <p className="text-xs font-bold text-slate-800 flex items-center gap-2">
                            Ask Mathi <span className="text-lg">🦜</span>
                        </p>
                    </div>
                 )}
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 ${isOpen ? 'bg-slate-200 text-slate-600' : 'bg-[#0F172A] text-white'}`}
                >
                    {isOpen ? <X className="w-6 h-6"/> : <MessageCircle className="w-7 h-7"/>}
                </button>
            </div>
        </div>
    )
}