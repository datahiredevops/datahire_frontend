"use client";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Briefcase, Users, Building2, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const pathname = usePathname();

  // Helper to check if link is active
  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex">
      
      {/* SIDEBAR (Fixed) */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col fixed h-full z-20">
        <div className="p-8">
            <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
                <div className="w-8 h-8 bg-[#0F172A] text-white rounded-lg flex items-center justify-center text-lg">D</div>
                DataHire <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase tracking-wider">Corp</span>
            </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
            <NavItem href="/employer/dashboard" icon={<LayoutDashboard className="w-5 h-5"/>} label="Dashboard" active={pathname === "/employer/dashboard"} />
            <NavItem href="/employer/jobs" icon={<Briefcase className="w-5 h-5"/>} label="My Jobs" active={isActive("/employer/jobs")} />
            <NavItem href="/employer/applicants" icon={<Users className="w-5 h-5"/>} label="Applicants" active={isActive("/employer/applicants")} />
            <NavItem href="/employer/company" icon={<Building2 className="w-5 h-5"/>} label="Company Profile" active={isActive("/employer/company")} />
        </nav>

        <div className="p-4 border-t border-slate-100">
            <button onClick={logout} className="flex items-center gap-3 text-slate-500 hover:text-red-600 font-bold text-sm p-2 w-full hover:bg-red-50 rounded-lg transition">
                <LogOut className="w-5 h-5" /> Sign Out
            </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 ml-0 lg:ml-64 w-full">
        {children}
      </main>
    </div>
  );
}

// NavItem Component (Now uses Link)
function NavItem({ href, icon, label, active }: any) {
    return (
        <Link 
            href={href} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${active ? 'bg-[#0F172A] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
        >
            {icon}
            <span className="text-sm font-bold">{label}</span>
        </Link>
    )
}