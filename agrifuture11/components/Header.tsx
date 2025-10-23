import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { LANGUAGES } from '../translations';
import { useTranslations } from '../hooks/useTranslations';
import { useAuth } from '../context/AuthContext';
import type { Tab, Page } from '../App';

const LeafIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a6 6 0 006-6c0-3.314-2.686-6-6-6s-6 2.686-6 6c0 3.314 2.686 6 6 6zM12 18c-3.314 0-6-2.686-6-6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2m8.66-14.66l-1.414 1.414M4.754 4.754l1.414 1.414m12.492 12.492l-1.414-1.414M6.168 17.832l-1.414-1.414M2 12h2m16 0h2" />
    </svg>
);

interface HeaderProps {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
    setPage: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, setPage }) => {
    const { language, setLanguage } = useLanguage();
    const t = useTranslations();
    const { user, isGuest, signOut } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(event.target.value);
    };

    const handleNav = (page: Page) => {
      setPage(page);
      setIsProfileOpen(false);
    };
    
    const handleTabClick = (tab: Tab) => {
        setPage('main');
        setActiveTab(tab);
    }

    const tabs: { id: Tab; label: string; }[] = [
        { id: 'analyzer', label: t('tabAnalyzer') },
        { id: 'guide', label: t('tabFarmingGuide') },
        { id: 'qa', label: t('tabCommunityQA') },
        { id: 'calendar', label: t('tabCropCalendar') },
        { id: 'chat', label: t('tabChatBot') },
    ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-20">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
            <LeafIcon />
            <h1 className="ml-3 text-xl sm:text-2xl font-bold text-green-800 tracking-tight">
                AgriFuture <span className="hidden sm:inline">India</span>
            </h1>
        </div>
        <div className="flex items-center gap-4">
            <div className="relative">
                <select
                    value={language}
                    onChange={handleLanguageChange}
                    className="appearance-none bg-stone-100 border border-stone-300 text-stone-700 font-semibold rounded-lg py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    aria-label="Select language"
                >
                    {LANGUAGES.map(({ code, name }) => (
                        <option key={code} value={code}>{name}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>

            {user ? (
                 <div className="relative" ref={profileRef}>
                    <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 focus:outline-none">
                        <img src={user.avatarUrl} alt="User Avatar" className="w-8 h-8 rounded-full border-2 border-green-600"/>
                    </button>
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-30 border border-stone-200">
                            <div className="px-4 py-2 text-sm text-stone-700 border-b">
                                <p className="font-semibold">{user.name}</p>
                                <p className="text-xs text-stone-500 truncate">{user.email}</p>
                            </div>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleNav('profile'); }} className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-100">{t('profile')}</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleNav('settings'); }} className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-100">{t('settings')}</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); signOut(); setIsProfileOpen(false); }} className="block px-4 py-2 text-sm text-red-600 hover:bg-stone-100">{t('signOut')}</a>
                        </div>
                    )}
                </div>
            ) : ( // This will be the guest view
                <button onClick={signOut} className="px-4 py-2 text-sm font-semibold text-green-700 bg-white border border-green-700 rounded-md hover:bg-green-50 transition-colors">
                    {t('signUpSignIn')}
                </button>
            )}

        </div>
      </div>
      <nav className="bg-green-700">
        <div className="container mx-auto">
          <div className="overflow-x-auto whitespace-nowrap hide-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`inline-block px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-green-700'
                    : 'text-white hover:bg-green-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;