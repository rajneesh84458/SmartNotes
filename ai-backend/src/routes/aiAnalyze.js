import fetch from "node-fetch";
import { verifyToken } from "../middlewares/verifyToken.js";

export default async function aiAnalyzeRoutes(app) {
  app.post(
    "/analyze",
    { preHandler: verifyToken },
    async (req, reply) => {
      const { text } = req.body;

      if (!text) {
        return reply
          .status(400)
          .send({ error: "Text is required for analysis." });
      }

      try {
        const response = await fetch(process.env.API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": process.env.API_KEY,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "user",
                content: `
Analyze the following text deeply and return a clean JSON object with:

{
  "summary": "...",
  "keywords": [],
  "sentiment": "positive | neutral | negative",
  "bulletPoints": [],
  "category": "Technology | Finance | Education | General | Other"
}

TEXT:
${text}
                `,
              },
            ],
            temperature: 0.3,
            top_p: 0.9,
            max_tokens: 800,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.log("ANALYZE ERROR:", errText);
          return reply
            .status(500)
            .send({ error: "Analysis failed", details: errText });
        }

        const data = await response.json();
        const output = data.choices[0].message.content;

        let jsonOutput;

        try {
          jsonOutput = JSON.parse(output);
        } catch (e) {
          // fallback cleanup if AI sends slightly messy JSON
          jsonOutput = JSON.parse(
            output.replace(/```json/g, "").replace(/```/g, "")
          );
        }

        return jsonOutput;

      } catch (error) {
        console.error("AI Analyze Error:", error);
        return reply
          .status(500)
          .send({ error: "AI Analyze Error", details: error.message });
      }
    }
  );
}