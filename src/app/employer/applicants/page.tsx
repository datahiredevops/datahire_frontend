"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, Filter, Search } from "lucide-react";

export default function AllApplicantsPage() {
  const { token } = useAuth();
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    } catch (e) { 
        console.error(e); 
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">
        <div className="max-w-6xl mx-auto">
            
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">All Applicants</h1>
                    <p className="text-slate-500 mt-1">A unified view of candidates across all job postings.</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400"/>
                        <input className="pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold w-64 outline-none focus:ring-2 focus:ring-[#0F172A]" placeholder="Search candidates..."/>
                    </div>
                    <button className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-50">
                        <Filter className="w-4 h-4"/> Filter
                    </button>
                </div>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                            <th className="p-4 pl-6">Candidate</th>
                            <th className="p-4">Applied For</th>
                            <th className="p-4">AI Score</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applicants.map((app) => (
                            <tr key={app.id} className="border-b border-slate-100 hover:bg-slate-50 transition text-sm text-slate-700 group cursor-default">
                                <td className="p-4 pl-6 font-bold flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#0F172A] rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        {app.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-slate-900">{app.name}</div>
                                        <div className="text-xs text-slate-400 font-normal">{app.email}</div>
                                    </div>
                                </td>
                                <td className="p-4 font-medium text-slate-600">{app.job_title}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded font-bold text-xs ${app.score >= 80 ? 'bg-green-100 text-green-700' : app.score >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-50 text-red-600'}`}>
                                        {app.score}% Match
                                    </span>
                                </td>
                                <td className="p-4 capitalize">
                                    <span className="bg-slate-100 px-2 py-1 rounded text-slate-600 font-bold text-xs">{app.status}</span>
                                </td>
                                <td className="p-4 text-slate-400 font-medium">{new Date(app.applied_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {applicants.length === 0 && (
                    <div className="p-12 text-center text-slate-400">
                        <User className="w-10 h-10 mx-auto mb-3 opacity-20"/>
                        No applicants found yet.
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}