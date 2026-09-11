import mongoose from "mongoose";

const aiDocumentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    healthRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HealthRecord",
      default: null,
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },

    fileType: {
      type: String,
      required: true,
      trim: true,
    },

    mimeType: {
      type: String,
      default: "",
      trim: true,
    },

    extractedText: {
      type: String,
      default: "",
    },

    summary: {
      type: String,
      default: "",
    },

    // ─────────────────────────────────────
    // RAG CHUNKS + EMBEDDINGS
    // ─────────────────────────────────────

    chunks: {
      type: [
        {
          text: {
            type: String,
            default: "",
          },

          chunkIndex: {
            type: Number,
            default: 0,
          },

          embedding: {
            type: [Number],
            default: [],
          },
        },
      ],
      default: [],
    },

    // ─────────────────────────────────────
    // DOCUMENT Q&A MEMORY
    // ─────────────────────────────────────

    conversations: {
      type: [
        {
          question: {
            type: String,
            required: true,
          },

          answer: {
            type: String,
            required: true,
          },

          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },

    // ─────────────────────────────────────
    // STATUS
    // ─────────────────────────────────────

    status: {
      type: String,
      enum: [
        "uploaded",
        "processing",
        "analyzed",
        "failed",
      ],
      default: "uploaded",
    },

    errorMessage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// ─────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────

aiDocumentSchema.index({
  patientId: 1,
  createdAt: -1,
});

aiDocumentSchema.index({
  healthRecordId: 1,
});

aiDocumentSchema.index({
  status: 1,
});

// ─────────────────────────────────────────────
// SAFE MODEL CREATION
// ─────────────────────────────────────────────

const AIDocument =
  mongoose.models.AIDocument ||
  mongoose.model(
    "AIDocument",
    aiDocumentSchema
  );

export default AIDocument;