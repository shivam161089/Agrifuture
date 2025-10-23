
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslations } from '../hooks/useTranslations';
import type { Page } from '../App';

interface ProfilePageProps {
    setPage: (page: Page) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ setPage }) => {
    const { user } = useAuth();
    const t = useTranslations();

    if (!user) {
       return (
        <div className="text-center p-8">
            <p className="text-stone-600">Please sign in to view your profile.</p>
            {/* In a real app with a router, this would be a redirect.
                Here, we rely on the parent component's logic to show this page correctly. */}
        </div>
       )
    }

    return (
        <div className="max-w-2xl mx-auto">
             <button onClick={() => setPage('main')} className="mb-4 text-sm font-semibold text-green-700 hover:text-green-900 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                {t('backToMain')}
            </button>
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-stone-200">
                <h2 className="text-3xl font-bold text-green-800 mb-6 text-center">{t('profilePageTitle')}</h2>
                
                <div className="flex flex-col items-center mb-8">
                    <img src={user.avatarUrl} alt="User Avatar" className="w-24 h-24 rounded-full border-4 border-green-500 shadow-md" />
                    <h3 className="text-2xl font-semibold text-stone-800 mt-4">{user.name}</h3>
                    <p className="text-stone-500">{user.email}</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-600">{t('profileFarmLocation')}</label>
                        <input type="text" disabled value="Not set" className="mt-1 block w-full px-3 py-2 bg-stone-100 border border-stone-300 rounded-md shadow-sm cursor-not-allowed text-stone-500"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-600">{t('profilePrimaryCrops')}</label>
                        <input type="text" disabled value="Not set" className="mt-1 block w-full px-3 py-2 bg-stone-100 border border-stone-300 rounded-md shadow-sm cursor-not-allowed text-stone-500"/>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
