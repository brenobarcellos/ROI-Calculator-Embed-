import { useState, useEffect } from 'react';
import { InstitutionInputs, Language, CalculationResults, LeadCaptureData, ScenarioMetrics } from '../types';
import { translations } from '../translations';
import { formatCurrency, formatNumber, formatPercent } from '../utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Download, Calendar, Mail, FileText, Settings, RefreshCw, Layers, CheckCircle2, DollarSign, RotateCcw } from 'lucide-react';
import jsPDF from 'jspdf';

interface ExecutiveDashboardProps {
  currentLang: Language;
  inputs: InstitutionInputs;
  results: CalculationResults;
  lead: LeadCaptureData;
  onUpdateInputs: (inputs: InstitutionInputs) => void;
  onRestart: () => void;
}

export default function ExecutiveDashboard({
  currentLang,
  inputs,
  results,
  lead,
  onUpdateInputs,
  onRestart,
}: ExecutiveDashboardProps) {
  const t = translations[currentLang];
  const [selectedScenario, setSelectedScenario] = useState<'conservative' | 'expected' | 'optimistic' | 'custom'>('expected');
  const [customRates, setCustomRates] = useState({
    dropout: 5.5,
    adoption: 35,
    knowledge: 35,
    engagement: 27,
  });

  // AI-generated insights states
  const [insights, setInsights] = useState<{ summary: string; recommendations: string[] } | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insightError, setInsightError] = useState(false);

  // Recalculate whenever selected scenario or custom rates changes
  useEffect(() => {
    if (selectedScenario === 'custom') {
      const updatedInputs = {
        ...inputs,
        // Trigger a fake inputs update to recalculate custom scenario
      };
    }
  }, [selectedScenario, customRates]);

  // Fetch AI Insights from server endpoint
  useEffect(() => {
    const fetchAiInsights = async () => {
      setLoadingInsights(true);
      setInsightError(false);
      try {
        const response = await fetch('/api/generate-insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inputs, lead, lang: currentLang, results }),
        });
        if (response.ok) {
          const data = await response.json();
          setInsights(data);
        } else {
          setInsightError(true);
        }
      } catch (err) {
        setInsightError(true);
      } finally {
        setLoadingInsights(false);
      }
    };
    fetchAiInsights();
  }, [inputs, currentLang]);

  // Calculate dynamic custom values based on slider adjustments
  const dropoutCost = results.costs.dropout;
  const resourceCost = results.costs.resource;
  const knowledgeCost = results.costs.knowledge;
  const engagementCost = results.costs.engagement;

  const customDropoutBenefit = dropoutCost * (customRates.dropout / 100);
  const customResourceBenefit = resourceCost * (customRates.adoption / 100);
  const customKnowledgeBenefit = knowledgeCost * (customRates.knowledge / 100);
  const customEngagementBenefit = engagementCost * (customRates.engagement / 100);
  const customTotalBenefit = customDropoutBenefit + customResourceBenefit + customKnowledgeBenefit + customEngagementBenefit;
  const customRoi = inputs.odiloInvestment > 0 ? ((customTotalBenefit - inputs.odiloInvestment) / inputs.odiloInvestment) * 100 : 0;
  const customPayback = customTotalBenefit > 0 && inputs.odiloInvestment > 0 ? (inputs.odiloInvestment / (customTotalBenefit / 12)) : null;

  // Active scenario properties based on selected scenario tab
  const getActiveScenarioMetrics = (): {
    name: string;
    dropoutPct: number;
    resourcePct: number;
    knowledgePct: number;
    engagementPct: number;
    dropoutBenefit: number;
    resourceBenefit: number;
    knowledgeBenefit: number;
    engagementBenefit: number;
    totalBenefit: number;
    roi: number;
    payback: number | null;
  } => {
    if (selectedScenario === 'custom') {
      return {
        name: t.custom,
        dropoutPct: customRates.dropout,
        resourcePct: customRates.adoption,
        knowledgePct: customRates.knowledge,
        engagementPct: customRates.engagement,
        dropoutBenefit: customDropoutBenefit,
        resourceBenefit: customResourceBenefit,
        knowledgeBenefit: customKnowledgeBenefit,
        engagementBenefit: customEngagementBenefit,
        totalBenefit: customTotalBenefit,
        roi: customRoi,
        payback: customPayback,
      };
    }
    const s = results.scenarios[selectedScenario];
    return {
      name: t[selectedScenario],
      dropoutPct: s.dropoutReduction,
      resourcePct: s.resourceImprovement,
      knowledgePct: s.knowledgeImprovement,
      engagementPct: s.engagementImprovement,
      dropoutBenefit: s.dropoutBenefit,
      resourceBenefit: s.resourceBenefit,
      knowledgeBenefit: s.knowledgeBenefit,
      engagementBenefit: s.engagementBenefit,
      totalBenefit: s.totalBenefit,
      roi: s.roi,
      payback: s.paybackMonths,
    };
  };

  const active = getActiveScenarioMetrics();

  // Color mappings
  const COLORS = {
    dropout: '#EF4444',     // Red
    resource: '#F59E0B',    // Amber
    knowledge: '#3B82F6',   // Blue
    engagement: '#8B5CF6',  // Purple
  };

  // Recharts Chart 1: Cost breakdown (Pie Chart)
  const pieData = [
    { name: t.step2Title, value: results.costs.dropout, color: COLORS.dropout },
    { name: currentLang === 'en' ? 'Digital Resources' : currentLang === 'pt' ? 'Recursos Digitais' : 'Recursos Digitales', value: results.costs.resource, color: COLORS.resource },
    { name: currentLang === 'en' ? 'Knowledge Management' : currentLang === 'pt' ? 'Gestão Conhecimento' : 'Gestión Conocimiento', value: results.costs.knowledge, color: COLORS.knowledge },
    { name: currentLang === 'en' ? 'Student Engagement' : currentLang === 'pt' ? 'Engajamento' : 'Participación', value: results.costs.engagement, color: COLORS.engagement },
  ];

  // Recharts Chart 2: Benefits breakdown (Bar Chart)
  const barData = [
    {
      name: currentLang === 'en' ? 'Dropout Benefit' : currentLang === 'pt' ? 'Benefício Evasão' : 'Beneficio Deserción',
      value: active.dropoutBenefit,
      color: COLORS.dropout,
    },
    {
      name: currentLang === 'en' ? 'Digital Resource optimization' : currentLang === 'pt' ? 'Recursos Otimizados' : 'Recursos Optimizados',
      value: active.resourceBenefit,
      color: COLORS.resource,
    },
    {
      name: currentLang === 'en' ? 'Faculty Productivity' : currentLang === 'pt' ? 'Produtividade Docente' : 'Productividad Docente',
      value: active.knowledgeBenefit,
      color: COLORS.knowledge,
    },
    {
      name: currentLang === 'en' ? 'Engagement gain' : currentLang === 'pt' ? 'Ganhos Engajamento' : 'Ganancia Participación',
      value: active.engagementBenefit,
      color: COLORS.engagement,
    },
  ];

  // Recharts Chart 3: ROI Comparison across scenarios
  const roiComparisonData = [
    { name: t.conservative, value: Math.round(results.scenarios.conservative.roi) },
    { name: t.expected, value: Math.round(results.scenarios.expected.roi) },
    { name: t.optimistic, value: Math.round(results.scenarios.optimistic.roi) },
    { name: t.custom, value: Math.round(customRoi) },
  ];

  // Recharts Chart 4: Payback comparison across scenarios
  const paybackComparisonData = [
    { name: t.conservative, value: results.scenarios.conservative.paybackMonths ? parseFloat(results.scenarios.conservative.paybackMonths.toFixed(1)) : 0 },
    { name: t.expected, value: results.scenarios.expected.paybackMonths ? parseFloat(results.scenarios.expected.paybackMonths.toFixed(1)) : 0 },
    { name: t.optimistic, value: results.scenarios.optimistic.paybackMonths ? parseFloat(results.scenarios.optimistic.paybackMonths.toFixed(1)) : 0 },
    { name: t.custom, value: customPayback ? parseFloat(customPayback.toFixed(1)) : 0 },
  ];

  // PDF Export Implementation
  const handleDownloadPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Color definitions matching ODILO Palette
    const primaryColor = [87, 87, 86]; // Dark Gray
    const accentColor = [79, 70, 229]; // Indigo
    const secondaryColor = [7, 7, 79]; // Dark Blue

    // Setup styles
    doc.setFillColor(242, 243, 247); // Light background
    doc.rect(0, 0, 210, 297, 'F');

    // Header bar
    doc.setFillColor(7, 7, 79); // Indigo header
    doc.rect(0, 0, 210, 32, 'F');

    // Header Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(t.pdfHeader, 15, 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`ODILO ROI ANALYSIS REPORT`, 15, 20);

    doc.setFontSize(9);
    doc.setTextColor(200, 200, 250);
    doc.text(`${t.pdfPreparedFor} ${lead.firstName} ${lead.lastName} - ${lead.institution}`, 15, 26);
    doc.text(`${t.pdfDate} ${new Date().toLocaleDateString()}`, 145, 26);

    // Grid details of inputs
    let y = 42;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(12, y, 186, 45, 3, 3, 'F');

    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(t.step1Title, 18, y + 8);
    doc.line(18, y + 11, 192, y + 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`- Country: ${lead.country}`, 20, y + 18);
    doc.text(`- Enrolled Students: ${formatNumber(inputs.students, currentLang)}`, 20, y + 25);
    doc.text(`- Faculty Members: ${formatNumber(inputs.faculty, currentLang)}`, 20, y + 32);
    doc.text(`- Average Tuition Cost: ${formatCurrency(inputs.annualTuition, inputs.country, currentLang)}`, 20, y + 39);

    doc.text(`- Dropout rate: ${inputs.dropoutRate}%`, 110, y + 18);
    doc.text(`- Digital licensing budget: ${formatCurrency(inputs.digitalInvestment, inputs.country, currentLang)}`, 110, y + 25);
    doc.text(`- Active plat. utilization: ${inputs.resourceUtilization}%`, 110, y + 32);
    doc.text(`- Proposed ODILO Budget: ${formatCurrency(inputs.odiloInvestment, inputs.country, currentLang)}`, 110, y + 39);

    // Pain Analysis
    y += 52;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(12, y, 186, 52, 3, 3, 'F');

    doc.setTextColor(190, 40, 40); // Dark red for pain
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(t.totalPainCost.toUpperCase(), 18, y + 8);
    doc.line(18, y + 11, 192, y + 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text(`1. ${t.step2Title} Leakage:`, 20, y + 18);
    doc.text(`${formatCurrency(results.costs.dropout, inputs.country, currentLang)}`, 150, y + 18, { align: 'right' });

    doc.text(`2. Underutilized Digital Licenses:`, 20, y + 25);
    doc.text(`${formatCurrency(results.costs.resource, inputs.country, currentLang)}`, 150, y + 25, { align: 'right' });

    doc.text(`3. Faculty Content Search Bottlenecks:`, 20, y + 32);
    doc.text(`${formatCurrency(results.costs.knowledge, inputs.country, currentLang)}`, 150, y + 32, { align: 'right' });

    doc.text(`4. Disengaged Students Opportunity Cost:`, 20, y + 39);
    doc.text(`${formatCurrency(results.costs.engagement, inputs.country, currentLang)}`, 150, y + 39, { align: 'right' });

    doc.line(18, y + 42, 192, y + 42);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total leakage / current pain cost:`, 20, y + 47);
    doc.text(`${formatCurrency(results.costs.total, inputs.country, currentLang)}`, 150, y + 47, { align: 'right' });

    // Financial ROI impact
    y += 59;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(12, y, 186, 54, 3, 3, 'F');

    doc.setTextColor(7, 7, 79); // Indigo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`ODILO IMPACT MODEL (${active.name.toUpperCase()})`, 18, y + 8);
    doc.line(18, y + 11, 192, y + 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text(`Projected Annual savings:`, 20, y + 18);
    doc.text(`${formatCurrency(active.totalBenefit, inputs.country, currentLang)}`, 150, y + 18, { align: 'right' });

    doc.text(`ODILO Annual implementation budget:`, 20, y + 25);
    doc.text(`${formatCurrency(inputs.odiloInvestment, inputs.country, currentLang)}`, 150, y + 25, { align: 'right' });

    doc.text(`ROI (Return on Investment):`, 20, y + 32);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text(`${Math.round(active.roi)}%`, 150, y + 32, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    doc.text(`Investment payback period:`, 20, y + 39);
    doc.text(`${active.payback ? active.payback.toFixed(1) + ' months' : 'N/A'}`, 150, y + 39, { align: 'right' });

    doc.text(`Net financial impact (Year 1):`, 20, y + 46);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text(`${formatCurrency(active.totalBenefit - inputs.odiloInvestment, inputs.country, currentLang)}`, 150, y + 46, { align: 'right' });

    // AI generated Executive summary & recommendations
    y += 61;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(12, y, 186, 68, 3, 3, 'F');

    doc.setTextColor(7, 7, 79);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(t.pdfSummaryTitle, 18, y + 8);
    doc.line(18, y + 11, 192, y + 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(80, 80, 80);

    const defaultSummary = insights?.summary || `Based on your custom inputs, your institution is facing an annual leakage of ${formatCurrency(results.costs.total, inputs.country, currentLang)}. Implementing ODILO would recover approximately ${formatCurrency(active.totalBenefit, inputs.country, currentLang)} of this amount annually, achieving an estimated return on investment of ${Math.round(active.roi)}% with a payback window of ${active.payback ? active.payback.toFixed(1) + ' months' : 'N/A'}.`;
    const summaryLines = doc.splitTextToSize(defaultSummary, 174);
    doc.text(summaryLines, 18, y + 17);

    // Bullet points / Recommendations
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(9);
    doc.text(`Key Actionable Deliverables:`, 18, y + 39);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);

    const recList = insights?.recommendations || [t.recDropout, t.recResources, t.recKnowledge, t.recEngagement];
    let bulletY = y + 45;
    recList.slice(0, 3).forEach((rec) => {
      const recLines = doc.splitTextToSize(`• ${rec}`, 174);
      doc.text(recLines, 18, bulletY);
      bulletY += (recLines.length * 4);
    });

    // Footer
    doc.setFillColor(235, 237, 242);
    doc.rect(0, 287, 210, 10, 'F');
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(7);
    doc.text(t.pdfDisclaimer, 15, 293.5);

    doc.save(`ODILO_ROI_Report_${lead.institution.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Executive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <CheckCircle2 className="h-7 w-7 text-emerald-500" />
            {t.dashTitle}
          </h1>
          <p className="mt-1 text-sm text-gray-500 leading-relaxed">
            {t.dashSubtitle}
          </p>
        </div>

        {/* Action Buttons: Start Over & PDF Exporter */}
        <div className="flex gap-2.5 flex-wrap">
          <button
            onClick={onRestart}
            id="restart-calculator-btn"
            className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 px-5 py-3 text-sm font-bold text-gray-700 shadow-sm transition-all"
          >
            <RotateCcw className="h-4 w-4 text-emerald-600" />
            {currentLang === 'en' ? 'Start Over' : currentLang === 'pt' ? 'Fazer teste de novo' : 'Hacer prueba de nuevo'}
          </button>

          <button
            onClick={handleDownloadPdf}
            id="export-pdf-btn"
            className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow transition-all hover:shadow-lg"
          >
            <Download className="h-4 w-4 animate-bounce" />
            {t.pdfCta}
          </button>
        </div>
      </div>

      {/* Main KPI Counter Blocks */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Cost of Challenge Leakage */}
        <div className="rounded-2xl border border-red-100 bg-red-50/20 p-6 shadow-sm">
          <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest block mb-1">
            {t.totalPain}
          </span>
          <span className="text-2xl font-black text-gray-900 block">
            {formatCurrency(results.costs.total, inputs.country, currentLang)}
          </span>
          <span className="text-xs text-gray-400 mt-2 block">
            {currentLang === 'en' ? 'Current operational leaks' : currentLang === 'pt' ? 'Perdas operacionais' : 'Fugas operativas actuales'}
          </span>
        </div>

        {/* Projected Annual Savings */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/20 p-6 shadow-sm">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block mb-1">
            {t.annualBenefit}
          </span>
          <span className="text-2xl font-black text-emerald-700 block">
            {formatCurrency(active.totalBenefit, inputs.country, currentLang)}
          </span>
          <span className="text-xs text-emerald-600 font-medium mt-2 block">
            {currentLang === 'en' ? `Recovered through ODILO` : currentLang === 'pt' ? `Recuperados com a ODILO` : `Recuperados con ODILO`}
          </span>
        </div>

        {/* Estimated ROI */}
        <div className="rounded-2xl border border-emerald-500 bg-emerald-600 p-6 text-white shadow-md">
          <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest block mb-1">
            {t.roiLabel}
          </span>
          <span className="text-3xl font-black block">
            {active.roi >= 0 ? `${Math.round(active.roi)}%` : '–'}
          </span>
          <span className="text-xs text-emerald-50 mt-2 block">
            {t.roiEq}
          </span>
        </div>

        {/* Payback period */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
            {t.paybackLabel}
          </span>
          <span className="text-2xl font-black text-gray-900 block">
            {active.payback ? `${active.payback.toFixed(1)} ${currentLang === 'pt' ? 'meses' : currentLang === 'en' ? 'months' : 'meses'}` : '–'}
          </span>
          <span className="text-xs text-gray-500 font-medium mt-2 block">
            {t.monthlyBenefit}: <span className="font-extrabold text-emerald-600">{formatCurrency(active.totalBenefit / 12, inputs.country, currentLang)}</span>
          </span>
        </div>
      </div>

      {/* Scenario Selector Tabs */}
      <div className="rounded-2xl border border-gray-100 bg-white p-2 grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8 shadow-sm">
        {(['conservative', 'expected', 'optimistic', 'custom'] as const).map(scenarioKey => {
          let label = t[scenarioKey];
          if (scenarioKey === 'expected') {
            label = currentLang === 'en' ? 'Expected' : 'Esperado';
          } else if (scenarioKey === 'custom') {
            label = currentLang === 'en' ? 'Custom' : 'Personalizado';
          }
          return (
            <button
              key={scenarioKey}
              onClick={() => setSelectedScenario(scenarioKey)}
              id={`scenario-tab-${scenarioKey}`}
              className={`cursor-pointer rounded-xl px-2 py-2.5 text-center text-xs font-bold uppercase transition-all flex flex-col items-center justify-center min-h-[50px] ${
                selectedScenario === scenarioKey
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="text-xs">{label}</span>
              {scenarioKey === 'expected' && (
                <span className={`text-[8px] font-medium lowercase ${selectedScenario === 'expected' ? 'text-emerald-100' : 'text-emerald-600'}`}>
                  ({currentLang === 'en' ? 'recommended' : 'recomendado'})
                </span>
              )}
              {scenarioKey === 'custom' && (
                <span className={`text-[8px] font-medium lowercase ${selectedScenario === 'custom' ? 'text-emerald-100' : 'text-emerald-600'}`}>
                  ({currentLang === 'en' ? 'adjustable' : currentLang === 'pt' ? 'ajustável' : 'ajustable'})
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Visual Charts & Custom Sliders (Column 8) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Custom Sliders (Only if selectedScenario === 'custom') */}
          <AnimatePresence>
            {selectedScenario === 'custom' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50/10 p-6 shadow-sm"
              >
                <h3 className="text-sm font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-emerald-600" /> {t.customSliders}
                </h3>

                <div className="space-y-5">
                  {/* Attrition slider */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-bold text-gray-700">
                      <span>{t.bDropout}</span>
                      <span className="text-emerald-600">{customRates.dropout}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-400 font-bold">3%</span>
                      <input
                        type="range"
                        min="3"
                        max="8"
                        step="0.5"
                        value={customRates.dropout}
                        onChange={e => setCustomRates(prev => ({ ...prev, dropout: parseFloat(e.target.value) }))}
                        className="flex-1 accent-emerald-600"
                        id="custom-dropout-slider"
                      />
                      <span className="text-[10px] text-gray-400 font-bold">8%</span>
                    </div>
                  </div>

                  {/* Resource Adoption slider */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-bold text-gray-700">
                      <span>{t.bAdoption}</span>
                      <span className="text-emerald-600">{customRates.adoption}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-400 font-bold">20%</span>
                      <input
                        type="range"
                        min="20"
                        max="50"
                        step="1"
                        value={customRates.adoption}
                        onChange={e => setCustomRates(prev => ({ ...prev, adoption: parseFloat(e.target.value) }))}
                        className="flex-1 accent-emerald-600"
                        id="custom-adoption-slider"
                      />
                      <span className="text-[10px] text-gray-400 font-bold">50%</span>
                    </div>
                  </div>

                  {/* Knowledge Management slider */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-bold text-gray-700">
                      <span>{t.bKnow}</span>
                      <span className="text-emerald-600">{customRates.knowledge}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-400 font-bold">20%</span>
                      <input
                        type="range"
                        min="20"
                        max="50"
                        step="1"
                        value={customRates.knowledge}
                        onChange={e => setCustomRates(prev => ({ ...prev, knowledge: parseFloat(e.target.value) }))}
                        className="flex-1 accent-emerald-600"
                        id="custom-knowledge-slider"
                      />
                      <span className="text-[10px] text-gray-400 font-bold">50%</span>
                    </div>
                  </div>

                  {/* Engagement slider */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-bold text-gray-700">
                      <span>{t.bEng}</span>
                      <span className="text-emerald-600">{customRates.engagement}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-400 font-bold">15%</span>
                      <input
                        type="range"
                        min="15"
                        max="40"
                        step="1"
                        value={customRates.engagement}
                        onChange={e => setCustomRates(prev => ({ ...prev, engagement: parseFloat(e.target.value) }))}
                        className="flex-1 accent-emerald-600"
                        id="custom-engagement-slider"
                      />
                      <span className="text-[10px] text-gray-400 font-bold">40%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Visual Recharts side by side charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Chart 1: Cost Leakages */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">
                {t.chartCostBreakdown}
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={val => formatCurrency(val as number, inputs.country, currentLang)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-3 text-[10px] font-semibold text-gray-500">
                {pieData.map((d, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="line-clamp-1 max-w-[100px]">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 2: Savings breakdown */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">
                {t.chartBenefitBreakdown}
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ left: -10, right: 10 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={val => formatCurrency(val as number, inputs.country, currentLang)} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center text-[10px] text-gray-400 font-medium">
                {currentLang === 'en' ? `Annual potential savings` : currentLang === 'pt' ? `Economia anual potencial` : `Ahorros anuales potenciales`}
              </div>
            </div>

            {/* Chart 3: ROI comparison */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">
                {t.chartRoiComparison}
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roiComparisonData} margin={{ left: -10 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={val => `${val}%`} />
                    <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Payback period comparison */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">
                {t.chartPaybackComparison}
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={paybackComparisonData} margin={{ left: -10, right: 15 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={val => `${val} ${currentLang === 'pt' ? 'meses' : currentLang === 'en' ? 'months' : 'meses'}`} />
                    <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations Column (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/50 via-white to-white p-6 shadow-sm">
            <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              {t.recommendations}
            </h3>

            {/* Loading animation / spin for AI summary */}
            {loadingInsights ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin" />
                <p className="text-xs font-medium text-gray-400 text-center animate-pulse">
                  {currentLang === 'en'
                    ? 'AI is analyzing your institution and compiling McKinsey-grade recommendations...'
                    : currentLang === 'pt'
                    ? 'A IA está analisando sua instituição e compilando recomendações de nível executivo...'
                    : 'La IA está analizando su institución y recopilando recomendaciones de nivel ejecutivo...'}
                </p>
              </div>
            ) : insightError || !insights ? (
              // Fallback static recommendations in case of endpoint timeout or error
              <div className="space-y-4">
                <div className="rounded-xl bg-gray-50 p-4 border border-gray-100 text-xs text-gray-600 leading-relaxed">
                  {currentLang === 'en'
                    ? `Your institution could potentially recover ${formatCurrency(active.totalBenefit, inputs.country, currentLang)} annually through increased student engagement, optimized digital library licensing, and reduced dropouts.`
                    : currentLang === 'pt'
                    ? `Sua instituição poderia recuperar potencialmente ${formatCurrency(active.totalBenefit, inputs.country, currentLang)} anualmente por meio de maior engajamento dos alunos, licenças otimizadas e evasão reduzida.`
                    : `Su institución podría recuperar potencialmente ${formatCurrency(active.totalBenefit, inputs.country, currentLang)} anualmente mediante un mayor compromiso de los estudiantes, licencias digitales optimizadas y deserción reducida.`}
                </div>
                {[t.recDropout, t.recResources, t.recKnowledge, t.recEngagement].map((rec, i) => (
                  <div key={i} className="flex gap-2.5 items-start p-3 bg-white border border-gray-50 rounded-xl">
                    <div className="h-5 w-5 shrink-0 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-700 text-xs font-black">
                      {i + 1}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed font-medium">{rec}</p>
                  </div>
                ))}
              </div>
            ) : (
              // Dynamic AI insights
              <div className="space-y-4">
                <div className="rounded-xl bg-emerald-50/40 p-4 border border-emerald-100/50 text-xs text-emerald-950 font-medium leading-relaxed">
                  {insights.summary}
                </div>
                {insights.recommendations.map((rec, i) => (
                  <div key={i} className="flex gap-2.5 items-start p-3.5 bg-white border border-gray-50 rounded-xl shadow-sm">
                    <div className="h-5 w-5 shrink-0 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                      {i + 1}
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed font-semibold">{rec}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Corporate Final CTA section */}
      <div className="mt-12 rounded-2xl border border-gray-100 bg-gray-900 p-8 text-center text-white relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(16,185,129,0.12)_0%,transparent_70%)] pointer-events-none" />
        <h3 className="text-2xl font-black mb-2 relative z-10">
          Discover how ODILO can transform learning, engagement and institutional performance.
        </h3>
        <p className="mx-auto max-w-xl text-gray-400 text-sm leading-relaxed mb-6 relative z-10">
          Unlock an unlimited educational playground tailored to your specific university guidelines. Connect your LMS and start optimizing performance.
        </p>
        <div className="flex gap-3 justify-center flex-wrap relative z-10">
          <a
            href="https://www.odilo.us/contact"
            target="_blank"
            id="demo-cta-link"
            className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-6 py-3.5 text-sm font-black text-white shadow-md hover:shadow-lg transition-all"
          >
            {t.demoCta}
          </a>
          <button
            onClick={handleDownloadPdf}
            id="pdf-download-footer-btn"
            className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-800/80 hover:bg-gray-800 px-6 py-3.5 text-sm font-black text-gray-200 transition-all"
          >
            <Download className="h-4 w-4" />
            {t.pdfCta}
          </button>
        </div>
      </div>
    </div>
  );
}
