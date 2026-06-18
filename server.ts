import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for article summarization
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
      let response;
      const prompt = `Summarize the following article text into exactly 3 concise bullet points. Each bullet point MUST start with a dash (-) and a space.\n\nText:\n${text}`;
      
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
        } catch (fbErr: any) {
          return res.json({ summary: "Summary currently unavailable due to high API demand. Please read the full article." });
        }
      }

      res.json({ summary: response.text });
    } catch (error) {
      console.error("Summarization error:", error);
      res.status(503).json({ error: "Summarization service is currently unavailable. Please try again later." });
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
          tools: [{ googleSearch: {} }]
        });
      } catch (e) {
        console.warn("gemini-3.5-flash unavailable, falling back to gemini-2.5-pro...");
        // Fallback to gemini-2.5-pro for search tool support
        response = await ai.models.generateContent({
          model: "gemini-2.5-pro",
          contents: prompt,
          tools: [{ googleSearch: {} }]
        });
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
