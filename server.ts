import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for live news feeds (RSS)
  app.get("/api/news/trending", async (req, res) => {
    try {
      const Parser = (await import('rss-parser')).default;
      const parser = new Parser({
        customFields: {
          item: [
            ['media:content', 'mediaContent'],
            ['description', 'description']
          ],
        }
      });
      
      const feedsToFetch = [
        { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', category: 'World News' },
        { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', category: 'Technology' },
        { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml', category: 'Science' },
        { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', category: 'Business' }
      ];

      const feedPromises = feedsToFetch.map(async (feedInfo) => {
        try {
          const feed = await parser.parseURL(feedInfo.url);
          return feed.items.map((item, index) => {
            let imageUrl = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80';
            if (item.mediaContent && item.mediaContent['$'] && item.mediaContent['$'].url) {
              imageUrl = item.mediaContent['$'].url;
            }

            return {
              id: `live-${feedInfo.category.toLowerCase()}-${index}-${Date.now()}`,
              category: feedInfo.category,
              title: item.title || 'Untitled',
              location: 'Global',
              imageUrl,
              trustScore: 95, // Assumed for NYT
              readingTime: Math.max(3, Math.floor(Math.random() * 5) + 2), // Mock reading time
              content: item.contentSnippet || item.content || item.description || '',
              timestamp: item.pubDate,
              tags: Array.isArray(item.categories)
                ? item.categories.map((c: any) => typeof c === 'string' ? c : (c?._ || c?.domain || String(c)))
                : [feedInfo.category]
            };
          });
        } catch (err) {
          console.error(`Failed to fetch ${feedInfo.url}`, err);
          return [];
        }
      });

      const allArticlesArrays = await Promise.all(feedPromises);
      let allArticles = allArticlesArrays.flat();
      
      // Sort by publication date, newest first
      allArticles.sort((a, b) => {
        const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return dateB - dateA;
      });

      res.json({ articles: allArticles });
    } catch (error) {
      console.error("Failed to fetch live news:", error);
      res.status(500).json({ error: "Failed to fetch live news" });
    }
  });

  // API Route for article summarization (Streaming)
  app.post("/api/summarize", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "No text provided" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API Key is not configured." });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Summarize the following article text into exactly 3 concise bullet points. Each bullet point MUST start with a dash (-) and a space.\n\nText:\n${text}`;
      
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      try {
        const responseStream = await ai.models.generateContentStream({
          model: "gemini-2.5-flash",
          contents: prompt
        });
        
        for await (const chunk of responseStream) {
          if (chunk.text) {
            res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
          }
        }
        res.write('data: [DONE]\n\n');
        res.end();
      } catch (err: any) {
        console.error("Stream generation error:", err);
        res.write(`data: ${JSON.stringify({ text: "\n\nError: Summary currently unavailable due to high API demand." })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      }
    } catch (error) {
      console.error("Summarization error:", error);
      if (!res.headersSent) {
        res.status(503).json({ error: "Summarization service is currently unavailable. Please try again later." });
      } else {
        res.end();
      }
    }
  });

  // API Route for article categorization
  app.post("/api/categorize", async (req, res) => {
    try {
      const { title, content } = req.body;
      if (!title) {
        return res.status(400).json({ error: "No title provided" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API Key is not configured." });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      let response;
      const prompt = `Given the following news article title and content, generate up to 3 short tags or categories (e.g., Tech, Politics, Global, Local, Health, Environment) as a comma-separated list.
Title: ${title}
Content: ${content || 'No content provided'}`;

      try {
        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt
        });
      } catch (err: any) {
        // Wait before fallback
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
          response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: prompt
          });
        } catch (fallbackErr: any) {
          // Fall back to rule-based tags if AI is unavailable to ensure resilient UI
          const fallbackTags = [];
          const lowerTitle = title.toLowerCase();
          if (lowerTitle.includes('tech') || lowerTitle.includes('software') || lowerTitle.includes('ai')) fallbackTags.push('Tech');
          if (lowerTitle.includes('politi') || lowerTitle.includes('govern') || lowerTitle.includes('election')) fallbackTags.push('Politics');
          if (lowerTitle.includes('market') || lowerTitle.includes('stock') || lowerTitle.includes('economy')) fallbackTags.push('Business');
          if (fallbackTags.length === 0) fallbackTags.push('General');
          return res.json({ tags: fallbackTags });
        }
      }

      const tagsRaw = response.text || '';
      const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3);
      
      res.json({ tags });
    } catch (error) {
      console.error("Categorization error:", error);
      res.json({ tags: [] }); // Graceful degradation for categorization so the feed resolves
    }
  });

  // API Route for article AI categorization/tagging
  app.post("/api/tags", async (req, res) => {
    try {
      const { title, content } = req.body;
      if (!title) {
        return res.status(400).json({ error: "No title provided" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API Key is not configured." });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Analyze the tone and subject of the following news article. Provide exactly 3 short, relevant tags (e.g., Politics, Tech, Environment). Return ONLY a comma-separated list of the tags.\n\nTitle: ${title}\nContent: ${content || 'No content provided'}`;

      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt
        });
      } catch (err: any) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
          response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: prompt
          });
        } catch (fallbackErr: any) {
          return res.json({ tags: [] });
        }
      }

      const tagsRaw = response.text || '';
      const tags = tagsRaw.split(',').map(t => t.trim().replace(/[^a-zA-Z0-9\s-]/g, '')).filter(t => t.length > 0 && t.length <= 20).slice(0, 3);
      
      res.json({ tags });
    } catch (error) {
      console.error("Tags error:", error);
      res.json({ tags: [] });
    }
  });

  // API Route for article translation
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, targetLanguage } = req.body;
      
      if (!text || !targetLanguage) {
        return res.status(400).json({ error: "Text and targetLanguage are required." });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API Key is not configured." });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Translate the following article text into ${targetLanguage}. Maintain the original markdown formatting and structure. Do not include any conversational filler.\n\nText:\n${text}`;

      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt
        });
      } catch (err: any) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
          response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: prompt
          });
        } catch (fallbackErr: any) {
           return res.status(500).json({ error: "Translation failed." });
        }
      }

      res.json({ translatedText: response.text });
    } catch (error) {
      console.error("Translation error:", error);
      res.status(500).json({ error: "Translation failed." });
    }
  });

  // API Route for article sentiment analysis
  app.post("/api/sentiment", async (req, res) => {
    try {
      const { title, content } = req.body;
      if (!title) {
        return res.status(400).json({ error: "No title provided" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API Key is not configured." });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Analyze the tone and sentiment of the following news article. Respond with EXACTLY ONE of the following words: Positive, Neutral, or Critical.\n\nTitle: ${title}\nContent: ${content || 'No content provided'}`;

      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt
        });
      } catch (err: any) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
          response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: prompt
          });
        } catch (fallbackErr: any) {
          return res.json({ sentiment: "Neutral" });
        }
      }

      const sentimentRaw = response.text || '';
      const sentiment = sentimentRaw.replace(/[^a-zA-Z]/g, '').trim() || "Neutral";
      
      res.json({ sentiment });
    } catch (error) {
      console.error("Sentiment error:", error);
      res.json({ sentiment: "Neutral" }); // Graceful degradation
    }
  });

  // API Route for article verification using Google Search Grounding
  app.post("/api/verify", async (req, res) => {
    try {
      const { title, content } = req.body;
      if (!title) {
        return res.status(400).json({ error: "No title provided" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API Key is not configured." });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      // The user specifically requested gemini-3.5-flash
      const prompt = `Fact check the following news report using Google Search data. 
Title: ${title}
Content: ${content || ''}
Provide a brief fact-check summary and determine if it is TRUE, FALSE, or UNVERIFIABLE based on recent search results.`;

      let response;
      try {
        response = await ai.models.generateContent({
          // Try gemini-3.5-flash as explicitly requested by user
          model: "gemini-3.5-flash", 
          contents: prompt,
          // @ts-ignore: GoogleSearch tool bypass for TS limitation
          tools: [{ googleSearch: {} }]
        });
      } catch (e) {
        console.warn("gemini-3.5-flash unavailable, falling back to gemini-1.5-pro...");
        try {
          // Fallback to gemini-1.5-pro for search tool support
          response = await ai.models.generateContent({
            model: "gemini-1.5-pro",
            contents: prompt,
            // @ts-ignore: GoogleSearch tool bypass for TS limitation
            tools: [{ googleSearch: {} }]
          });
        } catch (e2) {
          console.warn("gemini-1.5-pro unavailable, falling back to gemini-2.5-flash...");
          response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
          });
        }
      }
      
      const text = response.text || "Fact check unavailable.";
      const metadata = response.candidates?.[0]?.groundingMetadata;
      const links = metadata?.groundingChunks?.map((chunk: any) => chunk.web?.uri).filter(Boolean) || [];

      res.json({ result: text, sources: links });
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({ error: "Failed to verify report via Google Search" });
    }
  });

  // API Route for article chat (Streaming)
  app.post("/api/chat/article", async (req, res) => {
    try {
      const { message, articleTitle, articleContent, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "No message provided" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API Key is not configured." });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const systemInstruction = `You are a helpful AI assistant answering questions about a specific article. 
Use the following article as your primary context:
Title: ${articleTitle}
Content: ${articleContent}

If the user greets you or asks a general question, you can answer politely, but try to tie it back to the article if possible. If the user asks a question that cannot be answered using the article's context, mention that the article does not provide that information, but you can try to provide a general answer.`;

      const formattedHistory = history ? history.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })) : [];

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      try {
        const chat = ai.chats.create({
          model: "gemini-2.5-flash",
          config: {
            systemInstruction: systemInstruction,
          },
          history: formattedHistory
        });

        const responseStream = await chat.sendMessageStream({
          message: message
        });
        
        for await (const chunk of responseStream) {
           if (chunk.text) {
             res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
           }
        }
        res.write('data: [DONE]\n\n');
        res.end();
      } catch (err: any) {
        console.error("Chat generation error:", err);
        res.write(`data: ${JSON.stringify({ text: "\n\nError: Chat is currently unavailable due to high API demand." })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      }
    } catch (error) {
      console.error("Chat error:", error);
      if (!res.headersSent) {
        res.status(503).json({ error: "Chat service is currently unavailable. Please try again later." });
      } else {
        res.end();
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve static files from dist
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
