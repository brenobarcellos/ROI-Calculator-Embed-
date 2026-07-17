import { useState } from 'react';
import { Language, InstitutionInputs, LeadCaptureData, SavedLeadRecord } from './types';
import { translations } from './translations';
import { DEFAULT_INPUTS, calculateAll } from './utils';
import Header from './components/Header';
import Wizard from './components/Wizard';
import TeaserDashboard from './components/TeaserDashboard';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import CrmSimulator from './components/CrmSimulator';
import LandingPageCalculator from './components/LandingPageCalculator';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentLang, setCurrentLang] = useState<Language>(() => {
    const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const urlLang = searchParams.get('lang');
    if (urlLang === 'es' || urlLang === 'en' || urlLang === 'pt') {
      return urlLang;
    }
    return 'es'; // Default is Spanish
  });
  const [inputs, setInputs] = useState<InstitutionInputs>(DEFAULT_INPUTS);
  const [lead, setLead] = useState<LeadCaptureData | null>(null);
  const [view, setView] = useState<'wizard' | 'teaser' | 'executive'>('wizard');
  const [isAdminView, setIsAdminView] = useState(false);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  const isEmbedMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('embed') === 'true';
  const [calculatorType, setCalculatorType] = useState<'wizard' | 'landing'>(isEmbedMode ? 'landing' : 'wizard');

  const t = translations[currentLang];

  // Perform calculations on active inputs
  const results = calculateAll(inputs);

  // When 6-step Wizard configuration completes
  const handleWizardComplete = (finalInputs: InstitutionInputs) => {
    setInputs(finalInputs);
    setView('teaser');
  };

  // When Lead form is submitted
  const handleLeadSubmit = async (leadData: LeadCaptureData) => {
    setIsSubmittingLead(true);
    setLead(leadData);

    try {
      // Sync to backend persistent log
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead: leadData,
          inputs,
          results,
          scenario: 'expected', // Default pre-selected scenario
        }),
      });
    } catch (err) {
      console.error('Failed to sync captured lead to backend database:', err);
    } finally {
      setIsSubmittingLead(false);
      setView('executive');
    }
  };

  const handleRestart = () => {
    setView('wizard');
  };

  const handleUnlockReport = (quickInputs: InstitutionInputs) => {
    setInputs(quickInputs);
    setView('teaser');
  };

  return (
    <div className={`min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-gray-800 antialiased ${isEmbedMode ? 'p-0 bg-white' : ''}`}>
      {/* Top sticky brand header and portal selector (hidden in embed mode) */}
      {!isEmbedMode && (
        <Header
          currentLang={currentLang}
          onLangChange={lang => setCurrentLang(lang)}
          showAdminCta={true}
          onAdminClick={() => setIsAdminView(!isAdminView)}
          isAdminView={isAdminView}
        />
      )}

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {isAdminView ? (
            /* CRM Sales Enablement Portal Screen */
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <CrmSimulator currentLang={currentLang} />
            </motion.div>
          ) : (
            /* Main user interactive ROI flows */
            <div className={isEmbedMode ? 'py-2' : 'py-6'}>
              {view === 'wizard' && (
                <div className="space-y-6">
                  {/* Mode Selector Tab (hidden in embed mode) */}
                  {!isEmbedMode && (
                    <div className="mx-auto max-w-lg bg-white rounded-xl border border-gray-150 p-1.5 flex shadow-sm">
                      <button
                        type="button"
                        onClick={() => setCalculatorType('wizard')}
                        className={`cursor-pointer flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                          calculatorType === 'wizard'
                            ? 'bg-emerald-600 text-white shadow'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        {t.stepModeTab}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCalculatorType('landing')}
                        className={`cursor-pointer flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                          calculatorType === 'landing'
                            ? 'bg-emerald-600 text-white shadow'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        {t.landingModeTab}
                      </button>
                    </div>
                  )}

                  {calculatorType === 'wizard' ? (
                    <motion.div
                      key="wizard"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Wizard
                        currentLang={currentLang}
                        onComplete={handleWizardComplete}
                        initialInputs={inputs}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="landing-page-calc"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <LandingPageCalculator
                        currentLang={currentLang}
                        onLangChange={lang => setCurrentLang(lang)}
                        onUnlockReport={handleUnlockReport}
                        inputs={inputs}
                        onUpdateInputs={updated => setInputs(updated)}
                      />
                    </motion.div>
                  )}
                </div>
              )}

              {view === 'teaser' && (
                <motion.div
                  key="teaser"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <TeaserDashboard
                    currentLang={currentLang}
                    inputs={inputs}
                    results={results}
                    onSubmitLead={handleLeadSubmit}
                    isSubmitting={isSubmittingLead}
                  />
                </motion.div>
              )}

              {view === 'executive' && lead && (
                <motion.div
                  key="executive"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ExecutiveDashboard
                    currentLang={currentLang}
                    inputs={inputs}
                    results={results}
                    lead={lead}
                    onUpdateInputs={updated => setInputs(updated)}
                    onRestart={handleRestart}
                  />
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Corporate humble footer (hidden in embed mode) */}
      {!isEmbedMode && (
        <footer className="border-t border-gray-100 bg-white py-6 text-center text-xs text-gray-400">
          <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span>&copy; {new Date().getFullYear()} ODILO. All rights reserved.</span>
            <div className="flex gap-4 font-semibold">
              <a href="https://www.odilo.us/legal-notice/" target="_blank" className="hover:text-gray-600">Legal Notice</a>
              <a href="https://www.odilo.us/privacy-policy/" target="_blank" className="hover:text-gray-600">Privacy Policy</a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
