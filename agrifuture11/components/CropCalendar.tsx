import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslations } from '../hooks/useTranslations';
import { getCropRecommendations } from '../services/geminiService';
import { INDIAN_STATES } from '../data/indianStates';
import type { CropCalendarResponse } from '../types';

// Icons for the new data points
const MarketIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const WaterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-14v4m-2-2h4m5 14v4m-2-2h4M12 3v18" /></svg>;
const SoilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5V4H4zm0 11v5h5v-5H4zm11-11v5h5V4h-5zm0 11v5h5v-5h-5z" /></svg>;

const CropCalendar: React.FC = () => {
    const [state, setState] = useState('');
    const [season, setSeason] = useState('Kharif');
    const [results, setResults] = useState<CropCalendarResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const t = useTranslations();
    const { language } = useLanguage();

    const seasons = [
        { key: 'seasonKharif', value: 'Kharif' },
        { key: 'seasonRabi', value: 'Rabi' },
        { key: 'seasonZaid', value: 'Zaid' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!state) return;
        setIsLoading(true);
        setError('');
        setResults(null);
        try {
            const result = await getCropRecommendations(state, season, language);
            setResults(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('unknownError'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section id="calendar" className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-lg border border-stone-200">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-green-800">{t('cropCalendarTitle')}</h2>
                <p className="text-stone-600 mt-2 max-w-2xl mx-auto">{t('cropCalendarDescription')}</p>
            </div>

            <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="bg-stone-50 p-4 rounded-lg border border-stone-200 space-y-4 md:space-y-0 md:flex md:items-end md:gap-4">
                    <div className="flex-1">
                        <label htmlFor="state-select" className="block text-sm font-medium text-stone-600 mb-1">{t('selectStateLabel')}</label>
                        <select id="state-select" value={state} onChange={e => setState(e.target.value)} className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-base">
                            <option value="">-- Select a State --</option>
                            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label htmlFor="season-select" className="block text-sm font-medium text-stone-600 mb-1">{t('selectSeasonLabel')}</label>
                        <select id="season-select" value={season} onChange={e => setSeason(e.target.value)} className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-base">
                            {seasons.map(s => <option key={s.key} value={s.value}>{t(s.key as any)}</option>)}
                        </select>
                    </div>
                    <button type="submit" disabled={isLoading || !state} className="w-full md:w-auto justify-center inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-stone-400 disabled:cursor-not-allowed">
                        {isLoading ? t('gettingRecommendationsButton') : t('getRecommendationsButton')}
                    </button>
                </form>

                <div className="mt-8 min-h-[20rem] flex flex-col justify-center">
                    {isLoading && (
                         <div className="flex justify-center items-center h-full">
                            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                         </div>
                    )}

                    {error && <div className="text-center text-red-600 bg-red-100 p-4 rounded-lg">{error}</div>}
                    
                    {!isLoading && !error && !results && (
                        <div className="text-center text-stone-500 p-8">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <p className="mt-4 text-lg">{t('cropCalendarInitialPrompt')}</p>
                        </div>
                    )}

                    {results && !isLoading && (
                        <div className="animate-fade-in space-y-8">
                            <div>
                                <h3 className="text-xl font-semibold text-green-800 mb-2">{t('recommendationSummary')}</h3>
                                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                                    <p className="text-green-900">{results.summary}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {results.recommendations.map((rec, index) => (
                                    <div key={index} className="bg-white border border-stone-200 rounded-lg shadow-sm p-5 flex flex-col">
                                        <h4 className="text-xl font-bold text-stone-800 mb-3">{rec.crop_name}</h4>
                                        
                                        <div className="space-y-4 text-sm flex-grow">
                                            <div className="flex justify-between p-2 bg-stone-100 rounded-md">
                                                <span className="font-semibold text-stone-600">{t('sowingTime')}:</span>
                                                <span className="text-stone-800 text-right">{rec.sowing_time}</span>
                                            </div>
                                            <div className="flex justify-between p-2 bg-stone-100 rounded-md">
                                                <span className="font-semibold text-stone-600">{t('harvestingTime')}:</span>
                                                <span className="text-stone-800 text-right">{rec.harvesting_time}</span>
                                            </div>

                                            <div className="space-y-2 pt-2">
                                                <div className="flex items-start gap-2"><MarketIcon /> <div><span className="font-semibold">{t('marketDemand')}:</span> {rec.market_demand}</div></div>
                                                <div className="flex items-start gap-2"><WaterIcon /> <div><span className="font-semibold">{t('waterRequirement')}:</span> {rec.water_requirement}</div></div>
                                                <div className="flex items-start gap-2"><SoilIcon /> <div><span className="font-semibold">{t('soilSuitability')}:</span> {rec.soil_suitability}</div></div>
                                            </div>

                                        </div>

                                        <div className="mt-4 pt-4 border-t border-stone-200">
                                            <h5 className="font-semibold mb-2 text-stone-700">{t('keyTips')}</h5>
                                            <ul className="list-disc list-inside space-y-1 text-sm text-stone-600">
                                                {rec.key_tips.map((tip, i) => <li key={i}>{tip}</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default CropCalendar;