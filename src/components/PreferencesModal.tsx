import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { usePreferences } from '../hooks/usePreferences';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../contexts/NotificationContext';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableCategories: string[];
}

export default function PreferencesModal({ isOpen, onClose, availableCategories }: PreferencesModalProps) {
  const { preferences, savePreferences } = usePreferences();
  const { user, signInWithGoogle } = useAuth();
  const { addNotification } = useNotifications();
  const [selected, setSelected] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelected(preferences);
    }
  }, [isOpen, preferences]);

  if (!isOpen) return null;

  const toggleCategory = (category: string) => {
    setSelected(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSave = async () => {
    if (!user) {
      addNotification('Sign-in Required', 'Please complete sign-in to save your preferences.', 'info');
      await signInWithGoogle();
      // Flow might be interrupted by popup, so we don't save immediately here
      // The user would have to click save again.
      return;
    }
    setIsSaving(true);
    try {
      await savePreferences(selected);
      addNotification('Preferences Updated', 'Your feed topic preferences have been saved.', 'success');
      onClose();
    } catch (e) {
      console.error(e);
      addNotification('Error', 'Failed to save feed preferences.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-primary/40 backdrop-blur-sm">
      <div className="bg-brand-surface-lowest rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-5 border-b border-brand-outline-variant">
          <h2 className="font-serif text-xl font-bold text-brand-primary">Personalize Your Feed</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-brand-surface-low rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {!user && (
            <div className="mb-6 bg-brand-secondary/10 border border-brand-secondary/20 text-brand-secondary p-4 rounded-xl text-sm leading-relaxed">
              <strong>Sign in required.</strong> To save your preferences across devices, you'll be prompted to sign in when saving.
            </div>
          )}

          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Select the topics you care about most. We'll use this to curate your "For You" feed.
          </p>

          <div className="flex flex-wrap gap-2">
            {availableCategories.filter(c => c !== 'All' && c !== 'For You').map(category => {
              const isSelected = selected.includes(category);
              return (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border flex items-center gap-2 ${
                    isSelected 
                      ? 'bg-brand-primary text-brand-surface-lowest border-brand-primary' 
                      : 'bg-brand-surface-lowest text-gray-500 hover:border-brand-primary/50 border-brand-outline-variant hover:text-brand-primary'
                  }`}
                >
                  {isSelected && <Check size={14} />}
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-5 border-t border-brand-outline-variant flex justify-end gap-3 bg-brand-surface-low">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-500 hover:bg-brand-surface border border-transparent hover:border-brand-outline-variant transition-colors"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || (user && selected.length === 0 && preferences.length === 0)}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-brand-primary text-brand-surface-lowest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? 'Saving...' : user ? 'Save Preferences' : 'Sign in & Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
