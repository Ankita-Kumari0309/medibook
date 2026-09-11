import express from "express";

import verifyToken from "../middleware/verifyToken.js";
import upload from "../middleware/uploadMiddleware.js";

import {
  uploadAndAnalyzeDocument,
  getAIDocument,
  askAboutDocument,
  deleteAIDocument,
} from "../controllers/aiDocumentController.js";

const router =
  express.Router();

// Upload + analyze
router.post(
  "/upload",
  verifyToken,
  upload.single("file"),
  uploadAndAnalyzeDocument
);

// Get summary
router.get(
  "/:documentId",
  verifyToken,
  getAIDocument
);

// Ask question
router.post(
  "/:documentId/ask",
  verifyToken,
  askAboutDocument
);

// Delete
router.delete(
  "/:documentId",
  verifyToken,
  deleteAIDocument
);

export default router;