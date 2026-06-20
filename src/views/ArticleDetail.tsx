import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ArrowLeft, ZoomIn, ZoomOut, Share2, Bookmark, BookmarkCheck, MessageSquare, Sparkles, Layers, Play, Pause, Square, Clock, Printer, User, Calendar, ArrowUp, BookOpen, Highlighter, Copy } from 'lucide-react';
import { Article, useBookmarks } from '../hooks/useBookmarks';
import { useReadLater } from '../hooks/useReadLater';
import { useSearch } from '../hooks/useSearch';
import { getReadingTime } from '../utils/readingTime';
import { useNotifications } from '../contexts/NotificationContext';
import ArticleChat from '../components/ArticleChat';
import CommentsSection from '../components/CommentsSection';

export interface ArticleDetailProps {
  article: Article;
}

export default function ArticleDetail({ article }: ArticleDetailProps) {
  const { addNotification } = useNotifications();
  const { setSearchQuery } = useSearch();

  const handleTopicClick = (topic: string) => {
    setSearchQuery(topic);
    window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'home', data: null } }));
  };

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
  const [fontSizeScale, setFontSizeScale] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const [selectedText, setSelectedText] = useState('');

  const increaseFontSize = () => setFontSizeScale(prev => Math.min(prev + 0.1, 2));
  const decreaseFontSize = () => setFontSizeScale(prev => Math.max(prev - 0.1, 0.5));

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveHighlight = () => {
    if (selectedText.trim()) {
      const newHighlights = [...highlights, selectedText.trim()];
      setHighlights(newHighlights);
      try {
        window.localStorage.setItem(`app_highlights_${article.id}`, JSON.stringify(newHighlights));
      } catch (e) {}
      addNotification('Highlight Saved', 'Text segment saved to your highlights.', 'success');
      window.getSelection()?.removeAllRanges();
      setSelectionRect(null);
      setSelectedText('');
    }
  };

  const copyText = async () => {
    if (selectedText.trim()) {
      try {
        await navigator.clipboard.writeText(selectedText.trim());
        addNotification('Text Copied', 'Copied to clipboard.', 'success');
      } catch (err) {
        addNotification('Copy Failed', 'Could not copy text to clipboard.', 'error');
      }
      window.getSelection()?.removeAllRanges();
      setSelectionRect(null);
      setSelectedText('');
    }
  };

  const articleBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0); // Reset scroll on load
    
    try {
      const savedHighlights = window.localStorage.getItem(`app_highlights_${article.id}`);
      if (savedHighlights) {
        setHighlights(JSON.parse(savedHighlights));
      }
    } catch (e) {}

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && selection.toString().trim() !== '') {
        // Only show if selection is within the article body
        if (articleBodyRef.current && articleBodyRef.current.contains(selection.anchorNode)) {
          const range = selection.getRangeAt(0);
          setSelectionRect(range.getBoundingClientRect());
          setSelectedText(selection.toString());
          return;
        }
      }
      setSelectionRect(null);
      setSelectedText('');
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    
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
      document.removeEventListener('selectionchange', handleSelectionChange);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('app_settings_changed', handleSettingsChange);
      window.speechSynthesis.cancel();
    };
  }, [article.id]);

  const articleContent = article?.content || `The recent developments surrounding ${article?.title?.toLowerCase()} represent a significant turning point in global dynamics. Experts point to multiple cascading effects that reach far beyond initial projections, particularly concerning infrastructure sustainability and socioeconomic patterns.
    
    According to inside reports, the underlying framework has been in preparation for nearly a decade, involving cross-border collaboration and a newly structured regulatory approach. Stakeholders are optimistic, yet remain cautious about potential operational bottlenecks.
    
    Moving forward, key indicators will be monitored closely to evaluate performance. The integration of advanced analytics and real-time auditing provides an unprecedented level of transparency, which many hope will set a new standard for operations of this magnitude.
    
    "This is not just an incremental update," noted a leading analyst during the latest briefing. "It's a structural transformation that demands we rethink our foundational assumptions." Wait times for additional disclosures are expected to be short as the implementation quickly scales.`;

  const handleShare = async () => {
    const url = `${window.location.origin}/article/${article.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: `Check out this article: ${article.title}`,
          url: url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
        if ((err as Error).name !== 'AbortError') {
          handleCopyToClipboard(url);
        }
      }
    } else {
      handleCopyToClipboard(url);
    }
  };

  const handleCopyToClipboard = async (url: string) => {
    try {
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
            <button onClick={handleToggleAudio} className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/10 text-brand-secondary transition-colors text-sm font-bold uppercase tracking-wider" title={isPlaying && !isPaused ? "Pause Audio" : "Listen to Audio"}>
              {isPlaying && !isPaused ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying && !isPaused ? "Pause" : "Listen"}
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
            <button onClick={decreaseFontSize} className="p-2 rounded-full hover:bg-white/10 transition-colors" title="Decrease Font Size">
              <ZoomOut size={18} />
            </button>
            <span className="text-xs font-mono w-8 text-center">{Math.round(fontSizeScale * 100)}%</span>
            <button onClick={increaseFontSize} className="p-2 rounded-full hover:bg-white/10 transition-colors" title="Increase Font Size">
              <ZoomIn size={18} />
            </button>
            <div className="w-px h-6 bg-white/10 mx-2"></div>
            <button onClick={() => toggleReadLater(article)} className="p-2 rounded-full hover:bg-white/10 transition-colors" title="Read Later">
              <Clock size={18} className={isReadLater(article.id) ? "text-brand-secondary" : ""} />
            </button>
            <div className="relative">
              {copiedId === article.id && (
                <span className="absolute right-full mr-2 whitespace-nowrap text-[10px] uppercase font-bold tracking-wider text-brand-success animate-in fade-in slide-in-from-right-4 duration-200 pointer-events-none mt-2">
                  Copied to clipboard
                </span>
              )}
              <button onClick={handleShare} className="p-2 rounded-full hover:bg-white/10 transition-colors" title="Share Article">
                <Share2 size={18} className={copiedId === article.id ? "text-brand-success" : ""} />
              </button>
            </div>
            <button onClick={() => toggleBookmark(article)} className="p-2 rounded-full hover:bg-white/10 transition-colors" title="Bookmark Article">
              {bookmarked ? <BookmarkCheck size={18} className="text-brand-secondary" /> : <Bookmark size={18} />}
            </button>
            <button onClick={() => setReaderMode(!readerMode)} className={`p-2 rounded-full transition-colors ${readerMode ? 'bg-brand-secondary text-brand-surface-lowest' : 'hover:bg-white/10'}`} title="Reader Mode">
              <BookOpen size={18} />
            </button>
            <button onClick={() => window.print()} className="p-2 rounded-full hover:bg-white/10 transition-colors hidden sm:block" title="Print Article">
              <Printer size={18} />
            </button>
          </div>
        </div>

        {/* Article Meta Header */}
        <div className="mb-10">
          {!readerMode && (
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="text-xs uppercase tracking-[0.3em] font-bold text-brand-secondary bg-brand-secondary/10 px-2 py-1 rounded">
                {article.category}
              </span>
              <span className="text-sm font-bold text-brand-success bg-brand-success/10 px-2 py-1 rounded flex items-center gap-1">
                <Sparkles size={14} /> Trust Score: {article.trustScore}%
              </span>
            </div>
          )}

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
              <span>{getReadingTime(translatedContent || articleContent)} min read</span>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {!readerMode && article.imageUrl && (
          <div className="w-full aspect-video rounded-3xl overflow-hidden mb-12 shadow-2xl relative">
            <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-mono text-white/80 border border-white/10 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-brand-secondary"></span> Location: {article.location || 'Unknown'}
            </div>
          </div>
        )}

        {/* Prose Body */}
        <div 
          ref={articleBodyRef}
          className={`${readerMode ? 'font-serif text-brand-on-surface text-xl max-w-2xl' : 'font-sans text-brand-on-surface/80 text-lg max-w-prose'} leading-relaxed mx-auto prose-p:mb-6 nice-scroll pb-16 transition-all relative`}
          style={{ fontSize: `${(readerMode ? 1.25 : 1.125) * fontSizeScale}rem`, lineHeight: readerMode ? 1.8 : 1.6 }}
        >
          {(translatedContent || articleContent).split('\n\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph.trim()}</p>
          ))}
        </div>

        {/* Highlights Section */}
        {highlights.length > 0 && !readerMode && (
          <div className="max-w-prose mx-auto mb-16 bg-brand-surface-lowest border border-brand-outline-variant p-6 rounded-2xl">
            <h3 className="text-xl font-bold font-serif text-brand-primary mb-4 flex items-center gap-2">
              <Highlighter size={20} className="text-brand-secondary" /> Your Highlights
            </h3>
            <ul className="space-y-4">
              {highlights.map((h, i) => (
                <li key={i} className="pl-4 border-l-2 border-brand-secondary text-brand-on-surface/80 italic text-sm">
                  "{h}"
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Floating Highlight Button */}
        {selectionRect && selectedText && (
          <div
            className="absolute z-50 animate-in fade-in zoom-in duration-200 pointer-events-auto flex items-center bg-brand-primary rounded-lg shadow-xl overflow-hidden"
            style={{
              top: selectionRect.top + window.scrollY - 48,
              left: selectionRect.left + window.scrollX + (selectionRect.width / 2) - 80,
            }}
          >
            <button
              onMouseDown={(e) => {
                // Prevent defaulting out the selection but keep click behavior
                e.preventDefault(); 
              }}
              onClick={saveHighlight}
              className="text-brand-surface-lowest flex items-center gap-2 px-3 py-2 text-xs uppercase font-bold tracking-wider hover:bg-white/10 transition-colors"
            >
              <Highlighter size={14} /> Highlight
            </button>
            <div className="w-px h-4 bg-brand-surface-lowest/30"></div>
            <button
              onMouseDown={(e) => {
                e.preventDefault(); 
              }}
              onClick={copyText}
              className="text-brand-surface-lowest flex items-center gap-2 px-3 py-2 text-xs uppercase font-bold tracking-wider hover:bg-white/10 transition-colors"
              title="Copy text"
            >
              <Copy size={14} /> Copy
            </button>
          </div>
        )}

        {/* Topics Section */}
        {!readerMode && article.tags && article.tags.length > 0 && (
          <div className="max-w-prose mx-auto mb-12">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-on-surface/50 mb-3">Topics</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTopicClick(tag)}
                  className="px-4 py-2 bg-brand-surface-low border border-brand-outline-variant hover:border-brand-secondary text-brand-primary text-sm rounded-full transition-colors font-medium"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* End of article actions */}
        {!readerMode && (
          <div className="max-w-prose mx-auto border-t border-brand-outline-variant pt-8 flex flex-col sm:flex-row justify-center gap-4 py-8">
            <button onClick={() => toggleReadLater(article)} className="flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-sm bg-brand-surface-lowest text-brand-primary px-8 py-4 rounded-full border border-brand-outline shadow-sm hover:border-brand-secondary transition-colors">
              <Clock size={18} /> {isReadLater(article.id) ? 'Saved' : 'Read Later'}
            </button>
            <button onClick={handleShare} className="flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-sm bg-brand-primary text-brand-surface-lowest px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all">
              <Share2 size={18} /> Share Article
            </button>
          </div>
        )}

        {/* Comments Section */}
        {!readerMode && <CommentsSection articleId={article.id} />}
        
        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-3 bg-brand-primary text-brand-surface-lowest rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all z-50 flex items-center justify-center animate-in fade-in slide-in-from-bottom-8 duration-300"
            title="Scroll to Top"
          >
            <ArrowUp size={20} />
          </button>
        )}

      </div>
    </div>
  );
}
