import React, { useState, useEffect } from 'react';
import { User, Bookmark, Clock, History, Settings, Tag, Plus, X, Activity } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useBookmarks } from '../hooks/useBookmarks';
import { useReadLater } from '../hooks/useReadLater';
import { useRecentArticles } from '../hooks/useRecentArticles';
import { usePreferences } from '../hooks/usePreferences';

const AVAILABLE_CATEGORIES = ['World', 'Local', 'Politics', 'Health', 'Tech', 'Business', 'Sports', 'Entertainment', 'Science'];

export default function Profile() {
  const { user } = useAuth();
  const { bookmarks } = useBookmarks();
  const { queue: readLaterQueue } = useReadLater();
  const { recentArticles } = useRecentArticles();
  const { preferences, loading: prefsLoading, savePreferences } = usePreferences();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [editCategories, setEditCategories] = useState(false);
  const [tempCategories, setTempCategories] = useState<string[]>([]);
  
  useEffect(() => {
    if (preferences) {
      setTempCategories(preferences);
    }
  }, [preferences]);

  const handleSaveCategories = async () => {
    try {
      await savePreferences(tempCategories);
      setEditCategories(false);
    } catch (e) {
      console.error("Failed to save preferences", e);
    }
  };

  const toggleCategory = (category: string) => {
    if (tempCategories.includes(category)) {
      setTempCategories(tempCategories.filter(c => c !== category));
    } else {
      setTempCategories([...tempCategories, category]);
    }
  };

  const openArticle = (article: any) => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'articleDetail', data: { article } } }));
  };

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-brand-surface text-center">
        <User size={64} className="text-gray-300 mb-6" />
        <h2 className="text-3xl font-serif font-bold text-brand-primary mb-4">Sign in to view your profile</h2>
        <p className="text-gray-500 mb-8 max-w-md">Create an account to save articles, manage your read later queue, and customize your news feed.</p>
        <button onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'home' } }))} className="px-6 py-3 bg-brand-primary text-white font-bold uppercase tracking-wider rounded-lg hover:bg-brand-primary/90 transition-colors">
          Return Home
        </button>
      </div>
    );
  }

  const renderArticleList = (articles: any[], emptyMessage: string) => {
    if (articles.length === 0) {
      return (
        <div className="text-center py-12 bg-brand-surface-low rounded-xl border border-brand-outline-variant border-dashed">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <article 
            key={article.id} 
            className="bg-brand-surface-lowest rounded-xl shadow-sm border border-brand-outline-variant overflow-hidden flex flex-col hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => openArticle(article)}
          >
            {article.imageUrl && (
              <div className="h-40 overflow-hidden relative">
                <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur text-white text-[10px] uppercase font-bold tracking-wider rounded">
                  {article.category}
                </div>
              </div>
            )}
            <div className="p-4 flex flex-col flex-grow">
              <h4 className="font-bold text-brand-primary line-clamp-2 mb-2 group-hover:text-brand-secondary transition-colors">
                {article.title}
              </h4>
              <p className="text-xs text-gray-500 line-clamp-2 mb-4">{article.summary || article.content}</p>
              <div className="mt-auto flex items-center justify-between text-xs text-brand-secondary font-medium uppercase tracking-wider">
                <span>{new Date(article.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-brand-surface nice-scroll pb-20">
      <div className="max-w-6xl mx-auto px-6 py-10">
        
        {/* Profile Header */}
        <div className="bg-brand-surface-lowest rounded-2xl p-8 border border-brand-outline-variant shadow-sm mb-8 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-brand-surface shadow-inner shrink-0 relative group">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || "User"} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-brand-primary text-white flex items-center justify-center">
                <User size={48} />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
               <span className="text-white text-xs font-bold uppercase">Change</span>
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-serif font-bold text-brand-primary mb-2">{user.displayName || 'Citizen Reporter'}</h1>
            <p className="text-gray-500 mb-6">{user.email}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="bg-brand-surface-low px-4 py-2 rounded-lg border border-brand-outline-variant flex items-center gap-3">
                <div className="bg-brand-secondary/20 p-2 rounded-full text-brand-secondary">
                  <Bookmark size={20} />
                </div>
                <div className="text-left">
                  <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Bookmarks</div>
                  <div className="text-xl font-serif font-bold text-brand-primary">{bookmarks.length}</div>
                </div>
              </div>
              <div className="bg-brand-surface-low px-4 py-2 rounded-lg border border-brand-outline-variant flex items-center gap-3">
                <div className="bg-brand-secondary-container p-2 rounded-full text-brand-secondary">
                  <Clock size={20} />
                </div>
                <div className="text-left">
                  <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Read Later</div>
                  <div className="text-xl font-serif font-bold text-brand-primary">{readLaterQueue.length}</div>
                </div>
              </div>
              <div className="bg-brand-surface-low px-4 py-2 rounded-lg border border-brand-outline-variant flex items-center gap-3">
                <div className="bg-brand-primary/10 p-2 rounded-full text-brand-primary">
                  <History size={20} />
                </div>
                <div className="text-left">
                  <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">History</div>
                  <div className="text-xl font-serif font-bold text-brand-primary">{recentArticles.length}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="hidden lg:flex flex-col gap-2">
            <button onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'settings' } }))} className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-surface-low hover:bg-brand-surface border border-brand-outline transition-colors rounded-xl text-brand-primary font-bold text-sm">
              <Settings size={18} />
              Account Settings
            </button>
          </div>
        </div>

        {/* Categories Section */}
        <div className="bg-brand-surface-lowest rounded-2xl p-8 border border-brand-outline-variant shadow-sm mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-brand-primary flex items-center gap-3">
              <Tag className="text-brand-secondary" size={24} /> Favorite Categories
            </h2>
            {!editCategories ? (
              <button 
                onClick={() => setEditCategories(true)}
                className="text-sm font-bold text-brand-secondary uppercase tracking-wider hover:underline"
              >
                Edit
              </button>
            ) : (
              <div className="flex gap-3">
                <button 
                  onClick={() => { setTempCategories(preferences); setEditCategories(false); }}
                  className="px-4 py-1.5 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveCategories}
                  className="px-4 py-1.5 bg-brand-primary text-white rounded-lg text-sm font-bold shadow-sm hover:bg-brand-primary/90 transition-colors"
                >
                  Save
                </button>
              </div>
            )}
          </div>
          
          {prefsLoading ? (
            <div className="animate-pulse flex gap-2">
              <div className="h-8 w-24 bg-brand-surface-low rounded-full"></div>
              <div className="h-8 w-32 bg-brand-surface-low rounded-full"></div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {editCategories ? (
                AVAILABLE_CATEGORIES.map(cat => {
                  const isSelected = tempCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors flex items-center gap-2 ${
                        isSelected 
                          ? 'bg-brand-secondary-container border-brand-secondary text-brand-secondary' 
                          : 'bg-transparent border-brand-outline text-gray-500 hover:border-gray-400'
                      }`}
                    >
                      {cat}
                      {isSelected ? <X size={14} /> : <Plus size={14} />}
                    </button>
                  );
                })
              ) : (
                preferences.length > 0 ? (
                  preferences.map(cat => (
                    <span key={cat} className="px-4 py-2 bg-brand-surface-low border border-brand-outline rounded-full text-sm font-medium text-brand-primary">
                      {cat}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">You haven't selected any favorite categories yet.</p>
                )
              )}
            </div>
          )}
        </div>

        {/* Content Tabs */}
        <div className="mb-8 border-b border-brand-outline-variant flex gap-8">
          <button 
            className={`pb-4 font-bold tracking-wider uppercase text-sm border-b-2 transition-colors ${activeTab === 'overview' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`pb-4 font-bold tracking-wider uppercase text-sm border-b-2 transition-colors ${activeTab === 'bookmarks' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            onClick={() => setActiveTab('bookmarks')}
          >
            Bookmarks
          </button>
          <button 
            className={`pb-4 font-bold tracking-wider uppercase text-sm border-b-2 transition-colors ${activeTab === 'readLater' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            onClick={() => setActiveTab('readLater')}
          >
            Read Later
          </button>
          <button 
            className={`pb-4 font-bold tracking-wider uppercase text-sm border-b-2 transition-colors ${activeTab === 'history' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-serif font-bold flex items-center gap-2">
                  <Clock size={20} className="text-brand-secondary" /> Read Later Queue
                </h3>
                <button onClick={() => setActiveTab('readLater')} className="text-sm font-bold text-brand-secondary hover:underline">View All</button>
              </div>
              {renderArticleList(readLaterQueue.slice(0, 2), "Your queue is empty.")}
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-serif font-bold flex items-center gap-2">
                  <Bookmark size={20} className="text-brand-primary" /> Recent Bookmarks
                </h3>
                <button onClick={() => setActiveTab('bookmarks')} className="text-sm font-bold text-brand-secondary hover:underline">View All</button>
              </div>
              {renderArticleList(bookmarks.slice(0, 2), "You haven't bookmarked any articles yet.")}
            </div>
          </div>
        )}

        {activeTab === 'bookmarks' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderArticleList(bookmarks, "You haven't bookmarked any articles yet.")}
          </div>
        )}

        {activeTab === 'readLater' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderArticleList(readLaterQueue, "Your read later queue is empty.")}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderArticleList(recentArticles, "You haven't read any articles recently.")}
          </div>
        )}

      </div>
    </div>
  );
}
