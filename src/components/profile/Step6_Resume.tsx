"use client";
import { UploadCloud, FileText, X, CheckCircle2, FileCheck } from "lucide-react";

export default function Step6_Resume({ data, update }: any) {
  
  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      update({ ...data, resume_file: file });
    }
  };

  const removeNewFile = () => {
    update({ ...data, resume_file: null });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Upload your Resume</h2>
        <p className="text-slate-500">Attach your original PDF.</p>
      </div>

      {/* --- 1. SHOW EXISTING FILE (FROM DB) --- */}
      {data.resume_file_path && !data.resume_file && (
         <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <FileCheck className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-green-900 text-sm">Resume Saved on Server</h3>
                    <p className="text-xs text-green-700 break-all">{data.resume_file_path.split('/').pop()}</p>
                </div>
            </div>
            <div className="text-xs font-bold text-green-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Active
            </div>
         </div>
      )}

      {/* --- 2. UPLOAD AREA --- */}
      <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center hover:bg-slate-50 transition relative">
        
        {data.resume_file ? (
            // NEW FILE SELECTED
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">{data.resume_file.name}</h3>
                <p className="text-slate-500 text-sm mb-6">
                    {(data.resume_file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={removeNewFile}
                        className="text-slate-500 hover:text-red-600 font-bold text-sm px-4 py-2"
                    >
                        Cancel
                    </button>
                    <span className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md">
                        Ready to Save
                    </span>
                </div>
            </div>
        ) : (
            // EMPTY UPLOAD VIEW
            <>
                <input 
                    type="file" 
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">
                    {data.resume_file_path ? "Replace Resume" : "Upload Resume"}
                </h3>
                <p className="text-slate-500 text-sm mt-2">Drag & drop or click to browse</p>
            </>
        )}
      </div>
    </div>
  );
}