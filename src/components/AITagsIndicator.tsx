import React, { useState, useEffect } from 'react';
import { Tag } from 'lucide-react';

interface AITagsIndicatorProps {
  title: string;
  content: string;
  fallbackTags?: string[];
}

export default function AITagsIndicator({ title, content, fallbackTags = [] }: AITagsIndicatorProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let didRequest = false;

    const fetchTags = async () => {
      if (didRequest) return;
      didRequest = true;
      setIsLoading(true);

      try {
        const response = await fetch('/api/tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content: content || '' }),
        });

        if (!response.ok) {
          if (mounted) {
            setTags(fallbackTags);
            setIsLoading(false);
          }
          return;
        }

        const data = await response.json();
        if (mounted) {
          if (data.tags && data.tags.length > 0) {
            setTags(data.tags);
          } else {
            setTags(fallbackTags);
          }
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setTags(fallbackTags);
          setIsLoading(false);
        }
      }
    };

    fetchTags();

    return () => {
      mounted = false;
    };
  }, [title, content, fallbackTags]);

  if (isLoading) {
    return (
        <div className="flex flex-wrap gap-2 mb-4 mt-4">
          <div className="bg-brand-surface-low text-transparent w-16 h-6 px-2 py-1 rounded border border-brand-outline-variant animate-pulse">
            Loading
          </div>
          <div className="bg-brand-surface-low text-transparent w-20 h-6 px-2 py-1 rounded border border-brand-outline-variant animate-pulse delay-75">
            Loading
          </div>
        </div>
    );
  }

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4 mt-4">
      {tags.map((tag, idx) => (
        <span key={idx} className="bg-brand-surface-low text-brand-primary px-2 py-1 rounded text-xs font-medium border border-brand-outline-variant flex items-center gap-1">
          <Tag size={10} className="text-brand-secondary" />
          {tag.toUpperCase()}
        </span>
      ))}
    </div>
  );
}
