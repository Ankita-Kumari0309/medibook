import "dotenv/config";
import Groq from "groq-sdk";
import User from "../models/User.js";

// ─────────────────────────────────────────────────────────────────────────────
// GROQ
// ─────────────────────────────────────────────────────────────────────────────

const MODEL = "openai/gpt-oss-120b";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ─────────────────────────────────────────────────────────────────────────────
// SPECIALITIES
// ─────────────────────────────────────────────────────────────────────────────

const SPECIALITIES = [
  "Cardiology",
  "Dermatology",
  "ENT",
  "Gastroenterology",
  "General Physician",
  "Neurology",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Urology",
];

// ─────────────────────────────────────────────────────────────────────────────
// LANGUAGES
// ─────────────────────────────────────────────────────────────────────────────

const LANGUAGE_NAMES = {
  en: "English",
  hi: "Hindi",
  bn: "Bengali",
  gu: "Gujarati",
  kn: "Kannada",
  ml: "Malayalam",
  mr: "Marathi",
  or: "Odia",
  pa: "Punjabi",
  ta: "Tamil",
  te: "Telugu",
  ur: "Urdu",
  as: "Assamese",
};

// ─────────────────────────────────────────────────────────────────────────────
// DETERMINISTIC QUESTIONS
// ─────────────────────────────────────────────────────────────────────────────

