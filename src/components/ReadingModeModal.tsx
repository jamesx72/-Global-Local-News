import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, Share2, Bookmark, BookmarkCheck, MessageSquare, Sparkles, Layers, Play, Pause, Square } from 'lucide-react';
import { Article, useBookmarks } from '../hooks/useBookmarks';
import { useRecentArticles } from '../hooks/useRecentArticles';

interface Comment {
  id: string;
  text: string;
  timestamp: number;
  author: string;
}

interface ReadingModeModalProps {
  article: Article | null;
  allArticles: Article[];
  isOpen: boolean;
  onClose: () => void;
  onShare: (e: React.SyntheticEvent | KeyboardEvent | null, id: string) => void;
  copiedId: string | null;
}

export default function ReadingModeModal({ article, allArticles, isOpen, onClose, onShare, copiedId }: ReadingModeModalProps) {
  const [fontSize, setFontSize] = useState<number>(18);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { addRecentArticle } = useRecentArticles();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  React.useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  React.useEffect(() => {
    if (!isOpen) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, [isOpen]);

  const articleContent = article?.content || `
    The recent developments surrounding ${article?.title?.toLowerCase()} represent a significant turning point in global dynamics. Experts point to multiple cascading effects that reach far beyond initial projections, particularly concerning infrastructure sustainability and socioeconomic patterns.
    
    According to inside reports, the underlying framework has been in preparation for nearly a decade, involving cross-border collaboration and a newly structured regulatory approach. Stakeholders are optimistic, yet remain cautious about potential operational bottlenecks.
    
    Moving forward, key indicators will be monitored closely to evaluate performance. The integration of advanced analytics and real-time auditing provides an unprecedented level of transparency, which many hope will set a new standard for operations of this magnitude.
    
    "This is not just an incremental update," noted a leading analyst during the latest briefing. "It's a structural transformation that demands we rethink our foundational assumptions." Wait times for additional disclosures are expected to be short as the implementation quickly scales.
  `;

  const [targetLanguage, setTargetLanguage] = useState<string>('English');
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  React.useEffect(() => {
    if (isOpen && article) {
      setScrollProgress(0);
      setSummary(null);
      setIsSummarizing(false);
      setTargetLanguage('English');
      setTranslatedContent(null);
      setIsTranslating(false);
      addRecentArticle(article);

      try {
        const savedComments = window.localStorage.getItem(`article_comments_${article.id}`);
        setComments(savedComments ? JSON.parse(savedComments) : []);
      } catch (e) {
        console.error('Failed to load comments', e);
        setComments([]);
      }
    }
  }, [isOpen, article]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !article) return;

    const comment: Comment = {
      id: Date.now().toString(),
      text: newComment.trim(),
      timestamp: Date.now(),
      author: "Guest User"
    };

    const updatedComments = [...comments, comment];
    setComments(updatedComments);
    setNewComment("");

    try {
      window.localStorage.setItem(`article_comments_${article.id}`, JSON.stringify(updatedComments));
    } catch (err) {
      console.error('Failed to save comment', err);
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement ||
        e.ctrlKey || e.metaKey || e.altKey
      ) {
        return;
      }

      if (!isOpen || !article) return;

      const key = e.key.toLowerCase();
      if (key === 'escape') {
        onClose();
      } else if (key === 's') {
        e.preventDefault();
        onShare(e, article.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, article, onClose, onShare]);

  if (!isOpen || !article) return null;

  const bookmarked = isBookmarked(article.id);

  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 32));
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 12));

  const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Arabic', 'Hindi', 'Portuguese', 'Italian'];

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    setTargetLanguage(lang);
    
    if (lang === 'English') {
      setTranslatedContent(null);
      return;
    }

    if (!articleContent) return;

    setIsTranslating(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: articleContent, targetLanguage: lang }),
      });

      if (response.ok) {
        const data = await response.json();
        setTranslatedContent(data.translatedText);
      } else {
        setTranslatedContent(null);
        setTargetLanguage('English');
      }
    } catch (error) {
      console.error("Translation failed:", error);
      setTranslatedContent(null);
      setTargetLanguage('English');
    } finally {
      setIsTranslating(false);
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
      };
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  const handleStopAudio = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const cycleSpeed = () => {
    setPlaybackRate(prev => {
      const next = prev >= 2 ? 0.5 : prev + 0.25;
      if (isPlaying) {
        window.speechSynthesis.cancel();
        const textToSpeak = translatedContent || articleContent;
        const utterance = new SpeechSynthesisUtterance(`${article?.title ?? ''}. ${textToSpeak}`);
        utterance.rate = next;
        utterance.onend = () => {
          setIsPlaying(false);
          setIsPaused(false);
        };
        window.speechSynthesis.speak(utterance);
        if (isPaused) {
          window.speechSynthesis.pause();
        }
      }
      return next;
    });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const maxScroll = scrollHeight - clientHeight;
    
    if (maxScroll <= 0) {
      setScrollProgress(100);
    } else {
      setScrollProgress((scrollTop / maxScroll) * 100);
    }
  };

  const relatedArticles = React.useMemo(() => {
    if (!article || !allArticles) return [];
    const currentTags = article.tags || [];
    if (currentTags.length === 0) return [];

    return allArticles
      .filter((a) => a.id !== article.id)
      .map((a) => {
        const sharedTags = (a.tags || []).filter((tag) => currentTags.includes(tag)).length;
        return { article: a, sharedTags };
      })
      .filter((item) => item.sharedTags > 0)
      .sort((a, b) => b.sharedTags - a.sharedTags)
      .slice(0, 3)
      .map((item) => item.article);
  }, [article, allArticles]);

  const handleSummarize = async () => {
    if (!articleContent) return;
    setIsSummarizing(true);
    setSummary(null);
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: articleContent })
      });
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      setSummary(data.summary);
    } catch (err) {
      console.error(err);
      setSummary("AI Summary is currently unavailable in this environment. Please ensure the backend is connected and GEMINI_API_KEY is configured.");
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#0A0A0A] w-full max-w-3xl h-[90vh] md:h-[85vh] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        {/* Header Controls */}
        <div className="relative flex items-center justify-between p-4 border-b border-white/10 bg-[#080808]">
          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 h-0.5 bg-brand-secondary transition-all duration-150 ease-out z-10" style={{ width: `${scrollProgress}%` }} />
          
          <div className="flex items-center gap-2">
            <button onClick={decreaseFontSize} className="p-2 rounded-full hover:bg-white/10 text-white/70 transition-colors" title="Decrease Font Size">
              <ZoomOut size={18} />
            </button>
            <span className="text-xs text-white/50 w-8 text-center">{fontSize}px</span>
            <button onClick={increaseFontSize} className="p-2 rounded-full hover:bg-white/10 text-white/70 transition-colors" title="Increase Font Size">
              <ZoomIn size={18} />
            </button>
            <div className="w-px h-6 bg-white/10 mx-2"></div>
            <button onClick={handleToggleAudio} className="p-2 rounded-full hover:bg-white/10 text-brand-secondary transition-colors" title={isPlaying && !isPaused ? "Pause Audio" : "Play Audio"}>
              {isPlaying && !isPaused ? <Pause size={18} /> : <Play size={18} />}
            </button>
            {isPlaying && (
              <button onClick={handleStopAudio} className="p-2 rounded-full hover:bg-white/10 text-brand-error transition-colors" title="Stop Audio">
                <Square size={18} />
              </button>
            )}
            <button onClick={cycleSpeed} className="p-2 rounded-full hover:bg-white/10 text-brand-secondary transition-colors font-mono text-xs w-10 overflow-hidden" title="Playback Speed">
              {playbackRate}x
            </button>
            <div className="w-px h-6 bg-white/10 mx-2"></div>
            <select
              value={targetLanguage}
              onChange={handleLanguageChange}
              disabled={isTranslating}
              className="bg-transparent text-xs text-white/70 border border-white/20 rounded p-1 outline-none focus:border-brand-secondary w-24"
            >
              <option value="English" className="bg-[#0A0A0A]">Original</option>
              {LANGUAGES.filter(l => l !== 'English').map(lang => (
                <option key={lang} value={lang} className="bg-[#0A0A0A]">{lang}</option>
              ))}
            </select>
            {isTranslating && <span className="text-xs text-brand-secondary animate-pulse ml-1 opacity-70">Translating...</span>}
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => onShare(e, article.id)}
              className="p-2 rounded-full hover:bg-white/10 text-white/70 transition-colors"
              title="Share Article"
            >
              <Share2 size={18} className={copiedId === article.id ? "text-brand-success" : ""} />
            </button>
            <button 
              onClick={() => toggleBookmark(article)}
              className="p-2 rounded-full hover:bg-white/10 text-white/70 transition-colors"
              title="Bookmark Article"
            >
              {bookmarked ? <BookmarkCheck size={18} className="text-brand-secondary" /> : <Bookmark size={18} />}
            </button>
            <div className="w-px h-6 bg-white/10 mx-2"></div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white/70 transition-colors" title="Close Reading Mode">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Article Content */}
        <div className="flex-1 overflow-y-auto w-full nice-scroll" onScroll={handleScroll}>
          <div className="max-w-2xl mx-auto py-12 px-8">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs uppercase tracking-[0.3em] text-brand-secondary">{article.category}</span>
                <span className="text-xs text-white/40">•</span>
                <span className="text-xs uppercase tracking-widest text-white/40">{article.location}</span>
                <span className="text-xs text-white/40">•</span>
                <span className="text-xs font-bold text-brand-success bg-brand-success/10 px-2 py-0.5 rounded uppercase">{article.trustScore} Trust Score</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif text-brand-primary leading-tight mb-8">
                {article.title}
              </h1>
              
              <div className="mb-10 bg-brand-secondary/5 border border-brand-secondary/20 rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="bg-brand-secondary/20 p-2 rounded-lg">
                    <Sparkles className="text-brand-secondary" size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                       <h4 className="text-brand-secondary font-bold text-sm tracking-wide">AI SUMMARY</h4>
                       {!summary && (
                         <button 
                           onClick={handleSummarize}
                           disabled={isSummarizing}
                           className="text-xs bg-brand-secondary text-brand-surface-lowest px-3 py-1.5 rounded-full font-semibold hover:bg-white transition-colors disabled:opacity-50"
                         >
                           {isSummarizing ? "Summarizing..." : "Summarize"}
                         </button>
                       )}
                    </div>
                    {summary ? (
                      <div className="text-brand-primary text-sm space-y-2 mt-3 pl-2">
                        {summary.split('\n').filter(line => line.trim().length > 0).map((bullet, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-brand-secondary mt-1 text-[10px]">■</span>
                            <span>{bullet.replace(/^-\s*/, '').trim()}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-white/50 text-sm">Use Gemini API to instantly generate a quick, bulleted summary of this report.</p>
                    )}
                  </div>
                </div>
              </div>
              
              {article.imageUrl && (
                <div className="w-full h-64 md:h-80 rounded-xl overflow-hidden mb-10 border border-white/5">
                  <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div 
              className="font-sans text-white/80 leading-relaxed font-light" 
              style={{ fontSize: `${fontSize}px` }}
            >
              {(translatedContent || articleContent).split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="mb-6">{paragraph.trim()}</p>
              ))}
            </div>

            {/* Comments Section */}
            <div className="mt-16 pt-8 border-t border-white/10">
              <h3 className="text-xl font-serif text-brand-primary mb-6 flex items-center gap-2">
                <MessageSquare size={20} className="text-brand-secondary" /> 
                Discussion ({comments.length})
              </h3>

              <div className="space-y-6 mb-8">
                {comments.length === 0 ? (
                  <p className="text-white/40 italic text-sm">No comments yet. Be the first to share your thoughts!</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="bg-white/5 rounded-lg p-4 border border-white/5">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-brand-secondary/20 flex items-center justify-center text-brand-secondary text-xs font-bold">
                          {comment.author.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-white/80">{comment.author}</span>
                        <span className="text-xs text-white/40">•</span>
                        <span className="text-xs text-white/40">
                          {new Date(comment.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-white/70 text-sm leading-relaxed">{comment.text}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddComment} className="flex flex-col gap-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white/90 text-sm placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-brand-secondary/50 focus:border-brand-secondary resize-none"
                  rows={3}
                  required
                />
                <button
                  type="submit"
                  className="self-end bg-brand-primary text-brand-surface-lowest px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-primary-container transition-colors"
                >
                  Post Comment
                </button>
              </form>
            </div>

            {/* Related Articles Section */}
            {relatedArticles.length > 0 && (
              <div className="mt-16 pt-8 border-t border-white/10">
                <h3 className="text-xl font-serif text-brand-primary mb-6 flex items-center gap-2">
                  <Layers size={20} className="text-brand-secondary" /> 
                  Related Reports
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedArticles.map((relArticle) => (
                    <div key={relArticle.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col hover:bg-white/10 transition-colors cursor-pointer" onClick={() => {/* We could navigate, but simple display is fine for now */}}>
                      <div className="flex-1">
                        <h4 className="text-white font-serif font-bold text-sm mb-2 line-clamp-2 leading-snug">{relArticle.title}</h4>
                        {relArticle.tags && relArticle.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-auto">
                            {relArticle.tags.slice(0, 2).map((tag, idx) => (
                              <span key={idx} className="bg-brand-secondary/20 text-brand-secondary px-1.5 py-0.5 rounded text-[10px] font-medium">
                                #{tag.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
