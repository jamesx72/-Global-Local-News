import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Command, Search, Home, ShieldCheck, FileText, Wallet, Bookmark, History, Settings, Users, User, LogIn, Clock } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const shortcuts = [
    { key: '?', label: 'Show/Hide Keyboard Shortcuts', icon: <Command size={16} /> },
    { key: '/', label: 'Focus Search', icon: <Search size={16} /> },
    { key: 'H', label: 'Go to Home', icon: <Home size={16} /> },
    { key: 'V', label: 'Go to Verification Center', icon: <ShieldCheck size={16} /> },
    { key: 'C', label: 'Go to My Contributions', icon: <FileText size={16} /> },
    { key: 'W', label: 'Go to My Wallet', icon: <Wallet size={16} /> },
    { key: 'B', label: 'Go to Saved Articles', icon: <Bookmark size={16} /> },
    { key: 'T', label: 'Go to Read Later', icon: <Clock size={16} /> },
    { key: 'R', label: 'Go to Recent Articles', icon: <History size={16} /> },
    { key: 'N', label: 'Go to Trust Network', icon: <Users size={16} /> },
    { key: 'S', label: 'Go to Settings', icon: <Settings size={16} /> },
    { key: 'P', label: 'Open Profile Modal', icon: <User size={16} /> },
    { key: 'L', label: 'Open Login Modal', icon: <LogIn size={16} /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-brand-surface border border-brand-outline-variant shadow-2xl rounded-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-brand-outline-variant flex justify-between items-center bg-brand-surface-lowest">
              <h2 className="font-serif text-xl font-bold text-brand-primary flex items-center gap-2">
                <Command size={24} className="text-brand-secondary" />
                Keyboard Shortcuts
              </h2>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-brand-primary transition-colors p-1 rounded-md hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-brand-surface-low border border-brand-outline-variant/50 hover:border-brand-primary/20 transition-colors">
                    <div className="flex items-center gap-3 text-sm text-brand-primary font-medium">
                      <div className="text-gray-500">{shortcut.icon}</div>
                      {shortcut.label}
                    </div>
                    <kbd className="px-2.5 py-1 bg-brand-surface-lowest border border-gray-200 rounded-md shadow-sm text-xs font-mono font-bold text-gray-600">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 bg-brand-surface-low border-t border-brand-outline-variant text-center text-xs text-gray-500">
              Press <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-600 font-mono">?</kbd> anywhere to show or hide this menu.
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}
