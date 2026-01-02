"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
// REMOVED: import Sidebar from "@/components/Sidebar"; <--- Layout handles this now
import PricingModal from "@/components/PricingModal"; 
import { 
  Bot, FileText, Mic, Briefcase, Sparkles, CheckCircle, Copy, User, ArrowRight, UserCircle2, Code2, LineChart, Crown, AlertTriangle
} from "lucide-react";

interface Job { id: number; title: string; company: string; }
interface ChatMessage { role: 'assistant' | 'user'; content: string; }

export default function AgentPage() {
  const { user } = useAuth();
  const [activeTool, setActiveTool] = useState<"cover-letter" | "interview" | "auto-apply">("cover-letter");
  const [jobs, setJobs] = useState<Job[]>([]);
  
  // --- PRICING STATE ---
  const [showPricing, setShowPricing] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs`).then(r=>r.json()).then(setJobs).catch(console.error);
  }, []);

  if (!user) return <div className="flex h-full items-center justify-center bg-slate-50 text-slate-400 font-bold">Loading Agent...</div>;

  // FIX: Main Container uses w-full h-full overflow-y-auto to respect the Layout
  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50 font-sans p-8 relative">
        
        {/* HEADER */}
        <div className="mb-8 flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <Bot className="w-8 h-8 text-purple-600"/> Agent Mathi
                </h1>
                <p className="text-slate-500 mt-2">Your AI Career Coach. Select a tool to get started.</p>
            </div>
            {!user.is_premium && (
                <button 
                    onClick={() => setShowPricing(true)}
                    className="hidden md:flex items-center gap-2 bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold text-xs shadow-sm hover:shadow-md transition hover:scale-105"
                >
                    <Crown className="w-4 h-4"/> Upgrade Plan
                </button>
            )}
        </div>

        {/* TOOL TABS */}
        <div className="flex flex-wrap gap-4 mb-8">
            <ToolTab label="Cover Letter Architect" icon={<FileText className="w-4 h-4"/>} active={activeTool === "cover-letter"} onClick={() => setActiveTool("cover-letter")} />
            <ToolTab label="Mock Interviewer" icon={<Mic className="w-4 h-4"/>} active={activeTool === "interview"} onClick={() => setActiveTool("interview")} />
            <ToolTab label="Auto-Apply Agent" icon={<Briefcase className="w-4 h-4"/>} active={activeTool === "auto-apply"} onClick={() => setActiveTool("auto-apply")} />
        </div>

        {/* MAIN WORKSPACE */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[600px] p-8 relative overflow-hidden mb-20">
            {activeTool === "cover-letter" && <CoverLetterTool user={user} jobs={jobs} triggerUpgrade={() => setShowPricing(true)} />}
            {activeTool === "interview" && <MockInterviewTool user={user} jobs={jobs} triggerUpgrade={() => setShowPricing(true)} />}
            {activeTool === "auto-apply" && <AutoApplyTool user={user} triggerUpgrade={() => setShowPricing(true)} />}
        </div>

        {/* --- PRICING MODAL --- */}
        <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />

    </div>
  );
}

function ToolTab({ label, icon, active, onClick }: any) {
    return <button onClick={onClick} className={`px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${active ? 'bg-[#0F172A] text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'}`}>{icon} {label}</button>
}

// 1. COVER LETTER TOOL
function CoverLetterTool({ user, jobs, triggerUpgrade }: any) {
    const [selectedJob, setSelectedJob] = useState("");
    const [loading, setLoading] = useState(false);
    const [letter, setLetter] = useState("");
    const [savedLetters, setSavedLetters] = useState<any[]>([]);
    const [likedJobIds, setLikedJobIds] = useState<number[]>([]);

    useEffect(() => {
        if(user) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/agent/${user.id}/cover-letters`).then(r=>r.json()).then(setSavedLetters).catch(console.error);
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/saved/${user.id}`).then(r=>r.json()).then(setLikedJobIds).catch(console.error);
        }
    }, [user]);

    const filteredJobs = jobs.filter((j: any) => likedJobIds.includes(j.id));

    const generate = async () => {
        if (!selectedJob) return alert("Select a job.");
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/agent/cover-letter`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: user.id, job_id: parseInt(selectedJob) })
            });
            const data = await res.json();
            
            if(!res.ok) {
                if (data.detail && data.detail.includes("Limit")) {
                    triggerUpgrade(); // <--- Trigger Modal on Limit
                    throw new Error("Limit Reached");
                }
                throw new Error(data.detail);
            }
            
            setLetter(data.content);
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/agent/${user.id}/cover-letters`).then(r=>r.json()).then(setSavedLetters);
        } catch(e:any) { 
            if (e.message !== "Limit Reached") alert(e.message); 
        } finally { setLoading(false); }
    };

    const deleteLetter = async (id: number) => {
        if(!confirm("Delete?")) return;
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/agent/cover-letter/${id}`, { method: "DELETE" });
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/agent/${user.id}/cover-letters`).then(r=>r.json()).then(setSavedLetters);
    };

    return (
        <div className="max-w-6xl mx-auto h-full flex flex-col md:flex-row gap-8">
            <div className="flex-1 flex flex-col">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Cover Letter Architect</h2>
                <div className="flex gap-4 mb-6">
                    <select className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none" value={selectedJob} onChange={e => setSelectedJob(e.target.value)}>
                        <option value="">Select a Saved Job...</option>
                        {filteredJobs.length > 0 ? filteredJobs.map((j: any) => <option key={j.id} value={j.id}>{j.title} at {j.company}</option>) : <option disabled>No Saved Jobs</option>}
                    </select>
                    <button onClick={generate} disabled={loading} className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-purple-700 transition">{loading ? "Writing..." : "Generate"}</button>
                </div>
                {letter ? (
                    <div className="flex-1 bg-slate-50 p-8 rounded-xl border border-slate-200 font-serif text-sm leading-7 text-slate-800 whitespace-pre-wrap overflow-y-auto relative group max-h-[500px]">
                        <button onClick={() => navigator.clipboard.writeText(letter)} className="absolute top-4 right-4 p-2 bg-white border rounded-lg opacity-0 group-hover:opacity-100 transition"><Copy className="w-4 h-4"/></button>
                        {letter}
                    </div>
                ) : <div className="flex-1 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 min-h-[300px]">Select a job to generate.</div>}
            </div>
            <div className="w-full md:w-80 border-l pl-0 md:pl-8 flex flex-col pt-8 md:pt-0 border-t md:border-t-0">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-900">Saved Letters</h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${savedLetters.length >= 5 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>{savedLetters.length}/5</span>
                </div>
                {savedLetters.length >= 5 && !user.is_premium && (
                    <button onClick={triggerUpgrade} className="mb-4 w-full py-2 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg hover:bg-amber-200">
                        Unlock Unlimited
                    </button>
                )}
                <div className="flex-1 overflow-y-auto space-y-3 max-h-[500px]">
                    {savedLetters.map((l: any) => (
                        <div key={l.id} className="p-4 bg-white border rounded-xl hover:border-purple-200 transition">
                            <p className="text-xs font-bold text-slate-900 line-clamp-2 mb-2">{l.title}</p>
                            <div className="flex gap-2">
                                <button onClick={() => setLetter(l.content)} className="flex-1 text-[10px] font-bold bg-slate-50 py-1.5 rounded">View</button>
                                <button onClick={() => deleteLetter(l.id)} className="text-[10px] font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// 2. MOCK INTERVIEW TOOL
function MockInterviewTool({ user, jobs, triggerUpgrade }: any) {
    const [selectedJob, setSelectedJob] = useState("");
    const [persona, setPersona] = useState("Recruiter");
    const [interviewId, setInterviewId] = useState<number | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [likedJobIds, setLikedJobIds] = useState<number[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if(user) fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/saved/${user.id}`).then(r=>r.json()).then(setLikedJobIds).catch(console.error);
    }, [user]);
    
    const filteredJobs = jobs.filter((j: any) => likedJobIds.includes(j.id));
    useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    const startInterview = async () => {
        if (!selectedJob) return;
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/agent/interview/start`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: user.id, job_id: parseInt(selectedJob), persona: persona })
            });
            const data = await res.json();
            
            if (!res.ok) {
                if (data.detail && data.detail.includes("Limit")) {
                    triggerUpgrade();
                    throw new Error("Limit Reached");
                }
                throw new Error(data.detail);
            }

            setInterviewId(data.interview_id);
            setMessages(data.history || [{ role: 'assistant', content: data.message }]);
        } catch (err: any) { 
            if(err.message !== "Limit Reached") alert(err.message || "Error starting."); 
        } finally { setLoading(false); }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!input.trim()) return;
        const msg = input;
        setInput("");
        setMessages(p => [...p, { role: 'user', content: msg }]);
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/agent/interview/chat`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ interview_id: interviewId, user_id: user.id, message: msg })
            });
            const data = await res.json();
            setMessages(p => [...p, { role: 'assistant', content: data.reply }]);
        } catch { setMessages(p => [...p, { role: 'assistant', content: "Connection error." }]); } finally { setLoading(false); }
    };

    if (!interviewId) {
        return (
            <div className="max-w-2xl mx-auto py-10">
                <div className="text-center mb-10"><h2 className="text-2xl font-bold text-slate-900 mb-2">Configure Your Interview</h2><p className="text-slate-500">Select a job and choose who will interview you.</p></div>
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Job</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none" value={selectedJob} onChange={e => setSelectedJob(e.target.value)}>
                            <option value="">Select a Saved Job...</option>
                            {filteredJobs.length > 0 ? filteredJobs.map((j: any) => <option key={j.id} value={j.id}>{j.title} at {j.company}</option>) : <option disabled>No Saved Jobs</option>}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Select Interviewer Persona</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <PersonaCard icon={<UserCircle2 className="w-6 h-6"/>} title="The Recruiter" desc="Friendly. Culture & soft skills." active={persona === 'Recruiter'} onClick={() => setPersona('Recruiter')} />
                            <PersonaCard icon={<Code2 className="w-6 h-6"/>} title="Senior Dev" desc="Strict. Technical details." active={persona === 'Senior Dev'} onClick={() => setPersona('Senior Dev')} />
                            <PersonaCard icon={<LineChart className="w-6 h-6"/>} title="The CTO" desc="Strategic. System design." active={persona === 'CTO'} onClick={() => setPersona('CTO')} />
                        </div>
                    </div>
                    <button onClick={startInterview} disabled={!selectedJob || loading} className="w-full bg-[#0F172A] text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition shadow-lg mt-4">{loading ? "Preparing..." : "Start Interview"}</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[600px] max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-xl">🦜</div>
                    <div><h3 className="font-bold text-slate-900">{persona}</h3><p className="text-xs text-purple-600 font-bold">Live Session</p></div>
                </div>
                <button onClick={() => setInterviewId(null)} className="text-xs font-bold text-slate-400 hover:text-red-500">End Session</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-4 mb-4">
                {messages.map((m, i) => (
                    <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${m.role === 'user' ? 'bg-slate-200' : 'bg-purple-600 text-white'}`}>{m.role === 'user' ? <User className="w-4 h-4"/> : <Bot className="w-4 h-4"/>}</div>
                        <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-slate-100 text-slate-800 rounded-tr-none' : 'bg-purple-50 text-slate-800 border border-purple-100 rounded-tl-none'}`}>{m.content}</div>
                    </div>
                ))}
                {loading && <div className="text-xs text-slate-400 italic">Typing...</div>}
                <div ref={scrollRef}></div>
            </div>
            <form onSubmit={sendMessage} className="relative">
                <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type your answer..." className="w-full h-14 pl-4 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"/>
                <button type="submit" disabled={!input.trim() || loading} className="absolute right-2 top-2 p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition disabled:opacity-50"><ArrowRight className="w-4 h-4"/></button>
            </form>
        </div>
    )
}

