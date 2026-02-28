"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAnalysisById } from "@/lib/storage";
import { AnalysisResult } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, RefreshCw, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { format } from "date-fns";

export default function AnalysisResultPage() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    if (params.id) {
      const data = getAnalysisById(params.id as string);
      if (data) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setResult(data);
      } else {
        router.push("/");
      }
    }
  }, [params.id, router]);

  if (!result) return null;

  const handlePrint = () => {
    window.print();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High": return "bg-red-100 text-red-800 border-red-200";
      case "Medium": return "bg-amber-100 text-amber-800 border-amber-200";
      case "Low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "High": return "bg-rose-100 text-rose-800 border-rose-200";
      case "Medium": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Low": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="flex items-center justify-between print:hidden">
        <Button variant="ghost" className="gap-2" onClick={() => router.push("/")}>
          <ArrowLeft className="w-4 h-4" />
          Back to Input
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={handlePrint}>
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => router.push("/")}>
            <RefreshCw className="w-4 h-4" />
            Refine Analysis
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{result.featureTitle}</h1>
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-slate-500">Ambiguity Score</span>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${result.ambiguityScore > 70 ? 'text-red-600' : result.ambiguityScore > 40 ? 'text-amber-600' : 'text-green-600'}`}>
                {result.ambiguityScore}
              </span>
              <span className="text-sm text-slate-400">/ 100</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-500">Analyzed on {format(new Date(result.date), "PPP 'at' p")}</p>
      </div>

      <Card className="border-indigo-100 bg-indigo-50/50 shadow-none">
        <CardHeader>
          <CardTitle className="text-indigo-900 flex items-center gap-2">
            <Info className="w-5 h-5 text-indigo-600" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700 leading-relaxed">{result.executiveSummary}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Implicit Assumptions
            </CardTitle>
            <CardDescription>Hidden premises that need validation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.implicitAssumptions.map((item, i) => (
              <div key={i} className="p-4 rounded-lg border border-slate-100 bg-slate-50/50">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <span className="text-sm font-semibold text-slate-700">{item.type}</span>
                  <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getSeverityColor(item.severity)}`}>
                    {item.severity}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              System Risk Scenarios
            </CardTitle>
            <CardDescription>Edge cases and structural vulnerabilities.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.systemRiskScenarios.map((item, i) => (
              <div key={i} className="p-4 rounded-lg border border-slate-100 bg-slate-50/50">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <span className="text-sm font-semibold text-slate-700">{item.category}</span>
                  <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getImpactColor(item.impact)}`}>
                    {item.impact}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{item.scenario}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Predicted UX Problems
          </CardTitle>
          <CardDescription>Potential usability issues and heuristic violations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.predictedUXProblems.map((item, i) => (
            <div key={i} className="p-4 rounded-lg border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900 mb-1">{item.problem}</p>
                <p className="text-xs text-slate-500">Violates: {item.heuristicViolated}</p>
              </div>
              <div className="shrink-0">
                <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getSeverityColor(item.severity)}`}>
                  {item.severity}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-emerald-100 bg-emerald-50/30 shadow-none">
        <CardHeader>
          <CardTitle className="text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Next Actions
          </CardTitle>
          <CardDescription>Recommended steps to clarify the feature.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {result.nextActions.map((action, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{action}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