const QUESTIONS = {
  symptoms: {
    en: "What symptoms are you experiencing?",
    hi: "आपको कौन-कौन से लक्षण हो रहे हैं?",
    bn: "আপনার কী কী উপসর্গ হচ্ছে?",
    gu: "તમને કયા કયા લક્ષણો થઈ રહ્યા છે?",
    kn: "ನೀವು ಯಾವ ಯಾವ ಲಕ್ಷಣಗಳನ್ನು ಅನುಭವಿಸುತ್ತಿದ್ದೀರಿ?",
    ml: "നിങ്ങൾക്ക് എന്തെല്ലാം ലക്ഷണങ്ങളാണ് അനുഭവപ്പെടുന്നത്?",
    mr: "तुम्हाला कोणती कोणती लक्षणे जाणवत आहेत?",
    or: "ଆପଣଙ୍କୁ କେଉଁ କେଉଁ ଲକ୍ଷଣ ହେଉଛି?",
    pa: "ਤੁਹਾਨੂੰ ਕਿਹੜੇ ਕਿਹੜੇ ਲੱਛਣ ਹੋ ਰਹੇ ਹਨ?",
    ta: "உங்களுக்கு என்னென்ன அறிகுறிகள் உள்ளன?",
    te: "మీకు ఏ ఏ లక్షణాలు ఉన్నాయి?",
    ur: "آپ کو کون کون سی علامات ہو رہی ہیں؟",
    as: "আপোনাৰ কি কি লক্ষণ দেখা দিছে?",
  },

  duration: {
    en: "How long have you been experiencing these symptoms?",
    hi: "आपको ये लक्षण कितने समय से हो रहे हैं?",
    bn: "আপনার এই উপসর্গগুলো কতদিন ধরে হচ্ছে?",
    gu: "તમને આ લક્ષણો કેટલા સમયથી થઈ રહ્યા છે?",
    kn: "ನೀವು ಈ ಲಕ್ಷಣಗಳನ್ನು ಎಷ್ಟು ಸಮಯದಿಂದ ಅನುಭವಿಸುತ್ತಿದ್ದೀರಿ?",
    ml: "നിങ്ങൾക്ക് ഈ ലക്ഷണങ്ങൾ എത്ര കാലമായി അനുഭവപ്പെടുന്നു?",
    mr: "तुम्हाला ही लक्षणे किती दिवसांपासून होत आहेत?",
    or: "ଆପଣଙ୍କୁ ଏହି ଲକ୍ଷଣଗୁଡ଼ିକ କେତେ ଦିନ ହେଲା ହେଉଛି?",
    pa: "ਤੁਹਾਨੂੰ ਇਹ ਲੱਛਣ ਕਿੰਨੇ ਸਮੇਂ ਤੋਂ ਹਨ?",
    ta: "இந்த அறிகுறிகள் உங்களுக்கு எவ்வளவு காலமாக உள்ளன?",
    te: "మీకు ఈ లక్షణాలు ఎంతకాలంగా ఉన్నాయి?",
    ur: "آپ کو یہ علامات کتنے عرصے سے ہیں؟",
    as: "আপোনাৰ এই লক্ষণবোৰ কিমান দিন ধৰি হৈ আছে?",
  },

  severity: {
    en: "How would you describe the severity of your symptoms: mild, moderate, or severe?",
    hi: "आप अपने लक्षणों की गंभीरता को कैसे बताएंगे: हल्की, मध्यम या तेज़?",
    bn: "আপনার উপসর্গের তীব্রতা কেমন: হালকা, মাঝারি নাকি তীব্র?",
    gu: "તમારા લક્ષણોની તીવ્રતા કેવી છે: હળવી, મધ્યમ કે વધારે?",
    kn: "ನಿಮ್ಮ ಲಕ್ಷಣಗಳ ತೀವ್ರತೆಯನ್ನು ಹೇಗೆ ವಿವರಿಸುತ್ತೀರಿ: ಸೌಮ್ಯ, ಮಧ್ಯಮ ಅಥವಾ ತೀವ್ರ?",
    ml: "നിങ്ങളുടെ ലക്ഷണങ്ങളുടെ തീവ്രത എങ്ങനെയാണ്: ലഘുവോ, മിതമായതോ, അതോ ഗുരുതരമോ?",
    mr: "तुमच्या लक्षणांची तीव्रता कशी आहे: सौम्य, मध्यम की तीव्र?",
    or: "ଆପଣଙ୍କ ଲକ୍ଷଣର ତୀବ୍ରତା କେମିତି: ହାଲୁକା, ମଧ୍ୟମ କିମ୍ବା ଅଧିକ?",
    pa: "ਤੁਹਾਡੇ ਲੱਛਣਾਂ ਦੀ ਤੀਬਰਤਾ ਕਿਹੋ ਜਿਹੀ ਹੈ: ਹਲਕੀ, ਦਰਮਿਆਨੀ ਜਾਂ ਗੰਭੀਰ?",
    ta: "உங்கள் அறிகுறிகளின் தீவிரம் எப்படி உள்ளது: லேசானதா, மிதமானதா அல்லது கடுமையானதா?",
    te: "మీ లక్షణాల తీవ్రత ఎలా ఉంది: తేలికపాటి, మధ్యస్థ లేదా తీవ్రమైనదా?",
    ur: "آپ کی علامات کی شدت کیسی ہے: ہلکی، درمیانی یا شدید؟",
    as: "আপোনাৰ লক্ষণবোৰৰ তীব্ৰতা কেনেকুৱা: মৃদু, মধ্যম নে তীব্ৰ?",
  },

  associatedSymptoms: {
    en: "Are you experiencing any other symptoms along with these?",
    hi: "क्या आपको इन लक्षणों के साथ कोई और लक्षण भी हो रहे हैं?",
    bn: "এই উপসর্গগুলোর সঙ্গে কি আপনার আর কোনো উপসর্গ হচ্ছে?",
    gu: "આ લક્ષણો સાથે તમને અન્ય કોઈ લક્ષણો પણ થઈ રહ્યા છે?",
    kn: "ಈ ಲಕ್ಷಣಗಳ ಜೊತೆಗೆ ನೀವು ಬೇರೆ ಯಾವುದಾದರೂ ಲಕ್ಷಣಗಳನ್ನು ಅನುಭವಿಸುತ್ತಿದ್ದೀರಾ?",
    ml: "ഈ ലക്ഷണങ്ങളോടൊപ്പം മറ്റേതെങ്കിലും ലക്ഷണങ്ങൾ അനുഭവപ്പെടുന്നുണ്ടോ?",
    mr: "या लक्षणांसोबत तुम्हाला आणखी काही लक्षणे जाणवत आहेत का?",
    or: "ଏହି ଲକ୍ଷଣଗୁଡ଼ିକ ସହିତ ଆପଣଙ୍କୁ ଆଉ କୌଣସି ଲକ୍ଷଣ ହେଉଛି କି?",
    pa: "ਕੀ ਇਹਨਾਂ ਲੱਛਣਾਂ ਦੇ ਨਾਲ ਤੁਹਾਨੂੰ ਹੋਰ ਕੋਈ ਲੱਛਣ ਵੀ ਹਨ?",
    ta: "இந்த அறிகுறிகளுடன் வேறு ஏதேனும் அறிகுறிகள் உள்ளனவா?",
    te: "ఈ లక్షణాలతో పాటు మీకు ఇంకేమైనా లక్షణాలు ఉన్నాయా?",
    ur: "کیا ان علامات کے ساتھ آپ کو کوئی اور علامات بھی ہو رہی ہیں؟",
    as: "এই লক্ষণবোৰৰ লগতে আন কোনো লক্ষণো হৈছে নেকি?",
  },
};

const MAX_FOLLOW_UP_QUESTIONS = 3;

// ─────────────────────────────────────────────────────────────────────────────
// LANGUAGE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const isSupportedLanguage = (code) => {
  return (
    typeof code === "string" &&
    Object.prototype.hasOwnProperty.call(
      LANGUAGE_NAMES,
      code
    )
  );
};

const normalizeLanguage = (language) => {
  if (typeof language !== "string") {
    return "en";
  }

  const clean = language
    .trim()
    .toLowerCase();

  return isSupportedLanguage(clean)
    ? clean
    : "en";
};

const getLanguageName = (language) => {
  return (
    LANGUAGE_NAMES[
      normalizeLanguage(language)
    ] || "English"
  );
};

