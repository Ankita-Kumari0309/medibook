import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    note: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },

    type: {
      type: String,
      default: "consultation",
    },
  },
  {
    timestamps: true,
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────────────────────────────────────

appointmentSchema.index({
  doctorId: 1,
  date: 1,
});

appointmentSchema.index({
  patientId: 1,
});

appointmentSchema.index({
  status: 1,
  date: 1,
});

appointmentSchema.index({
  patientId: 1,
  status: 1,
});

export default mongoose.model(
  "Appointment",
  appointmentSchema
);