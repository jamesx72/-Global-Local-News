import React, { useState, useEffect } from 'react';
import { Activity, Minus, AlertCircle } from 'lucide-react';

interface SentimentIndicatorProps {
  title: string;
  content: string;
}

export default function SentimentIndicator({ title, content }: SentimentIndicatorProps) {
  const [sentiment, setSentiment] = useState<string>('Analyzing...');

  useEffect(() => {
    let mounted = true;
    let didRequest = false;

    const fetchSentiment = async () => {
      if (didRequest) return;
      didRequest = true;

      try {
        const response = await fetch('/api/sentiment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content: content || '' }),
        });

        if (!response.ok) {
          if (mounted) setSentiment('Neutral');
          return;
        }

        const data = await response.json();
        if (mounted) {
          setSentiment(data.sentiment || 'Neutral');
        }
      } catch (err) {
        if (mounted) setSentiment('Neutral');
      }
    };

    fetchSentiment();

    return () => {
      mounted = false;
    };
  }, [title, content]);

  if (sentiment === 'Analyzing...') {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-surface-low border border-brand-outline-variant rounded-full animate-pulse mt-2">
        <Activity size={12} className="text-gray-400" />
        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Analyzing...</span>
      </div>
    );
  }

  const sentimentConfig: Record<string, { color: string, icon: React.ReactNode, bgColor: string, borderColor: string }> = {
    'Positive': { 
      color: 'text-brand-success', 
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      icon: <Activity size={12} className="text-brand-success" /> 
    },
    'Neutral': { 
      color: 'text-gray-500', 
      bgColor: 'bg-brand-surface-low',
      borderColor: 'border-brand-outline-variant',
      icon: <Minus size={12} className="text-gray-500" /> 
    },
    'Critical': { 
      color: 'text-brand-error', 
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      icon: <AlertCircle size={12} className="text-brand-error" /> 
    }
  };

  const config = sentimentConfig[sentiment] || sentimentConfig['Neutral'];

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 ${config.bgColor} border ${config.borderColor} rounded-full mt-2 w-max`}>
      {config.icon}
      <span className={`text-[10px] uppercase tracking-wider font-bold ${config.color}`}>
        {sentiment}
      </span>
    </div>
  );
}
