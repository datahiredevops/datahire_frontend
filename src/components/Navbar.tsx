"use client";

import { Home, Users, Briefcase, MessageSquare, Bell, Search, UserCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path ? "active" : "";

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 px-4 h-[56px] shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-full">
        
        {/* LEFT: Branding */}
        <div className="flex items-center gap-3">
          <Link href="/jobs">
            <div className="w-10 h-10 bg-[#0F172A] text-white rounded-lg flex items-center justify-center font-bold text-xl shadow-md cursor-pointer">
              D
            </div>
          </Link>
          
          <div className="hidden md:flex items-center bg-slate-100 px-4 py-2 rounded-full w-64 transition-all focus-within:w-80 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-200">
            <Search className="w-4 h-4 text-slate-500 mr-2" />
            <input 
              placeholder="Search DataHire..." 
              className="bg-transparent border-none outline-none text-sm w-full placeholder-slate-500 font-medium" 
            />
          </div>
        </div>

        {/* RIGHT: Navigation */}
        <ul className="flex items-center h-full gap-1">
          {/* Note: I linked "Feed" to jobs for now since we removed the feed page, or you can link to /jobs */}
          <Link href="/jobs"><li className={`nav-item ${isActive("/jobs")}`}><Briefcase className="w-5 h-5 mb-0.5" /><span className="hidden md:block">Jobs</span></li></Link>
          <Link href="/network"><li className={`nav-item ${isActive("/network")}`}><Users className="w-5 h-5 mb-0.5" /><span className="hidden md:block">Network</span></li></Link>
          <Link href="/messaging"><li className={`nav-item ${isActive("/messaging")}`}><MessageSquare className="w-5 h-5 mb-0.5" /><span className="hidden md:block">Chat</span></li></Link>
          <Link href="/notifications"><li className={`nav-item ${isActive("/notifications")}`}><Bell className="w-5 h-5 mb-0.5" /><span className="hidden md:block">Alerts</span></li></Link>
          
          <div className="w-[1px] h-8 bg-slate-200 mx-2"></div>
          
          {/* PROFILE LINK (Fixed) */}
          <Link href="/profile">
            <li className={`nav-item ${isActive("/profile")}`}>
                <div className="w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center border border-slate-300">
                    <UserCircle className="w-6 h-6 text-slate-500" />
                </div>
                <span className="hidden md:block mt-0.5 text-xs">Me ▾</span>
            </li>
          </Link>
        </ul>

      </div>
    </nav>
  );
}