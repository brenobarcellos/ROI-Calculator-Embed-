import React, { useState } from 'react';
import { LeadCaptureData, Language } from '../types';
import { translations, countries } from '../translations';
import { AlertCircle, Lock } from 'lucide-react';

interface LeadCaptureFormProps {
  currentLang: Language;
  defaultCountry: string;
  onSubmit: (data: LeadCaptureData) => void;
  isSubmitting?: boolean;
}

export default function LeadCaptureForm({
  currentLang,
  defaultCountry,
  onSubmit,
  isSubmitting = false,
}: LeadCaptureFormProps) {
  const t = translations[currentLang];
  const [formData, setFormData] = useState<Partial<LeadCaptureData>>({
    firstName: '',
    lastName: '',
    email: '',
    institution: '',
    jobTitle: '',
    country: defaultCountry,
    phone: '',
    consentGdpr: false,
    consentLgpd: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof LeadCaptureData, string>>>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (!formData.firstName?.trim()) {
      newErrors.firstName = t.requiredField;
      isValid = false;
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = t.requiredField;
      isValid = false;
    }
    if (!formData.email?.trim()) {
      newErrors.email = t.requiredField;
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = currentLang === 'en' ? 'Invalid email format' : currentLang === 'pt' ? 'Formato de e-mail inválido' : 'Formato de correo inválido';
      isValid = false;
    }
    if (!formData.institution?.trim()) {
      newErrors.institution = t.requiredField;
      isValid = false;
    }
    if (!formData.jobTitle?.trim()) {
      newErrors.jobTitle = t.requiredField;
      isValid = false;
    }
    if (!formData.country) {
      newErrors.country = t.requiredField;
      isValid = false;
    }

    // GDPR is required for ES/EN. LGPD is required for Brazil / PT.
    if (!formData.consentGdpr && (currentLang === 'es' || currentLang === 'en' || formData.country === 'ES')) {
      newErrors.consentGdpr = currentLang === 'en' ? 'You must accept privacy consent' : 'Debe aceptar los términos de privacidad';
      isValid = false;
    }
    if (!formData.consentLgpd && (currentLang === 'pt' || formData.country === 'BR')) {
      newErrors.consentLgpd = currentLang === 'pt' ? 'Você deve aceitar o consentimento da LGPD' : 'Debe aceptar el consentimiento de LGPD';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData as LeadCaptureData);
    }
  };

  const updateField = (field: keyof LeadCaptureData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Check if LGPD consent is relevant (Portuguese, Brazil, or BR is selected)
  const showLgpd = currentLang === 'pt' || formData.country === 'BR';
  const showGdpr = currentLang === 'es' || currentLang === 'en' || formData.country === 'ES';

  return (
    <form onSubmit={handleSubmit} className="space-y-5" id="lead-capture-form">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* First Name */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider" htmlFor="first-name">
            {t.formFirstName} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="first-name"
            value={formData.firstName}
            onChange={e => updateField('firstName', e.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            placeholder="John"
          />
          {errors.firstName && (
            <span className="text-xs font-medium text-red-500 flex items-center gap-1 mt-0.5">
              <AlertCircle className="h-3 w-3" /> {errors.firstName}
            </span>
          )}
        </div>

        {/* Last Name */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider" htmlFor="last-name">
            {t.formLastName} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="last-name"
            value={formData.lastName}
            onChange={e => updateField('lastName', e.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Doe"
          />
          {errors.lastName && (
            <span className="text-xs font-medium text-red-500 flex items-center gap-1 mt-0.5">
              <AlertCircle className="h-3 w-3" /> {errors.lastName}
            </span>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider" htmlFor="email-addr">
          {t.formEmail} <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email-addr"
          value={formData.email}
          onChange={e => updateField('email', e.target.value)}
          className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          placeholder="j.doe@university.edu"
        />
        {errors.email && (
          <span className="text-xs font-medium text-red-500 flex items-center gap-1 mt-0.5">
            <AlertCircle className="h-3 w-3" /> {errors.email}
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Institution */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider" htmlFor="institution-name">
            {t.formInstitution} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="institution-name"
            value={formData.institution}
            onChange={e => updateField('institution', e.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Harvard University"
          />
          {errors.institution && (
            <span className="text-xs font-medium text-red-500 flex items-center gap-1 mt-0.5">
              <AlertCircle className="h-3 w-3" /> {errors.institution}
            </span>
          )}
        </div>

        {/* Job Title */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider" htmlFor="job-title">
            {t.formJobTitle} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="job-title"
            value={formData.jobTitle}
            onChange={e => updateField('jobTitle', e.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Dean of Academics"
          />
          {errors.jobTitle && (
            <span className="text-xs font-medium text-red-500 flex items-center gap-1 mt-0.5">
              <AlertCircle className="h-3 w-3" /> {errors.jobTitle}
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Country Selector (Editable) */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider" htmlFor="form-country">
            {t.country} <span className="text-red-500">*</span>
          </label>
          <select
            id="form-country"
            value={formData.country}
            onChange={e => updateField('country', e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">{t.countrySelect}</option>
            {countries.map(c => (
              <option key={c.code} value={c.code}>
                {c.names[currentLang]}
              </option>
            ))}
          </select>
          {errors.country && (
            <span className="text-xs font-medium text-red-500 flex items-center gap-1 mt-0.5">
              <AlertCircle className="h-3 w-3" /> {errors.country}
            </span>
          )}
        </div>

        {/* Phone Number */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider" htmlFor="phone-num">
            {t.formPhone}
          </label>
          <input
            type="tel"
            id="phone-num"
            value={formData.phone}
            onChange={e => updateField('phone', e.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            placeholder="+1 (555) 000-0000"
          />
        </div>
      </div>

      {/* GDPR Consent */}
      {showGdpr && (
        <div className="flex flex-col gap-1">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              id="consent-gdpr"
              checked={formData.consentGdpr}
              onChange={e => updateField('consentGdpr', e.target.checked)}
              className="mt-1 accent-emerald-600 rounded border-gray-300"
            />
            <span className="text-xs text-gray-500 leading-relaxed select-none">
              {t.formConsentGdpr}
            </span>
          </label>
          {errors.consentGdpr && (
            <span className="text-xs font-medium text-red-500 flex items-center gap-1 mt-0.5">
              <AlertCircle className="h-3 w-3" /> {errors.consentGdpr}
            </span>
          )}
        </div>
      )}

      {/* LGPD Consent */}
      {showLgpd && (
        <div className="flex flex-col gap-1">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              id="consent-lgpd"
              checked={formData.consentLgpd}
              onChange={e => updateField('consentLgpd', e.target.checked)}
              className="mt-1 accent-emerald-600 rounded border-gray-300"
            />
            <span className="text-xs text-gray-500 leading-relaxed select-none">
              {t.formConsentLgpd}
            </span>
          </label>
          {errors.consentLgpd && (
            <span className="text-xs font-medium text-red-500 flex items-center gap-1 mt-0.5">
              <AlertCircle className="h-3 w-3" /> {errors.consentLgpd}
            </span>
          )}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        id="lead-submit-btn"
        disabled={isSubmitting}
        className="cursor-pointer w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all"
      >
        <Lock className="h-4 w-4" />
        {isSubmitting
          ? (currentLang === 'en' ? 'Processing...' : currentLang === 'pt' ? 'Processando...' : 'Procesando...')
          : t.formSubmit}
      </button>
    </form>
  );
}
