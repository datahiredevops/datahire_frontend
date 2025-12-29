"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const { login } = useAuth();
  
  const [role, setRole] = useState<"seeker" | "employer">("seeker");
  const [formData, setFormData] = useState({ first_name: "", last_name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/google-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: tokenResponse.access_token }),
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Google Sign Up Failed");

        // Auto-Login -> Go to Profile Wizard
        login("fake-jwt-token", data.user,'profile');
        
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    },
    onError: () => setError("Google Sign Up Failed"),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. REGISTER
      const regRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role }),
      });

      const regData = await regRes.json();
      if (!regRes.ok) throw new Error(regData.detail || "Registration failed");

      // 2. AUTO-LOGIN (Immediate)
      const loginRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error("Auto-login failed. Please sign in manually.");

      // 3. REDIRECT TO PROFILE WIZARD
      login("fake-jwt-token", loginData.user,'/profile');
      
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-10">
        
        <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create an account</h1>
            <p className="text-sm text-slate-500 mt-2">Start your journey with DataHire.</p>
        </div>

        <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            <button onClick={() => setRole("seeker")} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${role === 'seeker' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Job Seeker</button>
            <button onClick={() => setRole("employer")} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${role === 'employer' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Employer</button>
        </div>

        {error && <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center font-medium">{error}</div>}

        <button type="button" onClick={() => handleGoogleSignup()} className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-slate-200 rounded-xl bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition duration-200">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5" alt="Google" />
            Sign up with Google
        </button>

        <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="px-3 bg-white text-slate-400 font-medium tracking-wider">Or</span></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">First Name</label>
                    <input type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-[#0F172A] focus:bg-white outline-none" required value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Last Name</label>
                    <input type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-[#0F172A] focus:bg-white outline-none" required value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} />
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Email</label>
                <input type="email" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-[#0F172A] focus:bg-white outline-none" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Password</label>
                <input type="password" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-[#0F172A] focus:bg-white outline-none" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-[#0F172A] hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-900/20 transition-all transform active:scale-[0.98] disabled:opacity-70 mt-2">
                {loading ? "Creating..." : "Create Account"}
            </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account? <Link href="/login" className="font-bold text-[#0F172A] hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}