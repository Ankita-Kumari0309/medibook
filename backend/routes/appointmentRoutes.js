import express from "express";

import verifyToken from "../middleware/verifyToken.js";
import checkRole from "../middleware/checkrole.js";

import {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  getMyDoctors,
  updateAppointmentStatus,
  markAsCompleted,
  getAvailableSlots,
} from "../controllers/appointmentController.js";

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// PATIENT ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// Book appointment
router.post(
  "/",
  verifyToken,
  checkRole("patient"),
  bookAppointment
);

// Get my appointments
router.get(
  "/my",
  verifyToken,
  checkRole("patient"),
  getMyAppointments
);

// Cancel appointment
router.put(
  "/cancel/:id",
  verifyToken,
  checkRole("patient"),
  cancelAppointment
);

// Get my doctors
router.get(
  "/doctors",
  verifyToken,
  checkRole("patient"),
  getMyDoctors
);

// Get available slots
router.get(
  "/slots",
  verifyToken,
  checkRole("patient"),
  getAvailableSlots
);

// ─────────────────────────────────────────────────────────────────────────────
// DOCTOR ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// Accept / Reject appointment
router.put(
  "/:id/status",
  verifyToken,
  checkRole("doctor"),
  updateAppointmentStatus
);

// Mark appointment as completed
router.put(
  "/:id/complete",
  verifyToken,
  checkRole("doctor"),
  markAsCompleted
);

export default router;