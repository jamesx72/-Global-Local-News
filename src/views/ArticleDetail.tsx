import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ArrowLeft, ZoomIn, ZoomOut, Share2, Bookmark, BookmarkCheck, MessageSquare, Sparkles, Layers, Play, Pause, Square, Clock, Printer, User, Calendar } from 'lucide-react';
import { Article, useBookmarks } from '../hooks/useBookmarks';
import { useReadLater } from '../hooks/useReadLater';
import { getReadingTime } from '../utils/readingTime';
import { useNotifications } from '../contexts/NotificationContext';
import ArticleChat from '../components/ArticleChat';

export interface ArticleDetailProps {
  article: Article;
}

export default function ArticleDetail({ article }: ArticleDetailProps) {
  const { addNotification } = useNotifications();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { isReadLater, toggleReadLater } = useReadLater();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [readerMode, setReaderMode] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<string>('English');
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0); // Reset scroll on load
    const handleSettingsChange = () => {
      try {
        const saved = window.localStorage.getItem('app_settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.readerMode !== undefined) {
            setReaderMode(parsed.readerMode);
          }
        }
      } catch (e) {}
    };
    
    handleSettingsChange();
    window.addEventListener('app_settings_changed', handleSettingsChange);
    return () => {
      window.removeEventListener('app_settings_changed', handleSettingsChange);
      window.speechSynthesis.cancel();
    };
  }, [article.id]);

  const articleContent = article?.content || `The recent developments surrounding ${article?.title?.toLowerCase()} represent a significant turning point in global dynamics. Experts point to multiple cascading effects that reach far beyond initial projections, particularly concerning infrastructure sustainability and socioeconomic patterns.
    
    According to inside reports, the underlying framework has been in preparation for nearly a decade, involving cross-border collaboration and a newly structured regulatory approach. Stakeholders are optimistic, yet remain cautious about potential operational bottlenecks.
    
    Moving forward, key indicators will be monitored closely to evaluate performance. The integration of advanced analytics and real-time auditing provides an unprecedented level of transparency, which many hope will set a new standard for operations of this magnitude.
    
    "This is not just an incremental update," noted a leading analyst during the latest briefing. "It's a structural transformation that demands we rethink our foundational assumptions." Wait times for additional disclosures are expected to be short as the implementation quickly scales.`;

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/article/${article.id}`;
      await navigator.clipboard.writeText(url);
      setCopiedId(article.id);
      addNotification('Link Copied', 'Article URL copied to clipboard!', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error(err);
      addNotification('Error', 'Failed to copy link', 'error');
    }
  };

  const handleToggleAudio = () => {
    const textToSpeak = translatedContent || articleContent;
    if (!textToSpeak) return;

    if (isPlaying) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    } else {
      const utterance = new SpeechSynthesisUtterance(`${article?.title ?? ''}. ${textToSpeak}`);
      utterance.rate = playbackRate;
      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        utteranceRef.current = null;
      };
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  const handleStopAudio = () => {
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleBack = () => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'home' } }));
  };

  const bookmarked = isBookmarked(article.id);

  const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'];

  return (
    <div className="min-h-screen bg-brand-surface pt-6 pb-20 px-4 w-full">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={handleBack} 
          className="flex items-center gap-2 text-brand-secondary font-bold text-sm tracking-widest uppercase hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b border-brand-outline-variant mb-10">
          <div className="flex items-center gap-2">
            <button onClick={handleToggleAudio} className="p-2 rounded-full hover:bg-white/10 text-brand-secondary transition-colors" title={isPlaying && !isPaused ? "Pause Audio" : "Play Audio"}>
              {isPlaying && !isPaused ? <Pause size={18} /> : <Play size={18} />}
            </button>
            {isPlaying && (
              <button onClick={handleStopAudio} className="p-2 rounded-full hover:bg-white/10 text-brand-error transition-colors" title="Stop Audio">
                <Square size={18} />
              </button>
            )}
            <div className="w-px h-6 bg-white/10 mx-2"></div>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="bg-transparent text-xs text-brand-on-surface/70 border border-brand-outline rounded p-1 outline-none"
            >
              <option value="English">Original (EN)</option>
              {LANGUAGES.filter(l => l !== 'English').map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 text-brand-on-surface/70">
            <button onClick={() => toggleReadLater(article)} className="p-2 rounded-full hover:bg-white/10 transition-colors" title="Read Later">
              <Clock size={18} className={isReadLater(article.id) ? "text-brand-secondary" : ""} />
            </button>
            <div className="relative">
              {copiedId === article.id && (
                <span className="absolute right-full mr-2 whitespace-nowrap text-[10px] uppercase font-bold tracking-wider text-brand-success animate-in fade-in slide-in-from-right-4 duration-200 pointer-events-none mt-2">
                  Copied to clipboard
                </span>
              )}
              <button onClick={handleCopyLink} className="p-2 rounded-full hover:bg-white/10 transition-colors" title="Share Article">
                <Share2 size={18} className={copiedId === article.id ? "text-brand-success" : ""} />
              </button>
            </div>
            <button onClick={() => toggleBookmark(article)} className="p-2 rounded-full hover:bg-white/10 transition-colors" title="Bookmark Article">
              {bookmarked ? <BookmarkCheck size={18} className="text-brand-secondary" /> : <Bookmark size={18} />}
            </button>
            <button onClick={() => window.print()} className="p-2 rounded-full hover:bg-white/10 transition-colors hidden sm:block" title="Print Article">
              <Printer size={18} />
            </button>
          </div>
        </div>

        {/* Article Meta Header */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-brand-secondary bg-brand-secondary/10 px-2 py-1 rounded">
              {article.category}
            </span>
            <span className="text-sm font-bold text-brand-success bg-brand-success/10 px-2 py-1 rounded flex items-center gap-1">
              <Sparkles size={14} /> Trust Score: {article.trustScore}%
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-brand-primary leading-tight mb-8">
             {article.title}
          </h1>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 text-sm text-brand-on-surface/60 font-medium">
            <div className="flex items-center gap-2">
              <User size={16} className="text-brand-secondary" />
              <span>By <span className="font-bold text-brand-primary">{article.author || 'Editorial Team'}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-brand-secondary" />
              <span>{article.publicationDate || new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-brand-secondary" />
              <span>{getReadingTime(articleContent)} min read</span>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {article.imageUrl && (
          <div className="w-full aspect-video rounded-3xl overflow-hidden mb-12 shadow-2xl relative">
            <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-mono text-white/80 border border-white/10 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-brand-secondary"></span> Location: {article.location || 'Unknown'}
            </div>
          </div>
        )}

        {/* Prose Body */}
        <div className="font-sans text-brand-on-surface/80 text-lg leading-relaxed max-w-prose mx-auto prose-p:mb-6 nice-scroll pb-16">
          {(translatedContent || articleContent).split('\n\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph.trim()}</p>
          ))}
        </div>

        {/* End of article actions */}
        <div className="max-w-prose mx-auto border-t border-brand-outline-variant pt-8 flex flex-col sm:flex-row justify-center gap-4 py-16">
          <button onClick={() => toggleReadLater(article)} className="flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-sm bg-brand-surface-lowest text-brand-primary px-8 py-4 rounded-full border border-brand-outline shadow-sm hover:border-brand-secondary transition-colors">
            <Clock size={18} /> {isReadLater(article.id) ? 'Saved' : 'Read Later'}
          </button>
          <button onClick={handleCopyLink} className="flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-sm bg-brand-primary text-brand-surface-lowest px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all">
            <Share2 size={18} /> Share Article
          </button>
        </div>
        
      </div>
    </div>
  );
}
