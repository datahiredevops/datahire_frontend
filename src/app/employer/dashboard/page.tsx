"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Building2, Plus, Users, Briefcase, MapPin, Globe, LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function EmployerDashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
    
    // If logged in, fetch company details
    if (user && user.role === "employer") {
      fetchCompanyData();
    }
  }, [user, authLoading]);

  const fetchCompanyData = async () => {
    try {
        // We assume the user object has the company_id or we fetch it via a new endpoint
        // For now, let's fetch the user again to ensure we have the latest company link
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user?.id}`);
        const data = await res.json();
        
        if (data.company) {
            setCompany(data.company);
        }
    } catch (err) {
        console.error("Failed to load company", err);
    } finally {
        setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex">
      
      {/* SIDEBAR (Simplified for Employer) */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col fixed h-full">
        <div className="p-8">
            <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
                <div className="w-8 h-8 bg-[#0F172A] text-white rounded-lg flex items-center justify-center text-lg">D</div>
                DataHire <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase tracking-wider">Corp</span>
            </div>
        </div>
        <nav className="flex-1 px-4 space-y-2">
            <NavItem icon={<LayoutDashboard className="w-5 h-5"/>} label="Dashboard" active />
            <NavItem icon={<Briefcase className="w-5 h-5"/>} label="My Jobs" />
            <NavItem icon={<Users className="w-5 h-5"/>} label="Applicants" />
            <NavItem icon={<Building2 className="w-5 h-5"/>} label="Company Profile" />
        </nav>
        <div className="p-4 border-t border-slate-100">
            <button onClick={logout} className="flex items-center gap-3 text-slate-500 hover:text-red-600 font-bold text-sm p-2 w-full hover:bg-red-50 rounded-lg transition">
                <LogOut className="w-5 h-5" /> Sign Out
            </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-0 lg:ml-64 p-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-end mb-8">
            <div>
                <h1 className="text-3xl font-black text-slate-900">Hello, {user?.first_name} 👋</h1>
                <p className="text-slate-500 mt-2">Here is what's happening at <b>{company?.name || "Your Company"}</b>.</p>
            </div>
            <button className="bg-[#0F172A] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition shadow-lg shadow-slate-900/20">
                <Plus className="w-5 h-5" /> Post New Job
            </button>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard label="Active Jobs" value="0" icon={<Briefcase className="w-6 h-6 text-blue-600"/>} color="bg-blue-50 text-blue-900" />
            <StatCard label="Total Applicants" value="0" icon={<Users className="w-6 h-6 text-purple-600"/>} color="bg-purple-50 text-purple-900" />
            <StatCard label="Company Size" value={company?.size || "-"} icon={<Building2 className="w-6 h-6 text-orange-600"/>} color="bg-orange-50 text-orange-900" />
        </div>

        {/* EMPTY STATE (Since we have no jobs yet) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No jobs posted yet</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-8">Create your first job listing to start attracting the top 1% of AI talent matches.</p>
            <button className="text-[#0F172A] font-bold hover:underline">
                Create Job Posting →
            </button>
        </div>

      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: any) {
    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition ${active ? 'bg-[#0F172A] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
            {icon}
            <span className="text-sm font-bold">{label}</span>
        </div>
    )
}

function StatCard({ label, value, icon, color }: any) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-black text-slate-900">{value}</p>
            </div>
        </div>
    )
}