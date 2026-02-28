"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, FileText, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { analyzeFeature } from "@/lib/gemini";
import { saveAnalysis } from "@/lib/storage";

const PROCESSING_STEPS = [
  "Extracting assumptions...",
  "Detecting risk scenarios...",
  "Predicting UX failures...",
  "Estimating rework probability...",
  "Finalizing report...",
];

export default function Home() {
  const router = useRouter();
  const [textInput, setTextInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRunAnalysis = async () => {
    if (!textInput.trim() && !file) {
      setError("Please provide a feature description or upload a file.");
      return;
    }

    setError(null);
    setIsProcessing(true);
    setCurrentStep(0);

    // Simulate step progression for UX
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < PROCESSING_STEPS.length - 1 ? prev + 1 : prev));
    }, 2000);

    try {
      let imagePart;
      let promptText = textInput;

      if (file) {
        if (file.type.startsWith("image/")) {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
          });
          imagePart = {
            inlineData: {
              data: base64.split(",")[1],
              mimeType: file.type,
            },
          };
          if (!promptText) {
            promptText = "Analyze the feature described in this image.";
          }
        } else {
          // For text files, we can read them
          if (file.type === "text/plain") {
            const text = await file.text();
            promptText += "\n\n" + text;
          } else {
            // For PDF/DOCX, Gemini might not support them directly via inlineData unless it's a specific API.
            // We'll just pass the file name and ask the user to paste text for now, or we can try to pass as base64 if supported.
            // Gemini 1.5 Pro supports PDF via File API, but we are using inlineData.
            // Let's try to pass PDF as inlineData if it's application/pdf.
            if (file.type === "application/pdf") {
              const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = (error) => reject(error);
              });
              imagePart = {
                inlineData: {
                  data: base64.split(",")[1],
                  mimeType: file.type,
                },
              };
              if (!promptText) {
                promptText = "Analyze the feature described in this document.";
              }
            } else {
               throw new Error("Unsupported file type. Please upload an image, PDF, or text file.");
            }
          }
        }
      }

      const result = await analyzeFeature(promptText, imagePart);
      saveAnalysis(result);
      
      clearInterval(stepInterval);
      router.push(`/analysis/${result.id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during analysis.");
      setIsProcessing(false);
      clearInterval(stepInterval);
    }
  };

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-8" />
        <h2 className="text-2xl font-semibold tracking-tight mb-2">Analyzing Feature</h2>
        <p className="text-slate-500 mb-8">Please wait while our AI validates your design assumptions.</p>
        
        <div className="w-full space-y-3 text-left">
          {PROCESSING_STEPS.map((step, index) => (
            <div 
              key={step} 
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors duration-500 ${
                index === currentStep 
                  ? "bg-indigo-50 border border-indigo-100 text-indigo-700" 
                  : index < currentStep 
                    ? "text-slate-400" 
                    : "text-slate-300"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${
                index === currentStep ? "bg-indigo-600 animate-pulse" : index < currentStep ? "bg-slate-300" : "bg-slate-200"
              }`} />
              <span className="text-sm font-medium">{step}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-3">Validate Before You Design</h1>
        <p className="text-lg text-slate-600">
          Detect hidden assumptions, structural risks, and potential UX failures before starting your design or development workflow.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feature Input</CardTitle>
          <CardDescription>
            Describe your feature or upload a document/image (PDF, PNG, JPG, TXT).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3 text-red-800">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900">Feature Description</label>
            <textarea
              className="w-full min-h-[160px] p-3 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y text-sm"
              placeholder="e.g., Users should be able to invite team members via email. Invited members will receive a link to join the workspace. If they don't have an account, they must sign up first..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900">Attachments (Optional)</label>
            <div 
              className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".pdf,.png,.jpg,.jpeg,.txt"
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center gap-2">
                <UploadCloud className="w-8 h-8 text-slate-400" />
                {file ? (
                  <div className="flex items-center gap-2 text-sm font-medium text-indigo-600">
                    <FileText className="w-4 h-4" />
                    {file.name}
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-slate-900">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-500">PDF, PNG, JPG, or TXT (max. 10MB)</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <Button 
            className="w-full h-12 text-base bg-indigo-600 hover:bg-indigo-700 text-white" 
            onClick={handleRunAnalysis}
          >
            Run Analysis
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
