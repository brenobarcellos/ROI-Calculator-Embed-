import { useState, useEffect } from 'react';
import { SavedLeadRecord, Language } from '../types';
import { translations } from '../translations';
import { formatCurrency, formatNumber, formatCrmPayload, calculateAll } from '../utils';
import { Database, HubSpotIcon, SalesforceIcon, DynamicsIcon } from './icons'; // We will create custom icons or use Lucide
import { Server, CheckCircle2, RefreshCw, Eye, Code, Trash2, Calendar, User, Building, AlertCircle, Sparkles, TrendingUp, Info } from 'lucide-react';

interface CrmSimulatorProps {
  currentLang: Language;
}

export default function CrmSimulator({ currentLang }: CrmSimulatorProps) {
  const t = translations[currentLang];
  const [leads, setLeads] = useState<SavedLeadRecord[]>([]);
  const [selectedLead, setSelectedLead] = useState<SavedLeadRecord | null>(null);
  const [syncStates, setSyncStates] = useState<Record<string, 'idle' | 'syncing' | 'synced'>>({});
  const [activeTab, setActiveTab] = useState<'payload' | 'inputs' | 'hubspot'>('payload');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch captured leads from server database
  const loadLeads = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/leads');
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
        if (data.length > 0 && !selectedLead) {
          setSelectedLead(data[data.length - 1]); // default select newest
        }
      } else {
        const local = localStorage.getItem('odilo_captured_leads');
        if (local) {
          const parsed = JSON.parse(local);
          setLeads(parsed);
          if (parsed.length > 0 && !selectedLead) {
            setSelectedLead(parsed[parsed.length - 1]);
          }
        }
      }
    } catch (err) {
      console.error(err);
      const local = localStorage.getItem('odilo_captured_leads');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          setLeads(parsed);
          if (parsed.length > 0 && !selectedLead) {
            setSelectedLead(parsed[parsed.length - 1]);
          }
        } catch (_) {}
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleSyncCrm = async (leadId: string) => {
    setSyncStates(prev => ({ ...prev, [leadId]: 'syncing' }));
    
    // Simulate integration call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    setSyncStates(prev => ({ ...prev, [leadId]: 'synced' }));
  };

  const handleClearLeads = async () => {
    if (confirm(currentLang === 'en' ? 'Are you sure you want to clear lead history?' : '¿Está seguro de borrar el historial?')) {
      try {
        localStorage.removeItem('odilo_captured_leads');
      } catch (e) {}
      setLeads([]);
      setSelectedLead(null);
      try {
        await fetch('/api/leads', { method: 'DELETE' });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleGenerateDemoLead = async () => {
    const demoLeadsPool = [
      {
        firstName: "Marta",
        lastName: "Rodríguez",
        email: "m.rodriguez@unam.mx",
        institution: "Universidad Nacional Autónoma de México",
        jobTitle: "Rectora de Innovación",
        country: "MX",
        phone: "+52 55 5622 1200",
        students: 22000,
        dropoutRate: 11.5,
        annualTuition: 4200,
        digitalInvestment: 350000,
        odiloInvestment: 130000
      },
      {
        firstName: "Ana",
        lastName: "Silva",
        email: "a.silva@usp.br",
        institution: "Universidade de São Paulo",
        jobTitle: "Pró-Reitora de Graduação",
        country: "BR",
        phone: "+55 11 3091-3500",
        students: 45000,
        dropoutRate: 14.2,
        annualTuition: 8500,
        digitalInvestment: 650000,
        odiloInvestment: 210000
      },
      {
        firstName: "Alejandro",
        lastName: "Fernández",
        email: "a.fernandez@uniandes.edu.co",
        institution: "Universidad de los Andes",
        jobTitle: "Director de Biblioteca",
        country: "CO",
        phone: "+57 1 3394949",
        students: 16500,
        dropoutRate: 8.7,
        annualTuition: 5200,
        digitalInvestment: 280000,
        odiloInvestment: 95000
      },
      {
        firstName: "Javier",
        lastName: "Ortega",
        email: "j.ortega@uba.ar",
        institution: "Universidad de Buenos Aires",
        jobTitle: "Director de Innovación Académica",
        country: "AR",
        phone: "+54 11 5285-5000",
        students: 31000,
        dropoutRate: 16.5,
        annualTuition: 3800,
        digitalInvestment: 240000,
        odiloInvestment: 80000
      },
      {
        firstName: "María José",
        lastName: "Gómez",
        email: "mj.gomez@ub.edu",
        institution: "Universidad de Barcelona",
        jobTitle: "Vicerrectora de Docencia",
        country: "ES",
        phone: "+34 934 02 11 00",
        students: 28000,
        dropoutRate: 6.8,
        annualTuition: 2900,
        digitalInvestment: 410000,
        odiloInvestment: 140000
      }
    ];

    const randomDemo = demoLeadsPool[Math.floor(Math.random() * demoLeadsPool.length)];

    const leadData = {
      firstName: randomDemo.firstName,
      lastName: randomDemo.lastName,
      email: randomDemo.email,
      institution: randomDemo.institution,
      jobTitle: randomDemo.jobTitle,
      country: randomDemo.country,
      phone: randomDemo.phone,
      consentGdpr: true,
      consentLgpd: randomDemo.country === 'BR'
    };

    const inputsData = {
      country: randomDemo.country,
      students: randomDemo.students,
      faculty: Math.max(20, Math.round(randomDemo.students * 0.05)),
      dropoutRate: randomDemo.dropoutRate,
      annualTuition: randomDemo.annualTuition,
      digitalInvestment: randomDemo.digitalInvestment,
      resourceUtilization: 30 + Math.floor(Math.random() * 20),
      weeklySearchHours: 3 + Math.floor(Math.random() * 3),
      facultyHourlyCost: 20 + Math.floor(Math.random() * 15),
      activeStudentsPct: 40 + Math.floor(Math.random() * 30),
      inactiveStudentCost: 450 + Math.floor(Math.random() * 150),
      odiloInvestment: randomDemo.odiloInvestment
    };

    const resultsData = calculateAll(inputsData);

    const backupRecord: SavedLeadRecord = {
      id: Math.random().toString(36).substring(2, 9),
      lead: leadData,
      inputs: inputsData,
      results: resultsData,
      scenario: 'expected',
      date: new Date().toISOString()
    };

    try {
      const existing = localStorage.getItem('odilo_captured_leads');
      const list = existing ? JSON.parse(existing) : [];
      list.push(backupRecord);
      localStorage.setItem('odilo_captured_leads', JSON.stringify(list));
    } catch (e) {
      console.warn(e);
    }

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead: leadData,
          inputs: inputsData,
          results: resultsData,
          scenario: 'expected'
        })
      });

      if (response.ok) {
        const newLead = await response.json();
        setLeads(prev => {
          const filtered = prev.filter(l => l.id !== backupRecord.id);
          return [...filtered, newLead];
        });
        setSelectedLead(newLead);
        return;
      }
    } catch (err) {
      console.error("Error generating demo lead:", err);
    }

    // Fallback if the backend endpoint is not available (e.g. on Netlify or GitHub Pages)
    setLeads(prev => [...prev, backupRecord]);
    setSelectedLead(backupRecord);
  };

  const payloadStr = selectedLead 
    ? JSON.stringify(formatCrmPayload(selectedLead.lead, selectedLead.inputs, selectedLead.results, selectedLead.scenario as any), null, 2)
    : '';

  return (
    <div className="mx-auto max-w-6xl px-4 py-8" id="crm-simulator-view">
      {/* Portal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-emerald-950 flex items-center gap-2">
            <Server className="h-6 w-6 text-emerald-600" />
            {t.crmTitle}
          </h1>
          <p className="mt-1 text-sm text-gray-500 leading-relaxed">
            {t.crmDesc}
          </p>
        </div>

        <div className="flex gap-2 self-start">
          <button
            onClick={handleGenerateDemoLead}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-bold transition-all shadow-sm hover:shadow"
          >
            <Sparkles className="h-4 w-4" />
            {currentLang === 'pt' ? 'Simular Lead de Reitor' : currentLang === 'es' ? 'Simular Lead de Rector' : 'Simulate Rector Lead'}
          </button>

          {leads.length > 0 && (
            <button
              onClick={handleClearLeads}
              className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 px-4 py-2.5 text-xs font-bold transition-all"
            >
              <Trash2 className="h-4 w-4" />
              Clear Lead Database
            </button>
          )}
        </div>
      </div>

      {/* Sales Representative Playbook Guide Card */}
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/40 via-white to-white p-6 shadow-sm mb-8 space-y-4">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-emerald-600 shrink-0" />
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">
            {currentLang === 'pt' 
              ? 'Playbook do Representante de Vendas ODILO' 
              : currentLang === 'es' 
              ? 'Playbook del Representante de Ventas ODILO' 
              : 'ODILO Sales Representative Playbook & Guide'}
          </h2>
        </div>
        
        <p className="text-xs text-gray-500 leading-relaxed">
          {currentLang === 'pt'
            ? 'Este portal simula a caixa de entrada de oportunidades da equipe comercial da ODILO. Quando reitores usam a calculadora ou o widget em nossa Landing Page, os dados financeiros deles chegam aqui prontos para embasar o pitch de vendas.'
            : currentLang === 'es'
            ? 'Este portal simula la bandeja de oportunidades del equipo comercial de ODILO. Cuando los rectores usan la calculadora o el widget de Landing Page, sus datos financieros llegan aquí listos para guiar su pitch de ventas.'
            : 'This portal simulates ODILO\'s commercial sales opportunity pipeline. When prospective higher-ed decision-makers submit the ROI calculator or the landing page widget, their metrics arrive here immediately.'}
        </p>

        <div className="grid gap-4 sm:grid-cols-3 pt-2">
          {/* Step 1 */}
          <div className="space-y-1.5 p-3 rounded-xl bg-white border border-gray-50">
            <h3 className="text-xs font-bold text-emerald-950 flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-emerald-600 shrink-0" />
              {currentLang === 'pt' ? '1. Venda de Valor' : currentLang === 'es' ? '1. Venta de Valor' : '1. Value-Based Pitch'}
            </h3>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              {currentLang === 'pt'
                ? 'Aborde reitores com números exatos. Diga quanto dinheiro eles perdem em evasão ou licenças obsoletas hoje.'
                : currentLang === 'es'
                ? 'Aborde rectores con números exactos. Diga cuánto dinero pierden hoy en deserción escolar o licencias obsoletas.'
                : 'Pitch prospective Deans with exact numbers. Point out exactly how much they leak today in underutilized digital catalogs.'}
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-1.5 p-3 rounded-xl bg-white border border-gray-50">
            <h3 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <Code className="h-4 w-4 text-emerald-600 shrink-0" />
              {currentLang === 'pt' ? '2. Sincronização de CRM' : currentLang === 'es' ? '2. Sincronización CRM' : '2. CRM Synchronization'}
            </h3>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              {currentLang === 'pt'
                ? 'Clique em "Simular Sincronização" para ver como os dados financeiros estruturados em JSON alimentam o Salesforce ou HubSpot.'
                : currentLang === 'es'
                ? 'Haga clic en "Simular Sincronización" para ver cómo los datos en JSON alimentan su Salesforce, HubSpot o Dynamics.'
                : 'Click "Simulate Sync" to see how the rich JSON payload automatically updates Salesforce, HubSpot, or Dynamics.'}
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-1.5 p-3 rounded-xl bg-white border border-gray-50">
            <h3 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
              {currentLang === 'pt' ? '3. Sandbox Interativo' : currentLang === 'es' ? '3. Sandbox Interactivo' : '3. Test Drive Leads'}
            </h3>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              {currentLang === 'pt'
                ? 'Use o botão "Simular Lead de Reitor" para criar leads fictícios instantâneos e ver o portal em pleno funcionamento!'
                : currentLang === 'es'
                ? 'Use el botón "Simular Lead" para crear leads ficticios al instante y ver cómo interactúa el flujo del portal.'
                : 'Click the "Simulate Rector Lead" button above to populate the inbox with sample deans and test the full CRM integrations.'}
            </p>
          </div>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <Database className="mx-auto h-12 w-12 text-emerald-200 mb-4 animate-bounce" />
          <h3 className="text-lg font-bold text-gray-800">{t.crmNoLeads}</h3>
          <p className="mt-1.5 text-sm text-gray-400 max-w-sm mx-auto mb-6">
            {currentLang === 'pt'
              ? 'Nenhum lead capturado ainda. Gere um lead de exemplo clicando abaixo para entender o funcionamento do CRM em segundos.'
              : currentLang === 'es'
              ? 'No hay leads capturados todavía. Genere un lead de ejemplo haciendo clic abajo para comprender el CRM en segundos.'
              : 'Once a prospective Higher Ed decision maker fills out the gating form, their details populate here.'}
          </p>
          <button
            onClick={handleGenerateDemoLead}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 text-sm font-black transition-all shadow hover:shadow-lg"
          >
            <Sparkles className="h-4 w-4" />
            {currentLang === 'pt' ? 'Gerar Meu Primeiro Lead de Teste' : currentLang === 'es' ? 'Generar Mi Primer Lead de Prueba' : 'Generate First Test Lead'}
          </button>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Leads list table (5 columns) */}
          <div className="lg:col-span-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-gray-900 border-b border-gray-50 pb-3">
              Captured Leads Log ({leads.length})
            </h3>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
              {leads.map(record => {
                const isSelected = selectedLead?.id === record.id;
                const syncStatus = syncStates[record.id] || 'idle';

                return (
                  <div
                    key={record.id}
                    onClick={() => setSelectedLead(record)}
                    className={`cursor-pointer rounded-xl p-4 border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/20 shadow-sm'
                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(record.date).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        {record.scenario}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-gray-900 flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-gray-400" />
                      {record.lead.firstName} {record.lead.lastName}
                    </h4>
                    <p className="text-xs font-semibold text-gray-500 flex items-center gap-1 mt-0.5">
                      <Building className="h-3.5 w-3.5 text-gray-300" />
                      {record.lead.institution} ({record.lead.country})
                    </p>

                    <div className="mt-3 pt-3 border-t border-gray-100/50 flex items-center justify-between">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleSyncCrm(record.id);
                        }}
                        disabled={syncStatus === 'syncing'}
                        className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-[10px] font-black uppercase transition-all ${
                          syncStatus === 'synced'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : syncStatus === 'syncing'
                            ? 'bg-gray-100 text-gray-400'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {syncStatus === 'synced' ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Synced
                          </span>
                        ) : syncStatus === 'syncing' ? (
                          <span className="flex items-center gap-1">
                            <RefreshCw className="h-3 w-3 animate-spin" /> Syncing
                          </span>
                        ) : (
                          t.crmSyncBtn
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lead Detail Panel & Payload Sandbox (7 columns) */}
          <div className="lg:col-span-7 space-y-6">
            {selectedLead && (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                {/* Details Tab Toggles */}
                <div className="flex border-b border-gray-100 mb-6 overflow-x-auto scrollbar-none">
                  <button
                    onClick={() => setActiveTab('payload')}
                    className={`cursor-pointer pb-3 text-sm font-bold border-b-2 px-4 transition-all whitespace-nowrap ${
                      activeTab === 'payload'
                        ? 'border-emerald-600 text-emerald-600'
                        : 'border-transparent text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    <Code className="inline-block h-4 w-4 mr-1.5" />
                    Integration Payload
                  </button>
                  <button
                    onClick={() => setActiveTab('inputs')}
                    className={`cursor-pointer pb-3 text-sm font-bold border-b-2 px-4 transition-all whitespace-nowrap ${
                      activeTab === 'inputs'
                        ? 'border-emerald-600 text-emerald-600'
                        : 'border-transparent text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    <Eye className="inline-block h-4 w-4 mr-1.5" />
                    Calculated Leakages
                  </button>
                  <button
                    onClick={() => setActiveTab('hubspot')}
                    className={`cursor-pointer pb-3 text-sm font-bold border-b-2 px-4 transition-all whitespace-nowrap flex items-center ${
                      activeTab === 'hubspot'
                        ? 'border-emerald-600 text-emerald-600'
                        : 'border-transparent text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    <span className="inline-block h-4 w-4 mr-1.5 font-bold text-orange-500">HubSpot</span>
                    HubSpot Native Sync
                  </button>
                </div>

                {activeTab === 'payload' ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">
                        {t.crmJsonPayload}
                      </h4>
                      <span className="text-[10px] text-gray-400">REST API Ready</span>
                    </div>
                    <pre className="rounded-xl bg-gray-950 p-4 font-mono text-xs text-emerald-400 overflow-x-auto max-h-[380px] leading-relaxed">
                      {payloadStr}
                    </pre>
                  </div>
                ) : activeTab === 'inputs' ? (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">
                      Submitted Metrics and calculated annual leaks
                    </h4>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="p-3 border border-gray-100 rounded-xl bg-gray-50/50">
                        <span className="text-[10px] text-gray-400 font-bold block mb-1">Dropout Cost leakage</span>
                        <span className="text-sm font-black text-gray-900">
                          {formatCurrency(selectedLead.results.costs.dropout, selectedLead.inputs.country, currentLang)}
                        </span>
                      </div>
                      <div className="p-3 border border-gray-100 rounded-xl bg-gray-50/50">
                        <span className="text-[10px] text-gray-400 font-bold block mb-1">Digital Library Waste</span>
                        <span className="text-sm font-black text-gray-900">
                          {formatCurrency(selectedLead.results.costs.resource, selectedLead.inputs.country, currentLang)}
                        </span>
                      </div>
                      <div className="p-3 border border-gray-100 rounded-xl bg-gray-50/50">
                        <span className="text-[10px] text-gray-400 font-bold block mb-1">Faculty Prep Search Waste</span>
                        <span className="text-sm font-black text-gray-900">
                          {formatCurrency(selectedLead.results.costs.knowledge, selectedLead.inputs.country, currentLang)}
                        </span>
                      </div>
                      <div className="p-3 border border-gray-100 rounded-xl bg-gray-50/50">
                        <span className="text-[10px] text-gray-400 font-bold block mb-1">Student platform disengagement</span>
                        <span className="text-sm font-black text-gray-900">
                          {formatCurrency(selectedLead.results.costs.engagement, selectedLead.inputs.country, currentLang)}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 border border-emerald-100 rounded-xl bg-emerald-50/25 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-emerald-700 font-bold block mb-1">Active Scenario Benefit</span>
                        <span className="text-sm font-bold text-gray-500 uppercase">{selectedLead.scenario}</span>
                      </div>
                      <span className="text-lg font-black text-emerald-800">
                        {formatCurrency(
                          (selectedLead.results.scenarios as any)[selectedLead.scenario]?.totalBenefit || 0,
                          selectedLead.inputs.country,
                          currentLang
                        )}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="rounded-xl border border-orange-100 bg-orange-50/20 p-4">
                      <h4 className="text-sm font-black text-orange-950 mb-1 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-orange-500" />
                        {currentLang === 'pt' ? 'Como Sincronizar com o HubSpot em 2 Passos' : currentLang === 'es' ? 'Cómo Sincronizar con HubSpot en 2 Pasos' : 'How to Sync with HubSpot in 2 Steps'}
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {currentLang === 'pt' 
                          ? 'Para capturar leads da Landing Page diretamente no HubSpot mantendo os dados de ROI calculados, siga estas orientações:'
                          : currentLang === 'es'
                          ? 'Para capturar leads de la Landing Page directamente en HubSpot conservando los datos de ROI calculados, siga estas pautas:'
                          : 'To capture Landing Page leads directly into HubSpot while preserving the computed ROI financial metrics, do this:'}
                      </p>
                    </div>

                    {/* Step 1: Properties */}
                    <div className="space-y-2">
                      <span className="text-xs font-black text-gray-700 block">
                        {currentLang === 'pt' ? 'Passo 1: Crie as Propriedades Personalizadas no HubSpot' : currentLang === 'es' ? 'Paso 1: Cree las Propiedades Personalizadas en HubSpot' : 'Step 1: Create Custom Properties in HubSpot'}
                      </span>
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        {currentLang === 'pt'
                          ? 'Crie estas propriedades de contato no HubSpot com os nomes exatos abaixo para armazenar as métricas de simulação:'
                          : currentLang === 'es'
                          ? 'Cree estas propiedades de contacto en HubSpot con los nombres exactos abajo para guardar los datos del simulador:'
                          : 'Create these contact properties in HubSpot with the exact internal names below to save simulation metrics:'}
                      </p>

                      <div className="grid gap-2 text-xs font-mono bg-slate-900 text-gray-300 p-3 rounded-xl border border-slate-800">
                        <div className="flex justify-between border-b border-slate-800 pb-1.5">
                          <span className="text-emerald-400 font-bold">Property Name (Internal)</span>
                          <span className="text-gray-400">Value for current Lead</span>
                        </div>
                        <div className="flex justify-between">
                          <span>odilo_total_annual_leakage</span>
                          <span className="text-white font-black">{selectedLead.results.costs.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>odilo_estimated_annual_benefit</span>
                          <span className="text-white font-black">
                            {(selectedLead.results.scenarios as any)[selectedLead.scenario]?.totalBenefit || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>odilo_roi_percentage</span>
                          <span className="text-white font-black">
                            {Math.round((selectedLead.results.scenarios as any)[selectedLead.scenario]?.roi || 0)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>odilo_payback_months</span>
                          <span className="text-white font-black">
                            {((selectedLead.results.scenarios as any)[selectedLead.scenario]?.paybackMonths || 0).toFixed(1)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>number_of_students</span>
                          <span className="text-white font-black">{selectedLead.inputs.students}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>annual_tuition_avg</span>
                          <span className="text-white font-black">{selectedLead.inputs.annualTuition}</span>
                        </div>
                      </div>
                    </div>

                    {/* Step 2: Form submission script */}
                    <div className="space-y-2">
                      <span className="text-xs font-black text-gray-700 block">
                        {currentLang === 'pt' ? 'Passo 2: Integre o Formulário com a API de Submissão do HubSpot' : currentLang === 'es' ? 'Paso 2: Integre el Formulario con la API de Submisión de HubSpot' : 'Step 2: Submit lead data to HubSpot\'s Forms API (v3)'}
                      </span>
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        {currentLang === 'pt'
                          ? 'Ao submeter o formulário de conversão, dispare este script para enviar os dados de contato e os cálculos de ROI de uma só vez:'
                          : currentLang === 'es'
                          ? 'Al enviar el formulario de conversión, ejecute este script para mandar los datos de contacto y el ROI al mismo tiempo:'
                          : 'Upon submitting the calculator lead form, fire this JavaScript payload to create the contact and link their tracking cookie:'}
                      </p>

                      <pre className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-orange-400 overflow-x-auto max-h-[220px] leading-relaxed">
{`// Exemplo de integração nativa com a HubSpot Forms API v3
async function submitToHubSpot(leadData, calculatedMetrics) {
  const portalId = "SEU_PORTAL_ID";
  const formGuid = "SEU_FORMULÁRIO_GUID";
  const hubspotCookie = document.cookie.match(/hubspotutk=([^;]+)/)?.[1];

  const payload = {
    submittedAt: Date.now(),
    fields: [
      { name: "email", value: leadData.email },
      { name: "firstname", value: leadData.firstName },
      { name: "lastname", value: leadData.lastName },
      { name: "company", value: leadData.institution },
      { name: "jobtitle", value: leadData.jobTitle },
      { name: "phone", value: leadData.phone },
      // Métricas Financeiras Personalizadas de ROI:
      { name: "odilo_total_annual_leakage", value: calculatedMetrics.totalLeak },
      { name: "odilo_estimated_annual_benefit", value: calculatedMetrics.benefit },
      { name: "odilo_roi_percentage", value: calculatedMetrics.roi },
      { name: "number_of_students", value: calculatedMetrics.students }
    ],
    context: {
      hutk: hubspotCookie, // Associa o lead à timeline de navegação
      pageUri: window.location.href,
      pageName: document.title
    }
  };

  await fetch(\`https://api.hsforms.com/submissions/v3/integration/submit/\${portalId}/\${formGuid}\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}`}
                      </pre>
                    </div>

                    {/* Best Practice Callout */}
                    <div className="rounded-xl bg-gray-50 p-4 border border-gray-100 flex gap-2 items-start text-xs text-gray-500 leading-relaxed">
                      <span className="font-extrabold text-orange-600 uppercase shrink-0">HubSpot Pro Tip:</span>
                      <p>
                        {currentLang === 'pt'
                          ? 'Ao salvar estas propriedades, você pode criar Workflows no HubSpot para notificar o vendedor imediatamente quando um Lead de "Alta Perda Financeira" (ex: odilo_total_annual_leakage > $100,000) for criado, agilizando o fechamento!'
                          : currentLang === 'es'
                          ? 'Al guardar estas propiedades, puede configurar Workflows en HubSpot para notificar al ejecutivo asignado inmediatamente si el lead supera los $100,000 de fuga anual, priorizando las oportunidades de mayor valor.'
                          : 'By saving these properties, you can create automated HubSpot Workflows to assign and alert your sales reps instantly if a prospective lead has high leakage (e.g., leakage > $100k/yr).'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
