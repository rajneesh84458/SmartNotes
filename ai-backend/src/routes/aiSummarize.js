import fetch from "node-fetch";
import { verifyToken } from "../middlewares/verifyToken.js";

export default async function aiSummarizeRoutes(app) {
  app.post(
    "/summarize",
    // { preHandler: verifyToken },
    async (req, reply) => {
      const { text } = req.body;

      if (!text) {
        return reply
          .status(400)
          .send({ error: "Text is required for summarization" });
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
                content: `Summarize the following text in 5–7 lines:\n\n${text}`,
              },
            ],
            temperature: 0.5,
            top_p: 0.9,
            max_tokens: 500,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.log("SUMMARY ERROR:", errText);
          return reply
            .status(500)
            .send({ error: "Summarization failed", details: errText });
        }

        const data = await response.json();
        const summary = data.choices[0].message.content;

        return { summary };

      } catch (error) {
        console.error("AI Summarize Error:", error);
        return reply
          .status(500)
          .send({ error: "AI Summarize Error", details: error.message });
      }
    }
  );
}