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
      const prompt = `Provide a single-sentence summary of the following article text:\n\n${text}`;
      
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
