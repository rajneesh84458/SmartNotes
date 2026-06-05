import PDFParser from "pdf2json";

export const extractTextFromPDF = (buffer) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (err) => {
      reject(err.parserError);
    });

    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      const pages = pdfData?.formImage?.Pages || [];
      let extracted = "";

      pages.forEach((page) => {
        page.Texts.forEach((text) => {
          const line = decodeURIComponent(
            text.R.map((t) => t.T).join("")
          );
          extracted += line + " ";
        });
      });

      resolve(extracted);
    });

    pdfParser.parseBuffer(buffer);
  });
};