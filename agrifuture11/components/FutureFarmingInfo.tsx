
import React, { useState, useCallback, useEffect } from 'react';
import { getFarmingInfo } from '../services/geminiService';
import { useLanguage } from '../context/LanguageContext';
import { useTranslations } from '../hooks/useTranslations';
import { useHistory } from '../context/HistoryContext';
import { FARMING_TOPIC_KEYS } from '../data/plantData';

interface FutureFarmingInfoProps {
  selectedTopic: string | null;
}

const FutureFarmingInfo: React.FC<FutureFarmingInfoProps> = ({ selectedTopic }) => {
  const [activeTopic, setActiveTopic] = useState<string>('');
  const [info, setInfo] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();
  const t = useTranslations();
  const { addHistoryItem } = useHistory();

  const fetchInfo = useCallback(async (topic: string) => {
    setActiveTopic(topic);
    setIsLoading(true);
    setError(null);
    setInfo('');
    try {
      const result = await getFarmingInfo(topic, language);
      setInfo(result);
      addHistoryItem({
        id: Date.now(),
        type: 'info',
        timestamp: new Date().toISOString(),
        language,
        topic: topic,
        data: result,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('unknownError'));
    } finally {
      setIsLoading(false);
    }
  }, [language, t, addHistoryItem]);

  useEffect(() => {
    if (selectedTopic) {
      fetchInfo(selectedTopic);
    }
  }, [selectedTopic, fetchInfo]);

  // Simple markdown to HTML renderer
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements = [];
    let listItems: React.ReactElement[] = [];

    const endList = () => {
        if (listItems.length > 0) {
            elements.push(<ol key={`ol-${elements.length}`} className="list-decimal list-inside space-y-1 mt-2">{listItems}</ol>);
            listItems = [];
        }
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('### ')) {
            endList();
            elements.push(<h3 key={i} className="text-xl font-semibold mt-4 mb-2">{line.substring(4)}</h3>);
        } else if (line.startsWith('## ')) {
            endList();
            elements.push(<h2 key={i} className="text-2xl font-bold mt-5 mb-3">{line.substring(3)}</h2>);
        } else if (line.startsWith('# ')) {
            endList();
            elements.push(<h2 key={i} className="text-2xl font-bold mt-5 mb-3">{line.substring(2)}</h2>);
        } else if (line.match(/^\d+\.\s/)) {
            listItems.push(<li key={i} className="mb-1">{line.substring(line.indexOf(' ') + 1)}</li>);
        } else {
            endList();
            if (line.trim() !== '') {
                const boldedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                elements.push(<p key={i} className="mb-2" dangerouslySetInnerHTML={{ __html: boldedLine }} />);
            }
        }
    }
    endList(); // Add any remaining list items at the end
    return elements;
  };

  return (
    <section id="info" className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-lg border border-stone-200">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-green-800">{t('exploreFarmingTitle')}</h2>
        <p className="text-stone-600 mt-2 max-w-2xl mx-auto">{t('exploreFarmingDescription')}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-8">
        {FARMING_TOPIC_KEYS.map((topic) => (
          <button
            key={topic.key}
            onClick={() => fetchInfo(topic.value)}
            disabled={isLoading && activeTopic === topic.value}
            className={`font-semibold py-2 px-5 rounded-full transition-colors text-sm md:text-base
              ${activeTopic === topic.value 
                ? 'bg-green-700 text-white' 
                : 'bg-stone-200 text-stone-700 hover:bg-stone-300'}
              ${isLoading && activeTopic === topic.value ? 'cursor-wait' : ''}`}
          >
            {t(topic.key as any)}
          </button>
        ))}
      </div>
      
      <div className="max-w-4xl mx-auto mt-4 min-h-[200px]">
        {isLoading && (
            <div className="flex justify-center items-center h-full">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )}
        {error && <div className="text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</div>}
        {info && (
          <div className="prose prose-stone max-w-none bg-stone-50 p-6 rounded-lg border border-stone-200 animate-fade-in">
            {renderMarkdown(info)}
          </div>
        )}
      </div>
    </section>
  );
};

export default FutureFarmingInfo;
