import { AnalysisResult } from "@/types";

const STORAGE_KEY = "ux_clarifier_history";
const MAX_HISTORY = 50;

export function saveAnalysis(result: AnalysisResult): void {
  try {
    const history = getHistory();
    const updatedHistory = [result, ...history].slice(0, MAX_HISTORY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Failed to save analysis to local storage", error);
  }
}

export function getHistory(): AnalysisResult[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get history from local storage", error);
    return [];
  }
}

export function getAnalysisById(id: string): AnalysisResult | undefined {
  const history = getHistory();
  return history.find((item) => item.id === id);
}

export function deleteAnalysis(id: string): void {
  try {
    const history = getHistory();
    const updatedHistory = history.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Failed to delete analysis from local storage", error);
  }
}
