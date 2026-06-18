import { useState, useEffect } from 'react';
import { Article } from './useBookmarks';
import { useAuth } from './useAuth';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, serverTimestamp, onSnapshot, query, orderBy, getDocs } from 'firebase/firestore';

export function useRecentArticles() {
  const { user } = useAuth();
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void;

    async function loadRecent() {
      if (user) {
        setLoading(true);
        const q = query(collection(db, `users/${user.uid}/recentArticles`), orderBy('viewedAt', 'desc'));
        unsubscribe = onSnapshot(q, (snapshot) => {
          const loadedRecent = snapshot.docs.map(doc => doc.data() as Article);
          setRecentArticles(loadedRecent);
          setLoading(false);
        }, (error) => {
          console.error("Error listening to recent articles from Firestore", error);
          setLoading(false);
        });
      } else {
        try {
          const saved = window.localStorage.getItem('app_recent_articles');
          setRecentArticles(saved ? JSON.parse(saved) : []);
        } catch (e) {
          console.error('Error loading recent articles', e);
        }
        setLoading(false);
      }
    }
    loadRecent();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const addRecentArticle = async (article: Article) => {
    if (user) {
      try {
        await setDoc(doc(db, `users/${user.uid}/recentArticles`, article.id), {
          ...article,
          viewedAt: serverTimestamp()
        });
        
        // Remove older articles if exceeding 10
        if (recentArticles.length >= 10 && !recentArticles.find(a => a.id === article.id)) {
           const oldestId = recentArticles[recentArticles.length - 1].id;
           await deleteDoc(doc(db, `users/${user.uid}/recentArticles`, oldestId));
        }
      } catch (error) {
        console.error("Error saving recent article to Firestore", error);
      }
    } else {
      setRecentArticles(prev => {
        const filtered = prev.filter(a => a.id !== article.id);
        const updated = [article, ...filtered].slice(0, 10);
        try {
          window.localStorage.setItem('app_recent_articles', JSON.stringify(updated));
        } catch (e) {
          console.error('Error saving recent articles', e);
        }
        return updated;
      });
    }
  };

  const clearRecentArticles = async () => {
    if (user) {
      try {
        const snapshot = await getDocs(collection(db, `users/${user.uid}/recentArticles`));
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
      } catch (error) {
        console.error("Error clearing recent articles from Firestore", error);
      }
    } else {
      setRecentArticles([]);
      try {
        window.localStorage.removeItem('app_recent_articles');
      } catch (e) {
        console.error('Error clearing recent articles', e);
      }
    }
  };

  return {
    recentArticles,
    addRecentArticle,
    clearRecentArticles,
    loading
  };
}
