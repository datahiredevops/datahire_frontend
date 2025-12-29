"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, FileText, User, Bot, LogOut } from "lucide-react"; // Added LogOut icon
import { useAuth } from "@/context/AuthContext"; // Import Auth

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth(); // Get user and logout function

  const navItems = [
    { name: "Jobs", href: "/jobs", icon: Briefcase },
    { name: "Resume", href: "/resume", icon: FileText },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Agent", href: "/agent", icon: Bot },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col z-50">
      
      {/* Logo */}
      <div className="p-8">
        <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
          <div className="w-8 h-8 bg-[#0F172A] text-white rounded-lg flex items-center justify-center text-lg">D</div>
          DataHire
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                isActive
                  ? "bg-[#0F172A] text-white shadow-md shadow-slate-900/10"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition group">
          
          {/* Avatar Placeholder */}
          <div className="w-10 h-10 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-sm">
            {user?.first_name?.[0] || "U"}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">
              {user?.first_name} {user?.last_name?.charAt(0)}.
            </p>
            <p className="text-xs text-slate-500 truncate">Job Seeker</p>
          </div>

          {/* SIGN OUT BUTTON */}
          <button 
            onClick={logout}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
          
        </div>
      </div>
    </aside>
  );
}