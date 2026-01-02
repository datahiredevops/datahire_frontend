"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { ChevronDown, Search, Briefcase } from "lucide-react";

// --- COUNTRY DATA (Shortened for brevity, but keep your full list) ---
const COUNTRY_CODES = [
{ name: "United States", code: "US", dial_code: "+1", flag: "🇺🇸" },
{ name: "United Kingdom", code: "GB", dial_code: "+44", flag: "🇬🇧" },
{ name: "Canada", code: "CA", dial_code: "+1", flag: "🇨🇦" },
{ name: "India", code: "IN", dial_code: "+91", flag: "🇮🇳" },
{ name: "Australia", code: "AU", dial_code: "+61", flag: "🇦🇺" },
{ name: "Germany", code: "DE", dial_code: "+49", flag: "🇩🇪" },
{ name: "France", code: "FR", dial_code: "+33", flag: "🇫🇷" },
{ name: "Japan", code: "JP", dial_code: "+81", flag: "🇯🇵" },
{ name: "China", code: "CN", dial_code: "+86", flag: "🇨🇳" },
{ name: "Brazil", code: "BR", dial_code: "+55", flag: "🇧🇷" },
{ name: "Mexico", code: "MX", dial_code: "+52", flag: "🇲🇽" },
{ name: "Russia", code: "RU", dial_code: "+7", flag: "🇷🇺" },
{ name: "South Africa", code: "ZA", dial_code: "+27", flag: "🇿🇦" },
{ name: "Afghanistan", code: "AF", dial_code: "+93", flag: "🇦🇫" },
{ name: "Albania", code: "AL", dial_code: "+355", flag: "🇦🇱" },
{ name: "Algeria", code: "DZ", dial_code: "+213", flag: "🇩🇿" },
{ name: "Andorra", code: "AD", dial_code: "+376", flag: "🇦🇩" },
{ name: "Angola", code: "AO", dial_code: "+244", flag: "🇦🇴" },
{ name: "Argentina", code: "AR", dial_code: "+54", flag: "🇦🇷" },
{ name: "Armenia", code: "AM", dial_code: "+374", flag: "🇦🇲" },
{ name: "Austria", code: "AT", dial_code: "+43", flag: "🇦🇹" },
{ name: "Azerbaijan", code: "AZ", dial_code: "+994", flag: "🇦🇿" },
{ name: "Bahrain", code: "BH", dial_code: "+973", flag: "🇧🇭" },
{ name: "Bangladesh", code: "BD", dial_code: "+880", flag: "🇧🇩" },
{ name: "Belarus", code: "BY", dial_code: "+375", flag: "🇧🇾" },
{ name: "Belgium", code: "BE", dial_code: "+32", flag: "🇧🇪" },
{ name: "Belize", code: "BZ", dial_code: "+501", flag: "🇧🇿" },
{ name: "Benin", code: "BJ", dial_code: "+229", flag: "🇧🇯" },
{ name: "Bhutan", code: "BT", dial_code: "+975", flag: "🇧🇹" },
{ name: "Bolivia", code: "BO", dial_code: "+591", flag: "🇧🇴" },
{ name: "Bosnia and Herzegovina", code: "BA", dial_code: "+387", flag: "🇧🇦" },
{ name: "Botswana", code: "BW", dial_code: "+267", flag: "🇧🇼" },
{ name: "Bulgaria", code: "BG", dial_code: "+359", flag: "🇧🇬" },
{ name: "Cambodia", code: "KH", dial_code: "+855", flag: "🇰🇭" },
{ name: "Cameroon", code: "CM", dial_code: "+237", flag: "🇨🇲" },
{ name: "Chile", code: "CL", dial_code: "+56", flag: "🇨🇱" },
{ name: "Colombia", code: "CO", dial_code: "+57", flag: "🇨🇴" },
{ name: "Costa Rica", code: "CR", dial_code: "+506", flag: "🇨🇷" },
{ name: "Croatia", code: "HR", dial_code: "+385", flag: "🇭🇷" },
{ name: "Cuba", code: "CU", dial_code: "+53", flag: "🇨🇺" },
{ name: "Cyprus", code: "CY", dial_code: "+357", flag: "🇨🇾" },
{ name: "Czech Republic", code: "CZ", dial_code: "+420", flag: "🇨🇿" },
{ name: "Denmark", code: "DK", dial_code: "+45", flag: "🇩🇰" },
{ name: "Dominican Republic", code: "DO", dial_code: "+1 809", flag: "🇩🇴" },
{ name: "Ecuador", code: "EC", dial_code: "+593", flag: "🇪🇨" },
{ name: "Egypt", code: "EG", dial_code: "+20", flag: "🇪🇬" },
{ name: "El Salvador", code: "SV", dial_code: "+503", flag: "🇸🇻" },
{ name: "Estonia", code: "EE", dial_code: "+372", flag: "🇪🇪" },
{ name: "Ethiopia", code: "ET", dial_code: "+251", flag: "🇪🇹" },
{ name: "Finland", code: "FI", dial_code: "+358", flag: "🇫🇮" },
{ name: "Georgia", code: "GE", dial_code: "+995", flag: "🇬🇪" },
{ name: "Ghana", code: "GH", dial_code: "+233", flag: "🇬🇭" },
{ name: "Greece", code: "GR", dial_code: "+30", flag: "🇬🇷" },
{ name: "Greenland", code: "GL", dial_code: "+299", flag: "🇬🇱" },
{ name: "Guatemala", code: "GT", dial_code: "+502", flag: "🇬🇹" },
{ name: "Haiti", code: "HT", dial_code: "+509", flag: "🇭🇹" },
{ name: "Honduras", code: "HN", dial_code: "+504", flag: "🇭🇳" },
{ name: "Hong Kong", code: "HK", dial_code: "+852", flag: "🇭🇰" },
{ name: "Hungary", code: "HU", dial_code: "+36", flag: "🇭🇺" },
{ name: "Iceland", code: "IS", dial_code: "+354", flag: "🇮🇸" },
{ name: "Indonesia", code: "ID", dial_code: "+62", flag: "🇮🇩" },
{ name: "Iran", code: "IR", dial_code: "+98", flag: "🇮🇷" },
{ name: "Iraq", code: "IQ", dial_code: "+964", flag: "🇮🇶" },
{ name: "Ireland", code: "IE", dial_code: "+353", flag: "🇮🇪" },
{ name: "Israel", code: "IL", dial_code: "+972", flag: "🇮🇱" },
{ name: "Italy", code: "IT", dial_code: "+39", flag: "🇮🇹" },
{ name: "Jamaica", code: "JM", dial_code: "+1 876", flag: "🇯🇲" },
{ name: "Jordan", code: "JO", dial_code: "+962", flag: "🇯🇴" },
{ name: "Kazakhstan", code: "KZ", dial_code: "+7", flag: "🇰🇿" },
{ name: "Kenya", code: "KE", dial_code: "+254", flag: "🇰🇪" },
{ name: "Kuwait", code: "KW", dial_code: "+965", flag: "🇰🇼" },
{ name: "Latvia", code: "LV", dial_code: "+371", flag: "🇱🇻" },
{ name: "Lebanon", code: "LB", dial_code: "+961", flag: "🇱🇧" },
{ name: "Libya", code: "LY", dial_code: "+218", flag: "🇱🇾" },
{ name: "Liechtenstein", code: "LI", dial_code: "+423", flag: "🇱🇮" },
{ name: "Lithuania", code: "LT", dial_code: "+370", flag: "🇱🇹" },
{ name: "Luxembourg", code: "LU", dial_code: "+352", flag: "🇱🇺" },
{ name: "Macau", code: "MO", dial_code: "+853", flag: "🇲🇴" },
{ name: "Malaysia", code: "MY", dial_code: "+60", flag: "🇲🇾" },
{ name: "Maldives", code: "MV", dial_code: "+960", flag: "🇲🇻" },
{ name: "Malta", code: "MT", dial_code: "+356", flag: "🇲🇹" },
{ name: "Monaco", code: "MC", dial_code: "+377", flag: "🇲🇨" },
{ name: "Mongolia", code: "MN", dial_code: "+976", flag: "🇲🇳" },
{ name: "Montenegro", code: "ME", dial_code: "+382", flag: "🇲🇪" },
{ name: "Morocco", code: "MA", dial_code: "+212", flag: "🇲🇦" },
{ name: "Myanmar", code: "MM", dial_code: "+95", flag: "🇲🇲" },
{ name: "Namibia", code: "NA", dial_code: "+264", flag: "🇳🇦" },
{ name: "Nepal", code: "NP", dial_code: "+977", flag: "🇳🇵" },
{ name: "Netherlands", code: "NL", dial_code: "+31", flag: "🇳🇱" },
{ name: "New Zealand", code: "NZ", dial_code: "+64", flag: "🇳🇿" },
{ name: "Nicaragua", code: "NI", dial_code: "+505", flag: "🇳🇮" },
{ name: "Nigeria", code: "NG", dial_code: "+234", flag: "🇳🇬" },
{ name: "North Korea", code: "KP", dial_code: "+850", flag: "🇰🇵" },
{ name: "Norway", code: "NO", dial_code: "+47", flag: "🇳🇴" },
{ name: "Oman", code: "OM", dial_code: "+968", flag: "🇴🇲" },
{ name: "Pakistan", code: "PK", dial_code: "+92", flag: "🇵🇰" },
{ name: "Panama", code: "PA", dial_code: "+507", flag: "🇵🇦" },
{ name: "Paraguay", code: "PY", dial_code: "+595", flag: "🇵🇾" },
{ name: "Peru", code: "PE", dial_code: "+51", flag: "🇵🇪" },
{ name: "Philippines", code: "PH", dial_code: "+63", flag: "🇵🇭" },
{ name: "Poland", code: "PL", dial_code: "+48", flag: "🇵🇱" },
{ name: "Portugal", code: "PT", dial_code: "+351", flag: "🇵🇹" },
{ name: "Puerto Rico", code: "PR", dial_code: "+1 939", flag: "🇵🇷" },
{ name: "Qatar", code: "QA", dial_code: "+974", flag: "🇶🇦" },
{ name: "Romania", code: "RO", dial_code: "+40", flag: "🇷🇴" },
{ name: "Saudi Arabia", code: "SA", dial_code: "+966", flag: "🇸🇦" },
{ name: "Senegal", code: "SN", dial_code: "+221", flag: "🇸🇳" },
{ name: "Serbia", code: "RS", dial_code: "+381", flag: "🇷🇸" },
{ name: "Singapore", code: "SG", dial_code: "+65", flag: "🇸🇬" },
{ name: "Slovakia", code: "SK", dial_code: "+421", flag: "🇸🇰" },
{ name: "Slovenia", code: "SI", dial_code: "+386", flag: "🇸🇮" },
{ name: "South Korea", code: "KR", dial_code: "+82", flag: "🇰🇷" },
{ name: "Spain", code: "ES", dial_code: "+34", flag: "🇪🇸" },
{ name: "Sri Lanka", code: "LK", dial_code: "+94", flag: "🇱🇰" },
{ name: "Sudan", code: "SD", dial_code: "+249", flag: "🇸🇩" },
{ name: "Sweden", code: "SE", dial_code: "+46", flag: "🇸🇪" },
{ name: "Switzerland", code: "CH", dial_code: "+41", flag: "🇨🇭" },
{ name: "Syria", code: "SY", dial_code: "+963", flag: "🇸🇾" },
{ name: "Taiwan", code: "TW", dial_code: "+886", flag: "🇹🇼" },
{ name: "Tajikistan", code: "TJ", dial_code: "+992", flag: "🇹🇯" },
{ name: "Tanzania", code: "TZ", dial_code: "+255", flag: "🇹🇿" },
{ name: "Thailand", code: "TH", dial_code: "+66", flag: "🇹🇭" },
{ name: "Tunisia", code: "TN", dial_code: "+216", flag: "🇹🇳" },
{ name: "Turkey", code: "TR", dial_code: "+90", flag: "🇹🇷" },
{ name: "Ukraine", code: "UA", dial_code: "+380", flag: "🇺🇦" },
{ name: "United Arab Emirates", code: "AE", dial_code: "+971", flag: "🇦🇪" },
{ name: "Uruguay", code: "UY", dial_code: "+598", flag: "🇺🇾" },
{ name: "Uzbekistan", code: "UZ", dial_code: "+998", flag: "🇺🇿" },
{ name: "Venezuela", code: "VE", dial_code: "+58", flag: "🇻🇪" },
{ name: "Vietnam", code: "VN", dial_code: "+84", flag: "🇻🇳" },
{ name: "Yemen", code: "YE", dial_code: "+967", flag: "🇾🇪" },
{ name: "Zambia", code: "ZM", dial_code: "+260", flag: "🇿🇲" },
{ name: "Zimbabwe", code: "ZW", dial_code: "+263", flag: "🇿🇼" },
].sort((a, b) => a.name.localeCompare(b.name));

