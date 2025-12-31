"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
    Briefcase, Users, TrendingUp, Plus, 
    Clock
} from "lucide-react";

export default function EmployerDashboard() {
  const { token, user } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState({
      activeJobs: 0,
      totalApplicants: 0,
      unread: 0,
      pipeline: { applied: 0, reviewing: 0, interview: 0, offer: 0, rejected: 0 }
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    try {
        const jobsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employer/jobs`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const jobsData = await jobsRes.json();

        const appsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employer/applicants`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const appsData = await appsRes.json();

        const totalApps = appsData.length;
        const pipelineCounts: any = { applied: 0, reviewing: 0, interview: 0, offer: 0, rejected: 0 };
        let unreadCount = 0;

        appsData.forEach((app: any) => {
            const statusKey = app.status.toLowerCase();
            if (pipelineCounts[statusKey] !== undefined) {
                pipelineCounts[statusKey]++;
            }
            if (!app.is_viewed) unreadCount++;
        });

        const sortedActivity = appsData.sort((a: any, b: any) => 
            new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime()
        ).slice(0, 5);

        setStats({
            activeJobs: jobsData.filter((j: any) => j.status === 'Published').length,
            totalApplicants: totalApps,
            unread: unreadCount,
            pipeline: pipelineCounts
        });

        setRecentActivity(sortedActivity);

    } catch (e) { console.error("Dashboard fetch error:", e); } 
    finally { setLoading(false); }
  };

  const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good Morning";
      if (hour < 18) return "Good Afternoon";
      return "Good Evening";
  };

  const handlePipelineClick = (status: string) => {
      router.push(`/employer/applicants?status=${status}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                    {getGreeting()}, {user?.first_name || "Partner"} 👋
                </h1>
                <p className="text-slate-500 font-medium mt-1">Here is what's happening with your hiring pipeline.</p>
            </div>
            <button 
                onClick={() => router.push('/employer/jobs/create')}
                className="bg-[#0F172A] text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition flex items-center gap-2 shadow-lg shadow-slate-900/10"
            >
                <Plus className="w-5 h-5"/> Post New Job
            </button>
        </div>

        {/* METRICS - UPDATED: Removed Unread Card & Changed Grid to 2 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatsCard icon={<Briefcase className="w-6 h-6 text-blue-600"/>} label="Active Jobs" value={stats.activeJobs} color="bg-blue-50"/>
            <StatsCard icon={<Users className="w-6 h-6 text-purple-600"/>} label="Total Candidates" value={stats.totalApplicants} color="bg-purple-50"/>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* PIPELINE FUNNEL */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-slate-400"/> Pipeline Health
                    </h3>
                </div>
                <div className="grid grid-cols-4 gap-4">
                    <PipelineStage 
                        label="Applied" 
                        count={stats.pipeline.applied} 
                        color="bg-slate-100 text-slate-600"
                        onClick={() => handlePipelineClick('Applied')} 
                    />
                    <PipelineStage 
                        label="Reviewing" 
                        count={stats.pipeline.reviewing} 
                        color="bg-blue-100 text-blue-700"
                        onClick={() => handlePipelineClick('Reviewing')}
                    />
                    <PipelineStage 
                        label="Interview" 
                        count={stats.pipeline.interview} 
                        color="bg-purple-100 text-purple-700"
                        onClick={() => handlePipelineClick('Interview')}
                    />
                    <PipelineStage 
                        label="Offer" 
                        count={stats.pipeline.offer} 
                        color="bg-green-100 text-green-700"
                        onClick={() => handlePipelineClick('Offer')}
                    />
                </div>
                
                {/* Visual Bar */}
                <div className="mt-8 h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div style={{ flex: stats.pipeline.applied || 0.1 }} className="bg-slate-400 h-full"></div>
                    <div style={{ flex: stats.pipeline.reviewing }} className="bg-blue-500 h-full"></div>
                    <div style={{ flex: stats.pipeline.interview }} className="bg-purple-500 h-full"></div>
                    <div style={{ flex: stats.pipeline.offer }} className="bg-green-500 h-full"></div>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-400 mt-2">
                    <span>Inbound</span>
                    <span>Hired</span>
                </div>
            </div>

            {/* RECENT ACTIVITY */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-6">
                    <Clock className="w-5 h-5 text-slate-400"/> Recent Activity
                </h3>
                
                <div className="space-y-6">
                    {recentActivity.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-8">No recent activity.</p>
                    ) : (
                        recentActivity.map((act) => (
                            <div key={act.id} className="flex items-start gap-3 relative pb-6 border-l-2 border-slate-100 pl-4 last:pb-0 last:border-0">
                                <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white"></div>
                                <div>
                                    <p className="text-sm text-slate-900">
                                        <span className="font-bold">{act.name}</span> applied for <span className="font-bold text-blue-600">{act.job_title}</span>
                                    </p>
                                    <p className="text-xs text-slate-400 font-bold mt-1">
                                        {new Date(act.applied_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                
                <button 
                    onClick={() => router.push('/employer/applicants')}
                    className="w-full mt-6 py-3 text-sm font-bold text-slate-600 bg-slate-50 rounded-xl hover:bg-slate-100 transition"
                >
                    View All Activity
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ icon, label, value, color }: any) {
    return (
        <div className={`p-6 rounded-2xl border bg-white border-slate-200`}>
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                    {icon}
                </div>
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">{value}</div>
            <div className="text-sm font-bold text-slate-500">{label}</div>
        </div>
    )
}

function PipelineStage({ label, count, color, onClick }: any) {
    return (
        <button 
            onClick={onClick}
            className={`p-4 rounded-xl text-center transition hover:scale-105 hover:shadow-md cursor-pointer w-full ${color.split(' ')[0]}`}
        >
            <div className={`text-2xl font-black mb-1 ${color.split(' ')[1]}`}>{count}</div>
            <div className={`text-xs font-bold uppercase opacity-80 ${color.split(' ')[1]}`}>{label}</div>
        </button>
    )
}