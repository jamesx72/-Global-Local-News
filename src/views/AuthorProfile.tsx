import React, { useState, useEffect } from 'react';
import { User, Calendar, MapPin, ArrowLeft } from 'lucide-react';
import { Article } from '../hooks/useBookmarks';

interface AuthorProfileProps {
  authorName: string;
}

export default function AuthorProfile({ authorName }: AuthorProfileProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/news/search?author=${encodeURIComponent(authorName)}`);
        if (res.ok) {
          const data = await res.json();
          setArticles(data.articles || []);
        }
      } catch (err) {
        console.error("Failed to fetch author articles", err);
      } finally {
        setLoading(false);
      }
    };

    if (authorName) {
      fetchArticles();
    }
  }, [authorName]);

  const openArticle = (article: Article) => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'articleDetail', data: { article } } }));
  };

  const goBack = () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'home' } }));
  };

  return (
    <div className="flex-1 overflow-y-auto bg-brand-surface nice-scroll pb-20">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <button 
          onClick={goBack}
          className="mb-8 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-brand-primary transition-colors"
        >
          <ArrowLeft size={16} /> Back to News
        </button>

        {/* Author Header */}
        <div className="bg-brand-surface-lowest rounded-2xl p-8 border border-brand-outline-variant shadow-sm mb-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-secondary to-brand-primary"></div>
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-brand-surface shadow-inner shrink-0 flex items-center justify-center bg-brand-surface-low">
            <User size={40} className="text-gray-400" />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="text-xs font-bold uppercase tracking-widest text-brand-secondary mb-1">Author / Publisher</div>
            <h1 className="text-3xl font-serif font-bold text-brand-primary mb-3">{authorName || 'Unknown Author'}</h1>
            <p className="text-gray-600 mb-6 max-w-2xl leading-relaxed">
              Contributing writer producing content across various topics and categories. View their latest published articles below.
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="bg-brand-surface-low px-4 py-2 rounded-lg border border-brand-outline-variant flex items-center gap-3">
                <div className="text-left">
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Articles</div>
                  <div className="text-lg font-serif font-bold text-brand-primary">{loading ? '-' : articles.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Articles List */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-serif font-bold text-brand-primary">Latest from {authorName}</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-brand-surface-lowest rounded-xl shadow-sm border border-brand-outline-variant overflow-hidden h-72">
                  <div className="h-40 bg-brand-surface-low w-full"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-brand-surface-low rounded w-3/4"></div>
                    <div className="h-4 bg-brand-surface-low rounded w-1/2"></div>
                  </div>
                </div>
             ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20 bg-brand-surface-lowest rounded-2xl border border-brand-outline-variant border-dashed">
            <User size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No articles found</h3>
            <p className="text-gray-500">This author hasn't published any articles yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article) => (
              <article 
                key={article.id} 
                className="bg-brand-surface-lowest rounded-xl shadow-sm border border-brand-outline-variant overflow-hidden flex flex-col hover:shadow-md transition-shadow group cursor-pointer"
                onClick={() => openArticle(article)}
              >
                {article.imageUrl && (
                  <div className="h-48 overflow-hidden relative">
                    <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur text-white text-[10px] uppercase font-bold tracking-wider rounded">
                      {article.category}
                    </div>
                  </div>
                )}
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-brand-primary mb-2 group-hover:text-brand-secondary transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">
                    {article.summary || article.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400 font-medium uppercase tracking-wider mt-auto">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(article.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
