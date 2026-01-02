"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Loader2, 
  CheckCircle, 
  ArrowLeft, 
  Mail, 
  Lock, 
  KeyRound, 
  AlertCircle 
} from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  // --- STATE MANAGEMENT ---
  const [step, setStep] = useState(1); // 1 = Email Input, 2 = Verification & Reset
  const [loading, setLoading] = useState(false);
  
  // Form Inputs
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  // Feedback
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // --- STEP 1: SEND VERIFICATION CODE ---
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Verification code sent! Please check your inbox.");
        setStep(2); // Move to next screen
      } else {
        setError(data.detail || "Failed to send code. Please try again.");
      }
    } catch (err) {
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 2: VERIFY CODE & RESET PASSWORD ---
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            email: email, 
            code: otp, 
            new_password: newPassword 
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Password reset successfully! Redirecting to login...");
        router.push("/login");
      } else {
        setError(data.detail || "Invalid code or failed to reset.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        
        {/* BACK TO LOGIN BUTTON */}
        <button 
          onClick={() => router.push("/login")} 
          className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-8 text-sm font-bold transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Login
        </button>

        {/* HEADER ICON & TITLE */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600 shadow-sm">
            {step === 1 ? <Mail className="w-8 h-8" /> : <KeyRound className="w-8 h-8" />}
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {step === 1 ? "Forgot Password?" : "Reset Credentials"}
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            {step === 1 
              ? "Enter your email address to receive a verification code." 
              : `Enter the code sent to ${email}`}
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 text-center border border-red-100 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4"/> {error}
          </div>
        )}

        {/* SUCCESS MESSAGE */}
        {message && (
          <div className="bg-green-50 text-green-600 p-4 rounded-xl text-sm font-bold mb-6 text-center border border-green-100 flex items-center justify-center gap-2 animate-in fade-in zoom-in duration-300">
            <CheckCircle className="w-4 h-4"/> {message}
          </div>
        )}

        {/* --- FORM STEP 1: EMAIL --- */}
        {step === 1 ? (
          <form onSubmit={handleSendCode} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 block p-4 pl-12 font-bold outline-none transition shadow-sm" 
                  placeholder="name@company.com" 
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full text-white bg-[#0F172A] hover:bg-slate-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-bold rounded-xl text-sm px-5 py-4 text-center transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Code"}
            </button>
          </form>
        ) : (
          /* --- FORM STEP 2: VERIFY & RESET --- */
          <form onSubmit={handleResetPassword} className="space-y-6 animate-in slide-in-from-right-10 duration-300">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Verification Code</label>
              <input 
                type="text" 
                required
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-center text-2xl tracking-[0.5em] rounded-xl focus:ring-2 focus:ring-blue-600 outline-none p-4 font-black shadow-sm" 
                placeholder="0000" 
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">New Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="password" 
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-600 block p-4 pl-12 font-bold outline-none transition shadow-sm" 
                  placeholder="••••••••" 
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full text-white bg-[#0F172A] hover:bg-slate-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-bold rounded-xl text-sm px-5 py-4 text-center transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}