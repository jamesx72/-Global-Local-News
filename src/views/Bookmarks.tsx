import React, { useState } from 'react';
import { useBookmarks, Article } from '../hooks/useBookmarks';
import { Bookmark, BookmarkCheck, MapPin, Verified, ArrowRight, Share2, CheckCircle2, Maximize2, Clock } from 'lucide-react';
import ReadingModeModal from '../components/ReadingModeModal';

export default function Bookmarks() {
  const { bookmarks, toggleBookmark, isBookmarked } = useBookmarks();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [readingArticle, setReadingArticle] = useState<Article | null>(null);

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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif font-bold text-brand-primary flex items-center gap-3">
          Saved Collections
        </h2>
      </div>

      {bookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-brand-surface-low border border-brand-outline-variant rounded-2xl text-center">
          <Bookmark size={48} className="text-brand-outline mb-4" />
          <h3 className="text-xl font-serif font-bold text-brand-primary mb-2">No Saved Articles</h3>
          <p className="text-gray-500 mb-6 max-w-md">You haven't bookmarked any articles yet. Explore the live feed to start building your collection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((article) => {
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
      )}

      <ReadingModeModal 
        article={readingArticle}
        isOpen={!!readingArticle}
        onClose={() => setReadingArticle(null)}
        copiedId={copiedId}
        onShare={handleShare}
      />
    </div>
  );
}
