import fs from "fs/promises";
import { PDFParse } from "pdf-parse";
import Tesseract from "tesseract.js";
import { pipeline } from "@xenova/transformers";

// ─────────────────────────────────────────────────────────────────────────────
// EMBEDDING MODEL
// ─────────────────────────────────────────────────────────────────────────────

let embeddingPipeline = null;

const getEmbeddingPipeline = async () => {
  if (!embeddingPipeline) {
    console.log("Loading embedding model...");

    embeddingPipeline = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );

    console.log("Embedding model loaded.");
  }

  return embeddingPipeline;
};

// ─────────────────────────────────────────────────────────────────────────────
// PDF TEXT EXTRACTION
// pdf-parse v2 API
// ─────────────────────────────────────────────────────────────────────────────

export const extractPdfText = async (filePath) => {
  const buffer = await fs.readFile(filePath);

  console.log("Reading PDF:", filePath);
  console.log("PDF size:", buffer.length, "bytes");

  const parser = new PDFParse({
    data: buffer,
  });

  try {
    const result = await parser.getText();

    const text = result?.text?.trim() || "";

    console.log(
      "Extracted PDF text length:",
      text.length
    );

    return text;
  } finally {
    await parser.destroy();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE OCR
// ─────────────────────────────────────────────────────────────────────────────

export const extractImageText = async (filePath) => {
  console.log("Running OCR:", filePath);

  const result = await Tesseract.recognize(
    filePath,
    "eng+hin",
    {
      logger: (info) => {
        if (
          info.status === "recognizing text" &&
          info.progress
        ) {
          console.log(
            `OCR progress: ${Math.round(
              info.progress * 100
            )}%`
          );
        }
      },
    }
  );

  const text =
    result?.data?.text?.trim() || "";

  console.log(
    "Extracted OCR text length:",
    text.length
  );

  return text;
};

// ─────────────────────────────────────────────────────────────────────────────
// GENERIC DOCUMENT EXTRACTION
// ─────────────────────────────────────────────────────────────────────────────

export const extractDocumentText = async (
  filePath,
  mimeType
) => {
  if (mimeType === "application/pdf") {
    return extractPdfText(filePath);
  }

  if (
    mimeType === "image/jpeg" ||
    mimeType === "image/png"
  ) {
    return extractImageText(filePath);
  }

  throw new Error(
    `Unsupported document type: ${mimeType}`
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CLEAN TEXT
// ─────────────────────────────────────────────────────────────────────────────

const cleanText = (text) => {
  return text
    .replace(/\r/g, " ")
    .replace(/\t/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

// ─────────────────────────────────────────────────────────────────────────────
// CHUNK DOCUMENT
// ─────────────────────────────────────────────────────────────────────────────

export const createChunks = (
  text,
  chunkSize = 900,
  overlap = 150
) => {
  const cleaned = cleanText(text);

  if (!cleaned) {
    return [];
  }

  const chunks = [];

  let start = 0;
  let chunkIndex = 0;

  while (start < cleaned.length) {
    const end = Math.min(
      start + chunkSize,
      cleaned.length
    );

    const chunk = cleaned
      .slice(start, end)
      .trim();

    if (chunk) {
      chunks.push({
        text: chunk,
        chunkIndex,
      });
    }

    if (end >= cleaned.length) {
      break;
    }

    start = end - overlap;
    chunkIndex++;
  }

  console.log(
    "Created chunks:",
    chunks.length
  );

  return chunks;
};

// ─────────────────────────────────────────────────────────────────────────────
// CREATE EMBEDDING
// ─────────────────────────────────────────────────────────────────────────────

export const createEmbedding = async (
  text
) => {
  const extractor =
    await getEmbeddingPipeline();

  const output = await extractor(
    text,
    {
      pooling: "mean",
      normalize: true,
    }
  );

  return Array.from(
    output.data
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// EMBED CHUNKS
// ─────────────────────────────────────────────────────────────────────────────

export const embedChunks = async (
  chunks
) => {
  const result = [];

  for (
    const chunk of chunks
  ) {
    const embedding =
      await createEmbedding(
        chunk.text
      );

    result.push({
      text: chunk.text,
      chunkIndex:
        chunk.chunkIndex,
      embedding,
    });
  }

  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// COSINE SIMILARITY
// ─────────────────────────────────────────────────────────────────────────────

export const cosineSimilarity = (
  a,
  b
) => {
  if (
    !a?.length ||
    !b?.length ||
    a.length !== b.length
  ) {
    return 0;
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (
    let i = 0;
    i < a.length;
    i++
  ) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (
    normA === 0 ||
    normB === 0
  ) {
    return 0;
  }

  return (
    dot /
    (
      Math.sqrt(normA) *
      Math.sqrt(normB)
    )
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH RELEVANT CHUNKS
// ─────────────────────────────────────────────────────────────────────────────

export const searchChunks = async (
  chunks,
  query,
  topK = 4
) => {
  if (
    !Array.isArray(chunks) ||
    chunks.length === 0
  ) {
    return [];
  }

  const queryEmbedding =
    await createEmbedding(
      query
    );

  const scored = chunks.map(
    (chunk) => ({
      ...chunk,

      score:
        cosineSimilarity(
          queryEmbedding,
          chunk.embedding
        ),
    })
  );

  scored.sort(
    (a, b) =>
      b.score - a.score
  );

  return scored
    .slice(0, topK)
    .filter(
      (chunk) =>
        chunk.score > 0.15
    );
};