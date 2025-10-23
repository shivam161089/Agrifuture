
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PlantHealthAnalyzer from './components/PlantHealthAnalyzer';
import FutureFarmingInfo from './components/FutureFarmingInfo';
import Footer from './components/Footer';
import { LanguageProvider } from './context/LanguageContext';
import { HistoryProvider } from './context/HistoryContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import CommunityQA from './components/CommunityQA';
import CropCalendar from './components/CropCalendar';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import WeatherWidget from './components/WeatherWidget';
import AuthPage from './components/AuthPage';
import ChatBot from './components/ChatBot';

export type Tab = 'analyzer' | 'guide' | 'qa' | 'calendar' | 'chat';
export type Page = 'main' | 'profile' | 'settings';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('analyzer');
  const [page, setPage] = useState<Page>('main');
  const [searchSelectedTechnique, setSearchSelectedTechnique] = useState<string | null>(null);

  useEffect(() => {
    // Clear the selected technique if the user navigates away from the guide tab
    if (activeTab !== 'guide') {
      setSearchSelectedTechnique(null);
    }
  }, [activeTab]);

  const handleTechniqueSelect = (topic: string) => {
    setPage('main');
    setActiveTab('guide');
    setSearchSelectedTechnique(topic);
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab !== 'guide') {
        setSearchSelectedTechnique(null);
    }
  }

  const renderContent = () => {
    switch (page) {
      case 'profile':
        return <ProfilePage setPage={setPage} />;
      case 'settings':
        return <SettingsPage setPage={setPage} />;
      case 'main':
      default:
        return (
          <div className="space-y-12 md:space-y-20">
            {activeTab === 'analyzer' && <PlantHealthAnalyzer onTechniqueSelect={handleTechniqueSelect} />}
            {activeTab === 'guide' && <FutureFarmingInfo selectedTopic={searchSelectedTechnique} />}
            {activeTab === 'qa' && <CommunityQA />}
            {activeTab === 'calendar' && <CropCalendar />}
            {activeTab === 'chat' && <ChatBot />}
          </div>
        );
    }
  };
  
  return (
    <HistoryProvider>
      <div className="min-h-screen flex flex-col bg-stone-50">
        <Header activeTab={activeTab} setActiveTab={handleTabChange} setPage={setPage} />
        <main className="flex-grow container mx-auto p-4 md:p-8">
          {activeTab === 'analyzer' && <WeatherWidget />}
          <div className={activeTab === 'analyzer' ? 'mt-8' : ''}>
            {renderContent()}
          </div>
        </main>
        <Footer />
      </div>
    </HistoryProvider>
  );
};

const AppContent: React.FC = () => {
  const { user, isGuest, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user && !isGuest) {
    return <AuthPage />;
  }

  return <MainApp />;
}

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <SettingsProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </SettingsProvider>
    </LanguageProvider>
  );
};

export default App;
