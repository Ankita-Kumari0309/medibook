import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────────────────────

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import healthRecordRoutes from "./routes/healthRecordRoutes.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import availabilityRoutes from "./routes/availabilityRoutes.js";

import aiCareRoutes from "./routes/aiCareRoutes.js";
import aiDocumentRoutes from "./routes/aiDocumentRoutes.js";

// ─────────────────────────────────────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────────────────────────────────────

const app = express();

// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────────────────────────────────────

app.use(
  cors()
);

app.use(
  express.json()
);

// ─────────────────────────────────────────────────────────────────────────────
// STATIC FILES
// ─────────────────────────────────────────────────────────────────────────────

app.use(
  "/uploads",
  express.static("uploads")
);

// ─────────────────────────────────────────────────────────────────────────────
// NORMAL ROUTES
// ─────────────────────────────────────────────────────────────────────────────

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/patient",
  patientRoutes
);

app.use(
  "/api/appointments",
  appointmentRoutes
);

app.use(
  "/api/health-records",
  healthRecordRoutes
);

app.use(
  "/api/medicines",
  medicineRoutes
);

app.use(
  "/api/doctor",
  doctorRoutes
);

app.use(
  "/api/doctor/availability",
  availabilityRoutes
);

// ─────────────────────────────────────────────────────────────────────────────
// AI ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// AI Care Assistant
app.use(
  "/api/ai",
  aiCareRoutes
);

// AI Medical Document Assistant
app.use(
  "/api/ai-documents",
  aiDocumentRoutes
);

// ─────────────────────────────────────────────────────────────────────────────
// TEST ROUTE
// ─────────────────────────────────────────────────────────────────────────────

app.get(
  "/",
  (req, res) => {
    res.json({
      message:
        "MediBook API running!",
    });
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// DATABASE + SERVER
// ─────────────────────────────────────────────────────────────────────────────

const PORT =
  process.env.PORT || 5000;

mongoose
  .connect(
    process.env.MONGO_URI
  )
  .then(() => {
    console.log(
      "MongoDB connected!"
    );

    app.listen(
      PORT,
      () => {
        console.log(
          `Server running on port ${PORT}`
        );
      }
    );
  })
  .catch((error) => {
    console.error(
      "MongoDB connection failed:",
      error.message
    );
  });