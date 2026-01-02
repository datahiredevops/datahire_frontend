"use client";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const authPages = ["/login", "/signup", "/forgot-password"];
  const isAuthPage = authPages.includes(pathname);

  return (
    // 1. FLEX CONTAINER: Forces items to sit side-by-side
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden font-sans">
      
      {/* 2. SIDEBAR: Sits on the left naturally */}
      {!isAuthPage && <Sidebar />}

      {/* 3. MAIN CONTENT: Fills the rest of the screen
          flex-1: Grow to fill width
          overflow-hidden: Prevents double scrollbars
      */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {children}
      </main>
      
    </div>
  );
}