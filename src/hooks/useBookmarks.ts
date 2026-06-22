import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useNotifications } from '../contexts/NotificationContext';

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
  scope?: 'Local' | 'Global';
  author?: string;
  authorBio?: string;
  publicationDate?: string;
}

export function useBookmarks() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [bookmarks, setBookmarks] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void;

    async function loadBookmarks() {
      if (user) {
        setLoading(true);
        
        // Sync local bookmarks to Firebase
        try {
          const item = window.localStorage.getItem('bookmarks');
          if (item) {
            const localBookmarks: Article[] = JSON.parse(item);
            if (Array.isArray(localBookmarks) && localBookmarks.length > 0) {
              const syncPromises = localBookmarks.map(article => 
                setDoc(doc(db, `users/${user.uid}/bookmarks`, String(article.id)), {
                  ...article,
                  savedAt: serverTimestamp()
                }, { merge: true })
              );
              await Promise.all(syncPromises);
              window.localStorage.removeItem('bookmarks');
            }
          }
        } catch (e) {
          console.error('Error syncing local bookmarks to Firestore', e);
        }

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
        addNotification('Bookmark Saved', 'Article has been added to your collection.', 'success');
      } catch (error) {
        console.error("Error saving bookmark to Firestore", error);
        addNotification('Error', 'Could not save bookmark.', 'error');
      }
    } else {
      window.localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
      addNotification('Bookmark Saved locally', 'Sign in to sync across devices.', 'success');
    }
  };

  const removeBookmark = async (id: string) => {
    const newBookmarks = bookmarks.filter((b) => b.id !== id);
    setBookmarks(newBookmarks);

    if (user) {
      try {
        await deleteDoc(doc(db, `users/${user.uid}/bookmarks`, id));
        addNotification('Bookmark Removed', 'Article removed from collection.', 'info');
      } catch (error) {
        console.error("Error removing bookmark from Firestore", error);
        addNotification('Error', 'Could not remove bookmark.', 'error');
      }
    } else {
      window.localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
      addNotification('Bookmark Removed', 'Article removed from collection.', 'info');
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
