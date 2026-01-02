"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail, ArrowRight } from "lucide-react";
import Link from "next/link"; 

export default function LoginPage() {
  const { login } = useAuth(); // removed googleLogin destructuring if not used in UI yet
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // This matches the AuthContext signature: login(email, password)
      await login(email, password);
    } catch (err: any) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white mb-4 shadow-lg shadow-slate-900/20">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">Enter your credentials to access your account.</p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 text-center border border-red-100">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="email" 
                required
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 block p-4 pl-12 font-bold outline-none transition shadow-sm" 
                placeholder="name@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="password" 
                required
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 block p-4 pl-12 font-bold outline-none transition shadow-sm" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* FORGOT PASSWORD LINK */}
          <div className="flex justify-end">
            <Link 
              href="/forgot-password" 
              className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline transition"
            >
              Forgot Password?
            </Link>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full text-white bg-[#0F172A] hover:bg-slate-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-bold rounded-xl text-sm px-5 py-4 text-center transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 group"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/></>}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-slate-500 text-sm font-medium">
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-600 hover:text-blue-800 font-bold hover:underline transition">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}