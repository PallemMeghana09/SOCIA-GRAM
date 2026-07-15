import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set up high limit for base64 image payloads
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ limit: "15mb", extended: true }));

  // API endpoint for Image Recognition/Validation
  app.post("/api/validate-image", async (req, res) => {
    try {
      const { category, photoUrl, reportType } = req.body;

      if (!photoUrl) {
        return res.status(400).json({
          isValid: false,
          reason: "No image file provided.",
          confidence: 0,
        });
      }

      // Check if API key is configured
      if (!process.env.GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY is not set. Bypassing image verification with auto-approve.");
        return res.json({
          isValid: true,
          reason: "Verification bypassed: Gemini API Key is not configured in Secrets.",
          confidence: 1.0,
        });
      }

      // Parse mimeType and base64 data from data URL
      const match = photoUrl.match(/^data:([^;]+);base64,(.+)$/);
      let mimeType = "image/jpeg";
      let base64Data = photoUrl;
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      }

      const client = getGeminiClient();

      const imagePart = {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      };

      const targetField = reportType === "transport" ? "Transportation Request / Village Name Board" : category;

      const promptText = `
        You are a strict, smart civic validation AI for the public complaints portal 'Socia Gram'.
        Your job is to analyze the user-uploaded image and verify if it represents or contains evidence related to the selected category: "${targetField}".

        Guidelines for validation:
        1. If the category is 'Road Damage', the image MUST show potholes, severely cracked roads, broken tarmac, or blocked/damaged street pathways.
        2. If the category is 'Garbage & Waste', the image MUST show piles of trash, litter, dumpsters, rubbish piles, or illegal waste dumping in a community space.
        3. If the category is 'Drainage/Sewage', the image MUST show leaking sewers, clogged gutters, sewage overflows, flooded drainage channels, or toxic/stagnant dirty water puddles.
        4. If the category is 'Water Supply', the image MUST show water leaks, broken public taps, dry or rusted municipal tanks, muddy/dirty tap water, or public water pipe bursts.
        5. If the category is 'School/Public Building', the image MUST show public schools, village halls, government buildings, or civic spaces displaying structural issues (e.g., broken walls, cracked ceilings, collapsed plaster, broken windows, unmaintained offices).
        6. If the category is 'Streetlight/Electricity', the image MUST show electrical poles, streetlights, hanging/loose wires, sparked transformers, or broken/exposed power boxes.
        7. If the category is 'Transportation Request' or 'Transportation Request / Village Name Board', the image MUST depict a village name board, public transport bus, rural transport vehicle, bus stop, or transport pathway.
        8. If the category is 'Other', the image MUST show a genuine physical civic, environmental, or community infrastructure issue in a neighborhood.
        9. INVALID IMAGES: If the image is completely unrelated, generic, indoor household items unrelated to civic infrastructure, selfies, food/meals, abstract screens/diagrams, memes, digital text/document screenshots, or fully black/white/blank/extremely blurry, you MUST set "isValid" to false.

        Be constructive but strict. If an image is completely unrelated to the selected category, mark "isValid" as false.
        
        Return a JSON response matching the required schema.
      `;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts: [imagePart, { text: promptText }] },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isValid: {
                type: Type.BOOLEAN,
                description: "True if the image matches or is genuinely related to the chosen category/field, false otherwise.",
              },
              reason: {
                type: Type.STRING,
                description: "A polite, user-friendly 1-sentence explanation of the validation outcome. Mention what the image shows.",
              },
              confidence: {
                type: Type.NUMBER,
                description: "Confidence value between 0.0 and 1.0.",
              },
            },
            required: ["isValid", "reason", "confidence"],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response from Gemini API");
      }

      const result = JSON.parse(responseText.trim());
      console.log(`Validation result for category "${targetField}":`, result);
      return res.json(result);

    } catch (error: any) {
      console.error("Error in /api/validate-image:", error);
      // Return true with a warning as safety fallback so users aren't locked out of submissions due to transient API errors
      return res.status(200).json({
        isValid: true,
        reason: "Image auto-approved due to a temporary verification check bypass.",
        confidence: 0.5,
        error: error.message,
      });
    }
  });

  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
