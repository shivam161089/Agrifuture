import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslations } from '../hooks/useTranslations';
import { startChatSession } from '../services/geminiService';
import { useHistory } from '../context/HistoryContext';
import type { Chat } from '@google/genai';
import type { ChatMessage } from '../types';

const ChatBot: React.FC = () => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [currentInput, setCurrentInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const t = useTranslations();
    const { language } = useLanguage();
    const { addHistoryItem } = useHistory();
    const chatContainerRef = useRef<HTMLDivElement>(null);
    
    // Initialize chat session and welcome message
    useEffect(() => {
        const initChat = async () => {
            setIsLoading(true);
            const chatSession = await startChatSession(language);
            setChat(chatSession);
            setMessages([{ role: 'model', text: t('welcomeMessage') }]);
            setIsLoading(false);
        };
        initChat();
    }, [language, t]);
    
    // Scroll to bottom on new message
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);
    
    const handleSendMessage = async () => {
        if (!currentInput.trim() || !chat || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: currentInput };
        const currentMessages = [...messages, userMessage];
        setMessages(currentMessages);
        setCurrentInput('');
        setIsLoading(true);

        try {
            const stream = await chat.sendMessageStream({ message: currentInput });
            let modelResponse = '';
            setMessages(prev => [...prev, { role: 'model', text: '' }]);

            for await (const chunk of stream) {
                const chunkText = chunk.text;
                modelResponse += chunkText;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text += chunkText;
                    return newMessages;
                });
            }
            
            // This captures the last few messages for history.
            // In a real app you might want to save the whole session.
            addHistoryItem({
                id: Date.now(),
                type: 'chat',
                timestamp: new Date().toISOString(),
                language,
                messages: [userMessage, { role: 'model', text: modelResponse }],
            });

        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, { role: 'model', text: 'Sorry, something went wrong. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <section id="chatbot" className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-lg border border-stone-200">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-green-800">{t('chatBotTitle')}</h2>
                <p className="text-stone-600 mt-2 max-w-2xl mx-auto">{t('chatBotDescription')}</p>
            </div>
            <div className="max-w-3xl mx-auto flex flex-col h-[70vh] md:h-[65vh]">
                <div ref={chatContainerRef} className="flex-grow overflow-y-auto bg-stone-50 p-4 rounded-lg border border-stone-200 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl break-words ${
                                msg.role === 'user' 
                                ? 'bg-green-600 text-white' 
                                : 'bg-stone-200 text-stone-800'
                            }`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && messages.length > 0 && messages[messages.length-1].role === 'user' && (
                         <div className="flex justify-start">
                            <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl bg-stone-200 text-stone-800">
                                <div className="flex items-center space-x-1.5 p-1">
                                    <div className="w-2 h-2 bg-stone-500 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-stone-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                    <div className="w-2 h-2 bg-stone-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="mt-4 flex items-center gap-2">
                    <textarea
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder={t('chatPlaceholder')}
                        className="flex-grow p-3 border border-stone-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 resize-none max-h-28"
                        rows={1}
                        disabled={isLoading}
                        aria-label={t('chatPlaceholder')}
                    />
                    <button onClick={handleSendMessage} disabled={isLoading || !currentInput.trim()} className="p-3 rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-stone-400 disabled:cursor-not-allowed" aria-label={t('sendMessage')}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default ChatBot;