import React, { useState } from 'react';
import { useReadLater } from '../hooks/useReadLater';
import { useBookmarks, Article } from '../hooks/useBookmarks';
import { useSearch } from '../hooks/useSearch';
import { Clock, Bookmark, BookmarkCheck, MapPin, Verified, ArrowRight, Share2, CheckCircle2, Maximize2 } from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader';
import SentimentIndicator from '../components/SentimentIndicator';
import AITagsIndicator from '../components/AITagsIndicator';
import { handleShareAction } from '../utils/share';
import { getReadingTime } from '../utils/readingTime';

export default function ReadLater() {
  const { readLater, toggleReadLater, isReadLater, loading } = useReadLater();
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const { searchQuery } = useSearch();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const setReadingArticle = (article: Article | null) => {
    if (article) {
      window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'articleDetail', data: { article } } }));
    }
  };

  const filteredCollection = readLater.filter(article => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      article.title.toLowerCase().includes(q) ||
      (article.content && article.content.toLowerCase().includes(q)) ||
      (article.tags && article.tags.some(tag => tag.toLowerCase().includes(q))) ||
      article.location.toLowerCase().includes(q) ||
      article.category.toLowerCase().includes(q)
    );
  });

  const handleShare = (e: React.SyntheticEvent | KeyboardEvent | null, articleId: string, articleTitle: string) => {
    handleShareAction(e, articleId, articleTitle, (id) => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleToggleReadLater = (e: React.MouseEvent, article: Article) => {
    e.stopPropagation();
    toggleReadLater(article);
  };
  
  const handleToggleBookmark = (e: React.MouseEvent, article: Article) => {
    e.stopPropagation();
    toggleBookmark(article);
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif font-bold text-brand-primary flex items-center gap-3">
            Read Later
          </h2>
        </div>
        <SkeletonLoader count={6} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 ">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-brand-primary flex items-center gap-3">
          Read Later
        </h2>
      </div>

      {filteredCollection.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-brand-surface-low border border-brand-outline-variant rounded-2xl text-center">
          <Clock size={48} className="text-brand-outline mb-4" />
          <h3 className="text-xl font-serif font-bold text-brand-primary mb-2">Read Later Empty</h3>
          <p className="text-gray-500 mb-6 max-w-md">Try searching for something else or explore the live feed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollection.map((article) => {
            const bookmarked = isBookmarked(article.id);
            const inQueue = isReadLater(article.id);
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
                      onClick={(e) => handleToggleReadLater(e, article)}
                      className="p-2 bg-black/40 hover:bg-black/80 backdrop-blur-md rounded-full text-brand-secondary transition-colors border border-brand-secondary"
                      title="Remove from Read Later"
                    >
                      <Clock size={16} />
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
                  <div className="mt-auto flex items-center justify-between border-t border-brand-outline-variant pt-3 mt-4">
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
      )}
    </div>
  );
}
