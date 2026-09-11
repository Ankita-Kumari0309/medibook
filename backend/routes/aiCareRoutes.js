import express from "express";
import multer from "multer";

import verifyToken from "../middleware/verifyToken.js";
import checkRole from "../middleware/checkrole.js";

import {
  getCareRecommendation,
} from "../controllers/aiCareController.js";

import {
  transcribeAudio,
} from "../controllers/voiceController.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 25 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported audio format."));
    }
  },
});

router.post(
  "/care-recommendation",
  verifyToken,
  checkRole("patient"),
  getCareRecommendation
);

router.post(
  "/transcribe",
  verifyToken,
  checkRole("patient"),
  upload.single("audio"),
  transcribeAudio
);

export default router;