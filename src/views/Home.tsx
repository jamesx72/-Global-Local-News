import React, { useState } from 'react';
import { MapPin, ZoomIn, Globe, Verified, ArrowRight, Info, CheckCircle2, AlertTriangle, ExternalLink, ShieldCheck, Bookmark, BookmarkCheck, Share2, Maximize2, Clock, RefreshCw } from 'lucide-react';
import { useBookmarks, Article } from '../hooks/useBookmarks';
import { useSearch } from '../hooks/useSearch';
import { useReadLater } from '../hooks/useReadLater';
import SentimentIndicator from '../components/SentimentIndicator';
import AITagsIndicator from '../components/AITagsIndicator';
import PreferencesModal from '../components/PreferencesModal';
import { handleShareAction } from '../utils/share';
import { getReadingTime } from '../utils/readingTime';
import { useAuth } from '../hooks/useAuth';
import { usePreferences } from '../hooks/usePreferences';

const TRENDING_ARTICLES: Article[] = [
  {
    id: 'art-1',
    category: 'Tech',
    title: 'Hyper-Rail Network Reaches Operational Milestone',
    location: 'Tokyo, Japan',
    imageUrl: 'https://images.unsplash.com/photo-1541804246944-d621183204cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    trustScore: 92,
    readingTime: 4,
    tags: ['Technology', 'Infrastructure', 'Innovation'],
    scope: 'Global'
  },
  {
    id: 'art-2',
    category: 'Politics',
    title: 'New Transparency Bill Passes with Landmark Majority',
    location: 'London, UK',
    imageUrl: 'https://images.unsplash.com/photo-1520601332219-94bf7be28f69?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    trustScore: 98,
    readingTime: 6,
    tags: ['Politics', 'Legislation', 'Governance'],
    scope: 'Global'
  },
  {
    id: 'art-3',
    category: 'Environment',
    title: 'Local Park Renovation Completed with Native Flora',
    location: 'Downtown City',
    imageUrl: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    trustScore: 85,
    readingTime: 3,
    tags: ['Environment', 'Community', 'Urban'],
    scope: 'Local'
  },
  {
    id: 'art-4',
    category: 'Science',
    title: 'Deep-Ocean Exploration Submarine Discovers New Ecosystems',
    location: 'Mariana Trench',
    imageUrl: 'https://images.unsplash.com/photo-1682687220199-d0124f5a34e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    trustScore: 94,
    readingTime: 5,
    tags: ['Science', 'Oceanography', 'Discovery'],
    scope: 'Global'
  },
  {
    id: 'art-5',
    category: 'Economy',
    title: 'City Council Approves New Small Business Grants',
    location: 'City Hall',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    trustScore: 89,
    readingTime: 4,
    tags: ['Economy', 'Local Business', 'Community'],
    scope: 'Local'
  }
];

