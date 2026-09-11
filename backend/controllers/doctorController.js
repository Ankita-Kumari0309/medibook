import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import HealthRecord from "../models/HealthRecord.js";
import bcrypt from "bcryptjs";


// ─────────────────────────────────────────────────────────────────────────────
// DOCTOR DASHBOARD OVERVIEW
// ─────────────────────────────────────────────────────────────────────────────

export const getDoctorDashboardOverview = async (
  req,
  res
) => {
  try {
    const doctorId = req.user.id;

    const doctor = await User.findById(
      doctorId
    ).select(
      "name speciality"
    );

    const today = new Date();

    const startOfDay = new Date(
      today.setHours(
        0,
        0,
        0,
        0
      )
    );

    const endOfDay = new Date(
      today.setHours(
        23,
        59,
        59,
        999
      )
    );

    // IMPORTANT:
    // Never treat the logged-in doctor
    // as their own patient.
    const appointmentFilter = {
      doctorId,
      patientId: {
        $ne: doctorId,
      },
    };

    const allAppointments =
      await Appointment.find(
        appointmentFilter
      );

    const todayAppointments =
      await Appointment.find({
        ...appointmentFilter,
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      }).populate(
        "patientId",
        "name"
      );

    const totalPatients =
      await Appointment.distinct(
        "patientId",
        appointmentFilter
      );

    const completedToday =
      todayAppointments.filter(
        (appointment) =>
          appointment.status ===
          "completed"
      ).length;

    const pendingToday =
      todayAppointments.filter(
        (appointment) =>
          appointment.status !==
            "completed" &&
          appointment.status !==
            "cancelled"
      ).length;

    const requests =
      todayAppointments.filter(
        (appointment) =>
          appointment.status ===
          "pending"
      );

    const todayQueue =
      todayAppointments
        .filter(
          (appointment) =>
            appointment.status ===
              "confirmed" ||
            appointment.status ===
              "completed"
        )
        .map((appointment) => ({
          id: appointment._id,
          patientName:
            appointment.patientId
              ?.name ||
            "Unknown",
          time:
            appointment.time,
          status:
            appointment.status,
          note:
            appointment.note,
        }));

    const appointmentRequests =
      requests.map(
        (appointment) => ({
          id: appointment._id,
          patientName:
            appointment.patientId
              ?.name ||
            "Unknown",
          date:
            appointment.date,
          time:
            appointment.time,
          note:
            appointment.note,
        })
      );

    return res.json({
      doctor,

      stats: {
        todayAppointments:
          todayAppointments.length,

        completedToday,

        pendingToday,

        totalPatients:
          totalPatients.length,

        totalAppointments:
          allAppointments.length,
      },

      todayQueue,

      appointmentRequests,
    });
  } catch (error) {
    console.error(
      "DOCTOR DASHBOARD ERROR:",
      error
    );

    return res.status(500).json({
      message: error.message,
    });
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// GET ALL APPOINTMENTS
// ─────────────────────────────────────────────────────────────────────────────

export const getMyAppointmentsForDoctor =
  async (
    req,
    res
  ) => {
    try {
      const doctorId =
        req.user.id;

      const appointments =
        await Appointment.find({
          doctorId,

          // Defensive protection:
          // doctor cannot appear as patient.
          patientId: {
            $ne: doctorId,
          },
        })
          .populate(
            "patientId",
            "name age gender email"
          )
          .sort({
            date: 1,
          });

      return res.json(
        appointments
      );
    } catch (error) {
      console.error(
        "GET DOCTOR APPOINTMENTS ERROR:",
        error
      );

      return res.status(500).json({
        message: error.message,
      });
    }
  };


// ─────────────────────────────────────────────────────────────────────────────
// GET UPCOMING APPOINTMENTS
// ─────────────────────────────────────────────────────────────────────────────

export const getUpcomingAppointments =
  async (
    req,
    res
  ) => {
    try {
      const doctorId =
        req.user.id;

      const now =
        new Date();

      const upcoming =
        await Appointment.find({
          doctorId,

          // Defensive protection
          patientId: {
            $ne: doctorId,
          },

          date: {
            $gte: now,
          },

          status: {
            $ne: "cancelled",
          },
        }).populate(
          "patientId",
          "name age gender email"
        );

      return res.json(
        upcoming
      );
    } catch (error) {
      console.error(
        "GET UPCOMING APPOINTMENTS ERROR:",
        error
      );

      return res.status(500).json({
        message: error.message,
      });
    }
  };


// ─────────────────────────────────────────────────────────────────────────────
// GET ALL PATIENTS
// ─────────────────────────────────────────────────────────────────────────────

export const getMyPatients =
  async (
    req,
    res
  ) => {
    try {
      const doctorId =
        req.user.id;

      // Get patients from this doctor's
      // appointments only.
      //
      // Exclude any accidental record
      // where doctorId === patientId.
      const patientIds =
        await Appointment.distinct(
          "patientId",
          {
            doctorId,

            patientId: {
              $ne: doctorId,
            },
          }
        );

      // Additional protection:
      // Only actual patient accounts
      // should be returned here.
      const patients =
        await User.find({
          _id: {
            $in: patientIds,
          },

          role: "patient",
        }).select(
          "name email age gender"
        );

      return res.json(
        patients
      );
    } catch (error) {
      console.error(
        "GET DOCTOR PATIENTS ERROR:",
        error
      );

      return res.status(500).json({
        message: error.message,
      });
    }
  };


// ─────────────────────────────────────────────────────────────────────────────
// GET PATIENT HEALTH RECORDS
// ─────────────────────────────────────────────────────────────────────────────

export const getPatientHealthRecords =
  async (
    req,
    res
  ) => {
    try {
      const patientId =
        req.params.id;

      const records =
        await HealthRecord.find({
          patientId,
        })
          .populate(
            "doctorId",
            "name speciality"
          )
          .populate(
            "appointmentId",
            "date time"
          )
          .sort({
            createdAt: -1,
          });

      return res.json(
        records
      );
    } catch (error) {
      console.error(
        "GET PATIENT HEALTH RECORDS ERROR:",
        error
      );

      return res.status(500).json({
        message: error.message,
      });
    }
  };


// ─────────────────────────────────────────────────────────────────────────────
// GET DOCTOR PROFILE
// GET /api/doctor/profile
// ─────────────────────────────────────────────────────────────────────────────

export const getDoctorProfile =
  async (
    req,
    res
  ) => {
    try {
      const doctorId =
        req.user.id;

      const doctor =
        await User.findById(
          doctorId
        ).select(
          "-password"
        );

      if (!doctor) {
        return res.status(404).json({
          message:
            "Doctor not found",
        });
      }

      return res.json(
        doctor
      );
    } catch (error) {
      console.error(
        "GET DOCTOR PROFILE ERROR:",
        error
      );

      return res.status(500).json({
        message: error.message,
      });
    }
  };


// ─────────────────────────────────────────────────────────────────────────────
// UPDATE DOCTOR PROFILE
// PUT /api/doctor/profile
// ─────────────────────────────────────────────────────────────────────────────

export const updateDoctorProfile =
  async (
    req,
    res
  ) => {
    try {
      const doctorId =
        req.user.id;

      const {
        name,
        phone,
        dob,
        gender,
        city,
        state,
        country,
        pincode,
        speciality,
        experience,
        fees,
        currentPassword,
        newPassword,
      } = req.body;

      const doctor =
        await User.findById(
          doctorId
        );

      if (!doctor) {
        return res.status(404).json({
          message:
            "Doctor not found",
        });
      }

      // ─────────────────────────────
      // BASIC FIELDS
      // ─────────────────────────────

      if (name) {
        doctor.name =
          name;
      }

      if (phone) {
        doctor.phone =
          phone;
      }

      if (dob) {
        doctor.dob =
          new Date(dob);
      }

      if (gender) {
        doctor.gender =
          gender;
      }

      if (city) {
        doctor.city =
          city;
      }

      if (state) {
        doctor.state =
          state;
      }

      if (country) {
        doctor.country =
          country;
      }

      if (pincode) {
        doctor.pincode =
          pincode;
      }

      if (speciality) {
        doctor.speciality =
          speciality;
      }

      if (
        experience !==
        undefined
      ) {
        doctor.experience =
          Number(
            experience
          );
      }

      if (
        fees !==
        undefined
      ) {
        doctor.fees =
          Number(fees);
      }

      // ─────────────────────────────
      // PASSWORD CHANGE
      // ─────────────────────────────

      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({
            message:
              "Current password is required",
          });
        }

        const isMatch =
          await bcrypt.compare(
            currentPassword,
            doctor.password
          );

        if (!isMatch) {
          return res.status(400).json({
            message:
              "Current password is incorrect",
          });
        }

        if (
          newPassword.length <
          6
        ) {
          return res.status(400).json({
            message:
              "New password must be at least 6 characters",
          });
        }

        doctor.password =
          await bcrypt.hash(
            newPassword,
            10
          );
      }

      await doctor.save();

      const updated =
        await User.findById(
          doctorId
        ).select(
          "-password"
        );

      return res.json({
        message:
          "Profile updated successfully",

        doctor:
          updated,
      });
    } catch (error) {
      console.error(
        "UPDATE DOCTOR PROFILE ERROR:",
        error
      );

      return res.status(500).json({
        message:
          error.message,
      });
    }
  };


