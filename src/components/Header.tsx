import { Language, translations } from '../translations';
import { Globe } from 'lucide-react';

interface HeaderProps {
  currentLang: Language;
  onLangChange: (lang: Language) => void;
  showAdminCta?: boolean;
  onAdminClick?: () => void;
  isAdminView?: boolean;
}

export default function Header({
  currentLang,
  onLangChange,
  showAdminCta = true,
  onAdminClick,
  isAdminView = false,
}: HeaderProps) {
  const t = translations[currentLang];

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm md:px-12">
      {/* Brand Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {/* Custom SVG inline logo matching the ODILO identity */}
          <svg className="h-8 w-auto overflow-visible py-0.5 text-gray-800" viewBox="0 4 324 81" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M47.7 7.7C25.9 7.7 8 24.8 8 45.7c0 21 17.9 38 39.7 38 21.8 0 39.7-17 39.7-38 0-20.9-17.9-38-39.7-38zm0 65.5C31.5 73.2 18.2 60.9 18.2 45.7c0-15.2 13.3-27.5 29.5-27.5 16.2 0 29.5 12.3 29.5 27.5 0 15.2-13.3 27.5-29.5 27.5z" fill="#575756"/>
            <path d="M47.7 20.3c-4 0-7.2-3.1-7.2-7s3.2-7 7.2-7 7.2 3.1 7.2 7-3.2 7-7.2 7z" fill="#18E591"/>
            <path d="M125.7 8.3h-18.9v74.8h18.9c20.3 0 36.8-16.7 36.8-37.4s-16.5-37.4-36.8-37.4zm0 64.3h-8.7V18.8h8.7c14.2 0 25.8 11.2 25.8 26.9 0 15.7-11.6 26.9-25.8 26.9zm65.9-64.3h-10.2v74.8h10.2V8.3zM218.4 8.3H208v74.8h30.4v-10.5H218.4V8.3zm72.7-.6c-21.8 0-39.7 17-39.7 38 0 21 17.9 38 39.7 38s39.7-17 39.7-38c0-21-17.9-38-39.7-38zm0 65.5c-16.2 0-29.5-12.3-29.5-27.5 0-15.2 13.3-27.5 29.5-27.5s29.5 12.3 29.5 27.5c0 15.2-13.3 27.5-29.5 27.5z" fill="#575756"/>
          </svg>
        </div>
        <div className="hidden h-5 w-px bg-gray-200 sm:block"></div>
        <span className="hidden text-xs font-semibold tracking-wider text-gray-400 uppercase sm:block">
          {t.appName}
        </span>
      </div>

      {/* Language Toggle and Sales Enablement Portal Access */}
      <div className="flex items-center gap-4">
        {showAdminCta && onAdminClick && (
          <button
            onClick={onAdminClick}
            id="admin-portal-toggle"
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
              isAdminView
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {isAdminView ? '← Calculator' : 'Sales Portal (CRM)'}
          </button>
        )}

        <div className="flex items-center gap-1.5 rounded-xl bg-gray-50 p-1 border border-gray-100">
          <Globe className="ml-1.5 h-3.5 w-3.5 text-gray-400" />
          {(['es', 'en', 'pt'] as Language[]).map(langCode => (
            <button
              key={langCode}
              onClick={() => onLangChange(langCode)}
              id={`lang-btn-${langCode}`}
              className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-bold uppercase transition-all duration-150 ${
                currentLang === langCode
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {langCode}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
