
import React, { useState, useEffect } from 'react';
import { weatherService } from '../services/weatherService';
import type { WeatherData } from '../types';
import { useSettings } from '../context/SettingsContext';
import { useTranslations } from '../hooks/useTranslations';
import { useLanguage } from '../context/LanguageContext';

const WeatherWidget: React.FC = () => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { settings } = useSettings();
    const t = useTranslations();
    const { language } = useLanguage();

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const data = await weatherService.getWeather(
                        position.coords.latitude,
                        position.coords.longitude
                    );
                    setWeather(data);
                } catch (err) {
                    setError(t('weatherError'));
                } finally {
                    setLoading(false);
                }
            },
            () => {
                setError(t('weatherError'));
                setLoading(false);
            }
        );
    }, [t]);

    const getDisplayTemp = (temp_c: number, temp_f: number) => {
        const temp = settings.temperatureUnit === 'C' ? temp_c : temp_f;
        return `${Math.round(temp)}°`;
    };
    
    const getTranslatedCondition = (condition: string) => {
        const key = condition.replace(/\s/g, '').toLowerCase();
        const conditionMap: {[key: string]: string} = {
            sunny: t('sunny'),
            partlycloudy: t('partlyCloudy'),
            cloudy: t('cloudy'),
            rain: t('rain'),
            snow: t('snow'),
        };
        return conditionMap[key] || condition;
    }

    if (loading) {
        return (
            <div className="bg-white px-4 py-3 rounded-xl shadow-md border border-stone-200 text-sm text-stone-600">
                {t('weatherLoading')}
            </div>
        );
    }
    
    if (error || !weather) {
        return (
            <div className="bg-red-50 px-4 py-3 rounded-xl shadow-md border border-red-200 text-sm text-red-700">
                {error}
            </div>
        );
    }

    return (
        <div className="bg-white p-3 rounded-xl shadow-md border border-stone-200">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Location & Current Weather */}
                <div className="flex items-center gap-3 self-start md:self-center">
                     <div className="text-3xl">{weather.current.icon}</div>
                     <div>
                        <p className="font-bold text-lg text-stone-800">
                            {getDisplayTemp(weather.current.temp_c, weather.current.temp_f)}
                            <span className="text-base font-medium text-stone-600 ml-2">{getTranslatedCondition(weather.current.condition)}</span>
                        </p>
                        <p className="text-sm text-stone-500">{weather.location}</p>
                    </div>
                </div>
                
                {/* 5-Day Forecast */}
                <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto overflow-x-auto hide-scrollbar pb-2">
                    {weather.forecast.map(day => (
                        <div key={day.date} className="bg-stone-50 p-2 rounded-lg text-center w-16 flex-shrink-0">
                            <p className="font-semibold text-xs text-stone-700">
                                {new Date(day.date + 'T00:00:00').toLocaleDateString(language, { weekday: 'short' })}
                            </p>
                            <p className="text-xl my-0.5">{day.day.icon}</p>
                            <p className="text-xs text-stone-600">
                                <span className="font-medium text-stone-800">{getDisplayTemp(day.day.maxtemp_c, day.day.maxtemp_f)}</span>
                                <span className="text-stone-400">/{getDisplayTemp(day.day.mintemp_c, day.day.mintemp_f)}</span>
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WeatherWidget;
