
import React, { useState, useEffect } from 'react';
import { useHistory } from '../context/HistoryContext';
import { useTranslations } from '../hooks/useTranslations';
import type { HistoryItem, HistoryItemAnalysis, HistoryItemInfo, HistoryItemQA, HistoryItemChat } from '../types';

// Re-using icons from PlantHealthAnalyzer
const LeafIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const BeakerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.443 2.216a2 2 0 001.022.547l2.387.477a6 6 0 003.86-.517l.318-.158a6 6 0 013.86-.517l2.387-.477a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.443-2.216z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;

const SolutionSection: React.FC<{ title: string; solutions: string[]; icon: React.ReactElement; className: string; }> = ({ title, solutions, icon, className }) => {
    const t = useTranslations();
    return (
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
};


const AnalysisDetails: React.FC<{ item: HistoryItemAnalysis }> = ({ item }) => {
    const analysisResult = item.data;
    const t = useTranslations();
    return (
        <div className="bg-stone-100 p-6 rounded-xl border border-stone-200">
            <h3 className="text-2xl font-bold text-stone-800 mb-4 text-center">{analysisResult.plant_name} - <span className={analysisResult.health_status.toLowerCase() !== 'healthy' ? 'text-orange-600' : 'text-green-600'}>{analysisResult.health_status}</span></h3>
            <div className="text-center mb-6">
            <p className="font-semibold text-stone-700">{analysisResult.issue_identified}</p>
            <p className="text-stone-600 mt-1">{analysisResult.issue_description}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mt-4 text-sm">
            <SolutionSection title={t('organicSolutions')} solutions={analysisResult.organic_solutions} icon={<LeafIcon />} className="bg-green-50 border-l-4 border-green-500" />
            <SolutionSection title={t('nonOrganicSolutions')} solutions={analysisResult.non_organic_solutions} icon={<BeakerIcon />} className="bg-yellow-50 border-l-4 border-yellow-500" />
            <div className="md:col-span-2">
                <SolutionSection title={t('preventiveMeasures')} solutions={analysisResult.preventive_measures} icon={<ShieldIcon />} className="bg-blue-50 border-l-4 border-blue-500" />
            </div>
            </div>
        </div>
    );
};

const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements = [];
    let listItems: React.ReactElement[] = [];
    let listType: 'ol' | 'ul' | null = null;

    const endList = () => {
        if (listItems.length > 0 && listType) {
            const listElement = React.createElement(listType, {
                key: `${listType}-${elements.length}`,
                className: `list-${listType === 'ol' ? 'decimal' : 'disc'} list-inside space-y-1 mt-2`
            }, listItems);
            elements.push(listElement);
            listItems = [];
            listType = null;
        }
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('### ')) { endList(); elements.push(<h3 key={i} className="text-xl font-semibold mt-4 mb-2">{line.substring(4)}</h3>); }
        else if (line.startsWith('## ')) { endList(); elements.push(<h2 key={i} className="text-2xl font-bold mt-5 mb-3">{line.substring(3)}</h2>); }
        else if (line.startsWith('# ')) { endList(); elements.push(<h2 key={i} className="text-2xl font-bold mt-5 mb-3">{line.substring(2)}</h2>); }
        else if (line.match(/^\d+\.\s/)) {
            if (listType !== 'ol') endList();
            listType = 'ol';
            listItems.push(<li key={i} className="mb-1">{line.substring(line.indexOf(' ') + 1)}</li>);
        }
        else if (line.startsWith('* ')) {
            if (listType !== 'ul') endList();
            listType = 'ul';
            listItems.push(<li key={i} className="mb-1">{line.substring(2)}</li>);
        }
        else {
            endList();
            if (line.trim() !== '') {
                 const boldedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                 elements.push(<p key={i} className="mb-2" dangerouslySetInnerHTML={{ __html: boldedLine }} />);
            }
        }
    }
    endList();
    return elements;
};

const InfoDetails: React.FC<{ item: HistoryItemInfo }> = ({ item }) => {
    return <div className="prose prose-stone max-w-none bg-stone-50 p-6 rounded-lg border border-stone-200">{renderMarkdown(item.data)}</div>;
};

const QADetails: React.FC<{ item: HistoryItemQA }> = ({ item }) => {
    const t = useTranslations();
    return (
         <div className="prose prose-stone max-w-none bg-stone-50 p-6 rounded-lg border border-stone-200">
            <h4 className="font-semibold text-lg text-stone-800">Your Question:</h4>
            <p className="italic text-stone-600">"{item.question}"</p>
            <hr className="my-4"/>
            <h4 className="font-semibold text-lg text-stone-800">AI Scientist's Answer:</h4>
            <div>{renderMarkdown(item.answer)}</div>
        </div>
    );
};

const ChatDetails: React.FC<{ item: HistoryItemChat }> = ({ item }) => {
    return (
        <div className="bg-stone-100 p-4 rounded-xl border border-stone-200 space-y-4">
            {item.messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl ${
                        msg.role === 'user' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-stone-200 text-stone-800'
                    }`}>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

interface HistoryProps {
    initiallyExpandedId?: number | null;
}

const History: React.FC<HistoryProps> = ({ initiallyExpandedId = null }) => {
    const { history, clearHistory } = useHistory();
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const t = useTranslations();

    useEffect(() => {
        setExpandedId(initiallyExpandedId);
    }, [initiallyExpandedId]);

    const toggleExpand = (id: number) => {
        setExpandedId(prevId => (prevId === id ? null : id));
    };

    return (
        <section id="history" className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-lg border border-stone-200">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-green-800">{t('historyTitle')}</h3>
                {history.length > 0 && (
                    <button onClick={clearHistory} className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors">
                        {t('clearHistoryButton')}
                    </button>
                )}
            </div>

            {history.length === 0 ? (
                <p className="text-stone-500 text-center py-8">{t('noHistoryText')}</p>
            ) : (
                <div className="space-y-4">
                    {history.map((item) => (
                        <div key={item.id} className="border border-stone-200 rounded-lg overflow-hidden">
                            <div className="bg-stone-50 p-4 flex items-center justify-between cursor-pointer" onClick={() => toggleExpand(item.id)}>
                                <div className="flex items-center">
                                    {item.type === 'analysis' && <img src={item.imageThumbnail} alt="thumbnail" className="w-12 h-12 object-cover rounded-md mr-4" />}
                                    <div className="flex-1">
                                        <p className="font-semibold text-stone-800">
                                            {item.type === 'analysis' ? `${t('analysisHistoryTitle')}: ${item.data.plant_name}` 
                                            : item.type === 'info' ? `${t('infoHistoryTitle')}: ${item.topic}`
                                            : item.type === 'chat' ? t('chatHistoryTitle')
                                            : `${t('qaHistoryTitle')}: "${item.question.substring(0, 40)}${item.question.length > 40 ? '...' : ''}"`
                                            }
                                        </p>
                                        <p className="text-xs text-stone-500">{new Date(item.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>
                                <button className="text-sm font-semibold text-green-700 hover:text-green-900 ml-4 flex-shrink-0">
                                    {expandedId === item.id ? t('hideDetailsButton') : t('viewDetailsButton')}
                                </button>
                            </div>
                            {expandedId === item.id && (
                                <div className="p-4 animate-fade-in">
                                    {item.type === 'analysis' ? <AnalysisDetails item={item} /> 
                                    : item.type === 'info' ? <InfoDetails item={item} /> 
                                    : item.type === 'chat' ? <ChatDetails item={item} />
                                    : item.type === 'qa' ? <QADetails item={item} />
                                    : null}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default History;
