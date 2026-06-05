import fetch from "node-fetch";
import { verifyToken } from "../middlewares/verifyToken.js";

export default async function aiRoutes(app) {
  app.post("/chat", { preHandler: verifyToken }, async (req, reply) => {
    const { message } = req.body;

    if (!message) {
      return reply.status(400).send({ error: "Message is required" });
    }

    try {
      const response = await fetch(process.env.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.API_KEY}`,
          "X-API-KEY": process.env.API_KEY
        },
        body: JSON.stringify({
          model: process.env.MODEL_NAME || "gpt-4o-mini",
          messages: [{ role: "user", content: message }],
          temperature: 0.7,
          top_p: 1.0,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const errTxt = await response.text();
        console.log("AI PROVIDER ERROR:", errTxt);
        return reply.status(500).send({ error: "LLM provider error", details: errTxt });
      }

      const data = await response.json();
      return data.choices[0].message.content;

    } catch (error) {
      console.log("AI ERROR:", error);
      return reply.status(500).send({ error: "AI request failed", details: error.message });
    }
  });
}