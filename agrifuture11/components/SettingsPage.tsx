
import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { useTranslations } from '../hooks/useTranslations';
import type { Page } from '../App';

interface SettingsPageProps {
    setPage: (page: Page) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ setPage }) => {
    const { settings, updateSettings } = useSettings();
    const t = useTranslations();
    
    const handleUnitChange = (unit: 'C' | 'F') => {
        updateSettings({ temperatureUnit: unit });
    };

    return (
        <div className="max-w-2xl mx-auto">
            <button onClick={() => setPage('main')} className="mb-4 text-sm font-semibold text-green-700 hover:text-green-900 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                {t('backToMain')}
            </button>
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-stone-200">
                <h2 className="text-3xl font-bold text-green-800 mb-6 text-center">{t('settingsPageTitle')}</h2>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-base font-semibold text-stone-700">{t('temperatureUnit')}</label>
                        <fieldset className="mt-2">
                            <legend className="sr-only">Temperature unit</legend>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center">
                                    <input
                                        id="celsius"
                                        name="temperature-unit"
                                        type="radio"
                                        checked={settings.temperatureUnit === 'C'}
                                        onChange={() => handleUnitChange('C')}
                                        className="h-4 w-4 text-green-600 border-stone-300 focus:ring-green-500"
                                    />
                                    <label htmlFor="celsius" className="ml-2 block text-sm font-medium text-stone-700">{t('celsius')}</label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        id="fahrenheit"
                                        name="temperature-unit"
                                        type="radio"
                                        checked={settings.temperatureUnit === 'F'}
                                        onChange={() => handleUnitChange('F')}
                                        className="h-4 w-4 text-green-600 border-stone-300 focus:ring-green-500"
                                    />
                                    <label htmlFor="fahrenheit" className="ml-2 block text-sm font-medium text-stone-700">{t('fahrenheit')}</label>
                                </div>
                            </div>
                        </fieldset>
                    </div>
                    {/* Future settings can be added here */}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
