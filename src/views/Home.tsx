import React, { useState } from 'react';
import { MapPin, ZoomIn, Globe, Verified, ArrowRight, Info, CheckCircle2, AlertTriangle, ExternalLink, ShieldCheck, Bookmark, BookmarkCheck, Share2, Maximize2, Clock, RefreshCw } from 'lucide-react';
import { useBookmarks, Article } from '../hooks/useBookmarks';
import ReadingModeModal from '../components/ReadingModeModal';

const TRENDING_ARTICLES: Article[] = [
  {
    id: 'art-1',
    category: 'Tech',
    title: 'Hyper-Rail Network Reaches Operational Milestone',
    location: 'Tokyo, Japan',
    imageUrl: 'https://images.unsplash.com/photo-1541804246944-d621183204cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    trustScore: 92,
    readingTime: 4
  },
  {
    id: 'art-2',
    category: 'Politics',
    title: 'New Transparency Bill Passes with Landmark Majority',
    location: 'London, UK',
    imageUrl: 'https://images.unsplash.com/photo-1520601332219-94bf7be28f69?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    trustScore: 98,
    readingTime: 6
  },
  {
    id: 'art-3',
    category: 'Health',
    title: 'Urban Air Quality Levels Hit Record Highs Follow Green Initiative',
    location: 'Singapore',
    imageUrl: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    trustScore: 85,
    readingTime: 3
  }
];

export default function Home() {
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [readingArticle, setReadingArticle] = useState<Article | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [articles, setArticles] = useState<Article[]>(TRENDING_ARTICLES);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Auto-fetch tags sequentially to avoid rate limiting
    const updatedArticles = [...articles];
    for (let i = 0; i < updatedArticles.length; i++) {
      const article = updatedArticles[i];
      if (!article.tags || article.tags.length === 0) {
        try {
          const res = await fetch('/api/categorize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: article.title, content: article.content })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.tags && data.tags.length > 0) {
              updatedArticles[i] = { ...article, tags: data.tags };
              setArticles([...updatedArticles]); // Update state progressively
            }
          }
        } catch (e) {
          console.error('Failed to categorize', e);
        }
        // Small delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }

    setIsRefreshing(false);
  };

  React.useEffect(() => {
    // Initial fetch to populate tags
    handleRefresh();

    const autoFetchInterval = setInterval(() => {
      handleRefresh();
    }, 60000); // 60 seconds auto-fetch

    return () => clearInterval(autoFetchInterval);
  }, []);

  const handleShare = (e: React.SyntheticEvent | KeyboardEvent | null, id: string) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const url = `${window.location.origin}/article/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleToggleBookmark = (e: React.MouseEvent, article: Article) => {
    e.stopPropagation();
    toggleBookmark(article);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 ">
      
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

      {/* Trending Now */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-serif font-bold text-brand-primary flex items-center gap-3">
              Trending Now
              <span className="px-2.5 py-0.5 bg-brand-secondary-container text-brand-secondary text-xs rounded-full font-bold uppercase tracking-wider animate-pulse">Live</span>
            </h2>
            <button 
              onClick={handleRefresh}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TRENDING_ARTICLES.map((article) => {
            const bookmarked = isBookmarked(article.id);
            return (
              <article 
                key={article.id} 
                className="bg-brand-surface-lowest rounded-xl shadow-sm border border-brand-outline-variant overflow-hidden flex flex-col hover:shadow-md transition-shadow group cursor-pointer"
                onClick={() => setReadingArticle(article)}
              >
                <div className="h-48 overflow-hidden relative">
                  <img src={article.imageUrl} alt={article.category} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                  <div className="absolute top-3 left-3 bg-brand-secondary-container text-brand-secondary text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">{article.category}</div>
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button 
                      onClick={(e) => handleShare(e, article.id)}
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
                    {article.readingTime && (
                      <div className="flex items-center gap-1 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                        <Clock size={12} /> {article.readingTime} min read
                      </div>
                    )}
                  </div>
                  <h3 className="font-serif font-bold text-lg text-brand-primary leading-snug mb-4 group-hover:text-brand-primary-container">{article.title}</h3>
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.tags.map((tag, idx) => (
                        <span key={idx} className="bg-brand-surface-low text-brand-primary px-2 py-1 rounded text-xs font-medium border border-brand-outline-variant">
                          #{tag.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  )}
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
          })}
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

      <ReadingModeModal 
        article={readingArticle}
        allArticles={articles}
        isOpen={!!readingArticle}
        onClose={() => setReadingArticle(null)}
        copiedId={copiedId}
        onShare={handleShare}
      />
    </div>
  );
}