interface Step1Props {
  data: any;
  update: (data: any) => void;
  onNext: () => void;
}

export default function Step1_Basics({ data, update, onNext }: Step1Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // --- PHONE STATE ---
  const [phoneCountryCode, setPhoneCountryCode] = useState("US");
  const [dialCode, setDialCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPhoneDropdownOpen, setIsPhoneDropdownOpen] = useState(false);
  const [phoneSearchQuery, setPhoneSearchQuery] = useState("");
  const phoneDropdownRef = useRef<HTMLDivElement>(null);

  // --- LOCATION STATE ---
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState("");
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    first_name: data.first_name || user?.first_name || "",
    last_name: data.last_name || user?.last_name || "",
    city: data.city || "",
    state: data.state || "",
    country: data.country || "United States",
    linkedin_url: data.linkedin_url || "",
    portfolio_url: data.portfolio_url || "",
    headline: data.headline || "",
    summary: data.summary || "",
    target_job_titles: data.target_job_titles || "" // <--- ADDED THIS
  });

  // --- SYNC DATA ---
  useEffect(() => {
    setFormData({
        first_name: data.first_name || user?.first_name || "",
        last_name: data.last_name || user?.last_name || "",
        city: data.city || "",
        state: data.state || "",
        country: data.country || "United States",
        linkedin_url: data.linkedin_url || "",
        portfolio_url: data.portfolio_url || "",
        headline: data.headline || "",
        summary: data.summary || "",
        target_job_titles: data.target_job_titles || "" // <--- SYNC HERE
    });

    if (data.phone) {
        const sortedCodes = [...COUNTRY_CODES].sort((a, b) => b.dial_code.length - a.dial_code.length);
        const match = sortedCodes.find(c => data.phone.startsWith(c.dial_code));
        if (match) {
            setPhoneCountryCode(match.code);
            setDialCode(match.dial_code);
            setPhoneNumber(data.phone.replace(match.dial_code, "").trim());
        } else {
            setPhoneNumber(data.phone);
        }
    }
  }, [data, user]);

  // --- CLICK OUTSIDE ---
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (phoneDropdownRef.current && !phoneDropdownRef.current.contains(event.target)) setIsPhoneDropdownOpen(false);
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) setIsCountryDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    update({ ...data, [name]: value });
  };

  // --- PHONE LOGIC ---
  const handlePhoneCountrySelect = (country: any) => {
    setPhoneCountryCode(country.code);
    setDialCode(country.dial_code);
    const combined = `${country.dial_code} ${phoneNumber}`.trim();
    update({ ...data, phone: combined });
    setIsPhoneDropdownOpen(false);
    setPhoneSearchQuery("");
  };

  const handlePhoneNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPhoneNumber(val);
    const combined = `${dialCode} ${val}`.trim();
    update({ ...data, phone: combined });
  };

  const selectedPhoneCountry = COUNTRY_CODES.find(c => c.code === phoneCountryCode) || COUNTRY_CODES[0] || { flag: "🇺🇸", dial_code: "+1" };
  const filteredPhoneCountries = COUNTRY_CODES.filter(c => 
    c.name.toLowerCase().includes(phoneSearchQuery.toLowerCase()) || 
    c.dial_code.includes(phoneSearchQuery) || 
    c.code.toLowerCase().includes(phoneSearchQuery.toLowerCase())
  );

  // --- LOCATION LOGIC ---
  const handleLocationCountrySelect = (country: any) => {
    setFormData(prev => ({ ...prev, country: country.name }));
    update({ ...data, country: country.name });
    setIsCountryDropdownOpen(false);
    setCountrySearchQuery("");
  };

  const filteredLocationCountries = COUNTRY_CODES.filter(c => 
    c.name.toLowerCase().includes(countrySearchQuery.toLowerCase())
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.id) { alert("Session invalid."); return; }
    setLoading(true);
    try {
      const fullPhone = `${dialCode} ${phoneNumber}`.trim();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, ...formData, phone: fullPhone }),
      });
      if (!res.ok) throw new Error("Failed to save");
      onNext();
    } catch (err: any) { alert(`Error: ${err.message}`); } finally { setLoading(false); }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold mb-6 text-slate-900">Basic Information</h2>
      
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">First Name</label>
            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-[#0F172A] outline-none transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Last Name</label>
            <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-[#0F172A] outline-none transition" />
          </div>
        </div>

        {/* Headline */}
        <div>
          <label className="block text-sm font-medium text-slate-700">Professional Headline</label>
          <input type="text" name="headline" className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-[#0F172A] outline-none" placeholder="e.g. Senior Python Developer" value={formData.headline} onChange={handleChange} />
        </div>

        {/* --- NEW FIELD: Target Job Roles --- */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-1 flex items-center gap-2">
             <Briefcase className="w-4 h-4 text-blue-600"/> Target Job Roles <span className="text-slate-400 font-normal text-xs">(Keywords for job matching)</span>
          </label>
          <input 
            type="text"
            name="target_job_titles"
            value={formData.target_job_titles}
            onChange={handleChange}
            placeholder="e.g. Full Stack Developer, Data Scientist, Backend Engineer"
            className="mt-1 block w-full rounded-lg border border-blue-200 bg-blue-50/30 px-4 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition placeholder:font-normal placeholder:text-slate-400"
          />
        </div>
        {/* ----------------------------------- */}

        {/* Phone Number */}
        <div>
            <label className="block text-sm font-medium text-slate-700">Phone Number</label>
            <div className="mt-1 flex relative rounded-lg shadow-sm">
                <div className="relative" ref={phoneDropdownRef}>
                    <button type="button" onClick={() => setIsPhoneDropdownOpen(!isPhoneDropdownOpen)} className="inline-flex items-center justify-between h-full rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 px-3 text-sm text-slate-700 hover:bg-slate-100 min-w-[110px]">
                        <span className="flex items-center gap-2"><span>{selectedPhoneCountry.flag}</span><span>{selectedPhoneCountry.dial_code}</span></span>
                        <ChevronDown className="w-4 h-4 ml-1 text-slate-400" />
                    </button>
                    {isPhoneDropdownOpen && (
                        <div className="absolute z-50 top-full left-0 mt-1 w-72 bg-white border border-slate-200 rounded-xl shadow-xl max-h-80 flex flex-col animate-in fade-in zoom-in-95 duration-100">
                            <div className="p-2 border-b border-slate-100 sticky top-0 bg-white rounded-t-xl">
                                <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" autoFocus placeholder="Search..." value={phoneSearchQuery} onChange={(e) => setPhoneSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0F172A] outline-none" /></div>
                            </div>
                            <div className="overflow-y-auto flex-1 p-1">
                                {filteredPhoneCountries.map((country) => (
                                    <button key={country.code} type="button" onClick={() => handlePhoneCountrySelect(country)} className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-slate-50 transition ${country.code === phoneCountryCode ? "bg-slate-100 font-medium text-slate-900" : "text-slate-600"}`}>
                                        <div className="flex items-center gap-3"><span className="text-lg">{country.flag}</span><span>{country.name}</span></div><span className="text-slate-400 text-xs font-mono">{country.dial_code}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <input type="tel" name="phone" required value={phoneNumber} onChange={handlePhoneNumberInput} className="block w-full min-w-0 flex-1 rounded-none rounded-r-lg border border-slate-300 px-4 py-2 focus:border-[#0F172A] outline-none" placeholder="555 000-0000" />
            </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative" ref={countryDropdownRef}>
            <label className="block text-sm font-medium text-slate-700">Country</label>
            <button type="button" onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)} className="mt-1 w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-left flex justify-between items-center focus:ring-2 focus:ring-[#0F172A] focus:border-[#0F172A]">
                <span className={formData.country ? "text-slate-900" : "text-slate-400"}>{formData.country || "Select Country"}</span><ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            {isCountryDropdownOpen && (
                <div className="absolute z-50 top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 flex flex-col animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-slate-100 sticky top-0 bg-white rounded-t-xl">
                        <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" autoFocus placeholder="Search..." value={countrySearchQuery} onChange={(e) => setCountrySearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0F172A] outline-none" /></div>
                    </div>
                    <div className="overflow-y-auto flex-1 p-1">
                        {filteredLocationCountries.map((c) => (
                            <button key={c.code} type="button" onClick={() => handleLocationCountrySelect(c)} className={`w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-slate-50 transition ${formData.country === c.name ? "bg-slate-100 font-medium text-slate-900" : "text-slate-600"}`}><span className="mr-2">{c.flag}</span> {c.name}</button>
                        ))}
                    </div>
                </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">City, State</label>
            <input type="text" name="city" required className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-[#0F172A] outline-none" placeholder="San Francisco, CA" value={formData.city} onChange={handleChange} />
          </div>
        </div>

        {/* Summary */}
        <div>
          <label className="block text-sm font-medium text-slate-700">About / Professional Summary</label>
          <textarea name="summary" rows={4} className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-[#0F172A] outline-none" placeholder="Briefly describe your background..." value={formData.summary} onChange={handleChange} />
        </div>

        {/* Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-700">LinkedIn URL</label><input type="url" name="linkedin_url" className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-[#0F172A] outline-none" placeholder="https://linkedin.com/in/..." value={formData.linkedin_url} onChange={handleChange} /></div>
            <div><label className="block text-sm font-medium text-slate-700">Portfolio URL</label><input type="url" name="portfolio_url" className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-[#0F172A] outline-none" placeholder="https://myportfolio.com" value={formData.portfolio_url} onChange={handleChange} /></div>
        </div>

        <div className="pt-4 flex justify-end">
          <button type="submit" disabled={loading} className="bg-[#0F172A] text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-blue-500/10">
            {loading ? "Saving..." : "Save & Continue →"}
          </button>
        </div>

      </form>
    </div>
  );
}