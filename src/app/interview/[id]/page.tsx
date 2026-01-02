"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Loader2, Mic, Send, StopCircle, User, Bot, CheckCircle 
} from "lucide-react";

export default function InterviewRoom() {
  const { id } = useParams();
  const { token } = useAuth();
  const router = useRouter();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- 1. INITIALIZE INTERVIEW ON LOAD ---
  useEffect(() => {
    if (token && id) {
        startInterview();
    }
  }, [token, id]);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const startInterview = async () => {
    setLoading(true);
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/interview/${id}/start`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
            const data = await res.json();
            setMessages(data.history);
        } else {
            alert("Could not start interview. You may not be invited yet.");
            router.push("/my-applications");
        }
    } catch (err) { 
        console.error(err); 
    } finally { 
        setLoading(false); 
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    // Optimistic Update: Show user message immediately
    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/interview/${id}/reply`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json", 
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ answer: currentInput })
        });
        
        const data = await res.json();
        if (res.ok) {
            setMessages(data.history);
        }
    } catch (err) { 
        console.error(err);
        // Revert on error (optional, but good UX)
        alert("Failed to send message. Please try again.");
    } finally { 
        setLoading(false); 
    }
  };

  const finishInterview = async () => {
    if (!confirm("Are you sure you want to submit your interview? This cannot be undone.")) return;
    setLoading(true);
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/interview/${id}/submit`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            setIsFinished(true);
            setTimeout(() => router.push("/my-applications"), 3000);
        }
    } catch (err) { console.error(err); }
  };

  // --- FINISHED STATE ---
  if (isFinished) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white text-center p-8 font-sans">
        <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce shadow-lg shadow-green-100">
            <CheckCircle className="w-12 h-12"/>
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Interview Submitted!</h1>
        <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed">
            Great job. The employer has been notified and the AI is generating your score report.
        </p>
        <div className="mt-12 flex items-center gap-2 text-sm text-slate-400 font-bold uppercase tracking-widest animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin"/> Redirecting to Dashboard...
        </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-[#F8FAFC] font-sans">
        {/* HEADER */}
        <div className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm z-10">
            <div>
                <h2 className="font-black text-slate-900 text-xl tracking-tight">AI Technical Interview</h2>
                <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Live Assessment Session</p>
                </div>
            </div>
            <button 
                onClick={finishInterview}
                className="bg-red-50 text-red-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-red-100 transition flex items-center gap-2 border border-red-100"
            >
                <StopCircle className="w-4 h-4"/> End Interview
            </button>
        </div>

        {/* CHAT AREA */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">
            {messages.length === 0 && !loading && (
                <div className="text-center py-20 opacity-50">
                    <Loader2 className="w-10 h-10 mx-auto mb-4 text-slate-300 animate-spin"/>
                    <p className="text-slate-400 font-bold">Connecting to AI Interviewer...</p>
                </div>
            )}

            {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-6 shadow-sm relative ${
                        msg.role === "user" 
                        ? "bg-[#0F172A] text-white rounded-tr-none" 
                        : "bg-white text-slate-700 border border-slate-200 rounded-tl-none"
                    }`}>
                        {/* Avatar / Label */}
                        <div className={`absolute -top-3 ${msg.role === "user" ? "-right-2" : "-left-2"} bg-white p-1 rounded-full border border-slate-100 shadow-sm`}>
                            {msg.role === "user" ? (
                                <div className="w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center"><User className="w-3 h-3 text-white"/></div>
                            ) : (
                                <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center"><Bot className="w-3 h-3 text-white"/></div>
                            )}
                        </div>

                        <div className={`flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-widest ${msg.role === "user" ? "text-slate-400" : "text-indigo-600"}`}>
                            {msg.role === "user" ? "Candidate Response" : "AI Interviewer"}
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap text-sm md:text-base">{msg.content}</p>
                    </div>
                </div>
            ))}
            
            {loading && (
                <div className="flex justify-start animate-pulse">
                    <div className="bg-white p-5 rounded-2xl rounded-tl-none border border-slate-200 flex items-center gap-3 shadow-sm">
                        <div className="flex gap-1">
                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></span>
                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Thinking</span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* INPUT AREA */}
        <div className="bg-white p-6 border-t border-slate-200 z-20">
            <div className="max-w-4xl mx-auto relative flex gap-3 items-end">
                <div className="relative flex-1">
                    <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        disabled={loading}
                        placeholder="Type your answer here..."
                        rows={1}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none font-medium resize-none min-h-[60px] max-h-[150px] shadow-inner transition-all"
                        style={{ fieldSizing: "content" } as any} 
                    />
                    <div className="absolute right-3 bottom-3 text-xs text-slate-400 font-bold bg-white/80 px-2 py-1 rounded">
                        Shift + Enter for new line
                    </div>
                </div>
                
                <button 
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="bg-[#0F172A] text-white p-4 rounded-2xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-900/20 h-[60px] w-[60px] flex items-center justify-center"
                >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin"/> : <Send className="w-6 h-6"/>}
                </button>
            </div>
        </div>
    </div>
  );
}
