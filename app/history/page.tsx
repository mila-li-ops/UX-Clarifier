"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getHistory, deleteAnalysis } from "@/lib/storage";
import { AnalysisResult } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHistory(getHistory());
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteAnalysis(id);
    setHistory(getHistory());
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2" onClick={() => router.push("/")}>
          <ArrowLeft className="w-4 h-4" />
          Back to Input
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analysis History</h1>
        <p className="text-sm text-slate-500">View your previous feature validations. Stored locally.</p>
      </div>

      {history.length === 0 ? (
        <Card className="border-dashed border-2 bg-slate-50/50 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No history yet</h3>
            <p className="text-sm text-slate-500 max-w-sm">
              Run an analysis on the home page to see your results here.
            </p>
            <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => router.push("/")}>
              Start Analysis
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {history.map((item) => (
            <Card 
              key={item.id} 
              className="hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => router.push(`/analysis/${item.id}`)}
            >
              <CardContent className="p-6 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="text-lg font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                    {item.featureTitle}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(item.date), "MMM d, yyyy")}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${item.ambiguityScore > 70 ? 'bg-red-500' : item.ambiguityScore > 40 ? 'bg-amber-500' : 'bg-green-500'}`} />
                      Score: {item.ambiguityScore}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="hidden sm:flex flex-col items-end mr-4">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Ambiguity</span>
                    <span className={`text-xl font-bold ${item.ambiguityScore > 70 ? 'text-red-600' : item.ambiguityScore > 40 ? 'text-amber-600' : 'text-green-600'}`}>
                      {item.ambiguityScore}
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                    onClick={(e) => handleDelete(item.id, e)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
