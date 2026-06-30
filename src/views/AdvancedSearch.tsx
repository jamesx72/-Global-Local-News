import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Tag, User, SlidersHorizontal, ArrowRight, X } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import { Article } from '../hooks/useBookmarks';
import { useTheme } from '../hooks/useTheme';

export default function AdvancedSearch() {
  const { searchQuery, setSearchQuery } = useSearch();
  
  const [query, setQuery] = useState(searchQuery);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tags, setTags] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  
  const [results, setResults] = useState<Article[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const categories = ['World', 'Tech', 'Science', 'Business', 'Sports', 'Health', 'Politics'];

  // Sync with global search query initially
  useEffect(() => {
    if (searchQuery && !hasSearched) {
      setQuery(searchQuery);
      handleSearch(searchQuery);
    }
  }, [searchQuery]);

  const handleSearch = async (overrideQuery?: string) => {
    setIsSearching(true);
    setHasSearched(true);
    
    const searchParam = overrideQuery !== undefined ? overrideQuery : query;
    if (overrideQuery !== undefined) {
      setSearchQuery(overrideQuery);
    }
    
    try {
      const params = new URLSearchParams();
      if (searchParam) params.append('q', searchParam);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (tags) params.append('tags', tags);
      if (author) params.append('author', author);
      if (category) params.append('category', category);

      const res = await fetch(`/api/news/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.articles || []);
      }
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setIsSearching(false);
    }
  };

  const clearFilters = () => {
    setQuery('');
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setTags('');
    setAuthor('');
    setCategory('');
    setResults([]);
    setHasSearched(false);
  };

  const openArticle = (article: Article) => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'articleDetail', data: { article } } }));
  };

  return (
    <div className="flex-1 overflow-y-auto bg-brand-surface nice-scroll pb-20 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif font-bold text-brand-primary mb-2 flex items-center gap-3">
              <SlidersHorizontal className="text-brand-secondary" /> Advanced Search
            </h1>
            <p className="text-gray-500">Fine-tune your query to find exactly what you're looking for.</p>
          </div>
          {hasSearched && (
            <button 
              onClick={clearFilters}
              className="text-sm font-bold text-gray-500 hover:text-brand-primary transition-colors flex items-center gap-2"
            >
              <X size={16} /> Clear All
            </button>
          )}
        </div>

        <div className="bg-brand-surface-lowest rounded-2xl p-6 md:p-8 border border-brand-outline-variant shadow-sm mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Keywords</label>
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What are you looking for?" 
                  className="w-full bg-brand-surface-low border border-brand-outline-variant rounded-xl pl-12 pr-4 py-4 text-brand-primary focus:outline-none focus:border-brand-secondary transition-colors"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Start Date</label>
              <div className="relative">
                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-brand-surface-low border border-brand-outline-variant rounded-xl pl-12 pr-4 py-3 text-brand-primary focus:outline-none focus:border-brand-secondary transition-colors"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">End Date</label>
              <div className="relative">
                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-brand-surface-low border border-brand-outline-variant rounded-xl pl-12 pr-4 py-3 text-brand-primary focus:outline-none focus:border-brand-secondary transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-brand-surface-low border border-brand-outline-variant rounded-xl px-4 py-3 text-brand-primary focus:outline-none focus:border-brand-secondary transition-colors appearance-none"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Author</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. John Doe" 
                  className="w-full bg-brand-surface-low border border-brand-outline-variant rounded-xl pl-12 pr-4 py-3 text-brand-primary focus:outline-none focus:border-brand-secondary transition-colors"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Tags</label>
              <div className="relative">
                <Tag size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Comma separated tags (e.g. climate, election)" 
                  className="w-full bg-brand-surface-low border border-brand-outline-variant rounded-xl pl-12 pr-4 py-3 text-brand-primary focus:outline-none focus:border-brand-secondary transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-brand-outline-variant">
            <button 
              onClick={() => handleSearch()}
              disabled={isSearching}
              className="bg-brand-primary text-brand-surface-lowest px-8 py-3 rounded-xl font-bold uppercase tracking-wider shadow-sm hover:bg-brand-primary/90 hover:shadow transition-all disabled:opacity-70 flex items-center gap-2"
            >
              {isSearching ? 'Searching...' : 'Search News'} <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {hasSearched && (
          <div>
            <h2 className="text-2xl font-serif font-bold text-brand-primary mb-6 flex items-center justify-between">
              Search Results
              <span className="text-sm font-sans font-medium text-gray-500 bg-brand-surface-low px-3 py-1 rounded-full border border-brand-outline">
                {results.length} found
              </span>
            </h2>
            
            {results.length === 0 && !isSearching ? (
              <div className="text-center py-20 bg-brand-surface-low rounded-2xl border border-brand-outline-variant border-dashed">
                <Filter size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">No articles found</h3>
                <p className="text-gray-500">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.map((article) => (
                  <article 
                    key={article.id} 
                    className="bg-brand-surface-lowest rounded-xl shadow-sm border border-brand-outline-variant overflow-hidden flex flex-col hover:shadow-md transition-shadow group cursor-pointer"
                    onClick={() => openArticle(article)}
                  >
                    <div className="h-48 overflow-hidden relative">
                      <img src={article.imageUrl} alt={article.category} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur text-white text-[10px] uppercase font-bold tracking-wider rounded">
                        {article.category}
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="text-lg font-bold text-brand-primary mb-2 group-hover:text-brand-secondary transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">
                        {article.content}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-400 font-medium uppercase tracking-wider mt-auto">
                        <span 
                          className="flex items-center gap-1 hover:text-brand-secondary transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (article.author) {
                              window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'authorProfile', data: { authorName: article.author } } }));
                            }
                          }}
                        ><User size={12} /> {article.author || 'Unknown'}</span>
                        <span>{new Date(article.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
