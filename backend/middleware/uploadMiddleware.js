import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ─────────────────────────────────────────────────────────────────────────────
// Resolve backend directory reliably
// ─────────────────────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.resolve(
  __dirname,
  "..",
  "uploads"
);

// Make sure uploads folder exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, {
    recursive: true,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// STORAGE
// ─────────────────────────────────────────────────────────────────────────────

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },

  filename: (req, file, cb) => {
    const originalName =
      path
        .basename(file.originalname)
        .replace(/[^a-zA-Z0-9._-]/g, "_");

    const uniqueName =
      `${Date.now()}-${originalName}`;

    cb(null, uniqueName);
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// FILE FILTER
// ─────────────────────────────────────────────────────────────────────────────

const fileFilter = (
  req,
  file,
  cb
) => {
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
  ];

  if (
    allowedTypes.includes(
      file.mimetype
    )
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only PDF, JPG, PNG files are allowed"
      ),
      false
    );
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// MULTER
// ─────────────────────────────────────────────────────────────────────────────

const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize:
      10 * 1024 * 1024, // 10 MB
  },
});

export default upload;