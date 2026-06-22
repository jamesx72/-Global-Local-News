import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ArrowLeft, ZoomIn, ZoomOut, Share2, Bookmark, BookmarkCheck, MessageSquare, Sparkles, Layers, Play, Pause, Square, Clock, Printer, User, Calendar, ArrowUp, BookOpen, Highlighter, Copy, Link, Check, Heart } from 'lucide-react';
import { doc, setDoc, deleteDoc, updateDoc, increment, onSnapshot, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
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

  const { user, signInWithGoogle } = useAuth();
  const [likesCount, setLikesCount] = useState<number>(0);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [article.id]);

  useEffect(() => {
    const fetchRelated = async () => {
      if (article.tags && article.tags.length > 0) {
        try {
          const firstTag = article.tags[0];
          const res = await fetch('/api/news/search?q=' + encodeURIComponent(firstTag));
          if (res.ok) {
            const data = await res.json();
            if (data.articles) {
              const filtered = data.articles.filter((a: Article) => a.id !== article.id).slice(0, 3);
              setRelatedArticles(filtered);
            }
          }
        } catch (e) {
          console.error("Failed to fetch related articles");
        }
      }
    };
    fetchRelated();
  }, [article.id, article.tags]);

  useEffect(() => {
    const likesRef = collection(db, 'articles', article.id, 'likes');
    const unsubscribe = onSnapshot(likesRef, (snapshot) => {
      setLikesCount(snapshot.size);
      if (user) {
        setHasLiked(snapshot.docs.some(doc => doc.id === user.uid));
      } else {
        setHasLiked(false);
      }
    }, (error) => {
      console.error('Firestore Error observing likes:', error);
    });

    return () => unsubscribe();
  }, [article.id, user]);

  const handleLike = async () => {
    if (!user) {
      addNotification('Please sign in to like articles', 'info');
      signInWithGoogle();
      return;
    }
    
    try {
      const likeDocRef = doc(db, 'articles', article.id, 'likes', user.uid);
      if (hasLiked) {
        await deleteDoc(likeDocRef);
      } else {
        await setDoc(likeDocRef, {
          userId: user.uid,
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error updating likes", error);
      addNotification('Failed to update like status', 'error');
    }
  };

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
    try {
      const savedScroll = window.localStorage.getItem(`app_article_scroll_${article.id}`);
      if (savedScroll) {
        // Use a short timeout to ensure content is rendered before scrolling
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedScroll, 10));
        }, 100);
      } else {
        window.scrollTo(0, 0); // Reset scroll on load
      }
    } catch (e) {
      window.scrollTo(0, 0);
    }
    
    try {
      const savedHighlights = window.localStorage.getItem(`app_highlights_${article.id}`);
      if (savedHighlights) {
        setHighlights(JSON.parse(savedHighlights));
      }
    } catch (e) {}

    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        try {
          window.localStorage.setItem(`app_article_scroll_${article.id}`, window.scrollY.toString());
        } catch (e) {}
      }, 500);
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
      clearTimeout(scrollTimeout);
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
      window.speechSynthesis.cancel();
      const fullText = `${article?.title ?? ''}. ${textToSpeak}`;
      // Split into sentences to avoid Chrome's 15-second speech synthesis bug
      const chunks = fullText.match(/[^.!?]+[.!?]+/g) || [fullText];
      let currentChunk = 0;
      
      const speakNextChunk = () => {
        if (currentChunk >= chunks.length) {
          setIsPlaying(false);
          setIsPaused(false);
          utteranceRef.current = null;
          return;
        }
        
        const utterance = new SpeechSynthesisUtterance(chunks[currentChunk].trim());
        utterance.rate = playbackRate;
        utterance.onend = () => {
          currentChunk++;
          // Only continue if not cancelled
          if (utteranceRef.current) {
            speakNextChunk();
          }
        };
        utterance.onerror = () => {
          setIsPlaying(false);
          setIsPaused(false);
          utteranceRef.current = null;
        };
        
        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      };

      setIsPlaying(true);
      setIsPaused(false);
      speakNextChunk();
    }
  };

  const handleStopAudio = () => {
    utteranceRef.current = null;
    window.speechSynthesis.cancel();
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
            <button onClick={() => {
              const url = `${window.location.origin}/article/${article.id}`;
              handleCopyToClipboard(url);
            }} className="p-2 rounded-full hover:bg-white/10 transition-colors relative" title="Copy Link">
              {copiedId === article.id ? <Check size={18} className="text-brand-success" /> : <Link size={18} />}
              {copiedId === article.id && (
                <span className="absolute right-full mr-2 top-2 whitespace-nowrap text-[10px] uppercase font-bold tracking-wider text-brand-success animate-in fade-in slide-in-from-right-4 duration-200 pointer-events-none">
                  Copied
                </span>
              )}
            </button>
            <button onClick={handleShare} className="p-2 rounded-full hover:bg-white/10 transition-colors" title="Share Article">
              <Share2 size={18} />
            </button>
            <button onClick={() => toggleBookmark(article)} className="p-2 rounded-full hover:bg-white/10 transition-colors" title="Bookmark Article">
              {bookmarked ? <BookmarkCheck size={18} className="text-brand-secondary" /> : <Bookmark size={18} />}
            </button>
            <button onClick={handleLike} className={`flex items-center gap-1 p-2 rounded-full transition-colors ${hasLiked ? 'text-brand-error' : 'hover:bg-white/10'}`} title="Like Article">
              <Heart size={18} className={hasLiked ? "fill-current" : ""} />
              {likesCount > 0 && <span className="text-[10px] font-bold px-1">{likesCount}</span>}
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

          <div className="flex flex-col gap-6 mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-brand-primary leading-tight">
               {article.title}
            </h1>
            
            {article.tags && article.tags.length > 0 && !readerMode && (
              <div className="flex flex-wrap gap-2">
                {article.tags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTopicClick(tag)}
                    className="px-3 py-1 bg-brand-surface-lowest border border-brand-outline-variant hover:border-brand-secondary text-brand-primary text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-sm"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

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
            {!readerMode && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleLike} 
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-xs tracking-widest uppercase transition-all ${
                    hasLiked 
                      ? 'bg-red-50 text-red-500 border border-red-200' 
                      : 'bg-brand-surface-lowest text-brand-on-surface/60 border border-brand-outline-variant hover:border-brand-secondary hover:text-brand-primary'
                  }`}
                >
                  <Heart size={14} className={hasLiked ? 'fill-current' : ''} /> 
                  {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
                </button>
              </div>
            )}
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

        {/* Topics Section Removed (moved to top) */}

        {/* End of article author info */}
        {article.author && !readerMode && (
          <div className="max-w-prose mx-auto border-t border-brand-outline-variant pt-12 pb-6 mt-12 flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-brand-surface border border-brand-outline shrink-0 overflow-hidden flex items-center justify-center">
              <User size={32} className="text-brand-on-surface/30" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="text-xs font-bold uppercase tracking-widest text-brand-secondary mb-1">About the Author</div>
              <h4 className="font-serif text-xl font-bold text-brand-primary mb-2 flex items-center justify-center md:justify-start gap-2">
                {article.author}
              </h4>
              <p className="text-brand-on-surface/80 text-sm leading-relaxed">
                {article.authorBio || `Contributing writer covering the ${article.category || 'general'} section.`}
              </p>
            </div>
          </div>
        )}

        {/* End of article actions */}
        {!readerMode && (
          <div className="max-w-prose mx-auto border-t border-brand-outline-variant pt-8 flex flex-col sm:flex-row justify-center gap-4 py-8">
            <button onClick={() => toggleReadLater(article)} className="flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-sm bg-brand-surface-lowest text-brand-primary px-8 py-4 rounded-full border border-brand-outline shadow-sm hover:border-brand-secondary transition-colors">
              <Clock size={18} /> {isReadLater(article.id) ? 'Saved' : 'Read Later'}
            </button>
            <button onClick={() => handleCopyToClipboard(`${window.location.origin}/article/${article.id}`)} className="flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-sm bg-brand-surface-lowest text-brand-primary px-8 py-4 rounded-full border border-brand-outline shadow-sm hover:border-brand-secondary transition-colors">
              {copiedId === article.id ? <Check size={18} className="text-brand-success" /> : <Link size={18} />}
              {copiedId === article.id ? 'Copied' : 'Copy Link'}
            </button>
            <button onClick={handleShare} className="flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-sm bg-brand-primary text-brand-surface-lowest px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all">
              <Share2 size={18} /> Share Article
            </button>
          </div>
        )}

        {/* Related Articles */}
        {!readerMode && relatedArticles.length > 0 && (
          <div className="max-w-prose mx-auto border-t border-brand-outline-variant py-12">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-on-surface/50 mb-6 flex items-center gap-2">
              <Sparkles size={16} className="text-brand-secondary" /> Related Articles
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedArticles.map((relArticle) => (
                <div 
                  key={relArticle.id}
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'articleDetail', data: { article: relArticle } } }))}
                  className="bg-brand-surface-lowest rounded-xl shadow-sm border border-brand-outline-variant overflow-hidden cursor-pointer hover:shadow-md transition-shadow group flex flex-col"
                >
                  <div className="h-24 overflow-hidden relative">
                    <img src={relArticle.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=400&q=80'} alt={relArticle.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <div className="text-[10px] text-brand-secondary font-bold uppercase mb-1 tracking-wider">{relArticle.category}</div>
                    <h4 className="font-serif font-bold text-sm text-brand-primary leading-tight line-clamp-3 group-hover:text-brand-primary-container">{relArticle.title}</h4>
                  </div>
                </div>
              ))}
            </div>
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
