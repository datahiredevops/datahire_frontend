"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Building2, ArrowRight, CheckCircle2, AlertCircle, Loader2, Ban, ChevronLeft, Mail, Briefcase } from "lucide-react";
import Link from "next/link";

export default function EmployerRegisterPage() {
  const { login } = useAuth();
  
  // STEPS: 1=Email, 2=OTP, 3=Company/Join, 4=UserDetails
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // STATE
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [domainStatus, setDomainStatus] = useState<"new_company" | "company_found" | "public_domain" | null>(null);
  const [existingCompany, setExistingCompany] = useState<any>(null);

  // FORM DATA
  const [companyData, setCompanyData] = useState({
    name: "", website: "", industry: "", size: "1-10", description: "", 
    headquarters: "", founded_year: "", registration_number: ""
  });
  
  const [userData, setUserData] = useState({
    first_name: "", last_name: "", password: "", job_title: "", phone_number: ""
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // --- ACTIONS ---

  // 1. Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true); setError("");
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employer/send-otp`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });
        if (!res.ok) throw new Error("Failed to send code");
        setStep(2); // Go to OTP Step
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  // 2. Verify OTP & Check Domain
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employer/verify-otp`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code: otp })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Invalid Code");

        setDomainStatus(data.status);
        if (data.status === "company_found") setExistingCompany(data.company);
        setStep(3); // Go to Company Logic
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  // 3. Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) { setError("Please accept the terms."); return; }
    setLoading(true); setError("");

    const payload: any = {
      email, ...userData,
      company_id: existingCompany?.id || null,
      company: domainStatus === "new_company" ? companyData : null
    };

    try {
      const regRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employer/register`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const regData = await regRes.json();
      if (!regRes.ok) throw new Error(regData.detail || "Registration failed");

      const loginRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/login`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password: userData.password }),
      });
      const loginData = await loginRes.json();
      login(loginData.access_token, loginData.user); 
    } catch (err: any) { setError(err.message); setLoading(false); }
  };

  // Reusable Classes (Now applied directly)
  const inputClass = "w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 text-sm font-bold focus:ring-2 focus:ring-[#0F172A] focus:border-[#0F172A] focus:bg-white outline-none transition-all placeholder:text-slate-400";
  const labelClass = "text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1.5 block";
  const btnClass = "w-full py-4 bg-[#0F172A] text-white font-bold text-lg rounded-xl hover:bg-slate-800 transition shadow-lg shadow-slate-900/10 disabled:opacity-70 flex items-center justify-center gap-2";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 font-sans">
      
      {/* HEADER */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0F172A] text-white text-2xl font-bold mb-4 shadow-xl">D</div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">DataHire for Employers</h1>
      </div>

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative">
        
        {/* PROGRESS BAR */}
        <div className="h-1.5 w-full bg-slate-100">
            <div className="h-full bg-[#0F172A] transition-all duration-500 ease-out" style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>

        <div className="p-8 md:p-10">
          
          {/* BACK BUTTON */}
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="absolute top-6 left-6 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition">
                <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {error && <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-xl flex items-center gap-3"><AlertCircle className="w-5 h-5 shrink-0" /> {error}</div>}

          {/* --- STEP 1: EMAIL --- */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-8 mt-2">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900">Let's find your team</h2>
                    <p className="text-slate-500 mt-2">Enter your work email to get started.</p>
                </div>
                <div className="text-left">
                    <label className={labelClass}>Work Email</label>
                    <input type="email" required className={inputClass} placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)}/>
                </div>
                <button disabled={loading} className={btnClass}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <>Send Verification Code <ArrowRight className="w-5 h-5"/></>}
                </button>
            </form>
          )}

          {/* --- STEP 2: OTP --- */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-8 mt-2 text-center">
                <div>
                    <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"><Mail className="w-8 h-8" /></div>
                    <h2 className="text-2xl font-bold text-slate-900">Check your email</h2>
                    <p className="text-slate-500 mt-2">We sent a 4-digit code to <b>{email}</b></p>
                </div>
                <div className="text-left">
                    <label className={labelClass}>Verification Code</label>
                    <input type="text" required maxLength={4} className={`${inputClass} text-center text-3xl tracking-[0.5em] font-mono h-16`} placeholder="0000" value={otp} onChange={(e) => setOtp(e.target.value)}/>
                </div>
                <button disabled={loading} className={btnClass}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : "Verify & Continue"}
                </button>
            </form>
          )}

          {/* --- STEP 3: COMPANY --- */}
          {step === 3 && (
             <div className="space-y-6 mt-4">
                {domainStatus === "company_found" && (
                    <div className="text-center">
                        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><Building2 className="w-10 h-10" /></div>
                        <h2 className="text-2xl font-bold text-slate-900">We found {existingCompany.name}!</h2>
                        <button onClick={() => setStep(4)} className={`${btnClass} mt-8 bg-green-600 hover:bg-green-700`}>Join {existingCompany.name}</button>
                    </div>
                )}
                {domainStatus === "public_domain" && (
                    <div className="text-center">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><Ban className="w-10 h-10" /></div>
                        <h2 className="text-2xl font-bold text-slate-900">Work Email Required</h2>
                        <p className="text-slate-500 mt-2">Please use an official company email.</p>
                        <button onClick={() => setStep(1)} className="mt-8 w-full py-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200">Try Again</button>
                    </div>
                )}
                {domainStatus === "new_company" && (
                    <div className="space-y-5">
                        <h2 className="text-xl font-bold text-slate-900 text-center mb-6">Create Company Profile</h2>
                        
                        <div><label className={labelClass}>Company Name</label><input className={inputClass} required value={companyData.name} onChange={e => setCompanyData({...companyData, name: e.target.value})} /></div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className={labelClass}>Website</label><input className={inputClass} value={companyData.website} onChange={e => setCompanyData({...companyData, website: e.target.value})} /></div>
                            <div><label className={labelClass}>Size</label><select className={inputClass} value={companyData.size} onChange={e => setCompanyData({...companyData, size: e.target.value})}><option>1-10</option><option>11-50</option><option>51-200</option><option>201-1000</option><option>1000+</option></select></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div><label className={labelClass}>Established</label><input className={inputClass} placeholder="YYYY" value={companyData.founded_year} onChange={e => setCompanyData({...companyData, founded_year: e.target.value})} /></div>
                            <div><label className={labelClass}>Reg. Number</label><input className={inputClass} placeholder="Optional" value={companyData.registration_number} onChange={e => setCompanyData({...companyData, registration_number: e.target.value})} /></div>
                        </div>
                        <div><label className={labelClass}>Headquarters</label><input className={inputClass} placeholder="City, Country" value={companyData.headquarters} onChange={e => setCompanyData({...companyData, headquarters: e.target.value})} /></div>

                        <div><label className={labelClass}>Industry</label><input className={inputClass} value={companyData.industry} onChange={e => setCompanyData({...companyData, industry: e.target.value})} /></div>
                        
                        <button onClick={() => setStep(4)} disabled={!companyData.name} className={`${btnClass} mt-4`}>Next: Personal Details</button>
                    </div>
                )}
             </div>
          )}

          {/* --- STEP 4: USER DETAILS --- */}
          {step === 4 && (
            <form onSubmit={handleRegister} className="space-y-5 mt-4">
                <h2 className="text-2xl font-bold text-slate-900 text-center mb-6">Create your account</h2>
                
                <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelClass}>First Name</label><input className={inputClass} required value={userData.first_name} onChange={e => setUserData({...userData, first_name: e.target.value})} /></div>
                    <div><label className={labelClass}>Last Name</label><input className={inputClass} required value={userData.last_name} onChange={e => setUserData({...userData, last_name: e.target.value})} /></div>
                </div>
                
                <div><label className={labelClass}>Job Title</label><input className={inputClass} required placeholder="e.g. HR Manager" value={userData.job_title} onChange={e => setUserData({...userData, job_title: e.target.value})} /></div>
                <div><label className={labelClass}>Phone</label><input className={inputClass} type="tel" value={userData.phone_number} onChange={e => setUserData({...userData, phone_number: e.target.value})} /></div>
                <div><label className={labelClass}>Password</label><input className={inputClass} type="password" required value={userData.password} onChange={e => setUserData({...userData, password: e.target.value})} /></div>
                
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <input type="checkbox" required checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} className="mt-1 w-5 h-5 accent-[#0F172A]" />
                    <p className="text-xs text-slate-600 font-medium">I accept the Terms of Service and Privacy Policy.</p>
                </div>

                <button type="submit" disabled={loading} className={btnClass}>{loading ? <Loader2 className="animate-spin"/> : "Create Account"}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}