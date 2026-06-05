import fetch from "node-fetch";
import { verifyToken } from "../middlewares/verifyToken.js";

export default async function aiStreamRoutes(app) {
  app.post(
    "/stream",
    { preHandler: verifyToken },
    async (req, reply) => {
      const { message } = req.body;

      if (!message) {
        return reply.status(400).send({ error: "Message is required" });
      }

      // Set headers for streaming (Server-Sent Events)
      reply.raw.setHeader("Content-Type", "text/event-stream");
      reply.raw.setHeader("Cache-Control", "no-cache");
      reply.raw.setHeader("Connection", "keep-alive");

      try {
        const response = await fetch(process.env.API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": process.env.API_KEY
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: message }],
            stream: true,          // MUST ENABLE STREAMING
            temperature: 0.8,
            top_p: 0.9,
            max_tokens: 1000
          })
        });

        if (!response.ok) {
          const errTxt = await response.text();
          return reply.status(500).send({
            error: "LLM provider error",
            details: errTxt,
          });
        }

        // Read streaming chunks
        for await (const chunk of response.body) {
          // Convert Buffer → String
          const text = chunk.toString("utf8");

          // Send chunk to client (React Native)
          reply.raw.write(`data: ${text}\n\n`);
        }

        reply.raw.end();

      } catch (error) {
        console.log("STREAM ERROR:", error);
        reply.raw.end();
      }
    }
  );
}