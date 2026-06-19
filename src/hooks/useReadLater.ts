import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useNotifications } from '../contexts/NotificationContext';
import { Article } from './useBookmarks';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export function useReadLater() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [readLater, setReadLater] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void;

    async function loadReadLater() {
      if (user) {
        setLoading(true);
        
        // Sync local to Firebase
        try {
          const item = window.localStorage.getItem('readLater');
          if (item) {
            const localList: Article[] = JSON.parse(item);
            if (Array.isArray(localList) && localList.length > 0) {
              const syncPromises = localList.map(article => 
                setDoc(doc(db, `users/${user.uid}/readLater`, String(article.id)), {
                  ...article,
                  savedAt: serverTimestamp()
                }, { merge: true }).catch(err => {
                  handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/readLater/${article.id}`);
                })
              );
              await Promise.all(syncPromises);
              window.localStorage.removeItem('readLater');
            }
          }
        } catch (e) {
          console.error('Error syncing local read later to Firestore', e);
        }

        const q = query(collection(db, `users/${user.uid}/readLater`), orderBy('savedAt', 'desc'));
        unsubscribe = onSnapshot(q, (snapshot) => {
          const loadedList = snapshot.docs.map(doc => doc.data() as Article);
          setReadLater(loadedList);
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/readLater`);
          setLoading(false);
        });
      } else {
        try {
          const item = window.localStorage.getItem('readLater');
          setReadLater(item ? JSON.parse(item) : []);
        } catch (error) {
          console.error('Error loading readLater from local storage', error);
        }
        setLoading(false);
      }
    }
    loadReadLater();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const addReadLater = async (article: Article) => {
    // Add to local state immediately for fast response
    if (readLater.some((a) => a.id === article.id)) return;
    const newList = [...readLater, article];
    setReadLater(newList);

    if (user) {
      try {
        await setDoc(doc(db, `users/${user.uid}/readLater`, String(article.id)), {
          ...article,
          savedAt: serverTimestamp()
        });
        addNotification('Read Later', 'Article queued for later reading.', 'success');
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/readLater/${article.id}`);
      }
    } else {
      window.localStorage.setItem('readLater', JSON.stringify(newList));
      addNotification('Read Later locally', 'Sign in to sync across devices.', 'success');
    }
  };

  const removeReadLater = async (id: string) => {
    const newList = readLater.filter((a) => a.id !== String(id));
    setReadLater(newList);

    if (user) {
      try {
        await deleteDoc(doc(db, `users/${user.uid}/readLater`, String(id)));
        addNotification('Read Later Removed', 'Article removed from queue.', 'info');
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/readLater/${id}`);
      }
    } else {
      window.localStorage.setItem('readLater', JSON.stringify(newList));
      addNotification('Read Later Removed', 'Article removed from queue.', 'info');
    }
  };

  const isReadLater = (id: string) => {
    return readLater.some((a) => a.id === String(id));
  };

  const toggleReadLater = (article: Article) => {
    if (isReadLater(article.id)) {
      removeReadLater(article.id);
    } else {
      addReadLater(article);
    }
  };

  return { readLater, addReadLater, removeReadLater, isReadLater, toggleReadLater, loading };
}
