import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { MessageSquare, Send, User as UserIcon } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

interface Comment {
  id: string;
  userId: string;
  authorName: string;
  text: string;
  createdAt: Date | null;
}

export default function CommentsSection({ articleId }: { articleId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState(auth.currentUser);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((u) => {
      setUser(u);
    });

    const commentsRef = collection(db, 'articles', articleId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'desc'));

    const unsubscribeComments = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map((doc) => {
        const data = doc.data();
        let date = null;
        if (data.createdAt) {
          date = (data.createdAt as Timestamp).toDate();
        }
        return {
          id: doc.id,
          userId: data.userId,
          authorName: data.authorName,
          text: data.text,
          createdAt: date,
        } as Comment;
      });
      setComments(fetchedComments);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `articles/${articleId}/comments`);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeComments();
    };
  }, [articleId]);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'articles', articleId, 'comments'), {
        userId: user.uid,
        authorName: user.displayName || 'Anonymous Reader',
        text: newComment.trim(),
        createdAt: serverTimestamp(),
      });
      setNewComment('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `articles/${articleId}/comments`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-prose mx-auto mt-16 pb-16">
      <div className="flex items-center gap-2 mb-8 border-b border-brand-outline-variant pb-4">
        <MessageSquare className="text-brand-primary" size={24} />
        <h2 className="text-2xl font-serif font-bold text-brand-primary">Comments ({comments.length})</h2>
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-10 bg-brand-surface-lowest p-4 rounded-2xl border border-brand-outline shadow-sm">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
              <UserIcon size={20} className="text-brand-primary" />
            </div>
            <div className="flex-grow">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full bg-transparent border-none outline-none resize-none text-brand-on-surface placeholder:text-brand-on-surface/40 min-h-[80px]"
                maxLength={1000}
                required
              />
              <div className="flex justify-end mt-2 pt-2 border-t border-brand-outline-variant">
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="flex items-center gap-2 bg-brand-primary text-brand-surface-lowest px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-primary/90 transition-colors"
                >
                  {isSubmitting ? 'Posting...' : 'Post Comment'} <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-10 bg-brand-surface-lowest p-8 rounded-2xl border border-brand-outline shadow-sm text-center">
          <p className="text-brand-on-surface/70 mb-4">Join the conversation to share your thoughts.</p>
          <button
            onClick={handleSignIn}
            className="inline-flex items-center gap-2 bg-brand-primary text-brand-surface-lowest px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wide hover:shadow-lg transition-all"
          >
            Sign in to Comment
          </button>
        </div>
      )}

      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-brand-on-surface/50 italic text-center py-8">No comments yet. Be the first to share your perspective.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-secondary/20 flex items-center justify-center flex-shrink-0 text-brand-secondary font-bold font-serif uppercase">
                {comment.authorName.charAt(0)}
              </div>
              <div className="flex-grow">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-bold text-brand-on-surface text-sm">{comment.authorName}</span>
                  <span className="text-xs text-brand-on-surface/50">
                    {comment.createdAt ? comment.createdAt.toLocaleDateString() : 'Just now'}
                  </span>
                </div>
                <p className="text-brand-on-surface/80 text-sm leading-relaxed whitespace-pre-wrap">{comment.text}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
