
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslations } from '../hooks/useTranslations';
import { authService } from '../services/authService';

const LeafIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a6 6 0 006-6c0-3.314-2.686-6-6-6s-6 2.686-6 6c0 3.314 2.686 6 6 6zM12 18c-3.314 0-6-2.686-6-6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2m8.66-14.66l-1.414 1.414M4.754 4.754l1.414 1.414m12.492 12.492l-1.414-1.414M6.168 17.832l-1.414-1.414M2 12h2m16 0h2" />
    </svg>
);

const AuthPage: React.FC = () => {
    const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
    const t = useTranslations();
    const { signInWithGoogle, signInAsGuest, handleMobileAuthSuccess } = useAuth();

    const [mobileNumber, setMobileNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    const [countdown, setCountdown] = useState(30);
    const [timerActive, setTimerActive] = useState(false);

    useEffect(() => {
        let interval: number | null = null;
        if (timerActive && countdown > 0) {
            interval = window.setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        } else if (countdown === 0) {
            setTimerActive(false);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [timerActive, countdown]);
    
    const startOtpTimer = () => {
        setCountdown(30);
        setTimerActive(true);
    };

    const handleSendOtp = async () => {
        if (!/^\d{10}$/.test(mobileNumber)) {
            setError(t('invalidMobileError'));
            return;
        }
        setLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            await authService.sendOtp(mobileNumber);
            setOtpSent(true);
            setSuccessMessage(t('otpSentSuccess'));
            startOtpTimer();
        } catch (err) {
            setError(err instanceof Error ? err.message : t('unknownError'));
        }
        setLoading(false);
    };
    
    const handleResendOtp = async () => {
        setLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            await authService.sendOtp(mobileNumber);
            setSuccessMessage(t('otpSentSuccess'));
            startOtpTimer();
        } catch (err) {
            setError(err instanceof Error ? err.message : t('unknownError'));
        }
        setLoading(false);
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!/^\d{6}$/.test(otp)) {
            setError(t('invalidOtpError'));
            return;
        }
        setLoading(true);
        setError('');
        try {
            const user = await authService.verifyOtpAndSignUp(mobileNumber, otp);
            if(handleMobileAuthSuccess) handleMobileAuthSuccess(user);
        } catch (err) {
            setError(t('otpVerificationFailed'));
        }
        setLoading(false);
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!/^\d{10}$/.test(mobileNumber)) {
            setError(t('invalidMobileError'));
            return;
        }
        setLoading(true);
        setError('');
        try {
            const user = await authService.signInWithMobile(mobileNumber);
            if(handleMobileAuthSuccess) handleMobileAuthSuccess(user);
        } catch (err) {
             setError(err instanceof Error ? err.message : t('unknownError'));
        }
        setLoading(false);
    };
    
    const toggleMode = (mode: 'signin' | 'signup') => {
        setAuthMode(mode);
        setError('');
        setSuccessMessage('');
        setMobileNumber('');
        setOtp('');
        setOtpSent(false);
        setTimerActive(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-stone-200">
                <div className="text-center mb-6">
                    <LeafIcon />
                    <h1 className="text-3xl font-bold text-green-800 mt-2">{t('authPageTitle')}</h1>
                    <p className="text-stone-600 mt-2">{t('authPageDescription')}</p>
                </div>

                {authMode === 'signup' ? (
                    // Sign Up Form
                    <form onSubmit={handleSignUp} className="space-y-4">
                        <h2 className="text-xl font-semibold text-center text-stone-700">{t('signUpTitle')}</h2>
                        {!otpSent ? (
                            <div>
                                <label htmlFor="mobile-signup" className="block text-sm font-medium text-stone-600">{t('mobileNumberLabel')}</label>
                                <input type="tel" id="mobile-signup" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} placeholder={t('mobileNumberPlaceholder')} className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"/>
                                <button type="button" onClick={handleSendOtp} disabled={loading} className="mt-4 w-full justify-center inline-flex items-center px-4 py-2 border border-transparent font-semibold rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-stone-400">
                                    {loading ? t('sendingOtpButton') : t('sendOtpButton')}
                                </button>
                            </div>
                        ) : (
                             <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-stone-600">{t('otpLabel')}</label>
                                <input type="tel" id="otp" value={otp} onChange={e => setOtp(e.target.value)} placeholder={t('otpPlaceholder')} maxLength={6} className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"/>
                                
                                <div className="text-right mt-2 text-sm">
                                    {timerActive ? (
                                        <span className="text-stone-500">{t('resendOtpIn', { seconds: countdown })}</span>
                                    ) : (
                                        <button type="button" onClick={handleResendOtp} disabled={loading} className="font-medium text-green-600 hover:text-green-500 disabled:text-stone-400">
                                            {t('resendOtp')}
                                        </button>
                                    )}
                                </div>

                                <button type="submit" disabled={loading} className="mt-4 w-full justify-center inline-flex items-center px-4 py-2 border border-transparent font-semibold rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-stone-400">
                                    {loading ? t('verifyingOtpButton') : t('verifyOtpButton')}
                                </button>
                            </div>
                        )}
                        <p className="text-sm text-center text-stone-600">{t('alreadyHaveAccount')} <button type="button" onClick={() => toggleMode('signin')} className="font-medium text-green-600 hover:text-green-500">{t('signInLink')}</button></p>
                    </form>
                ) : (
                    // Sign In Form
                    <form onSubmit={handleSignIn} className="space-y-4">
                        <h2 className="text-xl font-semibold text-center text-stone-700">{t('signInTitle')}</h2>
                        <div>
                            <label htmlFor="mobile-signin" className="block text-sm font-medium text-stone-600">{t('mobileNumberLabel')}</label>
                            <input type="tel" id="mobile-signin" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} placeholder={t('mobileNumberPlaceholder')} className="mt-1 w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"/>
                        </div>
                        <button type="submit" disabled={loading} className="w-full justify-center inline-flex items-center px-4 py-2 border border-transparent font-semibold rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-stone-400">
                            {loading ? t('signingInButton') : t('signInButton')}
                        </button>
                        <p className="text-sm text-center text-stone-600">{t('dontHaveAccount')} <button type="button" onClick={() => toggleMode('signup')} className="font-medium text-green-600 hover:text-green-500">{t('signUpLink')}</button></p>
                    </form>
                )}
                
                {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
                {successMessage && <p className="mt-2 text-center text-sm text-green-600">{successMessage}</p>}


                <div className="my-6 flex items-center">
                    <div className="flex-grow border-t border-stone-300"></div>
                    <span className="flex-shrink mx-4 text-stone-500 text-sm">{t('orSeparator')}</span>
                    <div className="flex-grow border-t border-stone-300"></div>
                </div>

                <div className="space-y-3">
                    <button onClick={signInWithGoogle} className="w-full justify-center inline-flex items-center px-4 py-2 border border-stone-300 font-semibold rounded-md shadow-sm text-stone-700 bg-white hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                        {t('signInWithGoogle')}
                    </button>
                    <button onClick={signInAsGuest} className="w-full justify-center inline-flex items-center px-4 py-2 border border-transparent font-semibold rounded-md shadow-sm text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                        {t('continueAsGuest')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
