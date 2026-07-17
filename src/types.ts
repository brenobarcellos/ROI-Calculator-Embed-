export type Language = 'es' | 'en' | 'pt';

export interface InstitutionInputs {
  country: string;
  students: number;
  faculty: number;
  
  // Student Dropout (Step 2)
  dropoutRate: number; // 0 to 100
  annualTuition: number;

  // Digital Resources (Step 3)
  digitalInvestment: number;
  resourceUtilization: number; // 0 to 100

  // Knowledge Management (Step 4)
  weeklySearchHours: number;
  facultyHourlyCost: number;

  // Student Engagement (Step 5)
  activeStudentsPct: number; // 0 to 100
  inactiveStudentCost: number;

  // ODILO Investment (Step 6)
  odiloInvestment: number;
}

export interface LeadCaptureData {
  firstName: string;
  lastName: string;
  email: string;
  institution: string;
  jobTitle: string;
  country: string;
  phone?: string;
  consentGdpr: boolean;
  consentLgpd: boolean;
}

export interface ScenarioMetrics {
  name: string; // "conservative" | "expected" | "optimistic" | "custom"
  dropoutReduction: number;
  resourceImprovement: number;
  knowledgeImprovement: number;
  engagementImprovement: number;
  
  // Calculated Benefits
  dropoutBenefit: number;
  resourceBenefit: number;
  knowledgeBenefit: number;
  engagementBenefit: number;
  totalBenefit: number;

  // ROI & Payback
  roi: number;
  paybackMonths: number | null;
}

export interface CalculationResults {
  costs: {
    dropout: number;
    resource: number;
    knowledge: number;
    engagement: number;
    total: number;
  };
  scenarios: {
    conservative: ScenarioMetrics;
    expected: ScenarioMetrics;
    optimistic: ScenarioMetrics;
    custom: ScenarioMetrics;
  };
}

export interface SavedLeadRecord {
  id: string;
  lead: LeadCaptureData;
  inputs: InstitutionInputs;
  results: CalculationResults;
  date: string;
  scenario: string; // selected scenario at submission
}
