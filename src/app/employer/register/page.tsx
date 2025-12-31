"use client";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Building2, ArrowRight, CheckCircle2, AlertCircle, Loader2, Ban, ChevronLeft, Mail, Briefcase, ChevronDown, Search } from "lucide-react";
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
  
  // Country Code State
  const [countryCode, setCountryCode] = useState({ name: "United States", dial_code: "+1", code: "US" });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // --- CLICK OUTSIDE HANDLER ---
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  // --- FILTER COUNTRIES ---
  const filteredCountries = countryList.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.dial_code.includes(searchQuery)
  );

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
        setStep(2); 
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
        setStep(3); 
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  // 3. Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) { setError("Please accept the terms."); return; }
    setLoading(true); setError("");

    // Combine Code + Number
    const fullPhone = userData.phone_number ? `${countryCode.dial_code} ${userData.phone_number}` : "";

    const payload: any = {
      email, 
      ...userData,
      phone_number: fullPhone, 
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

  // Reusable Classes
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
                
                {/* --- CUSTOM SEARCHABLE DROPDOWN --- */}
                <div className="relative">
                    <label className={labelClass}>Phone (Optional)</label>
                    <div className="flex gap-3">
                        <div className="relative w-36" ref={dropdownRef}>
                            <button 
                                type="button" 
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full h-[58px] px-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 text-sm font-bold flex items-center justify-between hover:bg-white transition-all"
                            >
                                <span className="truncate">{countryCode.dial_code}</span>
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute top-16 left-0 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-60 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                                    <div className="p-2 border-b border-slate-100 sticky top-0 bg-white">
                                        <div className="flex items-center bg-slate-50 rounded-lg px-3 py-2">
                                            <Search className="w-4 h-4 text-slate-400 mr-2" />
                                            <input 
                                                className="bg-transparent text-xs font-bold w-full outline-none" 
                                                placeholder="Search country..." 
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                    <div className="overflow-y-auto flex-1">
                                        {filteredCountries.map((c: any) => (
                                            <button
                                                key={c.code}
                                                type="button"
                                                onClick={() => {
                                                    setCountryCode(c);
                                                    setIsDropdownOpen(false);
                                                    setSearchQuery("");
                                                }}
                                                className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm flex items-center justify-between"
                                            >
                                                <span className="truncate w-32 font-medium">{c.name}</span>
                                                <span className="text-slate-500 font-bold">{c.dial_code}</span>
                                            </button>
                                        ))}
                                        {filteredCountries.length === 0 && <p className="p-4 text-xs text-center text-slate-400">No country found</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                        <input className={inputClass} type="tel" placeholder="555-000-0000" value={userData.phone_number} onChange={e => setUserData({...userData, phone_number: e.target.value})} />
                    </div>
                </div>

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

// --- FULL 240+ COUNTRY LIST ---
const countryList = [
  {name: "Afghanistan", dial_code: "+93", code: "AF"},
  {name: "Albania", dial_code: "+355", code: "AL"},
  {name: "Algeria", dial_code: "+213", code: "DZ"},
  {name: "American Samoa", dial_code: "+1684", code: "AS"},
  {name: "Andorra", dial_code: "+376", code: "AD"},
  {name: "Angola", dial_code: "+244", code: "AO"},
  {name: "Anguilla", dial_code: "+1264", code: "AI"},
  {name: "Antarctica", dial_code: "+672", code: "AQ"},
  {name: "Antigua and Barbuda", dial_code: "+1268", code: "AG"},
  {name: "Argentina", dial_code: "+54", code: "AR"},
  {name: "Armenia", dial_code: "+374", code: "AM"},
  {name: "Aruba", dial_code: "+297", code: "AW"},
  {name: "Australia", dial_code: "+61", code: "AU"},
  {name: "Austria", dial_code: "+43", code: "AT"},
  {name: "Azerbaijan", dial_code: "+994", code: "AZ"},
  {name: "Bahamas", dial_code: "+1242", code: "BS"},
  {name: "Bahrain", dial_code: "+973", code: "BH"},
  {name: "Bangladesh", dial_code: "+880", code: "BD"},
  {name: "Barbados", dial_code: "+1246", code: "BB"},
  {name: "Belarus", dial_code: "+375", code: "BY"},
  {name: "Belgium", dial_code: "+32", code: "BE"},
  {name: "Belize", dial_code: "+501", code: "BZ"},
  {name: "Benin", dial_code: "+229", code: "BJ"},
  {name: "Bermuda", dial_code: "+1441", code: "BM"},
  {name: "Bhutan", dial_code: "+975", code: "BT"},
  {name: "Bolivia", dial_code: "+591", code: "BO"},
  {name: "Bosnia and Herzegovina", dial_code: "+387", code: "BA"},
  {name: "Botswana", dial_code: "+267", code: "BW"},
  {name: "Brazil", dial_code: "+55", code: "BR"},
  {name: "British Indian Ocean Territory", dial_code: "+246", code: "IO"},
  {name: "Brunei Darussalam", dial_code: "+673", code: "BN"},
  {name: "Bulgaria", dial_code: "+359", code: "BG"},
  {name: "Burkina Faso", dial_code: "+226", code: "BF"},
  {name: "Burundi", dial_code: "+257", code: "BI"},
  {name: "Cambodia", dial_code: "+855", code: "KH"},
  {name: "Cameroon", dial_code: "+237", code: "CM"},
  {name: "Canada", dial_code: "+1", code: "CA"},
  {name: "Cape Verde", dial_code: "+238", code: "CV"},
  {name: "Cayman Islands", dial_code: "+1345", code: "KY"},
  {name: "Central African Republic", dial_code: "+236", code: "CF"},
  {name: "Chad", dial_code: "+235", code: "TD"},
  {name: "Chile", dial_code: "+56", code: "CL"},
  {name: "China", dial_code: "+86", code: "CN"},
  {name: "Christmas Island", dial_code: "+61", code: "CX"},
  {name: "Cocos (Keeling) Islands", dial_code: "+61", code: "CC"},
  {name: "Colombia", dial_code: "+57", code: "CO"},
  {name: "Comoros", dial_code: "+269", code: "KM"},
  {name: "Congo", dial_code: "+242", code: "CG"},
  {name: "Congo, The Democratic Republic of the", dial_code: "+243", code: "CD"},
  {name: "Cook Islands", dial_code: "+682", code: "CK"},
  {name: "Costa Rica", dial_code: "+506", code: "CR"},
  {name: "Cote d'Ivoire", dial_code: "+225", code: "CI"},
  {name: "Croatia", dial_code: "+385", code: "HR"},
  {name: "Cuba", dial_code: "+53", code: "CU"},
  {name: "Cyprus", dial_code: "+357", code: "CY"},
  {name: "Czech Republic", dial_code: "+420", code: "CZ"},
  {name: "Denmark", dial_code: "+45", code: "DK"},
  {name: "Djibouti", dial_code: "+253", code: "DJ"},
  {name: "Dominica", dial_code: "+1767", code: "DM"},
  {name: "Dominican Republic", dial_code: "+1849", code: "DO"},
  {name: "Ecuador", dial_code: "+593", code: "EC"},
  {name: "Egypt", dial_code: "+20", code: "EG"},
  {name: "El Salvador", dial_code: "+503", code: "SV"},
  {name: "Equatorial Guinea", dial_code: "+240", code: "GQ"},
  {name: "Eritrea", dial_code: "+291", code: "ER"},
  {name: "Estonia", dial_code: "+372", code: "EE"},
  {name: "Ethiopia", dial_code: "+251", code: "ET"},
  {name: "Falkland Islands (Malvinas)", dial_code: "+500", code: "FK"},
  {name: "Faroe Islands", dial_code: "+298", code: "FO"},
  {name: "Fiji", dial_code: "+679", code: "FJ"},
  {name: "Finland", dial_code: "+358", code: "FI"},
  {name: "France", dial_code: "+33", code: "FR"},
  {name: "French Guiana", dial_code: "+594", code: "GF"},
  {name: "French Polynesia", dial_code: "+689", code: "PF"},
  {name: "Gabon", dial_code: "+241", code: "GA"},
  {name: "Gambia", dial_code: "+220", code: "GM"},
  {name: "Georgia", dial_code: "+995", code: "GE"},
  {name: "Germany", dial_code: "+49", code: "DE"},
  {name: "Ghana", dial_code: "+233", code: "GH"},
  {name: "Gibraltar", dial_code: "+350", code: "GI"},
  {name: "Greece", dial_code: "+30", code: "GR"},
  {name: "Greenland", dial_code: "+299", code: "GL"},
  {name: "Grenada", dial_code: "+1473", code: "GD"},
  {name: "Guadeloupe", dial_code: "+590", code: "GP"},
  {name: "Guam", dial_code: "+1671", code: "GU"},
  {name: "Guatemala", dial_code: "+502", code: "GT"},
  {name: "Guernsey", dial_code: "+44", code: "GG"},
  {name: "Guinea", dial_code: "+224", code: "GN"},
  {name: "Guinea-Bissau", dial_code: "+245", code: "GW"},
  {name: "Guyana", dial_code: "+592", code: "GY"},
  {name: "Haiti", dial_code: "+509", code: "HT"},
  {name: "Honduras", dial_code: "+504", code: "HN"},
  {name: "Hong Kong", dial_code: "+852", code: "HK"},
  {name: "Hungary", dial_code: "+36", code: "HU"},
  {name: "Iceland", dial_code: "+354", code: "IS"},
  {name: "India", dial_code: "+91", code: "IN"},
  {name: "Indonesia", dial_code: "+62", code: "ID"},
  {name: "Iran", dial_code: "+98", code: "IR"},
  {name: "Iraq", dial_code: "+964", code: "IQ"},
  {name: "Ireland", dial_code: "+353", code: "IE"},
  {name: "Isle of Man", dial_code: "+44", code: "IM"},
  {name: "Israel", dial_code: "+972", code: "IL"},
  {name: "Italy", dial_code: "+39", code: "IT"},
  {name: "Jamaica", dial_code: "+1876", code: "JM"},
  {name: "Japan", dial_code: "+81", code: "JP"},
  {name: "Jersey", dial_code: "+44", code: "JE"},
  {name: "Jordan", dial_code: "+962", code: "JO"},
  {name: "Kazakhstan", dial_code: "+7", code: "KZ"},
  {name: "Kenya", dial_code: "+254", code: "KE"},
  {name: "Kiribati", dial_code: "+686", code: "KI"},
  {name: "Kuwait", dial_code: "+965", code: "KW"},
  {name: "Kyrgyzstan", dial_code: "+996", code: "KG"},
  {name: "Laos", dial_code: "+856", code: "LA"},
  {name: "Latvia", dial_code: "+371", code: "LV"},
  {name: "Lebanon", dial_code: "+961", code: "LB"},
  {name: "Lesotho", dial_code: "+266", code: "LS"},
  {name: "Liberia", dial_code: "+231", code: "LR"},
  {name: "Libya", dial_code: "+218", code: "LY"},
  {name: "Liechtenstein", dial_code: "+423", code: "LI"},
  {name: "Lithuania", dial_code: "+370", code: "LT"},
  {name: "Luxembourg", dial_code: "+352", code: "LU"},
  {name: "Macau", dial_code: "+853", code: "MO"},
  {name: "Macedonia", dial_code: "+389", code: "MK"},
  {name: "Madagascar", dial_code: "+261", code: "MG"},
  {name: "Malawi", dial_code: "+265", code: "MW"},
  {name: "Malaysia", dial_code: "+60", code: "MY"},
  {name: "Maldives", dial_code: "+960", code: "MV"},
  {name: "Mali", dial_code: "+223", code: "ML"},
  {name: "Malta", dial_code: "+356", code: "MT"},
  {name: "Marshall Islands", dial_code: "+692", code: "MH"},
  {name: "Martinique", dial_code: "+596", code: "MQ"},
  {name: "Mauritania", dial_code: "+222", code: "MR"},
  {name: "Mauritius", dial_code: "+230", code: "MU"},
  {name: "Mayotte", dial_code: "+262", code: "YT"},
  {name: "Mexico", dial_code: "+52", code: "MX"},
  {name: "Micronesia", dial_code: "+691", code: "FM"},
  {name: "Moldova", dial_code: "+373", code: "MD"},
  {name: "Monaco", dial_code: "+377", code: "MC"},
  {name: "Mongolia", dial_code: "+976", code: "MN"},
  {name: "Montenegro", dial_code: "+382", code: "ME"},
  {name: "Montserrat", dial_code: "+1664", code: "MS"},
  {name: "Morocco", dial_code: "+212", code: "MA"},
  {name: "Mozambique", dial_code: "+258", code: "MZ"},
  {name: "Myanmar", dial_code: "+95", code: "MM"},
  {name: "Namibia", dial_code: "+264", code: "NA"},
  {name: "Nauru", dial_code: "+674", code: "NR"},
  {name: "Nepal", dial_code: "+977", code: "NP"},
  {name: "Netherlands", dial_code: "+31", code: "NL"},
  {name: "New Caledonia", dial_code: "+687", code: "NC"},
  {name: "New Zealand", dial_code: "+64", code: "NZ"},
  {name: "Nicaragua", dial_code: "+505", code: "NI"},
  {name: "Niger", dial_code: "+227", code: "NE"},
  {name: "Nigeria", dial_code: "+234", code: "NG"},
  {name: "Niue", dial_code: "+683", code: "NU"},
  {name: "Norfolk Island", dial_code: "+672", code: "NF"},
  {name: "North Korea", dial_code: "+850", code: "KP"},
  {name: "Northern Mariana Islands", dial_code: "+1670", code: "MP"},
  {name: "Norway", dial_code: "+47", code: "NO"},
  {name: "Oman", dial_code: "+968", code: "OM"},
  {name: "Pakistan", dial_code: "+92", code: "PK"},
  {name: "Palau", dial_code: "+680", code: "PW"},
  {name: "Palestine", dial_code: "+970", code: "PS"},
  {name: "Panama", dial_code: "+507", code: "PA"},
  {name: "Papua New Guinea", dial_code: "+675", code: "PG"},
  {name: "Paraguay", dial_code: "+595", code: "PY"},
  {name: "Peru", dial_code: "+51", code: "PE"},
  {name: "Philippines", dial_code: "+63", code: "PH"},
  {name: "Poland", dial_code: "+48", code: "PL"},
  {name: "Portugal", dial_code: "+351", code: "PT"},
  {name: "Puerto Rico", dial_code: "+1939", code: "PR"},
  {name: "Qatar", dial_code: "+974", code: "QA"},
  {name: "Reunion", dial_code: "+262", code: "RE"},
  {name: "Romania", dial_code: "+40", code: "RO"},
  {name: "Russia", dial_code: "+7", code: "RU"},
  {name: "Rwanda", dial_code: "+250", code: "RW"},
  {name: "Saint Barthelemy", dial_code: "+590", code: "BL"},
  {name: "Saint Helena", dial_code: "+290", code: "SH"},
  {name: "Saint Kitts and Nevis", dial_code: "+1869", code: "KN"},
  {name: "Saint Lucia", dial_code: "+1758", code: "LC"},
  {name: "Saint Martin", dial_code: "+590", code: "MF"},
  {name: "Saint Pierre and Miquelon", dial_code: "+508", code: "PM"},
  {name: "Saint Vincent and the Grenadines", dial_code: "+1784", code: "VC"},
  {name: "Samoa", dial_code: "+685", code: "WS"},
  {name: "San Marino", dial_code: "+378", code: "SM"},
  {name: "Sao Tome and Principe", dial_code: "+239", code: "ST"},
  {name: "Saudi Arabia", dial_code: "+966", code: "SA"},
  {name: "Senegal", dial_code: "+221", code: "SN"},
  {name: "Serbia", dial_code: "+381", code: "RS"},
  {name: "Seychelles", dial_code: "+248", code: "SC"},
  {name: "Sierra Leone", dial_code: "+232", code: "SL"},
  {name: "Singapore", dial_code: "+65", code: "SG"},
  {name: "Sint Maarten", dial_code: "+1721", code: "SX"},
  {name: "Slovakia", dial_code: "+421", code: "SK"},
  {name: "Slovenia", dial_code: "+386", code: "SI"},
  {name: "Solomon Islands", dial_code: "+677", code: "SB"},
  {name: "Somalia", dial_code: "+252", code: "SO"},
  {name: "South Africa", dial_code: "+27", code: "ZA"},
  {name: "South Korea", dial_code: "+82", code: "KR"},
  {name: "South Sudan", dial_code: "+211", code: "SS"},
  {name: "Spain", dial_code: "+34", code: "ES"},
  {name: "Sri Lanka", dial_code: "+94", code: "LK"},
  {name: "Sudan", dial_code: "+249", code: "SD"},
  {name: "Suriname", dial_code: "+597", code: "SR"},
  {name: "Svalbard and Jan Mayen", dial_code: "+47", code: "SJ"},
  {name: "Swaziland", dial_code: "+268", code: "SZ"},
  {name: "Sweden", dial_code: "+46", code: "SE"},
  {name: "Switzerland", dial_code: "+41", code: "CH"},
  {name: "Syria", dial_code: "+963", code: "SY"},
  {name: "Taiwan", dial_code: "+886", code: "TW"},
  {name: "Tajikistan", dial_code: "+992", code: "TJ"},
  {name: "Tanzania", dial_code: "+255", code: "TZ"},
  {name: "Thailand", dial_code: "+66", code: "TH"},
  {name: "Timor-Leste", dial_code: "+670", code: "TL"},
  {name: "Togo", dial_code: "+228", code: "TG"},
  {name: "Tokelau", dial_code: "+690", code: "TK"},
  {name: "Tonga", dial_code: "+676", code: "TO"},
  {name: "Trinidad and Tobago", dial_code: "+1868", code: "TT"},
  {name: "Tunisia", dial_code: "+216", code: "TN"},
  {name: "Turkey", dial_code: "+90", code: "TR"},
  {name: "Turkmenistan", dial_code: "+993", code: "TM"},
  {name: "Turks and Caicos Islands", dial_code: "+1649", code: "TC"},
  {name: "Tuvalu", dial_code: "+688", code: "TV"},
  {name: "Uganda", dial_code: "+256", code: "UG"},
  {name: "Ukraine", dial_code: "+380", code: "UA"},
  {name: "United Arab Emirates", dial_code: "+971", code: "AE"},
  {name: "United Kingdom", dial_code: "+44", code: "GB"},
  {name: "United States", dial_code: "+1", code: "US"},
  {name: "Uruguay", dial_code: "+598", code: "UY"},
  {name: "Uzbekistan", dial_code: "+998", code: "UZ"},
  {name: "Vanuatu", dial_code: "+678", code: "VU"},
  {name: "Venezuela", dial_code: "+58", code: "VE"},
  {name: "Vietnam", dial_code: "+84", code: "VN"},
  {name: "Virgin Islands, British", dial_code: "+1284", code: "VG"},
  {name: "Virgin Islands, U.S.", dial_code: "+1340", code: "VI"},
  {name: "Wallis and Futuna", dial_code: "+681", code: "WF"},
  {name: "Yemen", dial_code: "+967", code: "YE"},
  {name: "Zambia", dial_code: "+260", code: "ZM"},
  {name: "Zimbabwe", dial_code: "+263", code: "ZW"}
];