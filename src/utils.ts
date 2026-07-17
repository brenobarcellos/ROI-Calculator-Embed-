import { InstitutionInputs, LeadCaptureData, CalculationResults, ScenarioMetrics } from './types';
import { countries } from './translations';

export const DEFAULT_INPUTS: InstitutionInputs = {
  country: 'MX',
  students: 15000,
  faculty: 800,
  dropoutRate: 12,
  annualTuition: 4500,
  digitalInvestment: 300000,
  resourceUtilization: 40,
  weeklySearchHours: 3,
  facultyHourlyCost: 25,
  activeStudentsPct: 65,
  inactiveStudentCost: 500,
  odiloInvestment: 120000,
};

// Formatter helper based on selected country and language
export function formatCurrency(value: number, countryCode: string, lang: string): string {
  const countryObj = countries.find(c => c.code === countryCode) || countries[0];
  const locale = lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-MX' : 'en-US';
  
  try {
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
    
    if (countryObj.code === 'ES') {
      return `${formatted} €`;
    }
    return `${countryObj.symbol} ${formatted}`;
  } catch (e) {
    return `${countryObj.symbol} ${Math.round(value).toLocaleString()}`;
  }
}

export function formatNumber(value: number, lang: string): string {
  const locale = lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-MX' : 'en-US';
  return new Intl.NumberFormat(locale).format(value);
}

export function formatPercent(value: number, lang: string): string {
  return `${value.toFixed(1)}%`;
}

export function calculateAll(inputs: InstitutionInputs): CalculationResults {
  // 1. Costs calculations
  const dropoutCost = inputs.students * (inputs.dropoutRate / 100) * inputs.annualTuition;
  const resourceCost = inputs.digitalInvestment * (1 - (inputs.resourceUtilization / 100));
  const knowledgeCost = inputs.faculty * inputs.weeklySearchHours * 40 * inputs.facultyHourlyCost;
  const engagementCost = inputs.students * (1 - (inputs.activeStudentsPct / 100)) * inputs.inactiveStudentCost;
  const totalCost = dropoutCost + resourceCost + knowledgeCost + engagementCost;

  const createScenario = (
    name: string,
    dropoutRed: number,
    resourceImp: number,
    knowImp: number,
    engImp: number
  ): ScenarioMetrics => {
    const dropoutBenefit = dropoutCost * (dropoutRed / 100);
    const resourceBenefit = resourceCost * (resourceImp / 100);
    const knowledgeBenefit = knowledgeCost * (knowImp / 100);
    const engagementBenefit = engagementCost * (engImp / 100);
    const totalBenefit = dropoutBenefit + resourceBenefit + knowledgeBenefit + engagementBenefit;

    const odiloInv = inputs.odiloInvestment;
    const roi = odiloInv > 0 ? ((totalBenefit - odiloInv) / odiloInv) * 100 : 0;
    
    let paybackMonths: number | null = null;
    if (totalBenefit > 0 && odiloInv > 0) {
      const monthlyBenefit = totalBenefit / 12;
      paybackMonths = odiloInv / monthlyBenefit;
    }

    return {
      name,
      dropoutReduction: dropoutRed,
      resourceImprovement: resourceImp,
      knowledgeImprovement: knowImp,
      engagementImprovement: engImp,
      dropoutBenefit,
      resourceBenefit,
      knowledgeBenefit,
      engagementBenefit,
      totalBenefit,
      roi,
      paybackMonths,
    };
  };

  // Scenarios defined in requirements
  const conservative = createScenario('conservative', 3, 20, 20, 15);
  const expected = createScenario('expected', 5, 35, 35, 25);
  const optimistic = createScenario('optimistic', 8, 50, 50, 40);

  // Custom scenario (matching Expected values initially)
  const custom = createScenario('custom', 5.5, 35, 35, 27);

  return {
    costs: {
      dropout: dropoutCost,
      resource: resourceCost,
      knowledge: knowledgeCost,
      engagement: engagementCost,
      total: totalCost,
    },
    scenarios: {
      conservative,
      expected,
      optimistic,
      custom,
    },
  };
}

// Format lead data for dynamic CRM updates
export function formatCrmPayload(
  lead: LeadCaptureData,
  inputs: InstitutionInputs,
  results: CalculationResults,
  scenarioName: keyof typeof results.scenarios
) {
  const activeScenario = results.scenarios[scenarioName];
  return {
    crm_integration: {
      source: "ODILO ROI Calculator for Higher Education",
      timestamp: new Date().toISOString(),
      scenario_selected: scenarioName,
      lead_profile: {
        first_name: lead.firstName,
        last_name: lead.lastName,
        email: lead.email,
        phone: lead.phone || null,
        job_title: lead.jobTitle,
        institution_name: lead.institution,
        country: lead.country,
        consents: {
          gdpr: lead.consentGdpr,
          lgpd: lead.consentLgpd
        }
      },
      institution_inputs: {
        total_students: inputs.students,
        total_faculty: inputs.faculty,
        dropout_rate_percent: inputs.dropoutRate,
        annual_tuition_currency: inputs.annualTuition,
        digital_investment_annual: inputs.digitalInvestment,
        utilization_rate_percent: inputs.resourceUtilization,
        weekly_prep_hours_per_teacher: inputs.weeklySearchHours,
        faculty_hourly_cost: inputs.facultyHourlyCost,
        engagement_percent_active: inputs.activeStudentsPct,
        cost_per_inactive_student: inputs.inactiveStudentCost,
        proposed_odilo_investment: inputs.odiloInvestment
      },
      financial_impact_analysis: {
        calculated_challenges_cost: {
          student_dropout_pain: results.costs.dropout,
          digital_underutilization_pain: results.costs.resource,
          knowledge_mgmt_inefficiency_pain: results.costs.knowledge,
          student_disengagement_pain: results.costs.engagement,
          total_annual_leakage: results.costs.total
        },
        projected_odilo_performance: {
          dropout_recovery: activeScenario.dropoutBenefit,
          digital_resource_optimization: activeScenario.resourceBenefit,
          faculty_productivity_gain: activeScenario.knowledgeBenefit,
          student_engagement_gain: activeScenario.engagementBenefit,
          total_annual_economic_benefit: activeScenario.totalBenefit,
          estimated_roi_percentage: activeScenario.roi,
          payback_period_months: activeScenario.paybackMonths
        }
      }
    }
  };
}