const getQuestion = (
  topic,
  language
) => {
  const lang =
    normalizeLanguage(language);

  return (
    QUESTIONS[topic]?.[lang] ||
    QUESTIONS[topic]?.en
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CONVERSATION HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const cleanConversation = (
  messages = []
) => {
  return messages
    .filter(
      (item) =>
        item &&
        ["user", "assistant"].includes(
          item.role
        ) &&
        typeof item.content ===
          "string" &&
        item.content.trim()
    )
    .map((item) => ({
      role: item.role,
      content:
        item.content.trim(),
    }));
};

const countFollowUpQuestions = (
  messages = []
) => {
  const assistantMessages =
    messages.filter(
      (item) =>
        item.role === "assistant"
    );

  // First assistant message = welcome.
  return Math.max(
    assistantMessages.length - 1,
    0
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SCRIPT LANGUAGE DETECTION
// ─────────────────────────────────────────────────────────────────────────────

const detectScriptLanguage = (
  text
) => {
  if (!text) {
    return null;
  }

  if (/[\u0980-\u09FF]/.test(text)) {
    return "bn";
  }

  if (/[\u0A80-\u0AFF]/.test(text)) {
    return "gu";
  }

  if (/[\u0C80-\u0CFF]/.test(text)) {
    return "kn";
  }

  if (/[\u0D00-\u0D7F]/.test(text)) {
    return "ml";
  }

  if (/[\u0B00-\u0B7F]/.test(text)) {
    return "or";
  }

  if (/[\u0A00-\u0A7F]/.test(text)) {
    return "pa";
  }

  if (/[\u0B80-\u0BFF]/.test(text)) {
    return "ta";
  }

  if (/[\u0C00-\u0C7F]/.test(text)) {
    return "te";
  }

  if (/[\u0600-\u06FF]/.test(text)) {
    return "ur";
  }

  if (/[\u0900-\u097F]/.test(text)) {
    return "devanagari";
  }

  if (
    /^[\x00-\x7F\s.,!?'"():;\-]+$/.test(
      text
    )
  ) {
    return "en";
  }

  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// HINDI / MARATHI DETECTION
// ─────────────────────────────────────────────────────────────────────────────

const detectDevanagariLanguage =
  async (text) => {
    try {
      const response =
        await groq.chat.completions.create({
          model: MODEL,
          temperature: 0,
          max_tokens: 10,

          messages: [
            {
              role: "system",
              content: `
Identify whether this Devanagari text is Hindi or Marathi.

Return only:
hi
or
mr

No explanation.
              `.trim(),
            },
            {
              role: "user",
              content: text,
            },
          ],
        });

      const result =
        response.choices?.[0]
          ?.message?.content
          ?.trim()
          ?.toLowerCase();

      if (
        result === "hi" ||
        result === "mr"
      ) {
        return result;
      }
    } catch (error) {
      console.error(
        "DEVANAGARI LANGUAGE ERROR:",
        error.message
      );
    }

    return "hi";
  };

// ─────────────────────────────────────────────────────────────────────────────
// GENERAL LANGUAGE DETECTION
// ─────────────────────────────────────────────────────────────────────────────

const detectConversationLanguage =
  async (text) => {
    if (!text?.trim()) {
      return "en";
    }

    const scriptResult =
      detectScriptLanguage(text);

    console.log(
      "SCRIPT LANGUAGE RESULT:",
      scriptResult
    );

    if (
      scriptResult &&
      scriptResult !==
        "devanagari"
    ) {
      return scriptResult;
    }

    if (
      scriptResult ===
      "devanagari"
    ) {
      return detectDevanagariLanguage(
        text
      );
    }

    try {
      const response =
        await groq.chat.completions.create({
          model: MODEL,
          temperature: 0,
          max_tokens: 10,

          messages: [
            {
              role: "system",
              content: `
Detect the language.

Allowed:
en
hi
bn
gu
kn
ml
mr
or
pa
ta
te
ur
as

Return only the language code.
              `.trim(),
            },
            {
              role: "user",
              content: text,
            },
          ],
        });

      const detected =
        response.choices?.[0]
          ?.message?.content
          ?.trim()
          ?.toLowerCase();

      if (
        isSupportedLanguage(
          detected
        )
      ) {
        return detected;
      }
    } catch (error) {
      console.error(
        "LANGUAGE DETECTION ERROR:",
        error.message
      );
    }

    return "en";
  };

// ─────────────────────────────────────────────────────────────────────────────
// PARSE SIMPLE TAGGED PATIENT STATE
//
// NO JSON.
// NO response_format.
// NO structured output.
// ─────────────────────────────────────────────────────────────────────────────

const parsePatientStateText = (
  raw
) => {
  const text =
    String(raw || "").trim();

  console.log(
    "RAW PATIENT EXTRACTION:",
    text
  );

  const getLine = (
    label
  ) => {
    const regex =
      new RegExp(
        `^${label}:\\s*(.*)$`,
        "im"
      );

    const match =
      text.match(regex);

    return match
      ? match[1].trim()
      : "";
  };

  const symptomsText =
    getLine("SYMPTOMS");

  const duration =
    getLine("DURATION");

  const severityRaw =
    getLine("SEVERITY");

  const associatedText =
    getLine("ASSOCIATED");

  const providedRaw =
    getLine(
      "ASSOCIATED_PROVIDED"
    ).toLowerCase();

  // Symptoms
  const symptoms =
    symptomsText &&
    !/^none$/i.test(
      symptomsText
    )
      ? symptomsText
          .split(
            /\s*\|\s*|\s*,\s*/
          )
          .map((item) =>
            item.trim()
          )
          .filter(Boolean)
      : [];

  // Associated symptoms
  const associatedSymptoms =
    associatedText &&
    !/^none$/i.test(
      associatedText
    )
      ? associatedText
          .split(
            /\s*\|\s*|\s*,\s*/
          )
          .map((item) =>
            item.trim()
          )
          .filter(Boolean)
      : [];

  // Severity normalization
  let severity = "";

  const severityText =
    severityRaw.toLowerCase();

  if (
    /mild|light|हल्का|हल्की|सौम्य|लघु/.test(
      severityText
    )
  ) {
    severity = "mild";
  } else if (
    /moderate|medium|मध्यम|मध्यम/.test(
      severityText
    )
  ) {
    severity = "moderate";
  } else if (
    /severe|strong|high|गंभीर|तीव्र|तेज़|तेज/.test(
      severityText
    )
  ) {
    severity = "severe";
  } else {
    severity =
      severityRaw;
  }

  const associatedSymptomsProvided =
    /^(yes|true|y|हाँ|हां|हो|होय|yes)$/i.test(
      providedRaw
    );

  return {
    symptoms,

    duration:
      duration || "",

    severity:
      severity || "",

    associatedSymptoms,

    associatedSymptomsProvided,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// PATIENT INFORMATION EXTRACTION
//
// IMPORTANT:
// This DOES NOT use JSON response mode.
// Therefore Groq cannot fail with json_validate_failed.
// ─────────────────────────────────────────────────────────────────────────────

const extractPatientState =
  async (
    conversation,
    language
  ) => {
    const transcript =
      conversation
        .map((item) => {
          const speaker =
            item.role ===
            "user"
              ? "PATIENT"
              : "ASSISTANT";

          return `${speaker}: ${item.content}`;
        })
        .join("\n");

    const languageName =
      getLanguageName(
        language
      );

    const response =
      await groq.chat.completions.create({
        model: MODEL,

        temperature: 0,

        max_tokens: 120,

        messages: [
          {
            role: "system",
            content: `
You extract healthcare-navigation information.

Patient language:
${languageName}

Look ONLY at what the PATIENT says.

Return EXACTLY these five lines.
Do not write anything else.

SYMPTOMS: symptom1 | symptom2
DURATION: duration
SEVERITY: mild
ASSOCIATED: symptom1 | symptom2
ASSOCIATED_PROVIDED: yes

Rules:

- Put multiple symptoms separated by |.
- If no symptoms are mentioned, use:
  SYMPTOMS:

- If duration is missing, use:
  DURATION:

- Severity must be:
  mild
  moderate
  severe
  or empty.

- If no associated symptoms were mentioned, use:
  ASSOCIATED:

- ASSOCIATED_PROVIDED must be:
  yes
  or
  no

- Mark ASSOCIATED_PROVIDED as yes when the patient has explicitly
  answered the question about other symptoms, including "no",
  "none", "नहीं", "nahi", etc.

- Do not use information from the assistant's questions as patient data.

- Do not diagnose.
- Do not recommend medicines.
- Do not provide treatment advice.
      `.trim(),
          },

          {
            role: "user",
            content: transcript,
          },
        ],
      });

    const raw =
      response.choices?.[0]
        ?.message?.content
        ?.trim() || "";

    return parsePatientStateText(
      raw
    );
  };

// ─────────────────────────────────────────────────────────────────────────────
// DETERMINISTIC QUESTION SELECTION
// ─────────────────────────────────────────────────────────────────────────────

const getDeterministicQuestion =
  (
    state,
    language
  ) => {
    if (
      !Array.isArray(
        state.symptoms
      ) ||
      state.symptoms.length ===
        0
    ) {
      return {
        topic: "symptoms",
        question:
          getQuestion(
            "symptoms",
            language
          ),
      };
    }

    if (
      !state.duration?.trim()
    ) {
      return {
        topic: "duration",
        question:
          getQuestion(
            "duration",
            language
          ),
      };
    }

    if (
      !state.severity?.trim()
    ) {
      return {
        topic: "severity",
        question:
          getQuestion(
            "severity",
            language
          ),
      };
    }

    if (
      !state.associatedSymptomsProvided
    ) {
      return {
        topic:
          "associatedSymptoms",
        question:
          getQuestion(
            "associatedSymptoms",
            language
          ),
      };
    }

    return null;
  };

// ─────────────────────────────────────────────────────────────────────────────
// SPECIALTY CLASSIFICATION
//
// Uses the extracted state, NOT the full conversation.
// ─────────────────────────────────────────────────────────────────────────────

const classifySpeciality =
  async (state) => {
    const symptoms =
      Array.isArray(
        state?.symptoms
      )
        ? state.symptoms
        : [];

    const associatedSymptoms =
      Array.isArray(
        state?.associatedSymptoms
      )
        ? state.associatedSymptoms
        : [];

    const text = [
      ...symptoms,
      ...associatedSymptoms,
    ]
      .join(" ")
      .toLowerCase();

    console.log(
      "CLASSIFICATION INPUT:",
      text
    );

    // ─────────────────────────────────────
    // GASTROENTEROLOGY
    // ─────────────────────────────────────

    if (
      /stomach|abdomen|abdominal| पेट|पेट|पेट दर्द|दर्द पेट|vomit|vomiting|nausea|gastric|acidity|diarrhea|diarrhoea|constipation|indigestion|bloating|ulcer|उल्टी|मतली|कब्ज/.test(
        text
      )
    ) {
      return {
        speciality:
          "Gastroenterology",
        confidence:
          0.92,
      };
    }

    // ─────────────────────────────────────
    // NEUROLOGY
    // ─────────────────────────────────────

    if (
      /headache|migraine|seizure|brain|neurological|numbness|vertigo|dizziness|सिर दर्द|सरदर्द|माइग्रेन|चक्कर|सुन्न/.test(
        text
      )
    ) {
      return {
        speciality:
          "Neurology",
        confidence:
          0.90,
      };
    }

    // ─────────────────────────────────────
    // CARDIOLOGY
    // ─────────────────────────────────────

    if (
      /heart|chest pain|palpitation|palpitations|heartbeat|blood pressure|दिल|सीने में दर्द|धड़कन|ब्लड प्रेशर/.test(
        text
      )
    ) {
      return {
        speciality:
          "Cardiology",
        confidence:
          0.90,
      };
    }

    // ─────────────────────────────────────
    // PSYCHIATRY
    // ─────────────────────────────────────

    if (
      /insomnia|sleep|anxiety|depression|stress|panic|mental|नींद|अनिद्रा|चिंता|तनाव|घबराहट|डिप्रेशन/.test(
        text
      )
    ) {
      return {
        speciality:
          "Psychiatry",
        confidence:
          0.90,
      };
    }

    // ─────────────────────────────────────
    // DERMATOLOGY
    // ─────────────────────────────────────

    if (
      /skin|rash|acne|itching|eczema|allergy|त्वचा|खुजली|दाने|मुंहासे|एलर्जी/.test(
        text
      )
    ) {
      return {
        speciality:
          "Dermatology",
        confidence:
          0.90,
      };
    }

    // ─────────────────────────────────────
    // OPHTHALMOLOGY
    // ─────────────────────────────────────

    if (
      /eye|eyes|vision|blurred vision|sight|आंख|आँख|दृष्टि|धुंधला|नज़र/.test(
        text
      )
    ) {
      return {
        speciality:
          "Ophthalmology",
        confidence:
          0.90,
      };
    }

    // ─────────────────────────────────────
    // ORTHOPEDICS
    // ─────────────────────────────────────

    if (
      /bone|joint|knee|shoulder|back pain|fracture|muscle|हड्डी|जोड़|घुटना|कंधा|कमर दर्द|मांसपेशी/.test(
        text
      )
    ) {
      return {
        speciality:
          "Orthopedics",
        confidence:
          0.90,
      };
    }

    // ─────────────────────────────────────
    // PEDIATRICS
    // ─────────────────────────────────────

    if (
      /child|children|baby|infant|kid|बच्चा|बच्चे|शिशु/.test(
        text
      )
    ) {
      return {
        speciality:
          "Pediatrics",
        confidence:
          0.90,
      };
    }

    // ─────────────────────────────────────
    // AI FALLBACK
    // ─────────────────────────────────────

    const fallbackText = `
Symptoms: ${
      symptoms.length
        ? symptoms.join(", ")
        : "none"
    }

Associated symptoms: ${
      associatedSymptoms.length
        ? associatedSymptoms.join(
            ", "
          )
        : "none"
    }

Duration: ${
      state?.duration ||
      "not provided"
    }

Severity: ${
      state?.severity ||
      "not provided"
    }
    `.trim();

    try {
      const response =
        await groq.chat.completions.create(
          {
            model: MODEL,

            temperature: 0,

            max_tokens: 40,

            messages: [
              {
                role: "system",
                content: `
Choose one medical specialty for healthcare navigation.

Allowed:
${SPECIALITIES.join(", ")}

Return ONLY the exact specialty name.

No JSON.
No explanation.
No confidence.
No punctuation.
                `.trim(),
              },

              {
                role: "user",
                content:
                  fallbackText,
              },
            ],
          }
        );

      let raw =
        response.choices?.[0]
          ?.message?.content
          ?.trim() || "";

      console.log(
        "AI SPECIALITY RAW:",
        raw
      );

      raw = raw
        .replace(
          /```/g,
          ""
        )
        .replace(
          /^["']|["']$/g,
          ""
        )
        .replace(
          /\.$/,
          ""
        )
        .trim();

      const speciality =
        SPECIALITIES.find(
          (item) =>
            item.toLowerCase() ===
            raw.toLowerCase()
        ) ||
        SPECIALITIES.find(
          (item) =>
            raw
              .toLowerCase()
              .includes(
                item.toLowerCase()
              )
        ) ||
        "General Physician";

      return {
        speciality,
        confidence:
          speciality ===
          "General Physician"
            ? 0.65
            : 0.82,
      };
    } catch (error) {
      console.error(
        "SPECIALITY FALLBACK ERROR:",
        error.message
      );

      return {
        speciality:
          "General Physician",
        confidence: 0.65,
      };
    }
  };

// ─────────────────────────────────────────────────────────────────────────────
// DATABASE DOCTOR SEARCH
// ─────────────────────────────────────────────────────────────────────────────

const getDoctorRecommendations =
  async (speciality) => {
    const doctors =
      await User.find({
        role: "doctor",

        status: "approved",

        isActive: true,

        speciality: {
          $regex:
            `^${speciality}$`,
          $options: "i",
        },
      })
        .select(
          "name speciality experience fees"
        )
        .lean();

    console.log(
      `AI doctor search: ${speciality} -> ${doctors.length} doctors`
    );

    const rankedDoctors =
      doctors.map(
        (doctor) => {
          const experience =
            Number(
              doctor.experience
            ) || 0;

          const experienceScore =
            Math.min(
              experience / 20,
              1
            );

          // Specialty relevance = 60%
          // Experience = 40%
          const score =
            0.6 +
            experienceScore *
              0.4;

          return {
            _id:
              doctor._id,

            name:
              doctor.name,

            speciality:
              doctor.speciality,

            experience:
              doctor.experience,

            fees:
              doctor.fees,

            matchScore:
              Math.round(
                score * 100
              ),
          };
        }
      );

    rankedDoctors.sort(
      (a, b) =>
        b.matchScore -
          a.matchScore ||
        (Number(
          b.experience
        ) || 0) -
          (Number(
            a.experience
          ) || 0)
    );

    return rankedDoctors.slice(
      0,
      5
    );
  };

// ─────────────────────────────────────────────────────────────────────────────
// FINAL RESPONSE
// ─────────────────────────────────────────────────────────────────────────────

const generateFinalMessage =
  async (
    speciality,
    recommendations,
    language
  ) => {
    const lang =
      normalizeLanguage(
        language
      );

    const hasDoctors =
      recommendations.length >
      0;

    // ─────────────────────────────────────
    // NO DOCTORS
    // ─────────────────────────────────────

    if (!hasDoctors) {
      const messages = {
        en: `No approved ${speciality} doctors are currently available on MediBook. Please check again later or explore another available specialty.`,

        hi: `MediBook पर अभी कोई स्वीकृत ${speciality} डॉक्टर उपलब्ध नहीं है। कृपया बाद में फिर से जांच करें या उपलब्ध किसी अन्य विशेषज्ञता को देखें।`,

        bn: `MediBook-এ এই মুহূর্তে কোনো অনুমোদিত ${speciality} ডাক্তার পাওয়া যাচ্ছে না। পরে আবার চেষ্টা করুন অথবা অন্য কোনো উপলব্ধ বিশেষজ্ঞতা দেখুন।`,

        gu: `MediBook પર હાલમાં કોઈ મંજૂર ${speciality} ડૉક્ટર ઉપલબ્ધ નથી. કૃપા કરીને પછી ફરી તપાસ કરો અથવા અન્ય ઉપલબ્ધ વિશેષતા જુઓ.`,

        kn: `MediBook ನಲ್ಲಿ ಪ್ರಸ್ತುತ ಯಾವುದೇ ಅನುಮೋದಿತ ${speciality} ವೈದ್ಯರು ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ನಂತರ ಮತ್ತೆ ಪರಿಶೀಲಿಸಿ ಅಥವಾ ಲಭ್ಯವಿರುವ ಮತ್ತೊಂದು ವಿಶೇಷತೆಯನ್ನು ನೋಡಿ.`,

        ml: `MediBook-ൽ ഇപ്പോൾ അംഗീകൃത ${speciality} ഡോക്ടർമാർ ലഭ്യമല്ല. ദയവായി പിന്നീട് വീണ്ടും പരിശോധിക്കുക അല്ലെങ്കിൽ ലഭ്യമായ മറ്റൊരു സ്പെഷ്യാലിറ്റി നോക്കുക.`,

        mr: `MediBook वर सध्या कोणतेही मान्यताप्राप्त ${speciality} डॉक्टर उपलब्ध नाहीत. कृपया नंतर पुन्हा तपासा किंवा उपलब्ध दुसरी विशेषज्ञता पहा.`,

        or: `MediBook ରେ ବର୍ତ୍ତମାନ କୌଣସି ଅନୁମୋଦିତ ${speciality} ଡାକ୍ତର ଉପଲବ୍ଧ ନାହାନ୍ତି। ପରେ ପୁଣି ଯାଞ୍ଚ କରନ୍ତୁ କିମ୍ବା ଅନ୍ୟ ଉପଲବ୍ଧ ବିଶେଷଜ୍ଞତା ଦେଖନ୍ତୁ।`,

        pa: `MediBook ਤੇ ਇਸ ਸਮੇਂ ਕੋਈ ਮਨਜ਼ੂਰਸ਼ੁਦਾ ${speciality} ਡਾਕਟਰ ਉਪਲਬਧ ਨਹੀਂ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਬਾਅਦ ਵਿੱਚ ਦੁਬਾਰਾ ਜਾਂਚ ਕਰੋ ਜਾਂ ਕੋਈ ਹੋਰ ਉਪਲਬਧ ਵਿਸ਼ੇਸ਼ਤਾ ਵੇਖੋ।`,

        ta: `MediBook இல் தற்போது அங்கீகரிக்கப்பட்ட ${speciality} மருத்துவர் எவரும் கிடைக்கவில்லை. பின்னர் மீண்டும் சரிபார்க்கவும் அல்லது கிடைக்கும் மற்றொரு சிறப்பைப் பார்க்கவும்.`,

        te: `MediBookలో ప్రస్తుతం ఆమోదించబడిన ${speciality} వైద్యులు అందుబాటులో లేరు. దయచేసి తర్వాత మళ్లీ తనిఖీ చేయండి లేదా అందుబాటులో ఉన్న మరో నిపుణ్యాన్ని చూడండి.`,

        ur: `MediBook پر اس وقت کوئی منظور شدہ ${speciality} ڈاکٹر دستیاب نہیں ہے۔ براہ کرم بعد میں دوبارہ چیک کریں یا کوئی دوسری دستیاب تخصص دیکھیں۔`,

        as: `MediBook-ত বৰ্তমান কোনো অনুমোদিত ${speciality} চিকিৎসক উপলব্ধ নাই। পিছত পুনৰ চেষ্টা কৰক বা আন উপলব্ধ বিশেষজ্ঞতা চাওক।`,
      };

      return (
        messages[lang] ||
        messages.en
      );
    }

    // ─────────────────────────────────────
    // DOCTORS AVAILABLE
    // ─────────────────────────────────────

    try {
      const response =
        await groq.chat.completions.create({
          model: MODEL,
          temperature: 0.3,
          max_tokens: 120,

          messages: [
            {
              role: "system",
              content: `
Write a short healthcare-navigation response.

Language:
${getLanguageName(language)}

Specialty:
${speciality}

Approved doctors are available.

Tell the patient they can select a doctor
and book an appointment.

Do not diagnose.
Do not prescribe.
Do not give treatment advice.

Return only the response text.
              `.trim(),
            },

            {
              role: "user",
              content:
                "Generate the response.",
            },
          ],
        });

      const result =
        response.choices?.[0]
          ?.message?.content
          ?.trim();

      if (result) {
        return result;
      }
    } catch (error) {
      console.error(
        "FINAL MESSAGE ERROR:",
        error.message
      );
    }

    // Safe fallback without another AI call.
    if (lang === "hi") {
      return `${speciality} में कई मान्य डॉक्टर उपलब्ध हैं। आप किसी डॉक्टर को चुन सकते हैं और अपॉइंटमेंट बुक कर सकते हैं।`;
    }

    if (lang === "mr") {
      return `${speciality} मध्ये मान्य डॉक्टर उपलब्ध आहेत. तुम्ही डॉक्टर निवडून अपॉइंटमेंट बुक करू शकता.`;
    }

    return `Approved ${speciality} doctors are available. You can choose a doctor and book an appointment.`;
  };

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CONTROLLER
// ─────────────────────────────────────────────────────────────────────────────

export const getCareRecommendation =
  async (
    req,
    res
  ) => {
    try {
      // ───────────────────────────────────
      // API KEY
      // ───────────────────────────────────

      if (
        !process.env.GROQ_API_KEY
      ) {
        return res.status(500).json({
          message:
            "GROQ_API_KEY is not configured on the server.",
        });
      }

      // ───────────────────────────────────
      // REQUEST
      // ───────────────────────────────────

      const {
        message,
        messages = [],
        language = "auto",
      } = req.body;

      console.log(
        "──────────────── AI REQUEST ────────────────"
      );

      console.log(
        "REQUEST LANGUAGE:",
        language
      );

      console.log(
        "REQUEST MESSAGE:",
        message
      );

      // ───────────────────────────────────
      // CONVERSATION
      // ───────────────────────────────────

      let conversation =
        cleanConversation(
          Array.isArray(messages)
            ? messages
            : []
        );

      if (
        conversation.length ===
          0 &&
        message
      ) {
        conversation = [
          {
            role: "user",
            content:
              String(
                message
              ).trim(),
          },
        ];
      }

      if (
        conversation.length ===
        0
      ) {
        return res.status(400).json({
          message:
            "Please describe your health concern.",
        });
      }

      // ───────────────────────────────────
      // LANGUAGE
      // ───────────────────────────────────

      let selectedLanguage;

      if (
        language !== "auto" &&
        isSupportedLanguage(
          language
        )
      ) {
        selectedLanguage =
          normalizeLanguage(
            language
          );
      } else {
        const latestUserMessage =
          [...conversation]
            .reverse()
            .find(
              (item) =>
                item.role ===
                "user"
            );

        selectedLanguage =
          await detectConversationLanguage(
            latestUserMessage?.content ||
              ""
          );
      }

      console.log(
        "FINAL ACTIVE LANGUAGE:",
        selectedLanguage,
        `(${getLanguageName(
          selectedLanguage
        )})`
      );

      // ───────────────────────────────────
      // QUESTION COUNT
      // ───────────────────────────────────

      const questionCount =
        countFollowUpQuestions(
          conversation
        );

      // ───────────────────────────────────
      // EXTRACT PATIENT STATE
      // ───────────────────────────────────

      const state =
        await extractPatientState(
          conversation,
          selectedLanguage
        );

      console.log(
        "AI EXTRACTED STATE:",
        state
      );

      // ───────────────────────────────────
      // NEXT QUESTION
      // ───────────────────────────────────

      const nextQuestion =
        getDeterministicQuestion(
          state,
          selectedLanguage
        );

      if (
        nextQuestion &&
        questionCount <
          MAX_FOLLOW_UP_QUESTIONS
      ) {
        console.log(
          "NEXT QUESTION:",
          nextQuestion.question
        );

        return res.json({
          type: "question",

          topic:
            nextQuestion.topic,

          question:
            nextQuestion.question,

          language:
            selectedLanguage,
        });
      }

      // ───────────────────────────────────
      // SPECIALTY
      // ───────────────────────────────────

      const classification =
        await classifySpeciality(
          state
        );

      const speciality =
        classification.speciality;

      console.log(
        "SELECTED SPECIALITY:",
        speciality
      );

      console.log(
        "SPECIALITY CONFIDENCE:",
        classification.confidence
      );

      // ───────────────────────────────────
      // DOCTOR SEARCH
      // ───────────────────────────────────

      const recommendations =
        await getDoctorRecommendations(
          speciality
        );

      const doctorsAvailable =
        recommendations.length >
        0;

      console.log(
        `DOCTOR AVAILABILITY: ${doctorsAvailable}`
      );

      console.log(
        `RECOMMENDATION COUNT: ${recommendations.length}`
      );

      // ───────────────────────────────────
      // FINAL RESPONSE
      // ───────────────────────────────────

      const responseMessage =
        await generateFinalMessage(
          speciality,
          recommendations,
          selectedLanguage
        );

      // ───────────────────────────────────
      // NEUTRAL REASON
      // ───────────────────────────────────

      let neutralReason =
        `Based on the information you provided, ${speciality} is the most relevant specialty for doctor navigation.`;

      if (
        selectedLanguage ===
        "hi"
      ) {
        neutralReason =
          `आपकी दी गई जानकारी के आधार पर ${speciality} डॉक्टर के लिए सबसे संबंधित विशेषज्ञता है।`;
      }

      if (
        selectedLanguage ===
        "mr"
      ) {
        neutralReason =
          `तुम्ही दिलेल्या माहितीनुसार ${speciality} ही डॉक्टर शोधण्यासाठी सर्वात संबंधित विशेषज्ञता आहे.`;
      }

      // ───────────────────────────────────
      // COMPLETE RESPONSE
      // ───────────────────────────────────

      return res.json({
        type: "complete",

        language:
          selectedLanguage,

        message:
          responseMessage,

        analysis: {
          symptoms:
            Array.isArray(
              state.symptoms
            )
              ? state.symptoms
              : [],

          duration:
            state.duration ||
            "",

          severity:
            state.severity ||
            "",

          associatedSymptoms:
            Array.isArray(
              state.associatedSymptoms
            )
              ? state.associatedSymptoms
              : [],

          speciality,

          confidence:
            classification.confidence,

          reason:
            neutralReason,
        },

        recommendations,

        doctorsAvailable,

        noDoctorsAvailable:
          !doctorsAvailable,

        disclaimer:
          "This assistant provides healthcare-navigation recommendations only. It does not diagnose conditions or provide treatment advice.",
      });
    } catch (error) {
      console.error(
        "GROQ AI CARE ERROR:",
        error
      );

      return res.status(500).json({
        message:
          error?.message ||
          "Unable to generate AI recommendation.",
      });
    }
  };