import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import protectedRoutes from "./routes/protected.js";
import aiRoutes from "./routes/ai.js";
import aiStreamRoutes from "./routes/aiStream.js";
import aiSummarizeRoutes from "./routes/aiSummarize.js";
import aiAnalyzeRoutes from "./routes/aiAnalyze.js";
import aiPdfSummarizeRoutes from "./routes/aiPdfSummarize.js";
import multipart from "@fastify/multipart";

dotenv.config();

const app = Fastify({ logger: true });

app.register(cors, { origin: "*" });
app.register(multipart, {
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB
  },
});

// JSON BODY PARSER (IMPORTANT)
app.addContentTypeParser(
  "application/json",
  { parseAs: "string" },
  function (req, body, done) {
    try {
      const json = JSON.parse(body);
      done(null, json);
    } catch (err) {
      done(err, undefined);
    }
  }
);

app.register(authRoutes, { prefix: "/auth" });
app.register(protectedRoutes, { prefix: "/secure" });
app.register(aiRoutes, { prefix: "/ai" });
app.register(aiStreamRoutes, { prefix: "/ai" });
app.register(aiSummarizeRoutes, { prefix: "/ai" });
app.register(aiAnalyzeRoutes, { prefix: "/ai" });
app.register(aiPdfSummarizeRoutes, { prefix: "/ai" });
app.get("/", async () => ({ message: "Backend is running 🚀" }));

const start = async () => {
  await app.listen({ port: 5000 });
  console.log("Server running on http://localhost:5000");
};
start();