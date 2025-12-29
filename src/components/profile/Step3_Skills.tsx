"use client";
import { useState } from "react";
import { Plus, X, Star, Zap } from "lucide-react";

export default function Step3_Skills({ data, update }: any) {
  const [skillInput, setSkillInput] = useState("");
  const [skillType, setSkillType] = useState("Primary"); // Primary or Secondary

  const addSkill = (e: any) => {
    e.preventDefault();
    if (!skillInput.trim()) return;

    // Add new skill object to array
    const newSkill = {
        name: skillInput,
        skill_type: skillType, // Matches API Enum: "Primary" or "Secondary"
        proficiency: "Intermediate", // Default
        years_experience: 1
    };

    update({ ...data, skills: [...data.skills, newSkill] });
    setSkillInput(""); // Reset input
  };

  const removeSkill = (indexToRemove: number) => {
    update({ 
        ...data, 
        skills: data.skills.filter((_: any, idx: number) => idx !== indexToRemove) 
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Add your Top Skills</h2>
        <p className="text-slate-500">Categorize them so the AI knows what you are best at.</p>
      </div>

      {/* --- ADD SKILL FORM --- */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div className="flex gap-4 items-end">
            <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Skill Name</label>
                <input 
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="e.g. Python"
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-[#0F172A] outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && addSkill(e)}
                />
            </div>
            <div className="w-40">
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Importance</label>
                <select 
                    value={skillType}
                    onChange={(e) => setSkillType(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                >
                    <option value="Primary">Primary (Main)</option>
                    <option value="Secondary">Secondary</option>
                </select>
            </div>
            <button 
                onClick={addSkill}
                className="bg-[#0F172A] text-white p-2 rounded-lg hover:bg-slate-800 transition"
            >
                <Plus className="w-6 h-6" />
            </button>
        </div>
      </div>

      {/* --- SKILL LIST DISPLAY --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          
          {/* Primary Column */}
          <div className="border border-green-100 rounded-xl bg-green-50/50 p-4">
              <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 fill-green-600 text-green-600" /> Primary Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                  {data.skills.filter((s: any) => s.skill_type === "Primary").map((skill: any, idx: number) => (
                      <div key={idx} className="bg-white border border-green-200 text-green-900 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 shadow-sm">
                          {skill.name}
                          <button onClick={() => removeSkill(data.skills.indexOf(skill))} className="text-green-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                      </div>
                  ))}
                  {data.skills.filter((s: any) => s.skill_type === "Primary").length === 0 && (
                      <p className="text-xs text-green-600/60 italic">No primary skills added yet.</p>
                  )}
              </div>
          </div>

          {/* Secondary Column */}
          <div className="border border-slate-200 rounded-xl bg-slate-50/50 p-4">
              <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-slate-500" /> Secondary Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                  {data.skills.filter((s: any) => s.skill_type === "Secondary").map((skill: any, idx: number) => (
                      <div key={idx} className="bg-white border border-slate-300 text-slate-700 px-3 py-1 rounded-full text-sm flex items-center gap-2 shadow-sm">
                          {skill.name}
                          <button onClick={() => removeSkill(data.skills.indexOf(skill))} className="text-slate-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                      </div>
                  ))}
              </div>
          </div>

      </div>
    </div>
  );
}