import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { Article } from '../hooks/useBookmarks';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface ArticleChatProps {
  article: Article;
}

export default function ArticleChat({ article }: ArticleChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { id: Date.now().toString(), role: 'user', text: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    const modelMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: modelMessageId, role: 'model', text: '' }]);

    try {
      const response = await fetch('/api/chat/article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          articleTitle: article.title,
          articleContent: article.content || '',
          history: messages.map(msg => ({ role: msg.role, text: msg.text }))
        })
      });

      if (!response.ok) throw new Error('API error');
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Stream read error');

      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.substring(6);
              if (dataStr === '[DONE]') {
                done = true;
                break;
              }
              try {
                 const data = JSON.parse(dataStr);
                 if (data.text) {
                   setMessages(prev => prev.map(msg => 
                     msg.id === modelMessageId 
                       ? { ...msg, text: msg.text + data.text } 
                       : msg
                   ));
                 }
              } catch (err) {
                 // ignore parsing errors for partial chunks
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => prev.map(msg => 
        msg.id === modelMessageId 
          ? { ...msg, text: "Sorry, I couldn't reach the assistant right now. Please try again later." } 
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-16 pt-8 border-t border-brand-outline-variant">
      <h3 className="text-xl font-serif text-brand-primary mb-2 flex items-center gap-2">
        <Sparkles size={20} className="text-brand-secondary" /> 
        Ask Assistant
      </h3>
      <p className="text-gray-500 text-sm mb-6">Ask questions about this report and Gemini will answer using its context.</p>

      <div className="bg-brand-surface-low border border-brand-outline-variant rounded-xl overflow-hidden flex flex-col h-[400px]">
        <div className="flex-1 overflow-y-auto p-4 nice-scroll flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center flex-1 h-full text-gray-400 text-sm italic">
              Try asking: "What are the main takeaways?", or "Who is mentioned?"
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'self-end bg-brand-primary text-white ml-auto' : 'self-start bg-brand-surface-lowest border border-brand-outline-variant text-brand-primary mr-auto'} rounded-2xl px-4 py-3 shadow-sm`}>
                {msg.role === 'model' && (
                  <div className="shrink-0 pt-1">
                    <Bot size={16} className="text-brand-secondary" />
                  </div>
                )}
                <div className={`text-sm ${msg.role === 'user' ? 'leading-relaxed' : 'markdown-body text-brand-primary'}`}>
                  {msg.role === 'model' ? (
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="self-start bg-brand-surface-lowest border border-brand-outline-variant rounded-2xl px-4 py-3 flex gap-2 items-center">
               <Bot size={16} className="text-brand-secondary animate-pulse" />
               <span className="text-brand-secondary text-xs animate-pulse">Typing...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-3 border-t border-brand-outline-variant bg-brand-surface-lowest">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask a question about the article..."
              className="flex-1 bg-brand-surface border border-brand-outline-variant rounded-full px-4 py-2 text-sm text-brand-primary placeholder:text-gray-400 focus:outline-none focus:border-brand-secondary/50 focus:bg-brand-surface-low transition-all"
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-brand-secondary text-brand-surface-lowest p-2 rounded-full hover:bg-brand-secondary/90 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[40px]"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
