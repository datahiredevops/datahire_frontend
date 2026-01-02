"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
// REMOVED: import Sidebar from "@/components/Sidebar"; <--- Layout handles this now!

// Import Components
import Step1_Basics from "@/components/profile/Step1_Basics";
import Step2_Legal from "@/components/profile/Step2_Legal";
import Step3_Skills from "@/components/profile/Step3_Skills";
import Step4_History from "@/components/profile/Step4_History";
import Step5_Portfolio from "@/components/profile/Step5_Portfolio";
import Step6_Resume from "@/components/profile/Step6_Resume";
import WizardNavigation from "@/components/profile/WizardNavigation";
import ProfileView from "@/components/profile/ProfileView";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isEditing, setIsEditing] = useState(false); 
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    headline: "", summary: "", city: "", state: "", phone: "", linkedin_url: "", portfolio_url: "",
    work_auth: "US Citizen", requires_sponsorship: false, target_job_titles: "", min_expected_salary: "", notice_period: "Immediate", willing_to_relocate: false, preferred_remote_style: "Hybrid",
    
    // NEW FIELDS
    current_employment_status: "",
    target_experience_level: [] as string[],

    skills: [], experience: [], education: [], projects: [], certifications: [],
    resume_file: null as File | null, resume_file_path: "",
  });

  // 1. Fetch Profile & Decide Mode
  useEffect(() => {
    if (user?.id) {
      setCheckingProfile(true);
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.profile) {
            setProfileData(prev => ({ ...prev, ...data.profile }));
            
            const p = data.profile;
            const hasData = 
                p.headline || 
                p.summary || 
                p.city || 
                p.phone || 
                p.resume_file_path || 
                (p.skills && p.skills.length > 0) || 
                (p.experience && p.experience.length > 0);
            
            if (hasData) setIsEditing(false); 
            else setIsEditing(true);
            
          } else {
            setIsEditing(true);
          }
        })
        .catch(err => console.error("Failed to load profile", err))
        .finally(() => setTimeout(() => setCheckingProfile(false), 300));
    }
  }, [user]);

  // 2. Save Logic
  const saveAndNext = async (finish = false) => {
    if (!user?.id) return;
    setLoading(true);
    
    try {
      // Upload Resume
      if (profileData.resume_file) {
        const formData = new FormData();
        formData.append("file", profileData.resume_file);
        
        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.id}/resumes`, {
            method: "POST", body: formData
        });
        
        if (!uploadRes.ok) console.error("Resume upload failed");
        setProfileData(prev => ({ ...prev, resume_file: null }));
      }

      // REMOVE FILE OBJECT BEFORE SENDING JSON
      const { resume_file, ...cleanProfileData } = profileData;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanProfileData),
      });

      if (!res.ok) throw new Error("Save failed");

      if (finish) {
        setIsEditing(false); 
        window.scrollTo(0, 0);
      } else {
        setCurrentStep(prev => prev + 1);
        window.scrollTo(0, 0);
      }
      
    } catch (error: any) {
      alert(`Error saving profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || checkingProfile || !user) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#0F172A] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium">Loading Profile...</p>
            </div>
        </div>
      );
  }

  // FIX: Main Container uses w-full h-full overflow-y-auto to respect the Layout
  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50 font-sans p-8">
        
        {/* VIEW MODE */}
        {!isEditing ? (
            <ProfileView data={profileData} user={user} onEdit={() => setIsEditing(true)} />
        ) : (
            /* WIZARD MODE */
            <div className="max-w-3xl mx-auto pb-20">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Complete Your Profile</h1>
                    <p className="text-slate-500">Step {currentStep} of 6</p>
                </div>

                <div className="mb-8 flex gap-2">
                    {[1, 2, 3, 4, 5, 6].map((step) => (
                    <div key={step} className={`h-2 flex-1 rounded-full transition-all ${step <= currentStep ? 'bg-[#0F172A]' : 'bg-slate-200'}`} />
                    ))}
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 min-h-[400px]">
                    {currentStep === 1 && <Step1_Basics data={profileData} update={setProfileData} onNext={() => setCurrentStep(2)} />}
                    {currentStep === 2 && <><Step2_Legal data={profileData} update={setProfileData} /><WizardNavigation onBack={() => setCurrentStep(1)} onNext={() => saveAndNext()} loading={loading}/></>}
                    {currentStep === 3 && <><Step3_Skills data={profileData} update={setProfileData} /><WizardNavigation onBack={() => setCurrentStep(2)} onNext={() => saveAndNext()} loading={loading}/></>}
                    {currentStep === 4 && <><Step4_History data={profileData} update={setProfileData} /><WizardNavigation onBack={() => setCurrentStep(3)} onNext={() => saveAndNext()} loading={loading}/></>}
                    {currentStep === 5 && <><Step5_Portfolio data={profileData} update={setProfileData} /><WizardNavigation onBack={() => setCurrentStep(4)} onNext={() => saveAndNext()} loading={loading}/></>}
                    {currentStep === 6 && <><Step6_Resume data={profileData} update={setProfileData} /><WizardNavigation onBack={() => setCurrentStep(5)} onNext={() => saveAndNext(true)} isLastStep loading={loading}/></>}
                </div>
            </div>
        )}
    </div>
  );
}
