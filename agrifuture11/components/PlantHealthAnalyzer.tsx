
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { analyzePlantHealth } from '../services/geminiService';
import type { PlantHealthAnalysis, HistoryItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useTranslations } from '../hooks/useTranslations';
import { useHistory } from '../context/HistoryContext';
import { PLANT_DATA, FARMING_TOPIC_KEYS } from '../data/plantData';
import History from './History';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
  
interface PlantHealthAnalyzerProps {
  onTechniqueSelect: (topic: string) => void;
}

const PlantHealthAnalyzer: React.FC<PlantHealthAnalyzerProps> = ({ onTechniqueSelect }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<PlantHealthAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [userPlantName, setUserPlantName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [expandedHistoryId, setExpandedHistoryId] = useState<number | null>(null);

  const { language } = useLanguage();
  const t = useTranslations();
  const { addHistoryItem, history } = useHistory();

  const [searchResults, setSearchResults] = useState<{
    plants: typeof PLANT_DATA;
    techniques: { key: string; value: string; translatedValue: string }[];
    history: HistoryItem[];
  }>({ plants: [], techniques: [], history: [] });


  // Combined search logic
  useEffect(() => {
    if (searchTerm.length > 2) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      
      const filteredPlants = PLANT_DATA.filter(plant => 
        plant.name.toLowerCase().includes(lowerCaseSearch)
      );

      const translatedFarmingTopics = FARMING_TOPIC_KEYS.map(topic => ({
        ...topic,
        translatedValue: t(topic.key as any)
      }));
      
      const filteredTechniques = translatedFarmingTopics.filter(topic =>
        topic.value.toLowerCase().includes(lowerCaseSearch) ||
        topic.translatedValue.toLowerCase().includes(lowerCaseSearch)
      );

      const filteredHistory = history.filter(item => {
          const content = (
              item.type === 'analysis' ? item.data.plant_name :
              item.type === 'info' ? item.topic :
              item.type === 'qa' ? item.question :
              ''
          ).toLowerCase();
          return content.includes(lowerCaseSearch);
      }).slice(0, 5); // Limit history results

      setSearchResults({
        plants: filteredPlants,
        techniques: filteredTechniques,
        history: filteredHistory
      });

      if(filteredPlants.length > 0 || filteredTechniques.length > 0 || filteredHistory.length > 0) {
        setIsDropdownOpen(true);
      }
    } else {
      setSearchResults({ plants: [], techniques: [], history: [] });
      setIsDropdownOpen(false);
    }
  }, [searchTerm, history, t]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setAnalysisResult(null);
      setError(null);
    }
  };

  const handleAnalyzeClick = useCallback(async () => {
    if (!imageFile || !imagePreview) {
      setError(t('selectImageError'));
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const base64Image = await fileToBase64(imageFile);
      const result = await analyzePlantHealth(base64Image, imageFile.type, language, {
        userPlantName
      });
      setAnalysisResult(result);
      addHistoryItem({
        id: Date.now(),
        type: 'analysis',
        timestamp: new Date().toISOString(),
        language,
        data: result,
        imageThumbnail: imagePreview,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('unknownError'));
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, imagePreview, language, t, addHistoryItem, userPlantName]);

  const resetState = () => {
    setImageFile(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
    setUserPlantName('');
    setSearchTerm('');
  };

  const handlePlantSelect = (plantName: string) => {
    setUserPlantName(plantName);
    setSearchTerm(plantName);
    setIsDropdownOpen(false);
  };
  
  const handleTechniqueSelect = (topicValue: string) => {
    onTechniqueSelect(topicValue);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };
  
  const handleHistorySelect = (id: number) => {
    setExpandedHistoryId(id);
    setSearchTerm('');
    setIsDropdownOpen(false);
    // Scroll to history section
    document.getElementById('history')?.scrollIntoView({ behavior: 'smooth' });
  };

  const SolutionSection: React.FC<{ title: string; solutions: string[]; icon: React.ReactElement; className: string; }> = ({ title, solutions, icon, className }) => (
    <div className={`p-4 rounded-lg ${className}`}>
      <h4 className="font-semibold text-lg flex items-center mb-2">
        {icon}
        <span className="ml-2">{title}</span>
      </h4>
      {solutions && solutions.length > 0 ? (
        <ul className="list-disc list-inside space-y-1 text-stone-700">
          {solutions.map((sol, index) => <li key={index}>{sol}</li>)}
        </ul>
      ) : <p className="text-stone-500">{t('noSuggestions')}</p>}
    </div>
  );
  
  const getHistoryTitle = (item: HistoryItem) => {
    switch(item.type) {
      case 'analysis': return `${t('analysisHistoryTitle')}: ${item.data.plant_name}`;
      case 'info': return `${t('infoHistoryTitle')}: ${item.topic}`;
      case 'qa': return `${t('qaHistoryTitle')}: "${item.question.substring(0, 30)}..."`;
      case 'chat': return t('chatHistoryTitle');
      default: return 'History Item';
    }
  }

  return (
    <>
      <section id="analyzer" className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-lg border border-stone-200">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-green-800">{t('plantHealthAnalyzerTitle')}</h2>
          <p className="text-stone-600 mt-2 max-w-2xl mx-auto">{t('plantHealthAnalyzerDescription')}</p>
        </div>

        <div className="max-w-xl mx-auto">
          {!imagePreview ? (
            <div className="w-full h-64 border-2 border-dashed border-stone-300 rounded-lg flex flex-col justify-center items-center text-center p-4">
              <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <label htmlFor="file-upload" className="cursor-pointer bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                  {t('uploadButton')}
                </label>
              <p className="text-sm text-stone-500 mt-2">{t('fileTypes')}</p>
            </div>
          ) : (
            <div className="mb-4">
              <img src={imagePreview} alt={t('imagePreviewAlt')} className="max-h-64 w-auto mx-auto block rounded-lg shadow-md mb-6" />

              <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 space-y-4 mb-6" ref={dropdownRef}>
                  <h3 className="text-lg font-semibold text-stone-700 text-center">{t('provideMoreDetails')}</h3>
                  <div className="relative">
                      <label htmlFor="plant-name" className="block text-sm font-medium text-stone-600 mb-1">{t('userPlantNameLabel')}</label>
                      <input 
                        type="text" 
                        id="plant-name" 
                        value={searchTerm} 
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setUserPlantName(e.target.value);
                        }}
                        placeholder={t('userPlantNamePlaceholder')} 
                        className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm" 
                        autoComplete="off"
                      />
                      {isDropdownOpen && (searchResults.plants.length > 0 || searchResults.techniques.length > 0 || searchResults.history.length > 0) && (
                        <ul className="absolute z-10 w-full bg-white border border-stone-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                          {searchResults.plants.length > 0 && (
                            <>
                              <li className="px-3 pt-2 pb-1 text-xs font-semibold text-stone-500 uppercase tracking-wider">Plants</li>
                              {searchResults.plants.map(plant => (
                                <li key={`plant-${plant.id}`} onClick={() => handlePlantSelect(plant.name)} className="px-3 py-2 hover:bg-stone-100 cursor-pointer flex items-center">
                                  <img src={plant.thumbnail} alt={plant.name} className="w-8 h-8 mr-3 object-cover rounded-sm" />
                                  <span>{plant.name}</span>
                                </li>
                              ))}
                            </>
                          )}
                           {searchResults.techniques.length > 0 && (
                            <>
                              <li className="px-3 pt-2 pb-1 text-xs font-semibold text-stone-500 uppercase tracking-wider">Farming Guides</li>
                              {searchResults.techniques.map(tech => (
                                <li key={`tech-${tech.key}`} onClick={() => handleTechniqueSelect(tech.value)} className="px-3 py-2 hover:bg-stone-100 cursor-pointer">
                                  {tech.translatedValue}
                                </li>
                              ))}
                            </>
                          )}
                          {searchResults.history.length > 0 && (
                            <>
                              <li className="px-3 pt-2 pb-1 text-xs font-semibold text-stone-500 uppercase tracking-wider">Recent Activity</li>
                              {searchResults.history.map(item => (
                                <li key={`hist-${item.id}`} onClick={() => handleHistorySelect(item.id)} className="px-3 py-2 hover:bg-stone-100 cursor-pointer text-sm">
                                  {getHistoryTitle(item)}
                                </li>
                              ))}
                            </>
                          )}
                        </ul>
                      )}
                  </div>
            </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                  <button onClick={handleAnalyzeClick} disabled={isLoading} className="w-full sm:w-auto flex-grow justify-center inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-stone-400 disabled:cursor-not-allowed">
                      {isLoading ? (
                      <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t('analyzingButton')}
                      </>
                      ) : (
                      t('analyzeButton')
                      )}
                  </button>
                  <button onClick={resetState} className="w-full sm:w-auto flex-grow-0 justify-center inline-flex items-center px-6 py-3 border border-stone-300 text-base font-medium rounded-md text-stone-700 bg-white hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                      {t('newImageButton')}
                  </button>
              </div>
            </div>
          )}
        </div>

        {error && <div className="mt-6 text-center text-red-600 bg-red-100 p-3 rounded-lg max-w-xl mx-auto">{error}</div>}
        
        {analysisResult && !isLoading && (
          <div className="mt-8 max-w-4xl mx-auto animate-fade-in">
            <h3 className="text-2xl font-bold text-stone-800 mb-4 text-center">{analysisResult.plant_name} - <span className={analysisResult.health_status.toLowerCase() !== 'healthy' ? 'text-orange-600' : 'text-green-600'}>{analysisResult.health_status}</span></h3>
            <div className="text-center mb-6 bg-stone-50 p-4 rounded-lg border">
                <p className="font-semibold text-stone-700">{analysisResult.issue_identified}</p>
                <p className="text-stone-600 mt-1">{analysisResult.issue_description}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
                <SolutionSection title={t('organicSolutions')} solutions={analysisResult.organic_solutions} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} className="bg-green-50 border-l-4 border-green-500" />
                <SolutionSection title={t('nonOrganicSolutions')} solutions={analysisResult.non_organic_solutions} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.443 2.216a2 2 0 001.022.547l2.387.477a6 6 0 003.86-.517l.318-.158a6 6 0 013.86-.517l2.387-.477a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.443-2.216z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} className="bg-yellow-50 border-l-4 border-yellow-500" />
                <div className="md:col-span-2">
                    <SolutionSection title={t('preventiveMeasures')} solutions={analysisResult.preventive_measures} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>} className="bg-blue-50 border-l-4 border-blue-500" />
                </div>
            </div>
          </div>
        )}
      </section>
      <div className="mt-12 md:mt-20">
        <History initiallyExpandedId={expandedHistoryId} />
      </div>
    </>
  );
};

export default PlantHealthAnalyzer;
