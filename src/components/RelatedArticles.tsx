import React, { useState, useEffect } from 'react';
import { Article } from '../hooks/useBookmarks';

interface RelatedArticlesProps {
  category: string;
  currentArticleId: string;
  onArticleClick: (article: Article) => void;
}

export default function RelatedArticles({ category, currentArticleId, onArticleClick }: RelatedArticlesProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/news/search?q=' + encodeURIComponent(category));
        if (res.ok) {
          const data = await res.json();
          if (data.articles) {
            // Filter out current article and limit to 3
            const filtered = data.articles.filter((a: Article) => a.id !== currentArticleId).slice(0, 3);
            setArticles(filtered);
          }
        }
      } catch (err) {
        console.error("Failed to fetch related articles:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (category) {
      fetchRelated();
    }
  }, [category, currentArticleId]);

  if (isLoading) {
    return (
      <div className="mt-16 animate-pulse">
        <h3 className="text-xl font-bold font-serif mb-6 text-brand-primary">More Like This</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-brand-surface-low rounded-xl h-48"></div>
          ))}
        </div>
      </div>
    );
  }

  if (articles.length === 0) return null;

  return (
    <div className="mt-16 pt-10 border-t border-brand-outline-variant">
      <h3 className="text-2xl font-bold font-serif mb-8 text-brand-primary tracking-tight">More Like This</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {articles.map((article) => (
          <article 
            key={article.id} 
            className="bg-brand-surface-lowest rounded-xl shadow-sm border border-brand-outline-variant overflow-hidden flex flex-col hover:shadow-md transition-shadow group cursor-pointer"
            onClick={() => onArticleClick(article)}
          >
            {article.imageUrl && (
              <div className="h-32 overflow-hidden relative">
                <img src={article.imageUrl} alt={article.category} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur text-white text-[10px] uppercase font-bold tracking-wider rounded-sm">
                  {article.category}
                </div>
              </div>
            )}
            <div className="p-4 flex flex-col flex-grow">
              <h4 className="font-bold text-brand-primary line-clamp-3 mb-2 group-hover:text-brand-secondary transition-colors">
                {article.title}
              </h4>
              <div className="mt-auto flex items-center justify-between text-xs text-brand-secondary font-medium uppercase tracking-wider">
                <span>{article.location}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
