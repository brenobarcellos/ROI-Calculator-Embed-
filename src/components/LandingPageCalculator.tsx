import { useState } from 'react';
import { InstitutionInputs, Language, CalculationResults } from '../types';
import { translations, countries } from '../translations';
import { calculateAll, formatCurrency } from '../utils';
import { motion } from 'motion/react';
import { HelpCircle, Code, Copy, Check, Info, Sparkles, TrendingUp, DollarSign, ArrowRight } from 'lucide-react';

interface LandingPageCalculatorProps {
  currentLang: Language;
  onLangChange: (lang: Language) => void;
  onUnlockReport: (inputs: InstitutionInputs) => void;
  inputs: InstitutionInputs;
  onUpdateInputs: (inputs: InstitutionInputs) => void;
}

export default function LandingPageCalculator({
  currentLang,
  onLangChange,
  onUnlockReport,
  inputs,
  onUpdateInputs,
}: LandingPageCalculatorProps) {
  const t = translations[currentLang];
  const [copied, setCopied] = useState(false);
  const [embedLang, setEmbedLang] = useState<Language>(currentLang);
  const [embedHeight, setEmbedHeight] = useState('750');
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Perform calculation in real time
  const results = calculateAll(inputs);
  const expectedScenario = results.scenarios.expected;

  const handleSliderChange = (field: keyof InstitutionInputs, value: number) => {
    onUpdateInputs({
      ...inputs,
      [field]: value,
      // Keep faculty count estimated as ~5% of students for simplified calculations
      ...(field === 'students' ? { faculty: Math.max(10, Math.round(value * 0.05)) } : {}),
    });
  };

  // Generate responsive embed code
  const appUrl = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : 'https://roi.odilo.us';
  const iframeCode = `<iframe src="${appUrl}?embed=true&lang=${embedLang}" width="100%" height="${embedHeight}" style="border:none; border-radius:16px; background:#FFFFFF; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05);" allow="geolocation"></iframe>`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(iframeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-10" id="landing-page-calculator-view">
      {/* Intro pitch focused on conversion */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-100">
          <Sparkles className="h-3 w-3" />
          {currentLang === 'pt' ? 'Otimizado para Landing Pages' : currentLang === 'es' ? 'Optimizado para Landing Pages' : 'Optimized for High-Conversion Landing Pages'}
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight sm:text-4xl">
          {currentLang === 'pt' 
            ? 'Simulador de Impacto Financeiro e ROI Simplificado'
            : currentLang === 'es'
            ? 'Simulador de Impacto Financiero y ROI Simplificado'
            : 'Interactive Higher-Ed Financial Leakage & ROI Widget'}
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          {t.landingModeDesc}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Sliders Control Panel (7 columns) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-gray-900 border-b border-gray-50 pb-3">
            {currentLang === 'pt' ? 'Parâmetros de Simulação Rápida' : currentLang === 'es' ? 'Parámetros de Simulación Rápida' : 'Quick Simulation Parameters'}
          </h2>

          <div className="space-y-5">
            {/* Country Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider" htmlFor="quick-country">
                {t.country}
              </label>
              <select
                id="quick-country"
                value={inputs.country}
                onChange={e => handleSliderChange('country', e.target.value as any)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              >
                {countries.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.names[currentLang]} ({c.currency})
                  </option>
                ))}
              </select>
            </div>

            {/* Students count slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-bold text-gray-700">
                <label htmlFor="quick-students-slider">{t.quickStudents}</label>
                <span className="text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded font-black">
                  {inputs.students.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-gray-400 font-bold">1k</span>
                <input
                  type="range"
                  id="quick-students-slider"
                  min="1000"
                  max="60000"
                  step="500"
                  value={inputs.students}
                  onChange={e => handleSliderChange('students', parseInt(e.target.value))}
                  className="flex-1 accent-emerald-600"
                />
                <span className="text-[10px] text-gray-400 font-bold">60k</span>
              </div>
            </div>

            {/* Average Tuition slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-bold text-gray-700">
                <label htmlFor="quick-tuition-slider">{t.quickTuition}</label>
                <span className="text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded font-black">
                  {formatCurrency(inputs.annualTuition, inputs.country, currentLang)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-gray-400 font-bold">$1k</span>
                <input
                  type="range"
                  id="quick-tuition-slider"
                  min="1000"
                  max="20000"
                  step="250"
                  value={inputs.annualTuition}
                  onChange={e => handleSliderChange('annualTuition', parseInt(e.target.value))}
                  className="flex-1 accent-emerald-600"
                />
                <span className="text-[10px] text-gray-400 font-bold">$20k</span>
              </div>
            </div>

            {/* Dropout Rate slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-bold text-gray-700">
                <div className="flex items-center gap-1.5">
                  <label htmlFor="quick-dropout-slider">{t.quickDropout}</label>
                  <button
                    type="button"
                    onClick={() => setActiveTooltip(activeTooltip === 'dropout' ? null : 'dropout')}
                    className="text-gray-400 hover:text-emerald-500"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span className="text-red-600 bg-red-50 px-2.5 py-0.5 rounded font-black">
                  {inputs.dropoutRate}%
                </span>
              </div>
              {activeTooltip === 'dropout' && (
                <div className="rounded-lg bg-emerald-50/70 p-3 text-xs text-emerald-800 leading-relaxed border border-emerald-100">
                  {t.tooltipDropout}
                </div>
              )}
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-gray-400 font-bold">2%</span>
                <input
                  type="range"
                  id="quick-dropout-slider"
                  min="2"
                  max="25"
                  step="0.5"
                  value={inputs.dropoutRate}
                  onChange={e => handleSliderChange('dropoutRate', parseFloat(e.target.value))}
                  className="flex-1 accent-red-500"
                />
                <span className="text-[10px] text-gray-400 font-bold">25%</span>
              </div>
            </div>

            {/* Digital Investment slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-bold text-gray-700">
                <div className="flex items-center gap-1.5">
                  <label htmlFor="quick-digital-slider">{t.quickDigital}</label>
                  <button
                    type="button"
                    onClick={() => setActiveTooltip(activeTooltip === 'digital' ? null : 'digital')}
                    className="text-gray-400 hover:text-emerald-500"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span className="text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded font-black">
                  {formatCurrency(inputs.digitalInvestment, inputs.country, currentLang)}
                </span>
              </div>
              {activeTooltip === 'digital' && (
                <div className="rounded-lg bg-emerald-50/70 p-3 text-xs text-emerald-800 leading-relaxed border border-emerald-100">
                  {t.tooltipDigital}
                </div>
              )}
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-gray-400 font-bold">$50k</span>
                <input
                  type="range"
                  id="quick-digital-slider"
                  min="50000"
                  max="800000"
                  step="10000"
                  value={inputs.digitalInvestment}
                  onChange={e => handleSliderChange('digitalInvestment', parseInt(e.target.value))}
                  className="flex-1 accent-emerald-600"
                />
                <span className="text-[10px] text-gray-400 font-bold">$800k</span>
              </div>
            </div>

            {/* ODILO Investment slider */}
            <div className="flex flex-col gap-1.5 pt-3 border-t border-gray-50">
              <div className="flex justify-between text-xs font-bold text-gray-700">
                <div className="flex items-center gap-1.5">
                  <label className="text-emerald-950 font-extrabold" htmlFor="quick-odilo-slider">{t.quickOdilo}</label>
                  <button
                    type="button"
                    onClick={() => setActiveTooltip(activeTooltip === 'odilo' ? null : 'odilo')}
                    className="text-gray-400 hover:text-emerald-500"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span className="text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded font-black">
                  {formatCurrency(inputs.odiloInvestment, inputs.country, currentLang)}
                </span>
              </div>
              {activeTooltip === 'odilo' && (
                <div className="rounded-lg bg-emerald-50/70 p-3 text-xs text-emerald-800 leading-relaxed border border-emerald-100">
                  {t.tooltipOdilo}
                </div>
              )}
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-gray-400 font-bold">$20k</span>
                <input
                  type="range"
                  id="quick-odilo-slider"
                  min="20000"
                  max="300000"
                  step="5000"
                  value={inputs.odiloInvestment}
                  onChange={e => handleSliderChange('odiloInvestment', parseInt(e.target.value))}
                  className="flex-1 accent-emerald-700"
                />
                <span className="text-[10px] text-gray-400 font-bold">$300k</span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-Time Outcome Metrics (5 columns) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg space-y-6 relative overflow-hidden border border-slate-850">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(16,185,129,0.08)_0%,transparent_70%)] pointer-events-none" />
            
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 border-b border-slate-800 pb-3">
              {currentLang === 'pt' ? 'Resultados Calculados em Tempo Real' : currentLang === 'es' ? 'Resultados Calculados en Tiempo Real' : 'Real-Time Financial Outlook'}
            </h3>

            {/* Total leak leakage */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">
                {t.totalPain}
              </span>
              <span className="text-3xl font-black text-white block">
                {formatCurrency(results.costs.total, inputs.country, currentLang)}
              </span>
              <span className="text-[10px] text-gray-400 block">
                {currentLang === 'pt' ? 'Perdas anuais estimadas na instituição' : currentLang === 'es' ? 'Pérdidas anuales estimadas en la institución' : 'Estimated total annual institutional losses'}
              </span>
            </div>

            {/* Projected savings with ODILO */}
            <div className="space-y-1 pt-4 border-t border-slate-800">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                {t.annualBenefit} ({currentLang === 'en' ? 'Expected' : 'Esperado'})
              </span>
              <span className="text-3xl font-black text-emerald-400 block">
                {formatCurrency(expectedScenario.totalBenefit, inputs.country, currentLang)}
              </span>
              <span className="text-[10px] text-emerald-300 font-medium block">
                {currentLang === 'pt' ? 'Economia e receita recuperada anualmente' : currentLang === 'es' ? 'Ahorros y ingresos recuperados anualmente' : 'Annual recovered revenue and optimized spend'}
              </span>
            </div>

            {/* Split KPIs */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  {t.roiLabel}
                </span>
                <span className="text-xl font-black text-white block">
                  {expectedScenario.roi >= 0 ? `${Math.round(expectedScenario.roi)}%` : '–'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  {t.paybackLabel}
                </span>
                <span className="text-xl font-black text-white block">
                  {expectedScenario.paybackMonths ? `${expectedScenario.paybackMonths.toFixed(1)} ${currentLang === 'pt' ? 'meses' : currentLang === 'en' ? 'months' : 'meses'}` : '–'}
                </span>
              </div>
            </div>

            {/* CTA Conversion trigger */}
            <div className="pt-4">
              <button
                type="button"
                onClick={() => onUnlockReport(inputs)}
                className="cursor-pointer w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-5 py-4 text-sm font-black text-white shadow-md hover:shadow-lg transition-all"
              >
                {t.viewFullReport}
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="text-center text-[10px] text-gray-400 font-medium mt-3 leading-relaxed">
                {t.landingCtaDesc}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Embedding configuration Panel (Fully client-facing, makes integration extremely simple!) */}
      <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <Code className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-black text-gray-900">
            {t.embedTitle}
          </h2>
        </div>

        <p className="text-sm text-gray-500 leading-relaxed">
          {t.embedDesc}
        </p>

        <div className="grid gap-6 md:grid-cols-12 items-end">
          {/* Controls */}
          <div className="md:col-span-5 space-y-4">
            {/* Widget Preset Language */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider" htmlFor="embed-lang-select">
                {currentLang === 'pt' ? 'Idioma Pré-definido' : currentLang === 'es' ? 'Idioma Predefinido' : 'Preset Language'}
              </label>
              <select
                id="embed-lang-select"
                value={embedLang}
                onChange={e => setEmbedLang(e.target.value as Language)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs focus:border-emerald-500"
              >
                <option value="es">Español (ES)</option>
                <option value="en">English (EN)</option>
                <option value="pt">Português (PT)</option>
              </select>
            </div>

            {/* Preset Height */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider" htmlFor="embed-height-select">
                {currentLang === 'pt' ? 'Altura do Iframe' : currentLang === 'es' ? 'Altura del Iframe' : 'Iframe Height'}
              </label>
              <select
                id="embed-height-select"
                value={embedHeight}
                onChange={e => setEmbedHeight(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs focus:border-emerald-500"
              >
                <option value="650">650 px (Compact)</option>
                <option value="750">750 px (Recommended)</option>
                <option value="850">850 px (Generous)</option>
              </select>
            </div>
          </div>

          {/* Iframe Code display */}
          <div className="md:col-span-7 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {currentLang === 'pt' ? 'Código HTML de Incorporação' : currentLang === 'es' ? 'Código HTML de Incorporación' : 'HTML Embedding Code'}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 px-3 py-1.5 text-xs font-bold transition-all"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    {t.copied}
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    {t.copyCode}
                  </>
                )}
              </button>
            </div>

            <pre className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-emerald-400 overflow-x-auto max-h-[140px] leading-relaxed border border-slate-900 select-all">
              {iframeCode}
            </pre>
          </div>
        </div>

        {/* Mini Guide for common CMS */}
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 flex gap-3 items-start">
          <Info className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-gray-500 leading-relaxed space-y-1">
            <span className="font-bold text-gray-700 block">
              {currentLang === 'pt' ? 'Como incorporar no seu site corporativo:' : currentLang === 'es' ? 'Cómo incorporar en su sitio web corporativo:' : 'How to publish on your corporate website:'}
            </span>
            <p>
              {currentLang === 'pt' 
                ? '• No WordPress: Adicione um bloco de "HTML Personalizado" e cole o código.'
                : currentLang === 'es'
                ? '• En WordPress: Añada un bloque de "HTML Personalizado" y pegue el código.'
                : '• On WordPress: Add a "Custom HTML" block and paste the copied snippet.'}
            </p>
            <p>
              {currentLang === 'pt'
                ? '• No Webflow / Elementor: Adicione um componente de "Embed" / "HTML" e insira o iframe.'
                : currentLang === 'es'
                ? '• En Webflow / Elementor: Añada un componente de "Embed" / "Código" e inserte el iframe.'
                : '• On Webflow / Elementor: Add an "Embed" or "HTML Code" block and paste the iframe.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
