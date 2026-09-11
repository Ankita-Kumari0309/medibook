import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import Availability from "../models/Availability.js";
import { generateSlots } from "../utils/slotGenerator.js";

// ─────────────────────────────────────────────────────────────────────────────
// BOOK APPOINTMENT
// PATIENT
// ─────────────────────────────────────────────────────────────────────────────

export const bookAppointment = async (req, res) => {
  try {
    const patientId = req.user.id;

    const {
      doctorId,
      date,
      time,
      note,
    } = req.body;

    // Validate required fields
    if (!doctorId || !date || !time) {
      return res.status(400).json({
        message:
          "doctorId, date and time are required",
      });
    }

    // Prevent past-date booking
    const today = new Date()
      .toISOString()
      .split("T")[0];

    if (date < today) {
      return res.status(400).json({
        message:
          "Cannot book an appointment in the past",
      });
    }

    // ─────────────────────────────────────────────────────────────────────
    // DOCTOR AVAILABILITY
    // ─────────────────────────────────────────────────────────────────────

    const doctorAvailability =
      await Availability.findOne({
        doctorId,
      });

    if (!doctorAvailability) {
      return res.status(400).json({
        message:
          "Doctor schedule not set",
      });
    }

    // Get local day name
    const [
      year,
      month,
      day,
    ] = date.split("-").map(Number);

    const localDate = new Date(
      year,
      month - 1,
      day
    );

    const dayName = localDate
      .toLocaleDateString("en-US", {
        weekday: "long",
      })
      .toLowerCase();

    // ─────────────────────────────────────────────────────────────────────
    // DATE OVERRIDE
    // ─────────────────────────────────────────────────────────────────────

    const dateOverride = (
      doctorAvailability.dateOverrides ||
      []
    ).find(
      (item) => item.date === date
    );

    let slots = [];

    if (dateOverride) {
      if (!dateOverride.enabled) {
        return res.status(400).json({
          message:
            "Doctor is not available on this date",
        });
      }

      slots = generateSlots(
        dateOverride.slots || [],
        doctorAvailability.consultationDuration,
        doctorAvailability.breakTime
      );
    } else {
      // ───────────────────────────────────────────────────────────────────
      // WEEKLY AVAILABILITY
      // ───────────────────────────────────────────────────────────────────

      const dayKey = Object.keys(
        doctorAvailability.availability || {}
      ).find(
        (key) =>
          key.toLowerCase() === dayName
      );

      if (!dayKey) {
        return res.status(400).json({
          message:
            "Doctor availability is not configured for this day",
        });
      }

      const daySchedule =
        doctorAvailability.availability?.[
          dayKey
        ];

      if (!daySchedule?.enabled) {
        return res.status(400).json({
          message:
            "Doctor is not available on this day",
        });
      }

      slots = generateSlots(
        daySchedule.slots || [],
        doctorAvailability.consultationDuration,
        doctorAvailability.breakTime
      );
    }

    // ─────────────────────────────────────────────────────────────────────
    // VALIDATE SELECTED SLOT
    // ─────────────────────────────────────────────────────────────────────

    if (!slots.includes(time)) {
      return res.status(400).json({
        message:
          "Invalid time slot selected",
      });
    }

    // ─────────────────────────────────────────────────────────────────────
    // CHECK DAILY CAPACITY
    //
    // Cancelled appointments do not consume capacity.
    // ─────────────────────────────────────────────────────────────────────

    const count =
      await Appointment.countDocuments({
        doctorId,
        date,
        status: {
          $ne: "cancelled",
        },
      });

    const maxPatients =
      doctorAvailability.maxPatientsPerDay ||
      20;

    if (count >= maxPatients) {
      return res.status(400).json({
        message:
          "Doctor is fully booked for this day",
      });
    }

    // ─────────────────────────────────────────────────────────────────────
    // PREVENT DUPLICATE SLOT BOOKING
    // ─────────────────────────────────────────────────────────────────────

    const existing =
      await Appointment.findOne({
        doctorId,
        date,
        time,
        status: {
          $ne: "cancelled",
        },
      });

    if (existing) {
      return res.status(409).json({
        message:
          "This slot is already booked. Please choose another time.",
      });
    }

    // ─────────────────────────────────────────────────────────────────────
    // CREATE APPOINTMENT
    // ─────────────────────────────────────────────────────────────────────

    const appointment =
      await Appointment.create({
        patientId,
        doctorId,
        date,
        time,
        note: note || "",
        status: "pending",
      });

    return res.status(201).json({
      message:
        "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    console.error(
      "BOOK APPOINTMENT ERROR:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "This slot was just booked by someone else. Please choose another time.",
      });
    }

    return res.status(500).json({
      message:
        error.message ||
        "Unable to book appointment",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET AVAILABLE SLOTS
// ─────────────────────────────────────────────────────────────────────────────

export const getAvailableSlots = async (
  req,
  res
) => {
  try {
    const {
      doctorId,
      date,
    } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({
        message:
          "doctorId and date are required",
      });
    }

    // Local date
    const [
      year,
      month,
      day,
    ] = date.split("-").map(Number);

    const localDate = new Date(
      year,
      month - 1,
      day
    );

    const dayName = localDate
      .toLocaleDateString("en-US", {
        weekday: "long",
      })
      .toLowerCase();

    // Doctor availability
    const doctorAvailability =
      await Availability.findOne({
        doctorId,
      });

    if (!doctorAvailability) {
      return res.json([]);
    }

    let slots = [];

    // ─────────────────────────────────────────────────────────────────────
    // DATE OVERRIDE
    // ─────────────────────────────────────────────────────────────────────

    const dateOverride = (
      doctorAvailability.dateOverrides ||
      []
    ).find(
      (item) => item.date === date
    );

    if (dateOverride) {
      if (!dateOverride.enabled) {
        return res.json([]);
      }

      slots = generateSlots(
        dateOverride.slots || [],
        doctorAvailability.consultationDuration,
        doctorAvailability.breakTime
      );
    } else {
      // ───────────────────────────────────────────────────────────────────
      // WEEKLY AVAILABILITY
      // ───────────────────────────────────────────────────────────────────

      const dayKey = Object.keys(
        doctorAvailability.availability || {}
      ).find(
        (key) =>
          key.toLowerCase() === dayName
      );

      if (!dayKey) {
        return res.json([]);
      }

      const daySchedule =
        doctorAvailability.availability?.[
          dayKey
        ];

      if (!daySchedule?.enabled) {
        return res.json([]);
      }

      slots = generateSlots(
        daySchedule.slots || [],
        doctorAvailability.consultationDuration,
        doctorAvailability.breakTime
      );
    }

    // ─────────────────────────────────────────────────────────────────────
    // REMOVE BOOKED SLOTS
    // ─────────────────────────────────────────────────────────────────────

    const booked =
      await Appointment.find({
        doctorId,
        date,
        status: {
          $ne: "cancelled",
        },
      }).select("time");

    const bookedTimes =
      booked.map(
        (item) => item.time
      );

    const available = slots.filter(
      (slot) =>
        !bookedTimes.includes(slot)
    );

    return res.json(available);
  } catch (error) {
    console.error(
      "GET AVAILABLE SLOTS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Unable to get available slots",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET MY APPOINTMENTS
// PATIENT
// ─────────────────────────────────────────────────────────────────────────────

export const getMyAppointments = async (
  req,
  res
) => {
  try {
    const patientId = req.user.id;
    const { status } = req.query;

    const filter = {
      patientId,
    };

    if (status) {
      filter.status = status;
    }

    const appointments =
      await Appointment.find(filter)
        .populate(
          "doctorId",
          "name speciality fees experience"
        )
        .sort({
          date: 1,
          time: 1,
        });

    return res.json(
      appointments
    );
  } catch (error) {
    console.error(
      "GET MY APPOINTMENTS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Unable to fetch appointments",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CANCEL APPOINTMENT
// PATIENT
// ─────────────────────────────────────────────────────────────────────────────

export const cancelAppointment = async (
  req,
  res
) => {
  try {
    const patientId = req.user.id;
    const { id } = req.params;

    const appointment =
      await Appointment.findOne({
        _id: id,
        patientId,
      });

    if (!appointment) {
      return res.status(404).json({
        message:
          "Appointment not found",
      });
    }

    if (
      appointment.status ===
      "cancelled"
    ) {
      return res.status(400).json({
        message:
          "Appointment is already cancelled",
      });
    }

    if (
      appointment.status ===
      "completed"
    ) {
      return res.status(400).json({
        message:
          "Cannot cancel a completed appointment",
      });
    }

    appointment.status =
      "cancelled";

    await appointment.save();

    return res.json({
      message:
        "Appointment cancelled successfully",
    });
  } catch (error) {
    console.error(
      "CANCEL APPOINTMENT ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Unable to cancel appointment",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET MY DOCTORS
// PATIENT
// ─────────────────────────────────────────────────────────────────────────────

export const getMyDoctors = async (
  req,
  res
) => {
  try {
    const patientId = req.user.id;

    const doctorIds =
      await Appointment.distinct(
        "doctorId",
        {
          patientId,
          status: {
            $ne: "cancelled",
          },
        }
      );

    const doctors =
      await User.find({
        _id: {
          $in: doctorIds,
        },
      }).select(
        "name email speciality fees experience"
      );

    return res.json(doctors);
  } catch (error) {
    console.error(
      "GET MY DOCTORS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Unable to fetch doctors",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ACCEPT / REJECT APPOINTMENT
// DOCTOR
// ─────────────────────────────────────────────────────────────────────────────

export const updateAppointmentStatus =
  async (req, res) => {
    try {
      const doctorId = req.user.id;

      const { id } = req.params;

      const { status } =
        req.body;

      if (
        ![
          "confirmed",
          "cancelled",
        ].includes(status)
      ) {
        return res.status(400).json({
          message:
            "Status must be 'confirmed' or 'cancelled'",
        });
      }

      const appointment =
        await Appointment.findOne({
          _id: id,
          doctorId,
        });

      if (!appointment) {
        return res.status(404).json({
          message:
            "Appointment not found",
        });
      }

      if (
        appointment.status ===
        "completed"
      ) {
        return res.status(400).json({
          message:
            "Cannot update a completed appointment",
        });
      }

      if (
        appointment.status ===
        "cancelled"
      ) {
        return res.status(400).json({
          message:
            "Cannot update a cancelled appointment",
        });
      }

      appointment.status =
        status;

      await appointment.save();

      return res.json({
        message:
          `Appointment ${status} successfully`,
        appointment,
      });
    } catch (error) {
      console.error(
        "UPDATE APPOINTMENT STATUS ERROR:",
        error
      );

      return res.status(500).json({
        message:
          error.message ||
          "Unable to update appointment",
      });
    }
  };

// ─────────────────────────────────────────────────────────────────────────────
// MARK AS COMPLETED
// DOCTOR
// ─────────────────────────────────────────────────────────────────────────────

export const markAsCompleted =
  async (req, res) => {
    try {
      const doctorId = req.user.id;

      const { id } = req.params;

      const appointment =
        await Appointment.findOne({
          _id: id,
          doctorId,
        });

      if (!appointment) {
        return res.status(404).json({
          message:
            "Appointment not found",
        });
      }

      if (
        appointment.status ===
        "cancelled"
      ) {
        return res.status(400).json({
          message:
            "Cannot complete a cancelled appointment",
        });
      }

      if (
        appointment.status ===
        "completed"
      ) {
        return res.status(400).json({
          message:
            "Appointment is already completed",
        });
      }

      appointment.status =
        "completed";

      await appointment.save();

      return res.json({
        message:
          "Appointment marked as completed",
        appointment,
      });
    } catch (error) {
      console.error(
        "MARK APPOINTMENT COMPLETED ERROR:",
        error
      );

      return res.status(500).json({
        message:
          error.message ||
          "Unable to complete appointment",
      });
    }
  };