import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, Smartphone, Check, Moon, Globe, LogOut } from 'lucide-react';

interface SettingsState {
  fullName: string;
  email: string;
  bio: string;
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
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaved, setIsSaved] = useState(false);
  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      const saved = window.localStorage.getItem('app_settings');
      return saved ? JSON.parse(saved) : {
        fullName: 'A. Volkov',
        email: 'volkov@noir-archive.intl',
        bio: 'Curator of contemporary minimal and abstract structural works.',
        notifications: {
          email: true,
          push: false,
          newsletter: true
        },
        privacy: {
          profileVisible: true,
          showLocation: false
        },
        language: 'en',
        typography: 'classic'
      };
    } catch (e) {
      return {
        fullName: '',
        email: '',
        bio: '',
        notifications: { email: true, push: false, newsletter: true },
        privacy: { profileVisible: true, showLocation: false },
        language: 'en',
        typography: 'classic'
      };
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('app_settings', JSON.stringify(settings));
      window.dispatchEvent(new Event('app_settings_changed'));
    } catch (e) {
      console.error('Error saving settings', e);
    }
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
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

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto ">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Settings Sidebar */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          <h2 className="text-2xl font-serif font-bold text-brand-primary mb-6">Preferences</h2>
          
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${activeTab === 'profile' ? 'bg-white/10 text-brand-primary font-medium' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          >
            <User size={18} />
            Profile Information
          </button>
          
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${activeTab === 'notifications' ? 'bg-white/10 text-brand-primary font-medium' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          >
            <Bell size={18} />
            Notifications
          </button>

          <button 
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${activeTab === 'privacy' ? 'bg-white/10 text-brand-primary font-medium' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          >
            <Shield size={18} />
            Privacy & Security
          </button>
          
          <button 
            onClick={() => setActiveTab('system')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${activeTab === 'system' ? 'bg-white/10 text-brand-primary font-medium' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          >
            <Smartphone size={18} />
            System
          </button>

           <div className="mt-8 pt-8 border-t border-brand-outline-variant">
            <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all text-brand-error hover:bg-red-500/10 w-full">
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Settings Content */}
        <main className="flex-1 bg-brand-surface-low border border-brand-outline-variant rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSave} className="space-y-8">
            
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-xl font-serif text-brand-primary border-b border-brand-outline-variant pb-4 mb-6">Profile Information</h3>
                
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-white/50 block">Full Name</label>
                    <input 
                      type="text" 
                      value={settings.fullName}
                      onChange={(e) => setSettings({...settings, fullName: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-secondary transition-colors text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-white/50 block">Email Address</label>
                    <input 
                      type="email" 
                      value={settings.email}
                      onChange={(e) => setSettings({...settings, email: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-secondary transition-colors text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-white/50 block">Biography</label>
                    <textarea 
                      value={settings.bio}
                      onChange={(e) => setSettings({...settings, bio: e.target.value})}
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-secondary transition-colors text-white resize-none nice-scroll"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-xl font-serif text-brand-primary border-b border-brand-outline-variant pb-4 mb-6">Notification Preferences</h3>
                
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:border-white/20 transition-colors">
                    <div>
                      <div className="text-sm font-medium text-white mb-1">Email Alerts</div>
                      <div className="text-[11px] text-white/40">Receive critical updates about saved works</div>
                    </div>
                    <div className={`w-10 h-6 rounded-full transition-colors relative ${settings.notifications.email ? 'bg-brand-success' : 'bg-white/10'}`} onClick={() => updateNestedSettings('notifications', 'email', !settings.notifications.email)}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.notifications.email ? 'left-5' : 'left-1'}`} />
                    </div>
                  </label>

                  <label className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:border-white/20 transition-colors">
                    <div>
                      <div className="text-sm font-medium text-white mb-1">Push Notifications</div>
                      <div className="text-[11px] text-white/40">Real-time alerts for live verification updates</div>
                    </div>
                    <div className={`w-10 h-6 rounded-full transition-colors relative ${settings.notifications.push ? 'bg-brand-success' : 'bg-white/10'}`} onClick={() => updateNestedSettings('notifications', 'push', !settings.notifications.push)}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.notifications.push ? 'left-5' : 'left-1'}`} />
                    </div>
                  </label>

                  <label className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:border-white/20 transition-colors">
                    <div>
                      <div className="text-sm font-medium text-white mb-1">Newsletter</div>
                      <div className="text-[11px] text-white/40">Weekly curation of leading abstract designs</div>
                    </div>
                    <div className={`w-10 h-6 rounded-full transition-colors relative ${settings.notifications.newsletter ? 'bg-brand-success' : 'bg-white/10'}`} onClick={() => updateNestedSettings('notifications', 'newsletter', !settings.notifications.newsletter)}>
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
                  <label className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:border-white/20 transition-colors">
                    <div>
                      <div className="text-sm font-medium text-white mb-1">Public Profile</div>
                      <div className="text-[11px] text-white/40">Allow curators to find and view your collections</div>
                    </div>
                    <div className={`w-10 h-6 rounded-full transition-colors relative ${settings.privacy.profileVisible ? 'bg-brand-success' : 'bg-white/10'}`} onClick={() => updateNestedSettings('privacy', 'profileVisible', !settings.privacy.profileVisible)}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.privacy.profileVisible ? 'left-5' : 'left-1'}`} />
                    </div>
                  </label>

                  <label className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:border-white/20 transition-colors">
                    <div>
                      <div className="text-sm font-medium text-white mb-1">Location Data</div>
                      <div className="text-[11px] text-white/40">Share location to see region-specific trending nodes</div>
                    </div>
                    <div className={`w-10 h-6 rounded-full transition-colors relative ${settings.privacy.showLocation ? 'bg-brand-success' : 'bg-white/10'}`} onClick={() => updateNestedSettings('privacy', 'showLocation', !settings.privacy.showLocation)}>
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
                    <label className="text-[10px] uppercase tracking-[0.2em] text-white/50 block">Typography Settings</label>
                    <select 
                      value={settings.typography}
                      onChange={(e) => setSettings({...settings, typography: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-secondary transition-colors text-white appearance-none"
                    >
                      <option value="classic" className="bg-[#0A0A0A]">Classic (Merriweather & Inter)</option>
                      <option value="modern" className="bg-[#0A0A0A]">Modern (Playfair Display & Lato)</option>
                      <option value="editorial" className="bg-[#0A0A0A]">Editorial (Lora & Source Sans 3)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-white/50 block">Interface Language</label>
                    <select 
                      value={settings.language}
                      onChange={(e) => setSettings({...settings, language: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand-secondary transition-colors text-white appearance-none"
                    >
                      <option value="en" className="bg-[#0A0A0A]">English (EN)</option>
                      <option value="fr" className="bg-[#0A0A0A]">Français (FR)</option>
                      <option value="de" className="bg-[#0A0A0A]">Deutsch (DE)</option>
                      <option value="ja" className="bg-[#0A0A0A]">日本語 (JA)</option>
                    </select>
                  </div>

                  <div className="p-4 bg-black/40 border border-white/5 rounded-xl flex items-start gap-4">
                    <Moon className="text-brand-secondary shrink-0" size={20} />
                    <div>
                      <div className="text-sm font-medium text-white mb-1">Theme Lock Active</div>
                      <div className="text-[11px] text-white/50 leading-relaxed">
                        The interface is globally locked to Noir Archive's signature <strong className="text-white">Elegant Dark</strong> theme. Light mode cannot be enabled.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end pt-6 border-t border-brand-outline-variant mt-8">
              <button 
                type="submit" 
                className="px-8 py-3 bg-white text-black text-[11px] font-bold uppercase tracking-widest rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                {isSaved ? (
                  <>
                    <Check size={16} /> Saved
                  </>
                ) : (
                  'Save Configuration'
                )}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
