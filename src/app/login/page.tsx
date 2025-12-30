"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useGoogleLogin } from "@react-oauth/google";
import { Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/google-login`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: tokenResponse.access_token }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Google Login Failed");
        
        // FIX: Don't pass a path. Let AuthContext decide based on Role.
        login("fake-jwt-token", data.user); 
        
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    },
    onError: () => setError("Google Login Failed"),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed");
      
      // FIX: Removed '/jobs'. Now AuthContext will check data.user.role!
      login(data.access_token || "fake-jwt", data.user); 

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 p-8 md:p-10">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#0F172A] text-white text-xl font-bold mb-4 shadow-xl shadow-slate-900/20">D</div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome back</h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">Please enter your details to sign in.</p>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" /> {error}
            </div>
        )}

        <button type="button" onClick={() => handleGoogleLogin()} className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-200 rounded-xl bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition duration-200 shadow-sm">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5" alt="Google" />
            Sign in with Google
        </button>

        <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="px-3 bg-white text-slate-400 font-bold tracking-wider">Or continue with</span></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-[#0F172A] focus:bg-white outline-none transition-all" required />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-[#0F172A] focus:bg-white outline-none transition-all" required />
            </div>
            <button type="submit" disabled={loading} className="w-full py-4 px-4 bg-[#0F172A] hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-900/20 transition-all transform active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : "Sign In"}
            </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500 font-medium">
            Don't have an account? <Link href="/signup" className="font-bold text-[#0F172A] hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}