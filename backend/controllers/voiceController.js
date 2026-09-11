import "dotenv/config";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ─────────────────────────────────────────────────────────────────────────────
// LANGUAGE NORMALIZATION
// Groq Whisper expects ISO-style language codes, e.g. "hi", not "Hindi".
// ─────────────────────────────────────────────────────────────────────────────

const LANGUAGE_MAP = {
  auto: null,

  en: "en",
  english: "en",

  hi: "hi",
  hindi: "hi",

  bn: "bn",
  bengali: "bn",

  gu: "gu",
  gujarati: "gu",

  kn: "kn",
  kannada: "kn",

  ml: "ml",
  malayalam: "ml",

  mr: "mr",
  marathi: "mr",

  or: "or",
  odia: "or",
  oriya: "or",

  pa: "pa",
  punjabi: "pa",

  ta: "ta",
  tamil: "ta",

  te: "te",
  telugu: "te",

  ur: "ur",
  urdu: "ur",

  as: "as",
  assamese: "as",
};

function normalizeLanguage(language) {
  if (!language) {
    return null;
  }

  const key = String(language)
    .trim()
    .toLowerCase();

  return LANGUAGE_MAP[key] ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai/transcribe
// ─────────────────────────────────────────────────────────────────────────────

export const transcribeAudio = async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        message: "GROQ_API_KEY is not configured.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No audio file was uploaded.",
      });
    }

    // Frontend may send either:
    // "hi"
    // "Hindi"
    // "auto"
    //
    // We always normalize it before sending to Whisper.
    const requestedLanguage = normalizeLanguage(
      req.body?.language
    );

    console.log(
      "VOICE REQUEST LANGUAGE:",
      req.body?.language
    );

    console.log(
      "NORMALIZED WHISPER LANGUAGE:",
      requestedLanguage || "auto"
    );

    const file = new File(
      [req.file.buffer],
      req.file.originalname || "voice.webm",
      {
        type: req.file.mimetype || "audio/webm",
      }
    );

    const transcription =
      await groq.audio.transcriptions.create({
        file,

        model: "whisper-large-v3",

        response_format: "verbose_json",

        // Only send language when explicitly known.
        // For auto-detect, omit the parameter completely.
        ...(requestedLanguage
          ? {
              language: requestedLanguage,
            }
          : {}),

        temperature: 0,
      });

    const text =
      transcription?.text?.trim() || "";

    if (!text) {
      return res.status(400).json({
        message:
          "No speech could be detected in the recording.",
      });
    }

    // Whisper normally returns ISO code.
    // Normalize again just to be safe.
    const detectedLanguage =
      normalizeLanguage(
        transcription?.language
      ) ||
      requestedLanguage ||
      "en";

    console.log(
      "TRANSCRIBED TEXT:",
      text
    );

    console.log(
      "DETECTED LANGUAGE:",
      detectedLanguage
    );

    return res.json({
      text,

      // Always return a language CODE.
      // Example: "hi", never "Hindi".
      detectedLanguage,
    });
  } catch (error) {
    console.error(
      "VOICE TRANSCRIPTION ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error?.message ||
        "Unable to transcribe audio.",
    });
  }
};