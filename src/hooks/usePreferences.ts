import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export function usePreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPreferences([]);
      setLoading(false);
      return;
    }

    const loadPreferences = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().preferredCategories) {
          setPreferences(docSnap.data().preferredCategories);
        } else {
          setPreferences([]);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user]);

  const savePreferences = async (categories: string[]) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, { preferredCategories: categories }, { merge: true });
      setPreferences(categories);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
      throw error;
    }
  };

  return { preferences, loading, savePreferences };
}
