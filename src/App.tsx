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
  const [showShortcutModal, setShowShortcutModal] = useState(true);

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
          if (parsed.showShortcutModal !== undefined) setShowShortcutModal(parsed.showShortcutModal);
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

  const viewRef = React.useRef({ currentView, viewData });
  useEffect(() => {
    viewRef.current = { currentView, viewData };
  }, [currentView, viewData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        e.ctrlKey || e.metaKey || e.altKey // ignore if modifier used
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      const { currentView: cv, viewData: vd } = viewRef.current;

      if (cv === 'articleDetail' && vd?.list && vd?.article) {
        if (key === 'n') {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          const list: any[] = vd.list;
          const currentIndex = list.findIndex(a => a.id === vd.article.id);
          if (currentIndex !== -1) {
            const nextIndex = (currentIndex + 1) % list.length;
            setViewData({ article: list[nextIndex], list });
          }
          return;
        } else if (key === 'p') {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          const list: any[] = vd.list;
          const currentIndex = list.findIndex(a => a.id === vd.article.id);
          if (currentIndex !== -1) {
            const prevIndex = (currentIndex - 1 + list.length) % list.length;
            setViewData({ article: list[prevIndex], list });
          }
          return;
        }
      }

      if (key === 'h') {
        setCurrentView('home');
      } else if (key === 'b') {
        setCurrentView('bookmarks');
      } else if (key === 'r') {
        setCurrentView('recent');
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);

    const handleNavigate = (e: CustomEvent) => {
      setCurrentView(e.detail.view);
      setViewData(e.detail.data);
    };
    window.addEventListener('navigate', handleNavigate as EventListener);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
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
      
      <AnimatePresence>
        {currentView === 'articleDetail' && viewData?.list && showShortcutModal && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 bg-brand-surface-low border border-brand-outline px-4 py-3 rounded-xl shadow-xl z-50 no-print backdrop-blur-md"
          >
            <div className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Reading Shortcuts</div>
            <div className="flex gap-4 text-brand-primary text-sm font-medium">
               <div className="flex items-center gap-2"><kbd className="px-2 py-0.5 bg-brand-surface-lowest border border-gray-200 shadow-sm rounded text-xs font-mono">P</kbd> Previous</div>
               <div className="flex items-center gap-2"><kbd className="px-2 py-0.5 bg-brand-surface-lowest border border-gray-200 shadow-sm rounded text-xs font-mono">N</kbd> Next</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ReminderToast setCurrentView={setCurrentView} />
    </Layout>
  );
}
