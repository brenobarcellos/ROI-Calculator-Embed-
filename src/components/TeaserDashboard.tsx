import { InstitutionInputs, Language, CalculationResults, LeadCaptureData } from '../types';
import { translations } from '../translations';
import { formatCurrency, formatNumber } from '../utils';
import LeadCaptureForm from './LeadCaptureForm';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { motion } from 'motion/react';
import { Shield, Lock, TrendingUp, AlertTriangle, HelpCircle } from 'lucide-react';

interface TeaserDashboardProps {
  currentLang: Language;
  inputs: InstitutionInputs;
  results: CalculationResults;
  onSubmitLead: (lead: LeadCaptureData) => void;
  isSubmitting?: boolean;
}

export default function TeaserDashboard({
  currentLang,
  inputs,
  results,
  onSubmitLead,
  isSubmitting = false,
}: TeaserDashboardProps) {
  const t = translations[currentLang];

  // Prepare chart data
  const costData = [
    {
      name: t.step2Title,
      value: results.costs.dropout,
      color: '#EF4444', // Red
    },
    {
      name: currentLang === 'en' ? 'Digital Resources' : currentLang === 'pt' ? 'Recursos Digitais' : 'Recursos Digitales',
      value: results.costs.resource,
      color: '#F59E0B', // Amber
    },
    {
      name: currentLang === 'en' ? 'Knowledge Mgmt' : currentLang === 'pt' ? 'Gestão Conhec.' : 'Gestión Conoc.',
      value: results.costs.knowledge,
      color: '#3B82F6', // Blue
    },
    {
      name: currentLang === 'en' ? 'Student Engagement' : currentLang === 'pt' ? 'Engajamento' : 'Participación',
      value: results.costs.engagement,
      color: '#8B5CF6', // Purple
    },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-lg">
          <p className="text-xs font-bold text-gray-500">{payload[0].name}</p>
          <p className="text-sm font-black text-gray-900 mt-1">
            {formatCurrency(payload[0].value, inputs.country, currentLang)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Upper Teaser Section - Real Unlocked Data */}
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3.5 py-1 text-xs font-bold text-red-700 border border-red-200 mb-3">
          <AlertTriangle className="h-3.5 w-3.5" /> {t.teaserTitle}
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          {t.teaserDesc}
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Cost Analysis Column (7 columns) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Big Cost Stat */}
          <div className="rounded-2xl border border-red-100 bg-red-50/20 p-8 text-center shadow-sm">
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest block mb-1">
              {t.teaserCostText}
            </span>
            <span className="text-4xl font-black text-gray-900 sm:text-5xl block">
              {formatCurrency(results.costs.total, inputs.country, currentLang)}
            </span>
            <span className="text-xs text-gray-400 mt-2 block">
              {currentLang === 'en'
                ? 'Estimated annual leakage across attrition, low resource utilization, and administrative bottlenecks.'
                : currentLang === 'pt'
                ? 'Vazamento anual estimado em evasão, subutilização de recursos e gargalos administrativos.'
                : 'Pérdida anual estimada entre deserción, infrautilización de recursos y cuellos de botella administrativos.'}
            </span>
          </div>

          {/* Breakdown cards & Charts */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-base font-extrabold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gray-400" /> {t.chartCostBreakdown}
            </h3>

            {/* Recharts Cost Bar Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={value => {
                      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                      if (value >= 1000) return `$${(value / 100).toFixed(0)}k`;
                      return `$${value}`;
                    }}
                    tick={{ fill: '#9CA3AF', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {costData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* List of leakage parts */}
            <div className="grid gap-3 sm:grid-cols-2 mt-6">
              {costData.map((c, i) => (
                <div key={i} className="flex items-center justify-between border border-gray-50 rounded-xl p-3.5 bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-xs font-semibold text-gray-600 line-clamp-1">{c.name}</span>
                  </div>
                  <span className="text-xs font-extrabold text-gray-900">
                    {formatCurrency(c.value, inputs.country, currentLang)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lead Capture Gate Column (5 columns) */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border-2 border-emerald-500 bg-white p-6 shadow-xl relative overflow-hidden">
            {/* Locked Visual Teaser Header */}
            <div className="text-center pb-5 border-b border-gray-100 mb-6">
              <div className="mx-auto h-10 w-10 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 mb-3 animate-pulse">
                <Lock className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-black text-gray-900">{t.teaserLockTitle}</h2>
              <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
                {t.teaserLockDesc}
              </p>
            </div>

            {/* Form */}
            <LeadCaptureForm
              currentLang={currentLang}
              defaultCountry={inputs.country}
              onSubmit={onSubmitLead}
              isSubmitting={isSubmitting}
            />

            {/* Security Note */}
            <div className="mt-5 flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-medium">
              <Shield className="h-3 w-3 text-emerald-500" />
              <span>
                {currentLang === 'en'
                  ? 'Your data is secured under strict enterprise grade protocols.'
                  : currentLang === 'pt'
                  ? 'Seus dados estão protegidos sob protocolos rígidos corporativos.'
                  : 'Sus datos están protegidos bajo estrictos protocolos corporativos.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