// ─────────────────────────────────────────────────────────────────────────────
// GET DOCTOR APPOINTMENTS
// GET /api/doctor/appointments
// ─────────────────────────────────────────────────────────────────────────────

export const getDoctorAppointments =
  async (
    req,
    res
  ) => {
    try {
      const doctorId =
        req.user.id;

      const {
        status,
        date,
      } = req.query;

      // Base filter:
      // only appointments belonging
      // to the currently logged-in doctor.
      //
      // Never return a record where
      // the doctor is also the patient.
      const filter = {
        doctorId,

        patientId: {
          $ne: doctorId,
        },
      };

      if (
        status &&
        status !== "all"
      ) {
        filter.status =
          status;
      }

      // Date is stored as a Date in MongoDB.
      // Use a full-day range instead
      // of comparing Date directly to
      // a YYYY-MM-DD string.
      if (date) {
        const start =
          new Date(
            `${date}T00:00:00`
          );

        const end =
          new Date(
            `${date}T23:59:59.999`
          );

        filter.date = {
          $gte: start,
          $lte: end,
        };
      }

      const appointments =
        await Appointment.find(
          filter
        )
          .populate(
            "patientId",
            "name email age gender"
          )
          .sort({
            date: 1,
          });

      return res.json(
        appointments
      );
    } catch (error) {
      console.error(
        "GET DOCTOR APPOINTMENTS ERROR:",
        error
      );

      return res.status(500).json({
        message: error.message,
      });
    }
  };