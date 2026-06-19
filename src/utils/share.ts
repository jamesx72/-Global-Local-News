import React from 'react';

export const handleShareAction = async (
  e: React.SyntheticEvent | KeyboardEvent | null,
  id: string,
  title?: string,
  onCopySuccess?: (id: string) => void
) => {
  if (e && e.stopPropagation) e.stopPropagation();
  const url = `${window.location.origin}/article/${id}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: title || 'Global Local News',
        text: 'Check out this article on Global Local News',
        url: url,
      });
      return;
    } catch (error) {
      console.log('Share API error or user cancelled:', error);
    }
  }

  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(url);
    if (onCopySuccess) {
      onCopySuccess(id);
    }
  } catch (error) {
    console.error('Failed to copy text: ', error);
  }
};
