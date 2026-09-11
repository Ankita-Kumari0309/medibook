import express from "express";
import verifyToken from "../middleware/verifyToken.js";

import {
  predictNoShow,
} from "../controllers/mlController.js";

const router = express.Router();

// Appointment attendance / no-show prediction
router.get(
  "/no-show/:appointmentId",
  verifyToken,
  predictNoShow
);

export default router;