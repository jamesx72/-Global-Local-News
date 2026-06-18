import { useState, useEffect } from 'react';
import { Article } from './useBookmarks';

export function useRecentArticles() {
  const [recentArticles, setRecentArticles] = useState<Article[]>(() => {
    try {
      const saved = window.localStorage.getItem('app_recent_articles');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error loading recent articles', e);
      return [];
    }
  });

  const addRecentArticle = (article: Article) => {
    setRecentArticles(prev => {
      // Remove if it's already in the list to put it at the top
      const filtered = prev.filter(a => a.id !== article.id);
      const updated = [article, ...filtered].slice(0, 10);
      try {
        window.localStorage.setItem('app_recent_articles', JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving recent articles', e);
      }
      return updated;
    });
  };

  const clearRecentArticles = () => {
    setRecentArticles([]);
    try {
      window.localStorage.removeItem('app_recent_articles');
    } catch (e) {
      console.error('Error clearing recent articles', e);
    }
  };

  return {
    recentArticles,
    addRecentArticle,
    clearRecentArticles
  };
}
