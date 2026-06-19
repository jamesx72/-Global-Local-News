import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Layout from './components/Layout';
import Home from './views/Home';
import Contributor from './views/Contributor';
import Wallet from './views/Wallet';
import Verification from './views/Verification';
import Bookmarks from './views/Bookmarks';
import Recent from './views/Recent';
import Settings from './views/Settings';
import ReadLater from './views/ReadLater';
import ReminderToast from './components/ReminderToast';
import ArticleDetail from './views/ArticleDetail';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [viewData, setViewData] = useState<any>(null);

  useEffect(() => {
    const applyTypographyAndTheme = () => {
      let typography = 'classic';
      let theme = 'dark';
      let baseFontSize = 'medium';
      try {
        const saved = window.localStorage.getItem('app_settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.typography) typography = parsed.typography;
          if (parsed.theme) theme = parsed.theme;
          if (parsed.baseFontSize) baseFontSize = parsed.baseFontSize;
        }
      } catch (e) {
        // ignore
      }
      
      document.documentElement.classList.remove('typography-classic', 'typography-modern', 'typography-editorial');
      document.documentElement.classList.add(`typography-${typography}`);

      document.documentElement.classList.remove('theme-light');
      if (theme === 'light' || (theme === 'system' && !window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('theme-light');
      }

      // Apply base font size
      const fontSizes: Record<string, string> = {
        'small': '14px',
        'medium': '16px',
        'large': '18px',
        'x-large': '20px'
      };
      document.documentElement.style.fontSize = fontSizes[baseFontSize] || '16px';
    };

    applyTypographyAndTheme();
    window.addEventListener('app_settings_changed', applyTypographyAndTheme);
    
    return () => {
      window.removeEventListener('app_settings_changed', applyTypographyAndTheme);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement ||
        e.ctrlKey || e.metaKey || e.altKey // ignore if modifier used
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'h') {
        setCurrentView('home');
      } else if (key === 'b') {
        setCurrentView('bookmarks');
      } else if (key === 'r') {
        setCurrentView('recent');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const handleNavigate = (e: CustomEvent) => {
      setCurrentView(e.detail.view);
      setViewData(e.detail.data);
    };
    window.addEventListener('navigate', handleNavigate as EventListener);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('navigate', handleNavigate as EventListener);
    };
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'home': return <Home />;
      case 'contributor': return <Contributor />;
      case 'wallet': return <Wallet />;
      case 'verification': return <Verification />;
      case 'bookmarks': return <Bookmarks />;
      case 'recent': return <Recent />;
      case 'readLater': return <ReadLater />;
      case 'settings': return <Settings />;
      case 'articleDetail': return <ArticleDetail article={viewData?.article} />;
      default: return <Home />;
    }
  };

  return (
    <Layout currentView={currentView} setCurrentView={setCurrentView}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full h-full"
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
      <ReminderToast setCurrentView={setCurrentView} />
    </Layout>
  );
}
