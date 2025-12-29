import Navbar from "@/components/Navbar";
import { Image as ImageIcon, Calendar, Newspaper, Send, ThumbsUp, MessageCircle, Share2, MoreHorizontal } from "lucide-react";

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <Navbar />

      <main className="max-w-6xl mx-auto pt-8 px-0 md:px-4 grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* LEFT: Profile Card */}
        <div className="hidden md:block md:col-span-3 space-y-4">
          <div className="card relative pb-4 text-center group">
            {/* Gradient Header */}
            <div className="h-20 w-full bg-gradient-to-r from-[#0F172A] to-[#334155]"></div>
            
            <div className="relative -mt-10 mb-3">
              <div className="w-20 h-20 bg-white rounded-full mx-auto p-1.5 shadow-md">
                 <div className="w-full h-full bg-slate-200 rounded-full flex items-center justify-center text-3xl">👨‍💻</div>
              </div>
            </div>
            
            <h2 className="font-bold text-xl text-slate-900 group-hover:underline cursor-pointer">Mukesh Eswaran</h2>
            <p className="text-xs text-slate-500 mt-1 px-4 font-medium">AI/ML Engineer | Computer Vision | Building DataHire V2 🚀</p>
            
            <div className="mt-6 border-t border-slate-100 pt-4 text-left px-5 text-sm space-y-3">
              <div className="flex justify-between items-center text-slate-600 font-medium hover:bg-slate-50 p-1 rounded cursor-pointer">
                <span>Profile views</span>
                <span className="text-[#10B981] font-bold">142</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 font-medium hover:bg-slate-50 p-1 rounded cursor-pointer">
                <span>Post impressions</span>
                <span className="text-[#10B981] font-bold">1,204</span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER: Feed */}
        <div className="col-span-1 md:col-span-6 space-y-5">
          
          {/* Create Post Widget */}
          <div className="card p-5">
            <div className="flex gap-4 mb-4">
               <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-xl">👨‍💻</div>
               <input className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-6 text-sm font-semibold hover:bg-white focus:bg-white focus:border-[#0F172A] transition-all cursor-pointer text-left outline-none" placeholder="Share your knowledge, Mukesh..." />
            </div>
            <div className="flex justify-between px-2">
                <button className="flex items-center gap-2 text-slate-600 hover:bg-slate-50 px-3 py-2 rounded-lg font-semibold text-sm transition"><ImageIcon className="text-blue-500 w-5 h-5" /> Media</button>
                <button className="flex items-center gap-2 text-slate-600 hover:bg-slate-50 px-3 py-2 rounded-lg font-semibold text-sm transition"><Calendar className="text-orange-500 w-5 h-5" /> Event</button>
                <button className="flex items-center gap-2 text-slate-600 hover:bg-slate-50 px-3 py-2 rounded-lg font-semibold text-sm transition"><Newspaper className="text-red-500 w-5 h-5" /> Article</button>
            </div>
          </div>

          {/* MOCK POST (Placeholder) */}
          <div className="card">
             <div className="p-4 flex justify-between items-start">
                <div className="flex gap-3">
                    <div className="w-12 h-12 bg-[#76B900] rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">NV</div>
                    <div>
                        <h3 className="font-bold text-sm text-slate-900 hover:text-[#10B981] cursor-pointer transition">NVIDIA Careers</h3>
                        <p className="text-xs text-slate-500">234,098 followers</p>
                        <p className="text-xs text-slate-400 mt-0.5">2h • 🌐</p>
                    </div>
                </div>
                <button className="text-slate-400 hover:text-slate-900"><MoreHorizontal className="w-5 h-5"/></button>
             </div>
             
             <div className="px-5 pb-3 text-sm text-slate-800 leading-relaxed">
                 We are hiring! Looking for Senior AI Engineers to join our Deep Learning team. <br/>
                 <span className="text-[#10B981] font-semibold">#AI #NVIDIA #Hiring #DataHire</span>
             </div>
             
             <div className="w-full h-80 bg-slate-100 flex items-center justify-center text-slate-400 text-sm border-y border-slate-100">
                 [IMAGE: NVIDIA OFFICE]
             </div>
             
             <div className="px-5 py-3 border-b border-slate-100 flex justify-between text-xs text-slate-500 font-medium">
                 <span className="flex items-center gap-1">👍 1,402</span>
                 <span>42 comments • 12 reposts</span>
             </div>
             
             <div className="px-2 py-1 flex justify-between">
                 <button className="flex-1 flex items-center justify-center gap-2 text-slate-600 hover:bg-slate-50 py-3 rounded-lg font-bold text-sm transition"><ThumbsUp className="w-5 h-5" /> Like</button>
                 <button className="flex-1 flex items-center justify-center gap-2 text-slate-600 hover:bg-slate-50 py-3 rounded-lg font-bold text-sm transition"><MessageCircle className="w-5 h-5" /> Comment</button>
                 <button className="flex-1 flex items-center justify-center gap-2 text-slate-600 hover:bg-slate-50 py-3 rounded-lg font-bold text-sm transition"><Share2 className="w-5 h-5" /> Share</button>
                 <button className="flex-1 flex items-center justify-center gap-2 text-slate-600 hover:bg-slate-50 py-3 rounded-lg font-bold text-sm transition"><Send className="w-5 h-5" /> Send</button>
             </div>
          </div>

        </div>

        {/* RIGHT: News */}
        <div className="hidden md:block md:col-span-3">
            <div className="card p-5">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-sm text-slate-900">DataHire News</h2>
                    <span className="text-slate-400 text-xs cursor-pointer hover:text-slate-900">ℹ️</span>
                </div>
                <ul className="space-y-4">
                    <li className="cursor-pointer group">
                        <div className="font-bold text-xs text-slate-700 group-hover:text-[#10B981] transition">• AI Jobs skyrocketing</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Top news • 12,094 readers</div>
                    </li>
                    <li className="cursor-pointer group">
                        <div className="font-bold text-xs text-slate-700 group-hover:text-[#10B981] transition">• Tech hiring freezes thaw</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">14h ago • 5,432 readers</div>
                    </li>
                </ul>
            </div>
            
            <div className="mt-4 text-center text-[10px] text-slate-400">
                DataHire Corp © 2025
            </div>
        </div>

      </main>
    </div>
  );
}