function PersonaCard({ icon, title, desc, active, onClick }: any) {
    return (
        <div onClick={onClick} className={`p-4 rounded-xl border cursor-pointer transition-all ${active ? 'bg-purple-50 border-purple-500 ring-1 ring-purple-500' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${active ? 'bg-white text-purple-600' : 'bg-slate-50 text-slate-600'}`}>{icon}</div>
            <h4 className="font-bold text-sm text-slate-900 mb-1">{title}</h4>
            <p className="text-[10px] text-slate-500 leading-tight">{desc}</p>
        </div>
    )
}

// 3. AUTO APPLY TOOL
function AutoApplyTool({ user, triggerUpgrade }: any) {
    const [running, setRunning] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [threshold, setThreshold] = useState(75);

    const runAutoApply = async () => {
        setRunning(true);
        setResult(null);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/agent/auto-apply`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: user.id, min_score: threshold })
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.detail);
            setResult(data);
        } catch (err: any) { 
            // If backend throws generic error, check if it's because of limit
            if (err.message && err.message.includes("Limit")) {
                setResult({ status: 'limit_reached', message: "Daily limit reached." });
            } else {
                alert(err.message || "Failed to run."); 
            }
        } finally { setRunning(false); }
    };

    return (
        <div className="max-w-xl mx-auto py-8">
            <div className="text-center mb-10"><div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm"><Briefcase className="w-10 h-10"/></div><h2 className="text-2xl font-bold text-slate-900 mb-2">Auto-Apply Agent</h2><p className="text-slate-500 max-w-sm mx-auto">The agent scans available jobs, checks your AI Match Score, and applies if it meets your standards.</p></div>
            {!result ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-600"/> Agent Configuration</h3>
                    <div className="mb-6"><div className="flex justify-between mb-2"><label className="text-sm font-bold text-slate-700">Minimum Match Score</label><span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{threshold}%</span></div><input type="range" min="60" max="95" step="5" value={threshold} onChange={(e) => setThreshold(parseInt(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"/><p className="text-xs text-slate-400 mt-2">Only apply to jobs where I am a strong match.</p></div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"><div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-xs font-bold text-slate-900">3</div><div className="flex-1"><p className="text-xs font-bold text-slate-900">Daily Limit</p><p className="text-[10px] text-slate-500">Free Plan allows 3 auto-applications per day.</p></div></div>
                </div>
            ) : null}
            <div className="text-center">
                {!result ? (
                    <button onClick={runAutoApply} disabled={running} className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${running ? 'bg-slate-800 text-slate-400 cursor-not-allowed' : 'bg-[#0F172A] text-white hover:bg-slate-800'}`}>{running ? "Scanning & Applying..." : "Start Auto-Apply Agent"}</button>
                ) : (
                    <div className={`p-6 rounded-2xl border animate-in zoom-in duration-300 ${result.status === 'limit_reached' ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
                        {result.status === 'limit_reached' ? (
                            <>
                                <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4"><Crown className="w-6 h-6"/></div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Daily Limit Reached</h3>
                                <p className="text-sm text-slate-600 mb-6">{result.message}</p>
                                <button onClick={triggerUpgrade} className="bg-yellow-400 text-yellow-900 px-6 py-2 rounded-lg font-bold hover:bg-yellow-500 transition shadow-sm">Upgrade to Premium</button>
                                <button onClick={() => setResult(null)} className="block mx-auto mt-4 text-xs font-bold text-slate-400 hover:text-slate-600">Back</button>
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4"/>
                                <h3 className="text-xl font-bold text-slate-900 mb-1">Batch Complete!</h3>
                                <p className="text-slate-600">Successfully applied to <b>{result.applied_count}</b> new jobs.</p>
                                <button onClick={() => setResult(null)} className="mt-6 text-sm font-bold text-green-700 hover:underline">Run Again</button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}