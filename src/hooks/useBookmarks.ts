import { useState, useEffect } from 'react';

export interface Article {
  id: string;
  title: string;
  category: string;
  location: string;
  imageUrl: string;
  trustScore: number;
  timestamp?: string;
  content?: string;
  readingTime?: number;
  tags?: string[];
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Article[]>(() => {
    try {
      const item = window.localStorage.getItem('bookmarks');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error('Error loading bookmarks', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    } catch (error) {
      console.error('Error saving bookmarks', error);
    }
  }, [bookmarks]);

  const addBookmark = (article: Article) => {
    setBookmarks((prev) => {
      if (!prev.some((b) => b.id === article.id)) {
        return [...prev, article];
      }
      return prev;
    });
  };

  const removeBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const isBookmarked = (id: string) => {
    return bookmarks.some((b) => b.id === id);
  };

  const toggleBookmark = (article: Article) => {
    if (isBookmarked(article.id)) {
      removeBookmark(article.id);
    } else {
      addBookmark(article);
    }
  };

  return { bookmarks, addBookmark, removeBookmark, isBookmarked, toggleBookmark };
}
