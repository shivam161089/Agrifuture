
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslations } from '../hooks/useTranslations';
import { getCommunityAnswer } from '../services/geminiService';
import { useHistory } from '../context/HistoryContext';

const CommunityQA: React.FC = () => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const t = useTranslations();
    const { language } = useLanguage();
    const { addHistoryItem } = useHistory();

    const sampleQuestionKeys = [
        'sampleQuestion1',
        'sampleQuestion2',
        'sampleQuestion3',
        'sampleQuestion4'
    ];

    const handleSubmit = async (q: string) => {
        if (!q) return;
        setIsLoading(true);
        setError('');
        setAnswer('');
        try {
            const result = await getCommunityAnswer(q, language);
            setAnswer(result);
            addHistoryItem({
                id: Date.now(),
                type: 'qa',
                timestamp: new Date().toISOString(),
                language,
                question: q,
                answer: result,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : t('unknownError'));
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSubmit(question);
    };

    const renderMarkdown = (text: string) => {
        const lines = text.split('\n');
        const elements = [];
        let listItems: React.ReactElement[] = [];

        const endList = () => {
            if (listItems.length > 0) {
                elements.push(<ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-2 mt-2">{listItems}</ul>);
                listItems = [];
            }
        };

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.startsWith('**') && line.endsWith('**')) {
                endList();
                elements.push(<h3 key={i} className="text-xl font-semibold mt-4 mb-2">{line.replace(/\*\*/g, '')}</h3>);
            } else if (line.startsWith('* ')) {
                listItems.push(<li key={i} className="mb-1">{line.substring(2)}</li>);
            } else {
                endList();
                if (line.trim() !== '') {
                    elements.push(<p key={i} className="mb-2">{line}</p>);
                }
            }
        }
        endList(); // Final flush for any remaining list items
        return elements;
    };

    return (
        <section id="qa" className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-lg border border-stone-200">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-green-800">{t('communityQATitle')}</h2>
                <p className="text-stone-600 mt-2 max-w-2xl mx-auto">{t('communityQADescription')}</p>
            </div>

            <div className="max-w-3xl mx-auto">
                <form onSubmit={handleFormSubmit}>
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder={t('askQuestionPlaceholder')}
                        className="w-full h-28 p-3 border border-stone-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-base"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !question} className="mt-4 w-full justify-center inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-stone-400 disabled:cursor-not-allowed">
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                {t('gettingAnswerButton')}
                            </>
                        ) : t('askQuestionButton')}
                    </button>
                </form>

                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-stone-700 mb-2">{t('sampleQuestions')}:</h3>
                    <div className="flex flex-wrap gap-2">
                        {sampleQuestionKeys.map(key => {
                            const translatedQuestion = t(key as any);
                            return (
                                <button key={key} onClick={() => {setQuestion(translatedQuestion); handleSubmit(translatedQuestion);}} className="text-sm bg-stone-200 text-stone-700 px-3 py-1 rounded-full hover:bg-stone-300 transition-colors">
                                    {translatedQuestion}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {error && <div className="mt-6 text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</div>}
                
                {answer && !isLoading && (
                    <div className="mt-8 prose prose-stone max-w-none bg-stone-50 p-6 rounded-lg border border-stone-200 animate-fade-in">
                        {renderMarkdown(answer)}
                    </div>
                )}
            </div>
        </section>
    );
};

export default CommunityQA;
