"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Auth pages (job seeker + employer)
  const authRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/employer/login",
    "/employer/register",
  ];

  // Also protect future employer auth routes
  const isAuthPage =
    authRoutes.includes(pathname) ||
    pathname.startsWith("/employer/");

  // Auth pages → no sidebar, no flex shell
  if (isAuthPage) {
    return <>{children}</>;
  }

  // App pages → sidebar layout
  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {children}
      </main>
    </div>
  );
}
