export interface Assumption {
  type: string;
  description: string;
  severity: "Low" | "Medium" | "High";
}

export interface RiskScenario {
  category: string;
  scenario: string;
  impact: "Low" | "Medium" | "High";
}

export interface UXProblem {
  problem: string;
  heuristicViolated: string;
  severity: "Low" | "Medium" | "High";
}

export interface AnalysisResult {
  id: string;
  date: string;
  featureTitle: string;
  ambiguityScore: number;
  executiveSummary: string;
  implicitAssumptions: Assumption[];
  systemRiskScenarios: RiskScenario[];
  predictedUXProblems: UXProblem[];
  nextActions: string[];
}
