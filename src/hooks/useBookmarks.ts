import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';

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
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void;

    async function loadBookmarks() {
      if (user) {
        setLoading(true);
        const q = query(collection(db, `users/${user.uid}/bookmarks`), orderBy('savedAt', 'desc'));
        unsubscribe = onSnapshot(q, (snapshot) => {
          const loadedBookmarks = snapshot.docs.map(doc => doc.data() as Article);
          setBookmarks(loadedBookmarks);
          setLoading(false);
        }, (error) => {
          console.error("Error listening to bookmarks from Firestore", error);
          setLoading(false);
        });
      } else {
        try {
          const item = window.localStorage.getItem('bookmarks');
          setBookmarks(item ? JSON.parse(item) : []);
        } catch (error) {
          console.error('Error loading bookmarks from local storage', error);
        }
        setLoading(false);
      }
    }
    loadBookmarks();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const addBookmark = async (article: Article) => {
    // Add to local state immediately for fast response
    if (bookmarks.some((b) => b.id === article.id)) return;
    const newBookmarks = [...bookmarks, article];
    setBookmarks(newBookmarks);

    if (user) {
      try {
        await setDoc(doc(db, `users/${user.uid}/bookmarks`, article.id), {
          ...article,
          savedAt: serverTimestamp()
        });
      } catch (error) {
        console.error("Error saving bookmark to Firestore", error);
      }
    } else {
      window.localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
    }
  };

  const removeBookmark = async (id: string) => {
    const newBookmarks = bookmarks.filter((b) => b.id !== id);
    setBookmarks(newBookmarks);

    if (user) {
      try {
        await deleteDoc(doc(db, `users/${user.uid}/bookmarks`, id));
      } catch (error) {
        console.error("Error removing bookmark from Firestore", error);
      }
    } else {
      window.localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
    }
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

  return { bookmarks, addBookmark, removeBookmark, isBookmarked, toggleBookmark, loading };
}
