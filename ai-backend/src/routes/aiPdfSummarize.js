import fetch from "node-fetch";
// import { verifyToken } from "../middlewares/verifyToken.js";
import { extractTextFromPDF } from "../utils/pdfExtract.js";

export default async function aiPdfSummarizeRoutes(app) {
  app.post(
    "/summarize-pdf",
    // { preHandler: verifyToken },
    async (req, reply) => {
      try {
        const file = await req.file();
        if (!file) {
          return reply.status(400).send({ error: "No PDF file provided" });
        }

        const pdfBuffer = await file.toBuffer();

        // Extract text using pdf2json
        const extractedText = await extractTextFromPDF(pdfBuffer);

        if (!extractedText.trim()) {
          return reply.status(400).send({
            error: "Unable to extract text from PDF"
          });
        }

        const safeText = extractedText.substring(0, 8000);

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
                content: `Summarize the following PDF content in 10-15 lines:\n\n${safeText}`,
              },
            ],
            max_tokens: 700,
          }),
        });

        const data = await response.json();
        const summary = data?.choices?.[0]?.message?.content;

        return { summary };
      } catch (error) {
        console.log("PDF Summarize Error:", error);
        return reply.status(500).send({
          error: "Unexpected server error",
          details: error.message,
        });
      }
    }
  );
}