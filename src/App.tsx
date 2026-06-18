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

export default function App() {
  const [currentView, setCurrentView] = useState('home');

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
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'home': return <Home />;
      case 'contributor': return <Contributor />;
      case 'wallet': return <Wallet />;
      case 'verification': return <Verification />;
      case 'bookmarks': return <Bookmarks />;
      case 'recent': return <Recent />;
      case 'settings': return <Settings />;
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
    </Layout>
  );
}
