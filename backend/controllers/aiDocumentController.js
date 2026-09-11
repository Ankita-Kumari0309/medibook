import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import Groq from "groq-sdk";

import AIDocument from "../models/AIDocument.js";

import {
  extractDocumentText,
  createChunks,
  embedChunks,
  searchChunks,
} from "../services/aiDocumentService.js";

// ─────────────────────────────────────────────────────────────────────────────
// GROQ CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = "openai/gpt-oss-120b";

// ─────────────────────────────────────────────────────────────────────────────
// FILE TYPE
// ─────────────────────────────────────────────────────────────────────────────

const getFileType = (mimeType) => {
  switch (mimeType) {
    case "application/pdf":
      return "pdf";

    case "image/jpeg":
      return "jpg";

    case "image/png":
      return "png";

    default:
      return "unknown";
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY PARSER
// No JSON response format is used.
// ─────────────────────────────────────────────────────────────────────────────

const parseSummary = (raw) => {
  const text = String(raw || "").trim();

  const getSection = (label) => {
    const regex = new RegExp(
      `^${label}:\\s*([\\s\\S]*?)(?=\\n[A-Z_ ]+:|$)`,
      "im"
    );

    const match = text.match(regex);

    return match
      ? match[1].trim()
      : "";
  };

  const documentType =
    getSection("DOCUMENT_TYPE");

  const overview =
    getSection("OVERVIEW");

  const keyFindingsText =
    getSection("KEY_FINDINGS");

  const importantValuesText =
    getSection("IMPORTANT_VALUES");

  const medicinesMentionedText =
    getSection("MEDICINES_MENTIONED");

  const doctorRecommendationsText =
    getSection(
      "DOCTOR_RECOMMENDATIONS"
    );

  const followUpInformationText =
    getSection(
      "FOLLOW_UP_INFORMATION"
    );

  const toArray = (value) => {
    if (
      !value ||
      value.trim().toLowerCase() ===
        "none"
    ) {
      return [];
    }

    return value
      .split(/\s*\|\s*|\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  };

  return {
    documentType:
      documentType ||
      "Medical document",

    overview:
      overview ||
      "No summary available.",

    keyFindings:
      toArray(keyFindingsText),

    importantValues:
      toArray(importantValuesText),

    medicinesMentioned:
      toArray(
        medicinesMentionedText
      ),

    doctorRecommendations:
      toArray(
        doctorRecommendationsText
      ),

    followUpInformation:
      toArray(
        followUpInformationText
      ),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// GENERATE SUMMARY
// ─────────────────────────────────────────────────────────────────────────────

const generateSummary = async (
  text
) => {
  const prompt = `
You are MediBook AI Document Assistant.

Explain a medical document to a patient in simple language.

Use ONLY information explicitly present in the document.

Do NOT:
- diagnose a condition
- prescribe medicine
- recommend treatment
- invent information
- infer missing information

Return EXACTLY these lines:

DOCUMENT_TYPE: type of document
OVERVIEW: short patient-friendly overview
KEY_FINDINGS: finding 1 | finding 2
IMPORTANT_VALUES: value 1 | value 2
MEDICINES_MENTIONED: medicine 1 | medicine 2
DOCTOR_RECOMMENDATIONS: recommendation 1 | recommendation 2
FOLLOW_UP_INFORMATION: information 1 | information 2

If a section has no information, leave it empty.

DOCUMENT:

${text}
`;

  const response =
    await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.1,
      max_tokens: 700,

      messages: [
        {
          role: "system",
          content:
            "Return only the requested tagged format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

  const raw =
    response.choices?.[0]
      ?.message?.content
      ?.trim();

  if (!raw) {
    throw new Error(
      "AI returned an empty summary."
    );
  }

  console.log(
    "RAW DOCUMENT SUMMARY:",
    raw
  );

  return parseSummary(raw);
};

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD + ANALYZE
// POST /api/ai-documents/upload
// ─────────────────────────────────────────────────────────────────────────────

export const uploadAndAnalyzeDocument =
  async (req, res) => {
    let createdDocument = null;

    try {
      // ─────────────────────────────────
      // ROLE CHECK
      // ─────────────────────────────────

      if (
        req.user?.role !==
        "patient"
      ) {
        return res.status(403).json({
          message:
            "Only patients can upload AI documents.",
        });
      }

      // ─────────────────────────────────
      // GROQ KEY CHECK
      // ─────────────────────────────────

      if (
        !process.env.GROQ_API_KEY
      ) {
        return res.status(500).json({
          message:
            "GROQ_API_KEY is not configured.",
        });
      }

      // ─────────────────────────────────
      // FILE CHECK
      // ─────────────────────────────────

      if (!req.file) {
        return res.status(400).json({
          message:
            "Please upload a PDF, JPG, or PNG file.",
        });
      }

      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
      ];

      if (
        !allowedTypes.includes(
          req.file.mimetype
        )
      ) {
        return res.status(400).json({
          message:
            "Only PDF, JPG, and PNG files are supported.",
        });
      }

      // ─────────────────────────────────
      // FILE INFORMATION
      // ─────────────────────────────────

      const fileName =
        req.file.originalname;

      const fileUrl =
        `/uploads/${req.file.filename}`;

      const fileType =
        getFileType(
          req.file.mimetype
        );

      // ─────────────────────────────────
      // CREATE DOCUMENT
      // Status: uploaded → processing
      // ─────────────────────────────────

      createdDocument =
        await AIDocument.create({
          patientId:
            req.user.id,

          fileName,

          fileUrl,

          fileType,

          mimeType:
            req.file.mimetype,

          status:
            "processing",

          extractedText:
            "",

          summary:
            "",

          chunks:
            [],

          conversations:
            [],

          errorMessage:
            "",
        });

      // ─────────────────────────────────
      // EXTRACT TEXT
      // ─────────────────────────────────

      const extractedText =
        await extractDocumentText(
          req.file.path,
          req.file.mimetype
        );

      if (
        !extractedText ||
        extractedText.trim().length <
          20
      ) {
        createdDocument.status =
          "failed";

        createdDocument.errorMessage =
          "Could not extract enough text from this document.";

        await createdDocument.save();

        return res.status(422).json({
          message:
            "I could not read enough text from this document. For scanned PDFs, try uploading a clear image or a text-based PDF.",
        });
      }

      // ─────────────────────────────────
      // AI SUMMARY
      // ─────────────────────────────────

      const summary =
        await generateSummary(
          extractedText
        );

      // ─────────────────────────────────
      // CREATE CHUNKS
      // ─────────────────────────────────

      const rawChunks =
        createChunks(
          extractedText
        );

      if (
        !Array.isArray(
          rawChunks
        ) ||
        rawChunks.length === 0
      ) {
        throw new Error(
          "Unable to create document chunks."
        );
      }

      // ─────────────────────────────────
      // EMBEDDINGS
      // ─────────────────────────────────

      const embeddedChunks =
        await embedChunks(
          rawChunks
        );

      if (
        !Array.isArray(
          embeddedChunks
        ) ||
        embeddedChunks.length === 0
      ) {
        throw new Error(
          "Unable to create document embeddings."
        );
      }

      // ─────────────────────────────────
      // SAVE ANALYSIS
      // Status: processing → analyzed
      // ─────────────────────────────────

      createdDocument.extractedText =
        extractedText;

      createdDocument.summary =
        JSON.stringify(
          summary
        );

      createdDocument.chunks =
        embeddedChunks;

      createdDocument.status =
        "analyzed";

      createdDocument.errorMessage =
        "";

      await createdDocument.save();

      // ─────────────────────────────────
      // RESPONSE
      // ─────────────────────────────────

      return res.status(201).json({
        message:
          "Document analyzed successfully.",

        document: {
          id:
            createdDocument._id,

          name:
            createdDocument.fileName,

          fileName:
            createdDocument.fileName,

          fileUrl:
            createdDocument.fileUrl,

          fileType:
            createdDocument.fileType,

          mimeType:
            createdDocument.mimeType,

          summary,

          status:
            createdDocument.status,
        },
      });
    } catch (error) {
      console.error(
        "AI DOCUMENT ERROR:",
        error
      );

      // ─────────────────────────────────
      // SAVE FAILURE
      // ─────────────────────────────────

      if (createdDocument) {
        try {
          createdDocument.status =
            "failed";

          createdDocument.errorMessage =
            error?.message ||
            "Document analysis failed.";

          await createdDocument.save();
        } catch (saveError) {
          console.error(
            "FAILED TO SAVE DOCUMENT ERROR:",
            saveError
          );
        }
      }

      return res.status(500).json({
        message:
          error?.message ||
          "Unable to analyze document.",
      });
    }
  };

// ─────────────────────────────────────────────────────────────────────────────
// GET DOCUMENT
// GET /api/ai-documents/:documentId
// ─────────────────────────────────────────────────────────────────────────────

export const getAIDocument =
  async (req, res) => {
    try {
      const document =
        await AIDocument.findOne({
          _id:
            req.params.documentId,

          patientId:
            req.user.id,
        }).lean();

      if (!document) {
        return res.status(404).json({
          message:
            "Document not found.",
        });
      }

      let summary = {};

      try {
        summary =
          document.summary
            ? JSON.parse(
                document.summary
              )
            : {};
      } catch (error) {
        console.warn(
          "SUMMARY PARSE WARNING:",
          error.message
        );

        summary = {};
      }

      return res.json({
        id:
          document._id,

        name:
          document.fileName,

        fileName:
          document.fileName,

        fileUrl:
          document.fileUrl,

        fileType:
          document.fileType,

        mimeType:
          document.mimeType,

        summary,

        status:
          document.status,

        errorMessage:
          document.errorMessage ||
          "",

        createdAt:
          document.createdAt,
      });
    } catch (error) {
      console.error(
        "GET AI DOCUMENT ERROR:",
        error
      );

      return res.status(500).json({
        message:
          error?.message ||
          "Unable to retrieve document.",
      });
    }
  };

// ─────────────────────────────────────────────────────────────────────────────
// ASK QUESTION
// POST /api/ai-documents/:documentId/ask
// ─────────────────────────────────────────────────────────────────────────────

export const askAboutDocument =
  async (req, res) => {
    try {
      // ─────────────────────────────────
      // ROLE
      // ─────────────────────────────────

      if (
        req.user?.role !==
        "patient"
      ) {
        return res.status(403).json({
          message:
            "Only patients can ask questions about documents.",
        });
      }

      // ─────────────────────────────────
      // QUESTION
      // ─────────────────────────────────

      const {
        question,
      } = req.body;

      if (
        !question ||
        !question.trim()
      ) {
        return res.status(400).json({
          message:
            "Please enter a question.",
        });
      }

      // ─────────────────────────────────
      // DOCUMENT
      // IMPORTANT: analyzed, NOT ready
      // ─────────────────────────────────

      const document =
        await AIDocument.findOne({
          _id:
            req.params.documentId,

          patientId:
            req.user.id,

          status:
            "analyzed",
        }).lean();

      if (!document) {
        return res.status(404).json({
          message:
            "Analyzed document not found.",
        });
      }

      // ─────────────────────────────────
      // RAG SEARCH
      // ─────────────────────────────────

      const relevantChunks =
        await searchChunks(
          document.chunks || [],
          question.trim(),
          4
        );

      if (
        !Array.isArray(
          relevantChunks
        ) ||
        relevantChunks.length ===
          0
      ) {
        return res.json({
          answer:
            "I could not find enough information about that in the uploaded document.",

          sources: [],
        });
      }

      // ─────────────────────────────────
      // BUILD CONTEXT
      // ─────────────────────────────────

      const context =
        relevantChunks
          .map(
            (
              chunk,
              index
            ) =>
              `[Source ${
                index + 1
              }]\n${chunk.text || ""}`
          )
          .join(
            "\n\n"
          );

      // ─────────────────────────────────
      // PROMPT
      // ─────────────────────────────────

      const prompt = `
You are MediBook AI Document Assistant.

Answer the patient's question ONLY using the supplied document context.

Rules:
- Do not diagnose.
- Do not prescribe medicines.
- Do not give treatment instructions.
- Do not invent information.
- If the answer is not present in the context, clearly say that it is not available in the uploaded document.
- Explain difficult medical terminology in simple language.
- Keep the response concise.
- Mention source numbers when useful.

DOCUMENT CONTEXT:

${context}

PATIENT QUESTION:

${question.trim()}
`;

      // ─────────────────────────────────
      // AI ANSWER
      // ─────────────────────────────────

      const response =
        await groq.chat.completions.create({
          model: MODEL,

          temperature: 0.1,

          max_tokens: 700,

          messages: [
            {
              role: "system",
              content:
                "Answer only from the supplied document context.",
            },

            {
              role: "user",
              content: prompt,
            },
          ],
        });

      const answer =
        response.choices?.[0]
          ?.message?.content
          ?.trim();

      // ─────────────────────────────────
      // SAVE CONVERSATION MEMORY
      // ─────────────────────────────────

      if (answer) {
        await AIDocument.updateOne(
          {
            _id:
              document._id,

            patientId:
              req.user.id,

            status:
              "analyzed",
          },

          {
            $push: {
              conversations: {
                question:
                  question.trim(),

                answer,

                createdAt:
                  new Date(),
              },
            },
          }
        );
      }

      // ─────────────────────────────────
      // RESPONSE
      // ─────────────────────────────────

      return res.json({
        answer:
          answer ||
          "I could not generate an answer from the uploaded document.",

        sources:
          relevantChunks.map(
            (chunk) => ({
              chunk:
                Number(
                  chunk.chunkIndex
                ) + 1,

              score:
                typeof chunk.score ===
                "number"
                  ? Number(
                      chunk.score.toFixed(
                        3
                      )
                    )
                  : null,

              preview:
                chunk.text
                  ? chunk.text.slice(
                      0,
                      180
                    )
                  : "",
            })
          ),
      });
    } catch (error) {
      console.error(
        "AI DOCUMENT Q&A ERROR:",
        error
      );

      return res.status(500).json({
        message:
          error?.message ||
          "Unable to answer the question.",
      });
    }
  };

// ─────────────────────────────────────────────────────────────────────────────
// DELETE DOCUMENT
// DELETE /api/ai-documents/:documentId
// ─────────────────────────────────────────────────────────────────────────────

export const deleteAIDocument =
  async (req, res) => {
    try {
      const document =
        await AIDocument.findOne({
          _id:
            req.params.documentId,

          patientId:
            req.user.id,
        });

      if (!document) {
        return res.status(404).json({
          message:
            "Document not found.",
        });
      }

      // ─────────────────────────────────
      // DELETE LOCAL FILE
      // ─────────────────────────────────

      try {
        if (document.fileUrl) {
          const relativePath =
            document.fileUrl.replace(
              /^\/+/,
              ""
            );

          const absolutePath =
            path.join(
              process.cwd(),
              relativePath
            );

          await fs.unlink(
            absolutePath
          );
        }
      } catch (fileError) {
        console.warn(
          "DOCUMENT FILE DELETE WARNING:",
          fileError.message
        );
      }

      // ─────────────────────────────────
      // DELETE DATABASE RECORD
      // ─────────────────────────────────

      await document.deleteOne();

      return res.json({
        message:
          "AI document deleted successfully.",
      });
    } catch (error) {
      console.error(
        "DELETE AI DOCUMENT ERROR:",
        error
      );

      return res.status(500).json({
        message:
          error?.message ||
          "Unable to delete document.",
      });
    }
  };