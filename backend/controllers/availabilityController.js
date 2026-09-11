import mongoose from "mongoose";
import Availability from "../models/Availability.js";
import User from "../models/User.js";

// ─────────────────────────────────────────────────────────────────────────────
// Helper: generate appointment slots
// ─────────────────────────────────────────────────────────────────────────────
const generateSlots = (slots = [], duration = 30, breakTime = {}) => {
  const result = [];

  const timeToMinutes = (time) => {
    if (!time) return 0;

    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const breakStart = breakTime?.start
    ? timeToMinutes(breakTime.start)
    : null;

  const breakEnd = breakTime?.end
    ? timeToMinutes(breakTime.end)
    : null;

  for (const slot of slots) {
    if (!slot?.start || !slot?.end) continue;

    let current = timeToMinutes(slot.start);
    const end = timeToMinutes(slot.end);

    while (current + duration <= end) {

      // Skip break period
      if (
        breakStart !== null &&
        breakEnd !== null &&
        current < breakEnd &&
        current + duration > breakStart
      ) {
        current = breakEnd;
        continue;
      }

      const h = String(Math.floor(current / 60)).padStart(2, "0");
      const m = String(current % 60).padStart(2, "0");

      result.push(`${h}:${m}`);

      current += duration;
    }
  }

  return result;
};


// ─────────────────────────────────────────────────────────────────────────────
// GET /api/doctor/availability
// Doctor self view
// ─────────────────────────────────────────────────────────────────────────────
export const getAvailability = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const data = await Availability.findOne({ doctorId }).lean();

    // No availability configured yet
    if (!data) {
      return res.json({
        doctorId,
        availability: {},
        dateOverrides: [],
        consultationDuration: 30,
        maxPatientsPerDay: 20,
        breakTime: {
          start: "13:00",
          end: "14:00",
        },
      });
    }

    res.json(data);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/doctor/availability
// Doctor saves weekly + date-wise availability
// ─────────────────────────────────────────────────────────────────────────────
export const saveAvailability = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const {
      availability,
      dateOverrides,
      consultationDuration,
      maxPatientsPerDay,
      breakTime,
    } = req.body;

    const updated = await Availability.findOneAndUpdate(
      { doctorId },
      {
        doctorId,
        availability: availability || {},
        dateOverrides: dateOverrides || [],
        consultationDuration: consultationDuration || 30,
        maxPatientsPerDay: maxPatientsPerDay || 20,
        breakTime: breakTime || {
          start: "13:00",
          end: "14:00",
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    ).lean();

    res.json({
      message: "Saved successfully",
      data: updated,
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// GET /api/doctor/availability/:doctorId
// Patient view
//
// Optional:
// /api/doctor/availability/:doctorId?date=2026-09-15
// ─────────────────────────────────────────────────────────────────────────────
export const getAvailabilityForDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    // Validate doctor ID
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({
        message: "Invalid doctor ID",
      });
    }

    // Validate date if provided
    if (
      date &&
      !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
      return res.status(400).json({
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    // ───────────────────────────────────────────────────────────────────────
    // Fetch doctor
    // ───────────────────────────────────────────────────────────────────────
    const doctor = await User.findById(doctorId)
      .select("name speciality fees experience role")
      .lean();

    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    // ───────────────────────────────────────────────────────────────────────
    // Fetch availability
    // ───────────────────────────────────────────────────────────────────────
    const availability =
      await Availability.findOne({ doctorId }).lean();

    // Doctor hasn't configured any availability
    if (!availability) {
      return res.json({
        doctor: {
          _id: doctor._id,
          name: doctor.name,
          speciality: doctor.speciality,
          fees: doctor.fees,
          experience: doctor.experience,
        },

        configured: false,

        slots: {},
        dateSlots: {},

        selectedDate: date || null,
        selectedDateSlots: [],

        consultationDuration: 30,
        maxPatientsPerDay: 20,

        breakTime: {
          start: "13:00",
          end: "14:00",
        },
      });
    }

    const weeklyAvailability =
      availability.availability || {};

    const dateOverrides =
      availability.dateOverrides || [];

    const consultationDuration =
      availability.consultationDuration || 30;

    const maxPatientsPerDay =
      availability.maxPatientsPerDay || 20;

    const breakTime =
      availability.breakTime || {
        start: "13:00",
        end: "14:00",
      };


    // ───────────────────────────────────────────────────────────────────────
    // WEEKLY SLOTS
    // ───────────────────────────────────────────────────────────────────────
    const weeklySlots = {};

    const dayKeys = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    dayKeys.forEach((day) => {
      weeklySlots[day] = [];

      const dayData = weeklyAvailability[day];

      if (!dayData?.enabled) {
        return;
      }

      if (!Array.isArray(dayData.slots)) {
        return;
      }

      weeklySlots[day] = generateSlots(
        dayData.slots,
        consultationDuration,
        breakTime
      );
    });


    // ───────────────────────────────────────────────────────────────────────
    // DATE-SPECIFIC SLOTS
    // ───────────────────────────────────────────────────────────────────────
    const dateSlots = {};

    dateOverrides.forEach((override) => {
      if (!override?.date) return;

      if (!override.enabled) {
        dateSlots[override.date] = [];
        return;
      }

      dateSlots[override.date] =
        generateSlots(
          override.slots || [],
          consultationDuration,
          breakTime
        );
    });


    // ───────────────────────────────────────────────────────────────────────
    // SELECTED DATE
    // ───────────────────────────────────────────────────────────────────────
    let selectedDateSlots = [];

    if (date) {

      // Date-specific configuration gets priority
      const dateOverride =
        dateOverrides.find(
          (item) => item.date === date
        );

      if (dateOverride) {

        if (dateOverride.enabled) {
          selectedDateSlots =
            dateSlots[date] || [];
        } else {
          selectedDateSlots = [];
        }

      } else {

        // Otherwise use weekly recurring schedule
        const [year, month, day] =
          date.split("-").map(Number);

        const localDate =
          new Date(year, month - 1, day);

        const dayName =
          dayKeys[localDate.getDay() === 0
            ? 6
            : localDate.getDay() - 1];

        selectedDateSlots =
          weeklySlots[dayName] || [];
      }
    }


    // ───────────────────────────────────────────────────────────────────────
    // RESPONSE
    // ───────────────────────────────────────────────────────────────────────
    res.json({
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        speciality: doctor.speciality,
        fees: doctor.fees,
        experience: doctor.experience,
      },

      configured: true,

      // Weekly availability
      slots: weeklySlots,

      // Specific dates
      dateSlots,

      // Selected date
      selectedDate: date || null,
      selectedDateSlots,

      consultationDuration,
      maxPatientsPerDay,
      breakTime,
    });

  } catch (err) {

    console.error(
      "getAvailabilityForDoctor ERROR:",
      err
    );

    res.status(500).json({
      message: err.message,
    });
  }
};