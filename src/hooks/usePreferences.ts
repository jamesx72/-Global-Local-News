import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';

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
        console.error('Failed to load preferences', error);
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
      console.error('Failed to save preferences', error);
      throw error;
    }
  };

  return { preferences, loading, savePreferences };
}
