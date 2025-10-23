
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { Settings } from '../types';

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = 'agriFutureSettings';

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const storedSettings = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      const defaults: Settings = { temperatureUnit: 'C' };
      return storedSettings ? { ...defaults, ...JSON.parse(storedSettings) } : defaults;
    } catch (error) {
      console.error("Failed to read settings from localStorage", error);
      return { temperatureUnit: 'C' };
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prevSettings => ({ ...prevSettings, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
