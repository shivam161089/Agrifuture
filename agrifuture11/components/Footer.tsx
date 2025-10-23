
import React from 'react';
import { useTranslations } from '../hooks/useTranslations';

const Footer: React.FC = () => {
    const t = useTranslations();
  return (
    <footer className="bg-white mt-12 border-t">
      <div className="container mx-auto py-4 px-4 text-center text-stone-500 text-sm">
        <p>&copy; {new Date().getFullYear()} AgriFuture India. {t('footerText')}</p>
      </div>
    </footer>
  );
};

export default Footer;
