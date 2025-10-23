
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { HistoryItem } from '../types';

interface HistoryContextType {
  history: HistoryItem[];
  addHistoryItem: (item: HistoryItem) => void;
  clearHistory: () => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

const HISTORY_STORAGE_KEY = 'agriFutureHistory';
const MAX_HISTORY_ITEMS = 10;

export const HistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const storedHistory = window.localStorage.getItem(HISTORY_STORAGE_KEY);
      return storedHistory ? JSON.parse(storedHistory) : [];
    } catch (error) {
      console.error("Failed to read history from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save history to localStorage", error);
    }
  }, [history]);

  const addHistoryItem = (item: HistoryItem) => {
    setHistory(prevHistory => {
      const newHistory = [item, ...prevHistory];
      // Keep only the most recent items
      return newHistory.slice(0, MAX_HISTORY_ITEMS);
    });
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <HistoryContext.Provider value={{ history, addHistoryItem, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = (): HistoryContextType => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};
