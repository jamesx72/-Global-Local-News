import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function NewsTicker() {
  const [headlines, setHeadlines] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/news/trending')
      .then(res => res.json())
      .then(data => {
        if (data.articles && Array.isArray(data.articles)) {
            // Get just the unique titles from articles
            const titles = Array.from<string>(new Set(data.articles.map((a: any) => String(a.title)).filter(Boolean)));
            setHeadlines(titles.slice(0, 15));
        }
      })
      .catch(err => console.error("Could not fetch news ticker data", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || headlines.length === 0) return null;

  return (
    <div className="w-full bg-brand-primary text-brand-surface-lowest overflow-hidden h-8 flex items-center relative z-50">
      <div className="absolute left-0 top-0 bottom-0 px-4 bg-brand-primary flex items-center gap-2 z-10 font-bold text-xs uppercase tracking-widest shadow-[10px_0_20px_rgba(0,0,0,0.5)]">
        <AlertCircle size={14} className="text-brand-secondary" />
        <span className="hidden sm:inline">Breaking</span>
      </div>
      
      <div className="flex-1 overflow-hidden relative h-full flex items-center ml-24 sm:ml-32">
        <div className="animate-ticker flex whitespace-nowrap items-center hover:[animation-play-state:paused]">
          {headlines.map((headline, i) => (
            <div key={i} className="flex items-center">
              <a href="#" className="mx-4 text-xs font-medium hover:text-brand-secondary transition-colors cursor-pointer">
                {headline}
              </a>
              <span className="w-1 h-1 rounded-full bg-brand-secondary/50 mx-2"></span>
            </div>
          ))}
           {/* Duplicate for seamless scrolling, but only if we have enough. Usually marquee needs double content. */}
          {headlines.map((headline, i) => (
            <div key={`dup-${i}`} className="flex items-center">
              <a href="#" className="mx-4 text-xs font-medium hover:text-brand-secondary transition-colors cursor-pointer">
                {headline}
              </a>
              <span className="w-1 h-1 rounded-full bg-brand-secondary/50 mx-2"></span>
            </div>
          ))}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 40s linear infinite;
        }
      `}} />
    </div>
  );
}
