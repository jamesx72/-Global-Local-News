import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, Smartphone, Check, Moon, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { db, storage } from '../lib/firebase';
import { useNotifications } from '../contexts/NotificationContext';

interface SettingsState {
  fullName: string;
  email: string;
  bio: string;
  avatarUrl?: string;
  notifications: {
    email: boolean;
    push: boolean;
    newsletter: boolean;
  };
  privacy: {
    profileVisible: boolean;
    showLocation: boolean;
  };
  language: string;
  typography: string;
  baseFontSize: string;
  theme: string;
  readerMode: boolean;
}

export default function Settings() {
  const { user, logout, signInWithGoogle } = useAuth();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      const saved = window.localStorage.getItem('app_settings');
      const parsed = saved ? JSON.parse(saved) : {};
      return {
        fullName: parsed.fullName || '',
        email: parsed.email || '',
        bio: parsed.bio || 'Avid reader and occasional contributor to global news updates.',
        avatarUrl: parsed.avatarUrl || '',
        notifications: parsed.notifications || {
          email: true,
          push: false,
          newsletter: true
        },
        privacy: parsed.privacy || {
          profileVisible: true,
          showLocation: false
        },
        language: parsed.language || 'en',
        typography: parsed.typography || 'classic',
        baseFontSize: parsed.baseFontSize || 'medium',
        theme: parsed.theme || 'dark',
        readerMode: parsed.readerMode || false
      };
    } catch (e) {
      return {
        fullName: '',
        email: '',
        bio: '',
        avatarUrl: '',
        notifications: { email: true, push: false, newsletter: true },
        privacy: { profileVisible: true, showLocation: false },
        language: 'en',
        typography: 'classic',
        baseFontSize: 'medium',
        theme: 'dark',
        readerMode: false
      };
    }
  });

  // Sync settings with Firebase user
  useEffect(() => {
    if (user) {
      const loadUserSettings = async () => {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().settings) {
            setSettings(prev => ({
              ...prev,
              ...docSnap.data().settings,
              fullName: docSnap.data().settings.fullName || user.displayName || '',
              email: docSnap.data().settings.email || user.email || ''
            }));
          } else {
            setSettings(prev => ({
              ...prev,
              fullName: prev.fullName || user.displayName || '',
              email: prev.email || user.email || ''
            }));
          }
        } catch (e) {
          console.error("Error loading user settings from Firebase", e);
        }
      };
      loadUserSettings();
    }
  }, [user]);

  useEffect(() => {
    try {
      window.localStorage.setItem('app_settings', JSON.stringify(settings));
      window.dispatchEvent(new Event('app_settings_changed'));
    } catch (e) {
      console.error('Error saving settings locally', e);
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid);
        await setDoc(docRef, { settings }, { merge: true });
        addNotification('Settings Saved', 'Your preferences have been successfully updated in the cloud.', 'success');
      } catch (err) {
        console.error("Error saving settings to Firebase:", err);
        addNotification('Error', 'Failed to save settings. Please try again.', 'error');
      }
    } else {
      addNotification('Settings Saved', 'Your preferences have been saved locally.', 'success');
    }

    setIsSaving(false);
    setIsSaved(true);
    const timer = setTimeout(() => setIsSaved(false), 3000);
    return () => clearTimeout(timer);
  };

  const updateNestedSettings = (category: keyof SettingsState, field: string, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] as object),
        [field]: value
      }
    }));
  };

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setIsUploadingAvatar(true);
    try {
      const storageRef = ref(storage, `users/${user.uid}/avatar`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setSettings(prev => ({ ...prev, avatarUrl: downloadURL }));
      await updateProfile(user, { photoURL: downloadURL });
      
      // Persist the avatar update to Firestore immediately
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, { settings: { avatarUrl: downloadURL } }, { merge: true });
      
      addNotification('Avatar Updated', 'Your profile picture has been updated.', 'success');
    } catch (err) {
      console.error('Error uploading avatar:', err);
      // Fallback: If Firebase Storage rules block it, let's just use object URL locally or base64.
      // But let's rely on standard error reporting.
      addNotification('Upload Failed', 'Could not save profile picture to Firebase Storage. Please ensure Storage is enabled.', 'error');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto ">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Settings Sidebar */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          <h2 className="text-2xl font-serif font-bold text-brand-primary mb-6">Settings</h2>
          
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${activeTab === 'profile' ? 'bg-brand-secondary/10 text-brand-primary-dark font-semibold' : 'text-gray-500 hover:text-brand-primary hover:bg-gray-100'}`}
          >
            <User size={18} />
            Profile Information
          </button>
          
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${activeTab === 'notifications' ? 'bg-brand-secondary/10 text-brand-primary-dark font-semibold' : 'text-gray-500 hover:text-brand-primary hover:bg-gray-100'}`}
          >
            <Bell size={18} />
            Notifications
          </button>

          <button 
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${activeTab === 'privacy' ? 'bg-brand-secondary/10 text-brand-primary-dark font-semibold' : 'text-gray-500 hover:text-brand-primary hover:bg-gray-100'}`}
          >
            <Shield size={18} />
            Privacy & Security
          </button>
          
          <button 
            onClick={() => setActiveTab('system')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${activeTab === 'system' ? 'bg-brand-secondary/10 text-brand-primary-dark font-semibold' : 'text-gray-500 hover:text-brand-primary hover:bg-gray-100'}`}
          >
            <Smartphone size={18} />
            System
          </button>

           <div className="mt-8 pt-8 border-t border-brand-outline-variant">
            {user ? (
              <button 
                onClick={logout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all text-brand-error hover:bg-brand-error/10 w-full"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            ) : (
              <button 
                onClick={signInWithGoogle}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all text-brand-primary font-medium hover:bg-brand-surface-low border border-brand-outline-variant w-full"
              >
                <LogIn size={18} />
                Sign In with Google
              </button>
            )}
          </div>
        </aside>

        {/* Settings Content */}
        <main className="flex-1 bg-brand-surface-lowest border border-brand-outline-variant rounded-2xl p-8 shadow-sm">
          {!user && activeTab === 'profile' ? (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-300">
               <div className="w-16 h-16 bg-brand-secondary/10 text-brand-secondary rounded-full flex items-center justify-center mb-6">
                 <User size={32} />
               </div>
               <h3 className="text-xl font-serif font-bold text-brand-primary mb-2">Sign In Required</h3>
               <p className="text-gray-500 max-w-sm mb-8 leading-relaxed">
                 To view and manage your profile details, please sign in with your Google account.
               </p>
               <button 
                 onClick={signInWithGoogle}
                 className="px-6 py-3 bg-brand-primary text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-brand-primary/90 transition-colors flex gap-2 items-center"
               >
                 <LogIn size={18} /> Connect Account
               </button>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-8">
              
              {activeTab === 'profile' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h3 className="text-xl font-serif text-brand-primary border-b border-brand-outline-variant pb-4 mb-6">Profile Information</h3>
                  
                  <div className="grid gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-full bg-brand-surface-low border border-brand-outline-variant flex items-center justify-center overflow-hidden shrink-0 relative group">
                        {settings.avatarUrl ? (
                          <img src={settings.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User size={32} className="text-gray-400" />
                        )}
                        <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all cursor-pointer">
                          <label className="text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer h-full w-full flex items-center justify-center">
                            {isUploadingAvatar ? 'Wait...' : 'Upload'}
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={handleAvatarUpload}
                              disabled={isUploadingAvatar}
                            />
                          </label>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-brand-primary mb-1">Profile Avatar</h4>
                        <p className="text-xs text-gray-500 max-w-sm">We recommend an image of at least 400x400. You can upload a PNG or JPG.</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 block">Full Name</label>
                      <input 
                        type="text" 
                        value={settings.fullName}
                        onChange={(e) => setSettings({...settings, fullName: e.target.value})}
                        className="w-full bg-brand-surface border border-brand-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-secondary transition-colors text-brand-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 block">Email Address</label>
                      <input 
                        type="email" 
                        value={settings.email}
                        onChange={(e) => setSettings({...settings, email: e.target.value})}
                        className="w-full bg-brand-surface border border-brand-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-secondary transition-colors text-brand-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 block">Biography</label>
                      <textarea 
                        value={settings.bio}
                        onChange={(e) => setSettings({...settings, bio: e.target.value})}
                        rows={4}
                        className="w-full bg-brand-surface border border-brand-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-secondary transition-colors text-brand-primary resize-none nice-scroll"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h3 className="text-xl font-serif text-brand-primary border-b border-brand-outline-variant pb-4 mb-6">Notification Preferences</h3>
                  
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-brand-surface border border-brand-outline-variant rounded-xl cursor-pointer hover:border-gray-200 transition-colors">
                      <div>
                        <div className="text-sm font-bold text-brand-primary mb-1">Email Alerts</div>
                        <div className="text-[11px] text-gray-500 uppercase tracking-widest">Receive critical updates about saved works</div>
                      </div>
                      <div className={`w-10 h-6 rounded-full transition-colors relative ${settings.notifications.email ? 'bg-brand-success' : 'bg-gray-300'}`} onClick={() => updateNestedSettings('notifications', 'email', !settings.notifications.email)}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.notifications.email ? 'left-5' : 'left-1'}`} />
                      </div>
                    </label>

                    <label className="flex items-center justify-between p-4 bg-brand-surface border border-brand-outline-variant rounded-xl cursor-pointer hover:border-gray-200 transition-colors">
                      <div>
                        <div className="text-sm font-bold text-brand-primary mb-1">Push Notifications</div>
                        <div className="text-[11px] text-gray-500 uppercase tracking-widest">Real-time alerts for live verification updates</div>
                      </div>
                      <div className={`w-10 h-6 rounded-full transition-colors relative ${settings.notifications.push ? 'bg-brand-success' : 'bg-gray-300'}`} onClick={() => updateNestedSettings('notifications', 'push', !settings.notifications.push)}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.notifications.push ? 'left-5' : 'left-1'}`} />
                      </div>
                    </label>

                    <label className="flex items-center justify-between p-4 bg-brand-surface border border-brand-outline-variant rounded-xl cursor-pointer hover:border-gray-200 transition-colors">
                      <div>
                        <div className="text-sm font-bold text-brand-primary mb-1">Newsletter</div>
                        <div className="text-[11px] text-gray-500 uppercase tracking-widest">Weekly curation of leading abstract designs</div>
                      </div>
                      <div className={`w-10 h-6 rounded-full transition-colors relative ${settings.notifications.newsletter ? 'bg-brand-success' : 'bg-gray-300'}`} onClick={() => updateNestedSettings('notifications', 'newsletter', !settings.notifications.newsletter)}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.notifications.newsletter ? 'left-5' : 'left-1'}`} />
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h3 className="text-xl font-serif text-brand-primary border-b border-brand-outline-variant pb-4 mb-6">Privacy & Security</h3>
                  
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-brand-surface border border-brand-outline-variant rounded-xl cursor-pointer hover:border-gray-200 transition-colors">
                      <div>
                        <div className="text-sm font-bold text-brand-primary mb-1">Public Profile</div>
                        <div className="text-[11px] text-gray-500 uppercase tracking-widest">Allow curators to find and view your collections</div>
                      </div>
                      <div className={`w-10 h-6 rounded-full transition-colors relative ${settings.privacy.profileVisible ? 'bg-brand-success' : 'bg-gray-300'}`} onClick={() => updateNestedSettings('privacy', 'profileVisible', !settings.privacy.profileVisible)}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.privacy.profileVisible ? 'left-5' : 'left-1'}`} />
                      </div>
                    </label>

                    <label className="flex items-center justify-between p-4 bg-brand-surface border border-brand-outline-variant rounded-xl cursor-pointer hover:border-gray-200 transition-colors">
                      <div>
                        <div className="text-sm font-bold text-brand-primary mb-1">Location Data</div>
                        <div className="text-[11px] text-gray-500 uppercase tracking-widest">Share location to see region-specific trending nodes</div>
                      </div>
                      <div className={`w-10 h-6 rounded-full transition-colors relative ${settings.privacy.showLocation ? 'bg-brand-success' : 'bg-gray-300'}`} onClick={() => updateNestedSettings('privacy', 'showLocation', !settings.privacy.showLocation)}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.privacy.showLocation ? 'left-5' : 'left-1'}`} />
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'system' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h3 className="text-xl font-serif text-brand-primary border-b border-brand-outline-variant pb-4 mb-6">System Preferences</h3>
                  
                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 block">Appearance</label>
                      <select 
                        value={settings.theme}
                        onChange={(e) => setSettings({...settings, theme: e.target.value})}
                        className="w-full bg-brand-surface border border-brand-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-secondary transition-colors text-brand-primary appearance-none"
                      >
                        <option value="system">System Default</option>
                        <option value="dark">Dark Mode</option>
                        <option value="light">Light Mode</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 block">Typography Settings</label>
                      <select 
                        value={settings.typography}
                        onChange={(e) => setSettings({...settings, typography: e.target.value})}
                        className="w-full bg-brand-surface border border-brand-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-secondary transition-colors text-brand-primary appearance-none mb-4"
                      >
                        <option value="classic">Classic (Merriweather & Inter)</option>
                        <option value="modern">Modern (Playfair Display & Lato)</option>
                        <option value="editorial">Editorial (Lora & Source Sans 3)</option>
                      </select>
                      
                      <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 block mt-4">Base Font Size</label>
                      <select 
                        value={settings.baseFontSize}
                        onChange={(e) => setSettings({...settings, baseFontSize: e.target.value})}
                        className="w-full bg-brand-surface border border-brand-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-secondary transition-colors text-brand-primary appearance-none"
                      >
                        <option value="small">Small (14px)</option>
                        <option value="medium">Medium (16px) - Default</option>
                        <option value="large">Large (18px)</option>
                        <option value="x-large">Extra Large (20px)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 block">Interface Language</label>
                      <select 
                        value={settings.language}
                        onChange={(e) => setSettings({...settings, language: e.target.value})}
                        className="w-full bg-brand-surface border border-brand-outline-variant rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-secondary transition-colors text-brand-primary appearance-none"
                      >
                        <option value="en">English (EN)</option>
                        <option value="fr">Français (FR)</option>
                        <option value="de">Deutsch (DE)</option>
                        <option value="ja">日本語 (JA)</option>
                      </select>
                    </div>

                    <label className="flex items-center justify-between p-4 bg-brand-surface border border-brand-outline-variant rounded-xl cursor-pointer hover:border-gray-200 transition-colors">
                      <div>
                        <div className="text-sm font-bold text-brand-primary mb-1">Reader View by Default</div>
                        <div className="text-[11px] text-gray-500 uppercase tracking-widest">Increases line height, limits max-width, and hides non-essential UI.</div>
                      </div>
                      <div className={`w-10 h-6 rounded-full transition-colors relative ${settings.readerMode ? 'bg-brand-success' : 'bg-gray-300'}`} onClick={() => setSettings({...settings, readerMode: !settings.readerMode})}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.readerMode ? 'left-5' : 'left-1'}`} />
                      </div>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end pt-6 border-t border-brand-outline-variant mt-8">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-8 py-3 bg-brand-primary text-white text-[11px] font-bold uppercase tracking-widest rounded-lg hover:bg-brand-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    'Saving...'
                  ) : isSaved ? (
                    <>
                      <Check size={16} /> Saved
                    </>
                  ) : (
                    'Save Configuration'
                  )}
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}

