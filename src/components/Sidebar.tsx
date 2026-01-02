"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Briefcase, FileText, User, Bot, LogOut, Layers 
} from "lucide-react"; 
import { useAuth } from "@/context/AuthContext"; 

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth(); 

  if (["/login", "/signup", "/forgot-password"].includes(pathname)) {
    return null;
  }

  const navItems = [
    { name: "Jobs", href: "/jobs", icon: Briefcase },
    { name: "My Applications", href: "/my-applications", icon: Layers },
    { name: "Resume", href: "/resume", icon: FileText },
    { name: "Profile", href: "/profile", icon: User },
    { name: "AI Agent", href: "/agent", icon: Bot },
  ];

  return (
    // FIX: Removed 'fixed'. Uses 'w-64 h-full flex-none' to occupy physical space.
    <aside className="w-64 h-full bg-white border-r border-slate-200 hidden lg:flex flex-col flex-none z-50">
      
      <div className="p-8">
        <Link href="/jobs" className="flex items-center gap-3 font-black text-xl text-slate-900 tracking-tight hover:opacity-80 transition">
          <div className="w-9 h-9 bg-[#0F172A] text-white rounded-xl flex items-center justify-center text-lg shadow-lg shadow-slate-900/20">D</div>
          DataHire
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3.5 text-sm font-bold rounded-xl transition-all group ${
                isActive
                  ? "bg-[#0F172A] text-white shadow-md shadow-slate-900/15 translate-x-1"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1"
              }`}
            >
              <item.icon className={`w-5 h-5 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-200 cursor-default">
          <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-black text-sm border-2 border-white shadow-sm">
            {user?.first_name?.[0] || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">
              {user?.first_name} {user?.last_name?.charAt(0)}.
            </p>
            <p className="text-xs text-slate-500 truncate font-medium">Job Seeker</p>
          </div>
          <button onClick={logout} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Sign Out">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}