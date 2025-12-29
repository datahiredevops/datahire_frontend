"use client";
import { useState } from "react";
import { Check, X, Sparkles, Zap, Trophy, Crown } from "lucide-react";

export default function PricingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [status, setStatus] = useState<"select" | "loading" | "success">("select");
  const [selectedPlan, setSelectedPlan] = useState("");

  if (!isOpen) return null;

  const handleSelect = (planName: string) => {
    setSelectedPlan(planName);
    setStatus("loading");
    // Fake API delay to make it feel real
    setTimeout(() => {
      setStatus("success");
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Crown className="w-6 h-6 text-purple-600" /> Upgrade to Premium
            </h2>
            <p className="text-sm text-slate-500">Unlock the full power of AI to get hired faster.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="p-6 overflow-y-auto bg-slate-50/50 flex-1">
          
          {status === "select" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* PLAN 1: WEEKLY */}
              <PlanCard 
                title="The Sprint" 
                price="$5" 
                period="/ week" 
                description="Perfect for a busy interview week."
                icon={<Zap className="w-6 h-6 text-blue-500"/>}
                features={[
                  "15 Resume Slots",
                  "Unlimited Mock Interviews",
                  "10 Auto-Applies / day",
                  "Unlimited Cover Letters"
                ]}
                btnColor="bg-blue-600 hover:bg-blue-700"
                onClick={() => handleSelect("Weekly")}
              />

              {/* PLAN 2: MONTHLY (HIGHLIGHTED) */}
              <PlanCard 
                title="The Job Hunter" 
                price="$15" 
                period="/ month" 
                description="Most popular. Keep applying until you win."
                icon={<Sparkles className="w-6 h-6 text-purple-500"/>}
                features={[
                  "50 Resume Slots",
                  "Unlimited Mock Interviews",
                  "50 Auto-Applies / day",
                  "Unlimited Cover Letters",
                  "Priority AI Processing"
                ]}
                isPopular
                btnColor="bg-purple-600 hover:bg-purple-700"
                onClick={() => handleSelect("Monthly")}
              />

              {/* PLAN 3: ANNUAL */}
              <PlanCard 
                title="Career Builder" 
                price="$100" 
                period="/ year" 
                description="Stay market-ready all year round."
                icon={<Trophy className="w-6 h-6 text-yellow-500"/>}
                features={[
                  "Unlimited Resumes",
                  "Unlimited Mock Interviews",
                  "Unlimited Auto-Applies",
                  "Human Resume Review (Beta)",
                  "Early Access to New Features"
                ]}
                btnColor="bg-slate-800 hover:bg-slate-900"
                onClick={() => handleSelect("Annual")}
              />
            </div>
          )}

          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-6"></div>
              <h3 className="text-xl font-bold text-slate-900">Setting up your account...</h3>
              <p className="text-slate-500">Unlocking {selectedPlan} features.</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in max-w-lg mx-auto">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Sparkles className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">You're on the list! 🚀</h3>
              <p className="text-slate-600 mb-6 text-lg">
                We are currently in <b>Private Beta</b>. We've added you to the priority access list for the <b>{selectedPlan} Plan</b>.
              </p>
              <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl text-left w-full mb-6">
                <p className="text-sm font-bold text-purple-900 mb-1">🎁 A Gift for Waiting</p>
                <p className="text-sm text-purple-700">
                  As a thank you, we've unlocked <b>1 Extra Resume Slot</b> on your account for free. Enjoy!
                </p>
              </div>
              <button onClick={onClose} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg">
                Continue to Dashboard
              </button>
            </div>
          )}

        </div>
        
        {/* FOOTER */}
        {status === 'select' && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
                <p className="text-xs text-slate-400">Secure payment powered by Stripe. Cancel anytime.</p>
            </div>
        )}
      </div>
    </div>
  );
}

function PlanCard({ title, price, period, description, icon, features, isPopular, btnColor, onClick }: any) {
  return (
    <div className={`relative bg-white rounded-2xl p-6 border transition-all hover:scale-[1.02] flex flex-col ${isPopular ? 'border-purple-500 shadow-xl shadow-purple-100 ring-1 ring-purple-500' : 'border-slate-200 shadow-sm hover:shadow-md'}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
          Most Popular
        </div>
      )}
      
      <div className="mb-4">
        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
            {icon}
        </div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 mt-1 h-8">{description}</p>
      </div>

      <div className="mb-6">
        <span className="text-3xl font-black text-slate-900">{price}</span>
        <span className="text-sm font-medium text-slate-400">{period}</span>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feat: string, i: number) => (
          <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
            <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
            <span className="leading-tight">{feat}</span>
          </li>
        ))}
      </ul>

      <button onClick={onClick} className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${btnColor}`}>
        Select Plan
      </button>
    </div>
  );
}