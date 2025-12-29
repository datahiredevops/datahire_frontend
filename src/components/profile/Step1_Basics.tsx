"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

// Interface for props
interface Step1Props {
  data: any;
  update: (data: any) => void;
  onNext: () => void;
}

export default function Step1_Basics({ data, update, onNext }: Step1Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Local state to handle inputs before saving to parent
  const [formData, setFormData] = useState({
    phone: data.phone || "",
    city: data.city || "",
    state: data.state || "",
    country: data.country || "USA",
    linkedin_url: data.linkedin_url || "",
    portfolio_url: data.portfolio_url || "",
    headline: data.headline || "", // New Field
    summary: data.summary || ""    // New Field (About)
  });

  // Sync with parent data if it changes (e.g., on initial load or navigation back)
  useEffect(() => {
    setFormData({
        phone: data.phone || "",
        city: data.city || "",
        state: data.state || "",
        country: data.country || "USA",
        linkedin_url: data.linkedin_url || "",
        portfolio_url: data.portfolio_url || "",
        headline: data.headline || "",
        summary: data.summary || ""
    });
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // 1. Update Local State (for typing speed)
    setFormData(prev => ({ ...prev, [name]: value }));

    // 2. Update Parent State (immediately, so data persists if you switch tabs)
    update({ ...data, [name]: value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.id) {
        alert("Session invalid. Please Log In again.");
        return;
    }
    setLoading(true);

    try {
      // Send data to backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        // Merge current form data with existing profile data (to avoid wiping other steps)
        body: JSON.stringify({
           ...data, 
           ...formData 
        }),
      });

      if (!res.ok) throw new Error("Failed to save");
      
      // Move to next step
      onNext();
      
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold mb-6 text-slate-900">Basic Information</h2>
      
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Name Fields (Read Only) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">First Name</label>
            <input type="text" value={user?.first_name || ""} disabled className="mt-1 block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2 text-slate-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Last Name</label>
            <input type="text" value={user?.last_name || ""} disabled className="mt-1 block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2 text-slate-500" />
          </div>
        </div>

        {/* Headline (New) */}
        <div>
          <label className="block text-sm font-medium text-slate-700">Professional Headline</label>
          <input 
            type="text" 
            name="headline"
            className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-[#0F172A] focus:border-[#0F172A] outline-none"
            placeholder="e.g. Senior Python Developer | AI Enthusiast"
            value={formData.headline}
            onChange={handleChange}
          />
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Phone Number</label>
            <input 
              type="tel" 
              name="phone"
              required
              className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-[#0F172A] focus:border-[#0F172A] outline-none"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Location (City, State)</label>
            <input 
              type="text" 
              name="city" // Using 'city' field to store location string for simplicity
              required
              className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-[#0F172A] focus:border-[#0F172A] outline-none"
              placeholder="San Francisco, CA"
              value={formData.city}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Summary / About (New) */}
        <div>
          <label className="block text-sm font-medium text-slate-700">About / Professional Summary</label>
          <textarea 
            name="summary"
            rows={4}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-[#0F172A] focus:border-[#0F172A] outline-none"
            placeholder="Briefly describe your background, years of experience, and key achievements..."
            value={formData.summary}
            onChange={handleChange}
          />
        </div>

        {/* Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
            <label className="block text-sm font-medium text-slate-700">LinkedIn URL</label>
            <input 
                type="url" 
                name="linkedin_url"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-[#0F172A] focus:border-[#0F172A] outline-none"
                placeholder="https://linkedin.com/in/..."
                value={formData.linkedin_url}
                onChange={handleChange}
            />
            </div>
            <div>
            <label className="block text-sm font-medium text-slate-700">Portfolio URL</label>
            <input 
                type="url" 
                name="portfolio_url"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 focus:ring-[#0F172A] focus:border-[#0F172A] outline-none"
                placeholder="https://myportfolio.com"
                value={formData.portfolio_url}
                onChange={handleChange}
            />
            </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-[#0F172A] text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-blue-500/10"
          >
            {loading ? "Saving..." : "Save & Continue →"}
          </button>
        </div>

      </form>
    </div>
  );
}