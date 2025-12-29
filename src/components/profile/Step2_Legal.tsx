"use client";
import { Check } from "lucide-react";

export default function Step2_Legal({ data, update }: any) {
  
  const stageOptions = [
    "Student",
    "Recent Graduate",
    "Career Changer",
    "Restarting Career",
    "Laid Off / Immediately Available",
    "Professional / Passive Seeker"
  ];

  const employmentOptions = [
    "Unemployed and really need a job",
    "Unemployed but not stressed about it",
    "Badly employed and in need of a job switch",
    "Employed but open to greener pastures"
  ];

  const experienceOptions = [
    "Intern",
    "Entry-level (0-2 years)",
    "Junior/associate (1-3 years)",
    "Mid-level (3-5 years)",
    "Senior/lead (5+ years)",
    "Executive (7+ years)"
  ];

  const toggleExperience = (option: string) => {
    const current = data.target_experience_level || [];
    if (current.includes(option)) {
      update({ ...data, target_experience_level: current.filter((i: string) => i !== option) });
    } else {
      update({ ...data, target_experience_level: [...current, option] });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. NEW: CAREER STAGE */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Current Career Stage</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {stageOptions.map((option) => (
            <div 
              key={option}
              onClick={() => update({ ...data, career_stage: option })}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                data.career_stage === option 
                  ? "border-[#0F172A] bg-slate-50" 
                  : "border-slate-100 hover:border-slate-300"
              }`}
            >
              <span className="font-medium text-slate-700 text-sm">{option}</span>
              {data.career_stage === option && <div className="w-5 h-5 bg-[#0F172A] rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-white"/></div>}
            </div>
          ))}
        </div>
      </div>

      {/* 2. EMPLOYMENT STATUS */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Current Employment Status</h2>
        <div className="space-y-3">
          {employmentOptions.map((option) => (
            <div 
              key={option}
              onClick={() => update({ ...data, current_employment_status: option })}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                data.current_employment_status === option 
                  ? "border-[#0F172A] bg-slate-50" 
                  : "border-slate-100 hover:border-slate-300"
              }`}
            >
              <span className="font-medium text-slate-700 text-sm">{option}</span>
              {data.current_employment_status === option && <div className="w-5 h-5 bg-[#0F172A] rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-white"/></div>}
            </div>
          ))}
        </div>
      </div>

      {/* 3. TARGET EXPERIENCE LEVEL */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Target Experience Level</h2>
        <div className="space-y-3">
          {experienceOptions.map((option) => {
            const isSelected = (data.target_experience_level || []).includes(option);
            return (
              <div 
                key={option}
                onClick={() => toggleExperience(option)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                  isSelected ? "border-[#0F172A] bg-slate-50" : "border-slate-100 hover:border-slate-300"
                }`}
              >
                <span className="font-medium text-slate-700 text-sm">{option}</span>
                <div className={`w-5 h-5 rounded flex items-center justify-center border ${isSelected ? "bg-[#0F172A] border-[#0F172A]" : "border-slate-300"}`}>
                   {isSelected && <Check className="w-3 h-3 text-white"/>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. WORK AUTH */}
      <div className="pt-8 border-t border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Work Authorization</h2>
        <div className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">Work Authorization Status</label>
                <select 
                    value={data.work_auth || "US Citizen"} 
                    onChange={(e) => update({ ...data, work_auth: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#0F172A]"
                >
                    <option value="US Citizen">US Citizen</option>
                    <option value="Green Card">Green Card</option>
                    <option value="H1B">H1B Visa</option>
                    <option value="OPT/CPT">OPT/CPT</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div className="flex items-center gap-3 p-4 border border-slate-100 rounded-xl">
                <input type="checkbox" checked={data.requires_sponsorship} onChange={(e) => update({ ...data, requires_sponsorship: e.target.checked })} className="w-5 h-5 accent-[#0F172A]"/>
                <span className="text-sm text-slate-700 font-medium">I require visa sponsorship now or in the future</span>
            </div>
            <div className="flex items-center gap-3 p-4 border border-slate-100 rounded-xl">
                <input type="checkbox" checked={data.willing_to_relocate} onChange={(e) => update({ ...data, willing_to_relocate: e.target.checked })} className="w-5 h-5 accent-[#0F172A]"/>
                <span className="text-sm text-slate-700 font-medium">I am willing to relocate for the right role</span>
            </div>
        </div>
      </div>

    </div>
  );
}