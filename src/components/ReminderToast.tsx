import React, { useState, useEffect } from 'react';
import { useBookmarks } from '../hooks/useBookmarks';
import { useRecentArticles } from '../hooks/useRecentArticles';
import { Bookmark, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ReminderToast({ setCurrentView }: { setCurrentView: (view: string) => void }) {
  const { bookmarks } = useBookmarks();
  const { recentArticles } = useRecentArticles();
  const [isVisible, setIsVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Determine how many bookmarks haven't been read recently
    if (bookmarks.length === 0) return;

    const recentIds = new Set(recentArticles.map(a => a.id));
    const unread = bookmarks.filter(b => !recentIds.has(b.id)).length;

    if (unread > 0) {
      setUnreadCount(unread);
      
      const lastShown = window.localStorage.getItem('app_reminder_date');
      const today = new Date().toDateString();

      if (lastShown !== today) {
        // Show after a short delay
        const timer = setTimeout(() => {
          setIsVisible(true);
          window.localStorage.setItem('app_reminder_date', today);
        }, 3000);

        return () => clearTimeout(timer);
      }
    }
  }, [bookmarks, recentArticles]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, x: -50 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        exit={{ opacity: 0, y: 50, x: -50 }}
        className="fixed bottom-6 right-6 z-50 bg-brand-surface-lowest border border-brand-outline text-brand-primary p-4 rounded-xl shadow-xl max-w-sm flex items-start gap-4"
      >
        <div className="bg-brand-secondary/20 p-2 rounded-full text-brand-secondary mt-1">
          <Bookmark size={20} />
        </div>
        <div className="flex-1">
          <h4 className="font-bold font-serif mb-1">Unread Bookmarks</h4>
          <p className="text-sm text-gray-500 mb-3">
            You have {unreadCount} saved article{unreadCount !== 1 ? 's' : ''} waiting for you to catch up.
          </p>
          <button 
            onClick={() => {
              setCurrentView('bookmarks');
              setIsVisible(false);
            }}
            className="text-sm font-semibold text-brand-secondary flex items-center gap-1 hover:opacity-80 transition-opacity"
          >
            View Bookmarks <ArrowRight size={14} />
          </button>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-brand-primary transition-colors p-1"
          aria-label="Close reminder"
        >
          <X size={16} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
