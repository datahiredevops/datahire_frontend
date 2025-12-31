"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Building2, Save, Loader2, Globe, Pencil, X } from "lucide-react";

export default function CompanyProfilePage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // FIX: Added 'logo_url' to initial state so TypeScript knows it exists
  const [data, setData] = useState({ 
    name: "", 
    website: "", 
    industry: "", 
    size: "", 
    description: "", 
    headquarters: "", 
    founded_year: "",
    logo_url: "" // <--- ADDED THIS
  });
  
  const [originalData, setOriginalData] = useState<any>(null);

  useEffect(() => {
    if (user?.id) fetchCompany();
  }, [user]);

  const fetchCompany = async () => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user?.id}`);
        const userData = await res.json();
        if (userData.company) {
            setData(userData.company);
            setOriginalData(userData.company);
        }
    } catch (e) { console.error(e); }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employer/company`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(data)
        });
        setOriginalData(data);
        setIsEditing(false);
    } catch (e) { alert("Failed to update"); } 
    finally { setLoading(false); }
  };

  const handleCancel = () => {
    setData(originalData);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">
        <div className="max-w-4xl mx-auto">
            
            {/* HEADER */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 mb-2">Company Profile</h1>
                    <p className="text-slate-500">Manage your branding and details visible to candidates.</p>
                </div>
                {!isEditing && (
                    <button 
                        onClick={() => setIsEditing(true)} 
                        className="bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition flex items-center gap-2 shadow-sm"
                    >
                        <Pencil className="w-4 h-4" /> Edit Profile
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-8">
                
                {/* LOGO SECTION */}
                <div className="flex items-center gap-6 pb-8 border-b border-slate-100">
                    <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200 overflow-hidden">
                        {data.logo_url ? <img src={data.logo_url} className="w-full h-full object-cover"/> : <Building2 className="w-10 h-10"/>}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{data.name || "Company Name"}</h2>
                        <p className="text-slate-500 text-sm mt-1">{data.industry || "Industry Not Set"} • {data.headquarters || "Location Not Set"}</p>
                        {isEditing && <button className="mt-3 text-xs font-bold text-blue-600 hover:underline">Change Logo</button>}
                    </div>
                </div>

                {/* FORM / VIEW GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <Field 
                        label="Company Name" 
                        value={data.name} 
                        isEditing={isEditing} 
                        onChange={(val: string) => setData({...data, name: val})}
                    />
                    <Field 
                        label="Website" 
                        value={data.website} 
                        isEditing={isEditing} 
                        onChange={(val: string) => setData({...data, website: val})}
                        icon={<Globe className="w-3 h-3"/>}
                    />
                    <Field 
                        label="Industry" 
                        value={data.industry} 
                        isEditing={isEditing} 
                        onChange={(val: string) => setData({...data, industry: val})}
                    />
                    
                    {/* SIZE DROPDOWN */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase block mb-2 tracking-wider">Company Size</label>
                        {isEditing ? (
                            <select 
                                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-medium focus:ring-2 focus:ring-[#0F172A] outline-none"
                                value={data.size} 
                                onChange={e => setData({...data, size: e.target.value})}
                            >
                                <option>1-10</option><option>11-50</option><option>51-200</option><option>201-1000</option><option>1000+</option>
                            </select>
                        ) : (
                            <div className="text-lg font-medium text-slate-900">{data.size || "-"} Employees</div>
                        )}
                    </div>

                    <Field 
                        label="Headquarters" 
                        value={data.headquarters} 
                        isEditing={isEditing} 
                        onChange={(val: string) => setData({...data, headquarters: val})}
                    />
                    <Field 
                        label="Founded Year" 
                        value={data.founded_year} 
                        isEditing={isEditing} 
                        onChange={(val: string) => setData({...data, founded_year: val})}
                    />
                </div>

                {/* DESCRIPTION */}
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase block mb-2 tracking-wider">About Company</label>
                    {isEditing ? (
                        <textarea 
                            className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-medium min-h-[150px] focus:ring-2 focus:ring-[#0F172A] outline-none leading-relaxed"
                            value={data.description} 
                            onChange={e => setData({...data, description: e.target.value})}
                        />
                    ) : (
                        <p className="text-slate-600 leading-relaxed whitespace-pre-line">{data.description || "No description added yet."}</p>
                    )}
                </div>

                {/* ACTION BUTTONS */}
                {isEditing && (
                    <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
                        <button 
                            onClick={handleCancel}
                            className="px-6 py-3 font-bold text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave} 
                            disabled={loading} 
                            className="bg-[#0F172A] text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition flex items-center gap-2 shadow-lg shadow-slate-900/10"
                        >
                            {loading ? <Loader2 className="animate-spin w-4 h-4"/> : <><Save className="w-4 h-4"/> Save Changes</>}
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}

// Reusable Field Component
function Field({ label, value, isEditing, onChange, icon }: any) {
    return (
        <div>
            <label className="text-xs font-bold text-slate-400 uppercase block mb-2 tracking-wider">{label}</label>
            {isEditing ? (
                <input 
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-medium focus:ring-2 focus:ring-[#0F172A] outline-none transition-all"
                    value={value || ""} 
                    onChange={e => onChange(e.target.value)}
                />
            ) : (
                <div className="text-lg font-medium text-slate-900 flex items-center gap-2">
                    {icon} {value || "-"}
                </div>
            )}
        </div>
    );
}