"use client";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // --- UPDATED: Define strict auth/onboarding routes that need NO sidebar ---
  const cleanAuthRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/employer/login",
    "/employer/register",
  ];

  const isCleanPage = cleanAuthRoutes.includes(pathname);

  // If it's a login/register page, just show the content (no sidebar)
  if (isCleanPage) {
    return <>{children}</>;
  }

  // For all other pages (Employer Dashboard, Seeker Jobs, etc.), show the Sidebar shell
  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {children}
      </main>
    </div>
  );
}