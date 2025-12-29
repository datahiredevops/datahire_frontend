"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import PricingModal from "@/components/PricingModal"; 
import { 
  FileText, UploadCloud, Trash2, Download, Eye, CheckCircle, AlertCircle, Crown, Plus, Star 
} from "lucide-react";

export default function ResumePage() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [showPricing, setShowPricing] = useState(false);
  const [viewContent, setViewContent] = useState<string | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    if (user) fetchResumes();
  }, [user]);

  const fetchResumes = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user?.id}/resumes`);
      const data = await res.json();
      // Sort: Primary first, then by date
      const sorted = data.sort((a: any, b: any) => (b.is_primary === a.is_primary) ? 0 : b.is_primary ? 1 : -1);
      setResumes(sorted);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    if (!user?.is_premium && resumes.length >= 5) {
        setShowPricing(true);
        return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user?.id}/resumes`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      fetchResumes();
    } catch (err) {
      alert("Failed to upload resume.");
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (id: number) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user?.id}/resumes/${id}/set-primary`, {
            method: "PUT"
        });
        if (res.ok) fetchResumes();
    } catch { alert("Failed to set primary."); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user?.id}/resumes/${id}`, {
        method: "DELETE",
      });
      if (res.ok) fetchResumes();
      else alert("Could not delete. It might be attached to an application.");
    } catch (err) { alert("Error deleting resume."); }
  };

  const handleView = async (id: number) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user?.id}/resumes/${id}/content`);
        const data = await res.json();
        setViewContent(data.content);
        setIsViewerOpen(true);
    } catch { alert("Error loading content"); }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar />
      <main className="ml-20 lg:ml-64 flex-1 p-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-end mb-8">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-600"/> Resume Manager
                </h1>
                <p className="text-slate-500 mt-2">Upload and manage your resumes for different job roles.</p>
            </div>
            {!user?.is_premium && (
                <button 
                    onClick={() => setShowPricing(true)}
                    className="hidden md:flex items-center gap-2 bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold text-xs shadow-sm hover:shadow-md transition hover:scale-105"
                >
                    <Crown className="w-4 h-4"/> Upgrade Plan
                </button>
            )}
        </div>

        {/* STATS BAR */}
        <div className="flex items-center gap-4 mb-8">
            <div className={`px-4 py-2 rounded-lg text-sm font-bold border flex items-center gap-2 ${resumes.length >= 5 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-slate-600 border-slate-200'}`}>
                <span>Storage Used: {resumes.length} / {user?.is_premium ? '∞' : '5'}</span>
                {resumes.length >= 5 && !user?.is_premium && <AlertCircle className="w-4 h-4"/>}
            </div>
        </div>

        {/* RESUME GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            
            {/* UPLOAD CARD */}
            <label className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 cursor-pointer transition-all group min-h-[220px] ${resumes.length >= 5 && !user?.is_premium ? 'border-red-200 bg-red-50/50' : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50'}`}>
                <input type="file" accept=".pdf" className="hidden" onChange={handleUpload} disabled={uploading} />
                
                {uploading ? (
                    <div className="flex flex-col items-center animate-pulse">
                        <UploadCloud className="w-10 h-10 text-blue-400 mb-3" />
                        <span className="text-sm font-bold text-blue-600">Uploading...</span>
                    </div>
                ) : (
                    <>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors ${resumes.length >= 5 && !user?.is_premium ? 'bg-red-100 text-red-500' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
                            {resumes.length >= 5 && !user?.is_premium ? <Crown className="w-6 h-6"/> : <Plus className="w-6 h-6"/>}
                        </div>
                        <h3 className={`font-bold mb-1 ${resumes.length >= 5 && !user?.is_premium ? 'text-red-600' : 'text-slate-700 group-hover:text-blue-700'}`}>
                            {resumes.length >= 5 && !user?.is_premium ? "Unlock More Slots" : "Upload New Resume"}
                        </h3>
                        <p className="text-xs text-slate-400 text-center max-w-[200px]">
                            {resumes.length >= 5 && !user?.is_premium 
                                ? "You have reached the free limit. Upgrade to upload more." 
                                : "PDF files only. Max 5MB."}
                        </p>
                    </>
                )}
            </label>

            {/* RESUME CARDS */}
            {resumes.map((resume) => (
                <div key={resume.id} className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition group relative flex flex-col ${resume.is_primary ? 'border-green-500 ring-1 ring-green-500' : 'border-slate-200'}`}>
                    
                    {/* PRIMARY BADGE */}
                    {resume.is_primary && (
                        <div className="absolute -top-3 right-4 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                            <CheckCircle className="w-3 h-3"/> PRIMARY
                        </div>
                    )}

                    {/* OPTIMIZED BADGE */}
                    {resume.file_name.includes("Optimized") && (
                        <div className="absolute -top-3 left-4 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                            <CheckCircle className="w-3 h-3"/> Optimized
                        </div>
                    )}

                    <div className="flex items-start gap-4 mb-4 mt-2 flex-1">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${resume.is_primary ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                            <FileText className="w-6 h-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-slate-900 truncate text-sm leading-tight mb-1" title={resume.file_name}>{resume.file_name}</h3>
                            <p className="text-xs text-slate-400">Uploaded {new Date(resume.uploaded_at).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-slate-100 mt-auto">
                        {/* MAKE PRIMARY BUTTON */}
                        {!resume.is_primary && (
                            <button 
                                onClick={() => handleSetPrimary(resume.id)} 
                                className="flex-1 py-2 rounded-lg bg-slate-50 text-slate-500 text-xs font-bold flex items-center justify-center gap-1 hover:bg-green-50 hover:text-green-600 transition group/btn"
                                title="Set as Primary"
                            >
                                <Star className="w-3.5 h-3.5"/> Set Primary
                            </button>
                        )}
                        
                        <a href={resume.file_path} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition">
                            <Download className="w-4 h-4"/>
                        </a>
                        <button onClick={() => handleView(resume.id)} className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition">
                            <Eye className="w-4 h-4"/>
                        </button>
                        <button onClick={() => handleDelete(resume.id)} className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 transition">
                            <Trash2 className="w-4 h-4"/>
                        </button>
                    </div>
                </div>
            ))}
        </div>

        {/* VIEWER MODAL */}
        {isViewerOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white w-full max-w-3xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-200">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-lg text-slate-800">Resume Content</h3>
                        <button onClick={() => setIsViewerOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">Close</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 font-mono text-sm text-slate-600 bg-white whitespace-pre-wrap leading-relaxed">
                        {viewContent || "Loading content..."}
                    </div>
                </div>
            </div>
        )}

        <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />

      </main>
    </div>
  );
}