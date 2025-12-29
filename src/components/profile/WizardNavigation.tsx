"use client";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";

interface WizardNavProps {
  onBack: () => void;
  onNext: () => void;
  isLastStep?: boolean;
  loading?: boolean;
  showBack?: boolean;
}

export default function WizardNavigation({ 
  onBack, 
  onNext, 
  isLastStep = false, 
  loading = false,
  showBack = true
}: WizardNavProps) {
  return (
    <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200">
      
      {/* BACK BUTTON */}
      {showBack ? (
        <button 
          onClick={onBack}
          disabled={loading}
          className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800 transition px-4 py-2 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      ) : (
        <div></div> // Spacer
      )}

      {/* NEXT / SAVE BUTTON */}
      <button 
        onClick={onNext}
        disabled={loading}
        className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition transform hover:-translate-y-0.5 ${
          isLastStep 
            ? "bg-green-600 hover:bg-green-700 shadow-green-500/30" 
            : "bg-[#0F172A] hover:bg-slate-800 shadow-blue-500/30"
        }`}
      >
        {loading ? (
          "Saving..."
        ) : isLastStep ? (
          <>Finish & Save <Save className="w-4 h-4" /></>
        ) : (
          <>Next Step <ArrowRight className="w-4 h-4" /></>
        )}
      </button>
    </div>
  );
}