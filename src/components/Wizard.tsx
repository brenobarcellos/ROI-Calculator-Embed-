import { useState } from 'react';
import { InstitutionInputs, Language } from '../types';
import { translations, countries } from '../translations';
import { calculateAll, formatCurrency, formatNumber } from '../utils';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronRight, ChevronLeft, ArrowRight, Check, AlertCircle } from 'lucide-react';

interface WizardProps {
  currentLang: Language;
  onComplete: (inputs: InstitutionInputs) => void;
  initialInputs: InstitutionInputs;
}

export default function Wizard({ currentLang, onComplete, initialInputs }: WizardProps) {
  const t = translations[currentLang];
  const [institutionType, setInstitutionType] = useState<'higher-ed' | 'schools' | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [inputs, setInputs] = useState<InstitutionInputs>(initialInputs);
  const [errors, setErrors] = useState<Partial<Record<keyof InstitutionInputs, string>>>({});
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Validate current step
  const validateStep = (step: number): boolean => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (step === 1) {
      if (!inputs.country) {
        newErrors.country = t.requiredField;
        isValid = false;
      }
      if (inputs.students <= 0) {
        newErrors.students = t.positiveNumber;
        isValid = false;
      }
      if (inputs.faculty <= 0) {
        newErrors.faculty = t.positiveNumber;
        isValid = false;
      }
    } else if (step === 2) {
      if (inputs.dropoutRate < 0 || inputs.dropoutRate > 100) {
        newErrors.dropoutRate = t.invalidPercent;
        isValid = false;
      }
      if (inputs.annualTuition < 0) {
        newErrors.annualTuition = t.positiveNumber;
        isValid = false;
      }
    } else if (step === 3) {
      if (inputs.digitalInvestment < 0) {
        newErrors.digitalInvestment = t.positiveNumber;
        isValid = false;
      }
      if (inputs.resourceUtilization < 0 || inputs.resourceUtilization > 100) {
        newErrors.resourceUtilization = t.invalidPercent;
        isValid = false;
      }
    } else if (step === 4) {
      if (inputs.weeklySearchHours < 0) {
        newErrors.weeklySearchHours = t.positiveNumber;
        isValid = false;
      }
      if (inputs.facultyHourlyCost < 0) {
        newErrors.facultyHourlyCost = t.positiveNumber;
        isValid = false;
      }
    } else if (step === 5) {
      if (inputs.activeStudentsPct < 0 || inputs.activeStudentsPct > 100) {
        newErrors.activeStudentsPct = t.invalidPercent;
        isValid = false;
      }
      if (inputs.inactiveStudentCost < 0) {
        newErrors.inactiveStudentCost = t.positiveNumber;
        isValid = false;
      }
    } else if (step === 6) {
      if (inputs.odiloInvestment < 0) {
        newErrors.odiloInvestment = t.positiveNumber;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 6) {
        setCurrentStep(prev => prev + 1);
      } else {
        onComplete(inputs);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const updateField = (field: keyof InstitutionInputs, value: any) => {
    const updated = { ...inputs, [field]: value };
    setInputs(updated);
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Intermediate calculations for real-time cost indicators on each card
  const partials = calculateAll(inputs);

  // Transition variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  // If institution type is not selected, display onboarding selection screen
  if (institutionType === null) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200 mb-4"
          >
            🎓 {t.introSubtitle}
          </motion.div>
          <motion.h1
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-5xl animate-fade-in"
          >
            {t.introTitle}
          </motion.h1>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-4 max-w-2xl text-base text-gray-500 sm:text-lg"
          >
            {t.introDesc}
          </motion.p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Higher Ed Card (Active) */}
          <motion.div
            whileHover={{ y: -4, boxShadow: '0 12px 20px -8px rgba(0,0,0,0.1)' }}
            onClick={() => setInstitutionType('higher-ed')}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-emerald-500 bg-white p-8 shadow-md transition-all duration-300"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 text-2xl group-hover:scale-110 transition-transform">
              🎓
            </div>
            <h3 className="mt-6 text-xl font-bold text-gray-900">{t.higherEd}</h3>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">{t.higherEdDesc}</p>
            <div className="mt-6 flex items-center text-emerald-600 font-bold text-sm">
              {t.next} <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </motion.div>

          {/* Schools Card (Coming Soon) */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-8 opacity-75">
            <span className="absolute top-4 right-4 rounded-full bg-gray-200 px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider text-gray-600 uppercase">
              {t.comingSoon}
            </span>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-500 text-2xl">
              🏫
            </div>
            <h3 className="mt-6 text-xl font-bold text-gray-400">{t.schools}</h3>
            <p className="mt-2 text-sm text-gray-400 leading-relaxed">{t.schoolsDesc}</p>
            <p className="mt-6 text-xs font-semibold text-gray-400 italic">
              {t.schoolsSoon}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Step Indicators and Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
          <span>{t.step} {currentStep} {t.of} 6</span>
          <span className="text-emerald-600">
            {currentStep === 1 && t.step1Title}
            {currentStep === 2 && t.step2Title}
            {currentStep === 3 && t.step3Title}
            {currentStep === 4 && t.step4Title}
            {currentStep === 5 && t.step5Title}
            {currentStep === 6 && t.step6Title}
          </span>
        </div>
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <motion.div
            className="h-full bg-emerald-600"
            initial={{ width: '0%' }}
            animate={{ width: `${(currentStep / 6) * 100}%` }}
            transition={{ duration: 0.3 }}
          ></motion.div>
        </div>
      </div>

      {/* Main Configuration Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md md:p-8">
        <AnimatePresence mode="wait" custom={1}>
          <motion.div
            key={currentStep}
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            {/* Step 1: Institution Info */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">{t.step1Title}</h2>
                <p className="mt-1.5 text-sm text-gray-500 mb-8">{t.step1Desc}</p>

                <div className="space-y-6">
                  {/* Country Field */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-semibold text-gray-800" htmlFor="country-select">
                        {t.country}
                      </label>
                      <button
                        type="button"
                        onClick={() => setActiveTooltip(activeTooltip === 'country' ? null : 'country')}
                        className="text-gray-400 hover:text-emerald-500 cursor-pointer"
                      >
                        <HelpCircle className="h-4 w-4" />
                      </button>
                    </div>
                    {activeTooltip === 'country' && (
                      <div className="rounded-lg bg-emerald-50/70 p-3 text-xs text-emerald-800 leading-relaxed border border-emerald-100 mb-1">
                        {t.tooltipCountry}
                      </div>
                    )}
                    <select
                      id="country-select"
                      value={inputs.country}
                      onChange={e => updateField('country', e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="">{t.countrySelect}</option>
                      {countries.map(c => (
                        <option key={c.code} value={c.code}>
                          {c.names[currentLang]} ({c.currency})
                        </option>
                      ))}
                    </select>
                    {errors.country && <span className="text-xs font-medium text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3" /> {errors.country}</span>}
                  </div>

                  {/* Students Count */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-800" htmlFor="students-input">
                      {t.studentsCount}
                    </label>
                    <span className="text-xs text-gray-400">{t.studentsHint}</span>
                    <input
                      type="number"
                      id="students-input"
                      value={inputs.students || ''}
                      placeholder={t.studentsPlaceholder}
                      onChange={e => updateField('students', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                    {errors.students && <span className="text-xs font-medium text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3" /> {errors.students}</span>}
                  </div>

                  {/* Faculty Count */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-800" htmlFor="faculty-input">
                      {t.facultyCount}
                    </label>
                    <span className="text-xs text-gray-400">{t.facultyHint}</span>
                    <input
                      type="number"
                      id="faculty-input"
                      value={inputs.faculty || ''}
                      placeholder={t.facultyPlaceholder}
                      onChange={e => updateField('faculty', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                    {errors.faculty && <span className="text-xs font-medium text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3" /> {errors.faculty}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Student Attrition */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">{t.step2Title}</h2>
                <p className="mt-1.5 text-sm text-gray-500 mb-8">{t.step2Desc}</p>

                <div className="space-y-6">
                  {/* Dropout Rate */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-semibold text-gray-800" htmlFor="dropout-rate-input">
                          {t.dropoutRate}
                        </label>
                        <button
                          type="button"
                          onClick={() => setActiveTooltip(activeTooltip === 'dropout' ? null : 'dropout')}
                          className="text-gray-400 hover:text-emerald-500 cursor-pointer"
                        >
                          <HelpCircle className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        {inputs.dropoutRate}%
                      </span>
                    </div>
                    {activeTooltip === 'dropout' && (
                      <div className="rounded-lg bg-emerald-50/70 p-3 text-xs text-emerald-800 leading-relaxed border border-emerald-100 mb-1">
                        {t.tooltipDropout}
                      </div>
                    )}
                    <span className="text-xs text-gray-400">{t.dropoutHint}</span>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="0.5"
                        value={inputs.dropoutRate}
                        onChange={e => updateField('dropoutRate', parseFloat(e.target.value))}
                        className="flex-1 accent-emerald-500"
                        id="dropout-rate-slider"
                      />
                      <input
                        type="number"
                        id="dropout-rate-input"
                        value={inputs.dropoutRate}
                        onChange={e => updateField('dropoutRate', Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                        className="w-20 rounded-xl border border-gray-200 bg-white px-3 py-2 text-center text-sm focus:border-emerald-500 focus:ring-2"
                      />
                    </div>
                    {errors.dropoutRate && <span className="text-xs font-medium text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3" /> {errors.dropoutRate}</span>}
                  </div>

                  {/* Tuition Value */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-800" htmlFor="tuition-input">
                      {t.annualTuition}
                    </label>
                    <span className="text-xs text-gray-400">{t.tuitionHint}</span>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                        $
                      </span>
                      <input
                        type="number"
                        id="tuition-input"
                        value={inputs.annualTuition || ''}
                        placeholder={t.tuitionPlaceholder}
                        onChange={e => updateField('annualTuition', Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full rounded-xl border border-gray-200 bg-white pl-8 pr-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                    {errors.annualTuition && <span className="text-xs font-medium text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3" /> {errors.annualTuition}</span>}
                  </div>

                  {/* Formula Box and real-time step calculation */}
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-5">
                    <span className="text-[10px] font-extrabold tracking-wider text-emerald-700 uppercase">
                      {t.formulaDropout}
                    </span>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500">{t.currentDropoutCost}:</span>
                      <span className="text-lg font-black text-gray-900">
                        {formatCurrency(partials.costs.dropout, inputs.country, currentLang)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Underutilized Digital Resources */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">{t.step3Title}</h2>
                <p className="mt-1.5 text-sm text-gray-500 mb-8">{t.step3Desc}</p>

                <div className="space-y-6">
                  {/* Digital Investment */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-semibold text-gray-800" htmlFor="digital-inv-input">
                        {t.digitalInvestment}
                      </label>
                      <button
                        type="button"
                        onClick={() => setActiveTooltip(activeTooltip === 'digital' ? null : 'digital')}
                        className="text-gray-400 hover:text-emerald-500 cursor-pointer"
                      >
                        <HelpCircle className="h-4 w-4" />
                      </button>
                    </div>
                    {activeTooltip === 'digital' && (
                      <div className="rounded-lg bg-emerald-50/70 p-3 text-xs text-emerald-800 leading-relaxed border border-emerald-100 mb-1">
                        {t.tooltipDigital}
                      </div>
                    )}
                    <span className="text-xs text-gray-400">{t.digitalHint}</span>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                        $
                      </span>
                      <input
                        type="number"
                        id="digital-inv-input"
                        value={inputs.digitalInvestment || ''}
                        placeholder={t.digitalPlaceholder}
                        onChange={e => updateField('digitalInvestment', Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full rounded-xl border border-gray-200 bg-white pl-8 pr-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                    {errors.digitalInvestment && <span className="text-xs font-medium text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3" /> {errors.digitalInvestment}</span>}
                  </div>

                  {/* Utilization Rate */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-800" htmlFor="utilization-rate-input">
                        {t.utilizationRate}
                      </label>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        {inputs.resourceUtilization}%
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{t.utilizationHint}</span>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={inputs.resourceUtilization}
                        onChange={e => updateField('resourceUtilization', parseFloat(e.target.value))}
                        className="flex-1 accent-emerald-500"
                        id="utilization-rate-slider"
                      />
                      <input
                        type="number"
                        id="utilization-rate-input"
                        value={inputs.resourceUtilization}
                        onChange={e => updateField('resourceUtilization', Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                        className="w-20 rounded-xl border border-gray-200 bg-white px-3 py-2 text-center text-sm focus:border-emerald-500 focus:ring-2"
                      />
                    </div>
                    {errors.resourceUtilization && <span className="text-xs font-medium text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3" /> {errors.resourceUtilization}</span>}
                  </div>

                  {/* Formula and dynamic calculation */}
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-5">
                    <span className="text-[10px] font-extrabold tracking-wider text-emerald-700 uppercase">
                      {t.formulaDigital}
                    </span>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500">{t.currentDigitalCost}:</span>
                      <span className="text-lg font-black text-gray-900">
                        {formatCurrency(partials.costs.resource, inputs.country, currentLang)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Knowledge Management */}
            {currentStep === 4 && (
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">{t.step4Title}</h2>
                <p className="mt-1.5 text-sm text-gray-500 mb-8">{t.step4Desc}</p>

                <div className="space-y-6">
                  {/* Search Hours */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-semibold text-gray-800" htmlFor="search-hours-input">
                          {t.searchHours}
                        </label>
                        <button
                          type="button"
                          onClick={() => setActiveTooltip(activeTooltip === 'knowledge' ? null : 'knowledge')}
                          className="text-gray-400 hover:text-emerald-500 cursor-pointer"
                        >
                          <HelpCircle className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        {inputs.weeklySearchHours} {t.hUnit || 'h'}
                      </span>
                    </div>
                    {activeTooltip === 'knowledge' && (
                      <div className="rounded-lg bg-emerald-50/70 p-3 text-xs text-emerald-800 leading-relaxed border border-emerald-100 mb-1">
                        {t.tooltipKnowledge}
                      </div>
                    )}
                    <span className="text-xs text-gray-400">{t.searchHint}</span>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="20"
                        step="0.5"
                        value={inputs.weeklySearchHours}
                        onChange={e => updateField('weeklySearchHours', parseFloat(e.target.value))}
                        className="flex-1 accent-emerald-500"
                        id="search-hours-slider"
                      />
                      <input
                        type="number"
                        id="search-hours-input"
                        value={inputs.weeklySearchHours}
                        onChange={e => updateField('weeklySearchHours', Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-20 rounded-xl border border-emerald-500 bg-white px-3 py-2 text-center text-sm focus:border-emerald-500 focus:ring-2"
                      />
                    </div>
                    {errors.weeklySearchHours && <span className="text-xs font-medium text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3" /> {errors.weeklySearchHours}</span>}
                  </div>

                  {/* Hourly Cost */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-800" htmlFor="faculty-cost-input">
                      {t.facultyCost}
                    </label>
                    <span className="text-xs text-gray-400">{t.facultyCostHint}</span>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                        $
                      </span>
                      <input
                        type="number"
                        id="faculty-cost-input"
                        value={inputs.facultyHourlyCost || ''}
                        placeholder={t.facultyCostPlaceholder}
                        onChange={e => updateField('facultyHourlyCost', Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full rounded-xl border border-gray-200 bg-white pl-8 pr-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                    {errors.facultyHourlyCost && <span className="text-xs font-medium text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3" /> {errors.facultyHourlyCost}</span>}
                  </div>

                  {/* Formula and dynamic calculation */}
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-5">
                    <span className="text-[10px] font-extrabold tracking-wider text-emerald-700 uppercase">
                      {t.formulaKnowledge}
                    </span>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500">{t.currentKnowledgeCost}:</span>
                      <span className="text-lg font-black text-gray-900">
                        {formatCurrency(partials.costs.knowledge, inputs.country, currentLang)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Student Engagement */}
            {currentStep === 5 && (
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">{t.step5Title}</h2>
                <p className="mt-1.5 text-sm text-gray-500 mb-8">{t.step5Desc}</p>

                <div className="space-y-6">
                  {/* Active Students Pct */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-semibold text-gray-800" htmlFor="active-students-input">
                          {t.activeStudents}
                        </label>
                        <button
                          type="button"
                          onClick={() => setActiveTooltip(activeTooltip === 'engagement' ? null : 'engagement')}
                          className="text-gray-400 hover:text-emerald-500 cursor-pointer"
                        >
                          <HelpCircle className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        {inputs.activeStudentsPct}%
                      </span>
                    </div>
                    {activeTooltip === 'engagement' && (
                      <div className="rounded-lg bg-emerald-50/70 p-3 text-xs text-emerald-800 leading-relaxed border border-emerald-100 mb-1">
                        {t.tooltipEngagement}
                      </div>
                    )}
                    <span className="text-xs text-gray-400">{t.activeHint}</span>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={inputs.activeStudentsPct}
                        onChange={e => updateField('activeStudentsPct', parseFloat(e.target.value))}
                        className="flex-1 accent-emerald-500"
                        id="active-students-slider"
                      />
                      <input
                        type="number"
                        id="active-students-input"
                        value={inputs.activeStudentsPct}
                        onChange={e => updateField('activeStudentsPct', Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                        className="w-20 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-center text-sm focus:border-emerald-500 focus:ring-2"
                      />
                    </div>
                    {errors.activeStudentsPct && <span className="text-xs font-medium text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3" /> {errors.activeStudentsPct}</span>}
                  </div>

                  {/* Cost per inactive student */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-800" htmlFor="inactive-cost-input">
                      {t.costPerInactive}
                    </label>
                    <span className="text-xs text-gray-400">{t.costPerInactiveHint}</span>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                        $
                      </span>
                      <input
                        type="number"
                        id="inactive-cost-input"
                        value={inputs.inactiveStudentCost || ''}
                        placeholder={t.costPerInactivePlaceholder}
                        onChange={e => updateField('inactiveStudentCost', Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full rounded-xl border border-gray-200 bg-white pl-8 pr-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                    {errors.inactiveStudentCost && <span className="text-xs font-medium text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3" /> {errors.inactiveStudentCost}</span>}
                  </div>

                  {/* Formula and dynamic calculation */}
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-5">
                    <span className="text-[10px] font-extrabold tracking-wider text-emerald-700 uppercase">
                      {t.formulaEngagement}
                    </span>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500">{t.currentEngagementCost}:</span>
                      <span className="text-lg font-black text-gray-900">
                        {formatCurrency(partials.costs.engagement, inputs.country, currentLang)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: ODILO Investment */}
            {currentStep === 6 && (
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">{t.step6Title}</h2>
                <p className="mt-1.5 text-sm text-gray-500 mb-8">{t.step6Desc}</p>

                <div className="space-y-6">
                  {/* ODILO Investment */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-semibold text-gray-800" htmlFor="odilo-inv-input">
                        {t.odiloInvestment}
                      </label>
                      <button
                        type="button"
                        onClick={() => setActiveTooltip(activeTooltip === 'odilo' ? null : 'odilo')}
                        className="text-gray-400 hover:text-emerald-500 cursor-pointer"
                      >
                        <HelpCircle className="h-4 w-4" />
                      </button>
                    </div>
                    {activeTooltip === 'odilo' && (
                      <div className="rounded-lg bg-emerald-50/70 p-3 text-xs text-emerald-800 leading-relaxed border border-emerald-100 mb-1">
                        {t.tooltipOdilo}
                      </div>
                    )}
                    <span className="text-xs text-gray-400">{t.odiloHint}</span>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                        $
                      </span>
                      <input
                        type="number"
                        id="odilo-inv-input"
                        value={inputs.odiloInvestment || ''}
                        placeholder={t.odiloPlaceholder}
                        onChange={e => updateField('odiloInvestment', Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full border-emerald-500 border-2 bg-emerald-50/10 px-4 pl-8 py-3.5 text-sm font-semibold text-emerald-950 focus:ring-2 focus:ring-emerald-500/20 rounded-xl"
                      />
                    </div>
                    {errors.odiloInvestment && <span className="text-xs font-medium text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3" /> {errors.odiloInvestment}</span>}
                  </div>

                  {/* Summary of overall pain cost to build anticipation */}
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
                    <span className="text-[10px] font-extrabold tracking-wider text-gray-400 uppercase">
                      {t.totalPainCost}
                    </span>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-600">Total:</span>
                      <span className="text-xl font-black text-gray-900">
                        {formatCurrency(partials.costs.total, inputs.country, currentLang)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Wizard Controls Footer */}
        <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
          <button
            type="button"
            onClick={handleBack}
            id="wizard-back-btn"
            disabled={currentStep === 1}
            className={`cursor-pointer flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              currentStep === 1
                ? 'opacity-0 pointer-events-none'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <ChevronLeft className="h-4 w-4" /> {t.back}
          </button>

          <button
            type="button"
            onClick={handleNext}
            id="wizard-next-btn"
            className="cursor-pointer flex items-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition-all hover:shadow"
          >
            {currentStep === 6 ? t.calculate : t.next} <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