export default function Home() {
  const { user } = useAuth();
  const { preferences } = usePreferences();
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const { readLater, toggleReadLater, isReadLater } = useReadLater();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const setReadingArticleWithContext = (article: Article, list: Article[]) => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'articleDetail', data: { article, list } } }));
  };
  const [articles, setArticles] = useState<Article[]>(TRENDING_ARTICLES);
  const { searchQuery } = useSearch();
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [lastViewedArticle, setLastViewedArticle] = useState<Article | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  React.useEffect(() => {
    try {
      const saved = window.localStorage.getItem('last_viewed_article');
      if (saved) {
        setLastViewedArticle(JSON.parse(saved));
      }
    } catch (e) {}

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const recommendedArticles = React.useMemo(() => {
    if (readLater.length === 0) return [];
    
    const savedTags = new Set<string>();
    readLater.forEach(a => {
      if (a.tags) {
        a.tags.forEach(tag => savedTags.add(tag));
      }
    });

    const savedCategories = new Set<string>(readLater.map(a => a.category));

    const recommendations = articles.filter(a => {
      if (readLater.some(saved => saved.id === a.id)) return false;
      const hasMatchCategory = savedCategories.has(a.category);
      const hasMatchTag = a.tags ? a.tags.some(tag => savedTags.has(tag)) : false;
      return hasMatchCategory || hasMatchTag;
    });
    
    return recommendations.slice(0, 3);
  }, [readLater, articles]);

  const [selectedCategory, setSelectedCategory] = useState<string>('For You');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedScope, setSelectedScope] = useState<'Local' | 'Global'>('Global');

  const [isSearching, setIsSearching] = useState(false);

  React.useEffect(() => {
    if (searchQuery && selectedCategory === 'For You') {
      setSelectedCategory('All');
    }

    if (searchQuery) {
      const delayDebounceFn = setTimeout(async () => {
        setIsSearching(true);
        try {
          const res = await fetch('/api/news/search?q=' + encodeURIComponent(searchQuery));
          if (res.ok) {
            const data = await res.json();
            if (data.articles) {
              setArticles(data.articles);
            }
          }
        } catch (e) {
          console.error('Search failed', e);
        }
        setIsSearching(false);
      }, 400);

      return () => clearTimeout(delayDebounceFn);
    } else {
      fetchLiveNews();
    }
  }, [searchQuery]);

  const filteredArticles = articles.filter(article => {
    if (selectedScope && article.scope && article.scope !== selectedScope) {
      return false;
    }

    if (selectedTag && (!article.tags || !article.tags.includes(selectedTag))) {
      return false;
    }

    if (!searchQuery) {
      if (selectedCategory === 'For You') {
        if (preferences && preferences.length > 0) {
          if (!preferences.includes(article.category)) return false;
        }
      } else if (selectedCategory !== 'All' && article.category !== selectedCategory) {
        return false;
      }
    }
    
    return true;
  });

  const availableCategories = ['For You', 'All', ...Array.from(new Set(articles.map(a => a.category))) as string[]];
  const allUniqueTags = Array.from(new Set(articles.flatMap(a => a.tags || []))).filter(Boolean).slice(0, 20); // Top 20 tags

  const fetchLiveNews = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/news/trending');
      if (res.ok) {
        const data = await res.json();
        if (data.articles && data.articles.length > 0) {
          setArticles(data.articles);
        }
      }
    } catch (e) {
      console.error('Failed to fetch live news (falling back to local cache):', e);
    }
    setIsRefreshing(false);
  };

  React.useEffect(() => {
    // Initial fetch from NYT API feed
    fetchLiveNews();

    const autoFetchInterval = setInterval(() => {
      fetchLiveNews();
    }, 5 * 60 * 1000); // 5 minutes auto-fetch

    return () => clearInterval(autoFetchInterval);
  }, []);

  const handleShare = (e: React.SyntheticEvent | KeyboardEvent | null, articleId: string, articleTitle: string) => {
    handleShareAction(e, articleId, articleTitle, (id) => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleToggleBookmark = (e: React.MouseEvent, article: Article) => {
    e.stopPropagation();
    toggleBookmark(article);
  };

  const handleToggleReadLater = (e: React.MouseEvent, article: Article) => {
    e.stopPropagation();
    toggleReadLater(article);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 ">
      
      {/* Offline Mode Banner */}
      {isOffline && lastViewedArticle && (
        <div className="bg-brand-surface-low border-2 border-brand-secondary/30 rounded-2xl p-6 mb-8 text-center flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-brand-secondary animate-pulse" />
          <AlertTriangle size={28} className="text-brand-secondary mb-3" />
          <h3 className="font-serif font-bold text-xl text-brand-primary mb-2">You are currently offline</h3>
          <p className="text-brand-on-surface/80 text-sm max-w-md mx-auto mb-6">
            You've lost your internet connection, but you can continue reading the last article you viewed.
          </p>
          <button 
            onClick={() => setReadingArticleWithContext(lastViewedArticle, [lastViewedArticle])}
            className="flex items-center gap-2 bg-brand-primary text-brand-surface-lowest px-6 py-3 rounded-full font-bold text-sm hover:opacity-90 transition-opacity shadow-md"
          >
            <Clock size={16} /> Continue Reading
          </button>
        </div>
      )}

      {/* Hero Map Section */}
      <section className="relative h-[450px] bg-[#001026] rounded-2xl overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-[#001026] to-[#001026]"></div>
        
        {/* Mock Map Pulses */}
        <div className="absolute top-[30%] left-[25%]">
          <div className="w-3 h-3 bg-brand-secondary-container rounded-full animate-ping animate-infinite animate-duration-[2000ms]"></div>
          <div className="w-3 h-3 bg-brand-secondary-container rounded-full absolute top-0 left-0"></div>
        </div>
        <div className="absolute top-[45%] left-[65%]">
          <div className="w-3 h-3 bg-brand-secondary-container rounded-full animate-ping animate-infinite animate-duration-[2000ms] delay-75"></div>
          <div className="w-3 h-3 bg-brand-secondary-container rounded-full absolute top-0 left-0"></div>
        </div>
        <div className="absolute top-[15%] left-[45%]">
          <div className="w-3 h-3 bg-brand-secondary-container rounded-full animate-ping animate-infinite animate-duration-[2000ms] delay-150"></div>
          <div className="w-3 h-3 bg-brand-secondary-container rounded-full absolute top-0 left-0"></div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">The World in Real-Time</h2>
            <p className="text-blue-100 max-w-xl text-sm md:text-base">Citizen journalists across 140 countries are reporting verified truths as they happen.</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full border border-white/20 transition-colors backdrop-blur-sm">
              <ZoomIn size={20} />
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full border border-white/20 transition-colors backdrop-blur-sm">
              <Globe size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Daily Digest Carousel */}
      {articles.length >= 5 && (
        <section className="pt-2">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-serif font-bold text-brand-primary">Daily Digest</h2>
            <span className="text-sm font-medium text-gray-500">Top 5 Trending</span>
          </div>
          
          <div className="flex gap-6 overflow-x-auto nice-scroll pb-6 snap-x snap-mandatory">
            {articles.slice(0, 5).map((article, index) => (
              <article 
                key={`digest-${article.id}`} 
                onClick={() => setReadingArticleWithContext(article, articles.slice(0, 5))}
                className="snap-always snap-start shrink-0 w-[85%] md:w-[60%] lg:w-[40%] bg-brand-surface-lowest rounded-2xl shadow-sm border border-brand-outline-variant overflow-hidden group cursor-pointer hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="h-56 relative overflow-hidden">
                  <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute top-4 left-4 bg-brand-primary/90 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    #{index + 1} Trending
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button 
                      onClick={(e) => handleToggleReadLater(e, article)}
                      className={`p-2 backdrop-blur-md rounded-full transition-colors ${isReadLater(article.id) ? 'bg-black/60 text-brand-secondary border border-brand-secondary' : 'bg-black/40 hover:bg-black/80 text-white'}`}
                      title={isReadLater(article.id) ? "Remove from Read Later" : "Read Later"}
                    >
                      <Clock size={16} />
                    </button>
                    <button 
                      onClick={(e) => handleToggleBookmark(e, article)}
                      className="p-2 bg-black/40 hover:bg-black/80 backdrop-blur-md rounded-full text-white transition-colors"
                      title="Bookmark Article"
                    >
                      {isBookmarked(article.id) ? <BookmarkCheck size={16} className="text-brand-secondary" /> : <Bookmark size={16} />}
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                     <div className="flex items-center gap-2 text-white/80 text-xs mb-2">
                       <span className="bg-brand-secondary/90 text-brand-surface-lowest px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">{article.category}</span>
                       <span className="flex items-center gap-1"><Clock size={12} /> {getReadingTime(article.content || '')} min read</span>
                     </div>
                     <h3 className="font-serif font-bold text-xl text-white leading-snug group-hover:text-brand-secondary-container transition-colors line-clamp-2">
                       {article.title}
                     </h3>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Trending Now */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-serif font-bold text-brand-primary flex items-center gap-3">
              Trending Now
              <span className="px-2.5 py-0.5 bg-brand-secondary-container text-brand-secondary text-xs rounded-full font-bold uppercase tracking-wider animate-pulse">Live</span>
            </h2>
            <button 
              onClick={fetchLiveNews}
              disabled={isRefreshing}
              className="p-2 text-brand-secondary hover:bg-brand-secondary-container/50 rounded-full transition-colors disabled:opacity-50"
              title="Refresh feed"
            >
              <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
            </button>
          </div>
          <button className="text-brand-primary font-semibold text-sm flex items-center gap-1 hover:underline">
            View All <ArrowRight size={16} />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto nice-scroll pb-4 mb-4 items-center">
          <div className="flex bg-brand-surface-low border border-brand-outline-variant p-1 rounded-full shrink-0 mr-2">
            <button
              onClick={() => setSelectedScope('Global')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${selectedScope === 'Global' ? 'bg-brand-primary text-white shadow-sm' : 'text-gray-500 hover:text-brand-primary'}`}
            >
              Global
            </button>
            <button
              onClick={() => setSelectedScope('Local')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${selectedScope === 'Local' ? 'bg-brand-primary text-white shadow-sm' : 'text-gray-500 hover:text-brand-primary'}`}
            >
              Local
            </button>
          </div>
          {availableCategories.map(category => (
            <button
              key={category}
              onClick={() => { setSelectedCategory(category); setSelectedTag(null); }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                selectedCategory === category && !selectedTag
                  ? 'bg-brand-primary text-brand-surface-lowest' 
                  : 'bg-brand-surface-lowest text-gray-500 hover:bg-gray-200 border border-brand-outline-variant'
              }`}
            >
              {category}
            </button>
          ))}
          <div className="w-px h-6 bg-brand-outline-variant mx-2 shrink-0"></div>
          <button 
            onClick={() => setShowPreferencesModal(true)}
            className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors bg-brand-surface-low text-brand-secondary hover:bg-brand-secondary/10 border border-brand-secondary border-dashed"
          >
            Personalize
          </button>
        </div>

        {allUniqueTags.length > 0 && selectedCategory !== 'For You' && (
          <div className="flex gap-2 overflow-x-auto nice-scroll pb-4 mb-4 mt-[-8px]">
            {allUniqueTags.map(tag => (
               <button
                 key={tag as string}
                 onClick={() => setSelectedTag(selectedTag === tag ? null : (tag as string))}
                 className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors border ${
                   selectedTag === tag
                     ? 'bg-brand-secondary text-brand-surface-lowest border-brand-secondary'
                     : 'bg-brand-surface-lowest text-gray-500 border-brand-outline-variant hover:border-gray-400'
                 }`}
               >
                 # {tag}
               </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.length === 0 ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-brand-surface-lowest rounded-2xl border border-brand-outline-variant border-dashed">
              <div className="w-16 h-16 bg-brand-secondary/10 text-brand-secondary rounded-full flex items-center justify-center mb-4">
                <Globe size={32} />
              </div>
              <h3 className="text-xl font-serif font-bold text-brand-primary mb-2">No Matches Found</h3>
              <p className="text-gray-500 max-w-sm">
                {selectedCategory === 'For You' 
                  ? "You haven't set up your personalized feed yet, or there are no new articles in your selected topics." 
                  : "We couldn't find any articles matching your current filters."}
              </p>
              {selectedCategory === 'For You' && (
                 <button 
                   onClick={() => setShowPreferencesModal(true)}
                   className="mt-6 px-6 py-2.5 bg-brand-primary text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-brand-primary/90 transition-colors"
                 >
                   Set Preferences
                 </button>
              )}
            </div>
          ) : (
            filteredArticles.map((article) => {
              const bookmarked = isBookmarked(article.id);
              const inQueue = isReadLater(article.id);
              return (
              <article 
                key={article.id} 
                className="bg-brand-surface-lowest rounded-xl shadow-sm border border-brand-outline-variant overflow-hidden flex flex-col hover:shadow-md transition-shadow group cursor-pointer"
                onClick={() => setReadingArticleWithContext(article, filteredArticles)}
              >
                <div className="h-48 overflow-hidden relative">
                  <img src={article.imageUrl} alt={article.category} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                  <div className="absolute top-3 left-3 bg-brand-secondary-container text-brand-secondary text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">{article.category}</div>
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button 
                      onClick={(e) => handleToggleReadLater(e, article)}
                      className={`p-2 backdrop-blur-md rounded-full transition-colors ${inQueue ? 'bg-black/60 text-brand-secondary border border-brand-secondary' : 'bg-black/40 hover:bg-black/80 text-white'}`}
                      title={inQueue ? "Remove from Read Later" : "Read Later"}
                    >
                      <Clock size={16} />
                    </button>
                    <button 
                      onClick={(e) => handleShare(e, article.id, article.title)}
                      className="p-2 bg-black/40 hover:bg-black/80 backdrop-blur-md rounded-full text-white transition-colors"
                      title="Share Article"
                    >
                      {copiedId === article.id ? <CheckCircle2 size={16} className="text-brand-success" /> : <Share2 size={16} />}
                    </button>
                    <button 
                      onClick={(e) => handleToggleBookmark(e, article)}
                      className="p-2 bg-black/40 hover:bg-black/80 backdrop-blur-md rounded-full text-white transition-colors"
                      title="Bookmark Article"
                    >
                      {bookmarked ? <BookmarkCheck size={16} className="text-brand-secondary" /> : <Bookmark size={16} />}
                    </button>
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center shadow-2xl border border-white/20">
                        <Maximize2 size={20} />
                     </div>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1 relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                      <MapPin size={14} className="text-brand-secondary" /> {article.location}
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                      <Clock size={12} /> {getReadingTime(article.content)} min read
                    </div>
                  </div>
                  <h3 className="font-serif font-bold text-lg text-brand-primary leading-snug mb-4 group-hover:text-brand-primary-container">{article.title}</h3>
                  <SentimentIndicator title={article.title} content={article.content || ''} />
                  <AITagsIndicator title={article.title} content={article.content || ''} fallbackTags={article.tags} />
                  <div className="mt-auto flex items-center justify-between border-t border-brand-outline-variant pt-3">
                    <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded text-[10px] font-bold">
                      <Verified size={12} /> VERIFIED
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r from-brand-error via-brand-secondary-container to-brand-success`} style={{ width: `${article.trustScore}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-gray-800">{article.trustScore}</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
          )}
        </div>
      </section>

      {/* Deep Dive Bento Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-brand-surface-low rounded-2xl p-6 border border-brand-outline-variant">
          <h2 className="text-2xl font-serif font-bold text-brand-primary mb-6">Live Verification Log</h2>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 nice-scroll">
            
            <div className="flex items-start gap-4 p-4 bg-brand-surface-lowest rounded-xl border-l-4 border-brand-secondary shadow-sm">
              <Info className="text-brand-secondary shrink-0 mt-0.5" size={20} />
              <div>
                <div className="flex items-center gap-2 mb-1 text-sm">
                  <span className="font-bold text-brand-primary">Report #4920</span>
                  <span className="text-gray-400 text-xs text-[10px]">2 mins ago</span>
                </div>
                <p className="text-sm text-gray-700">Crowdsourced images from Berlin street protest cross-referenced with satellite data. Status: Pending Cross-Check.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-brand-surface-lowest rounded-xl border-l-4 border-brand-success shadow-sm opacity-80">
              <CheckCircle2 className="text-brand-success shrink-0 mt-0.5" size={20} />
              <div>
                <div className="flex items-center gap-2 mb-1 text-sm">
                  <span className="font-bold text-brand-primary">Report #4918</span>
                  <span className="text-gray-400 text-[10px]">15 mins ago</span>
                </div>
                <p className="text-sm text-gray-700">Water salinity levels in Amazon Basin verified by three independent sensor nodes. Status: Fully Confirmed.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-brand-surface-lowest rounded-xl border-l-4 border-brand-error shadow-sm">
              <AlertTriangle className="text-brand-error shrink-0 mt-0.5" size={20} />
              <div>
                <div className="flex items-center gap-2 mb-1 text-sm">
                  <span className="font-bold text-brand-primary">Report #4915</span>
                  <span className="text-gray-400 text-[10px]">45 mins ago</span>
                </div>
                <p className="text-sm text-gray-700">Misinformation alert: AI-generated deepfake regarding regional ceasefire detected and flagged.</p>
              </div>
            </div>

          </div>
        </div>

        <div className="bg-brand-primary text-white rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden group shadow-lg">
          <div className="absolute inset-0 bg-brand-secondary opacity-0 group-hover:opacity-5 transition-opacity"></div>
          <div>
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 border border-white/10">
              <ShieldCheck className="text-brand-secondary-container" size={28} />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-3 text-white">Transparency Log</h3>
            <p className="text-white/60 text-sm leading-relaxed">View our immutable ledger of all verification actions and editorial decisions.</p>
          </div>
          <button className="mt-8 flex items-center justify-between w-full p-4 border border-white/20 rounded-xl hover:bg-white/10 transition-colors uppercase tracking-widest text-[10px] font-bold">
            <span>Open Public Log</span>
            <ExternalLink size={16} />
          </button>
        </div>
      </section>

      {/* Recommended for You Section */}
      {recommendedArticles.length > 0 && (
        <section className="mt-12 mb-8 bg-brand-surface-low rounded-2xl p-6 border border-brand-outline-variant">
          <div className="flex items-center gap-2 mb-6 text-brand-primary">
            <BookmarkCheck className="text-brand-secondary" size={24} />
            <h2 className="text-2xl font-serif font-bold">Recommended based on your Read Later collection</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedArticles.map(article => (
              <article 
                key={article.id} 
                className="bg-brand-surface-lowest rounded-xl border border-brand-outline hover:border-brand-secondary hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer"
                onClick={() => setReadingArticleWithContext(article, recommendedArticles)}
              >
                {article.imageUrl && (
                  <div className="h-40 overflow-hidden relative">
                    <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-2 right-2 flex flex-col gap-2">
                       <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleReadLater(article);
                        }}
                        className="p-1.5 bg-black/50 hover:bg-black/80 rounded-full backdrop-blur text-white transition-colors"
                        title="Read Later"
                      >
                         <Clock size={14} className={isReadLater(article.id) ? "text-brand-secondary" : ""} />
                       </button>
                    </div>
                  </div>
                )}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary">
                      {article.category}
                    </span>
                    <div className="flex items-center gap-1 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                      <Clock size={12} /> {getReadingTime(article.content)} min read
                    </div>
                  </div>
                  <h3 className="font-serif font-bold text-base text-brand-primary leading-snug mb-3 group-hover:text-brand-primary-container line-clamp-2">{article.title}</h3>
                  <div className="mt-auto flex items-center justify-between border-t border-brand-outline-variant pt-3">
                    <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded text-[10px] font-bold">
                      <Verified size={12} /> VERIFIED
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r from-brand-error via-brand-secondary-container to-brand-success`} style={{ width: `${article.trustScore}%` }}></div>
                      </div>
                      <span className="text-[10px] font-bold text-gray-800">{article.trustScore}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <PreferencesModal
        isOpen={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        availableCategories={availableCategories}
      />
    </div>
  );
}
