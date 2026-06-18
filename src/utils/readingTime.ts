export const getReadingTime = (content?: string): number => {
  if (!content) return 1;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
};
