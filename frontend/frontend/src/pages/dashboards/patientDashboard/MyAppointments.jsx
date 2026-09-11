import { useEffect, useState } from "react";
import API from "../../../api/axios";
import {
  MdClose,
  MdEventAvailable,
  MdCancel,
  MdCheckCircle,
  MdWarningAmber,
} from "react-icons/md";

const filters = [
  "All",
  "Upcoming",
  "Completed",
  "Cancelled",
];

export default function MyAppointments() {
  const [activeFilter, setActiveFilter] =
    useState("All");

  const [appointments, setAppointments] =
    useState([]);

  const [selectedCancel, setSelectedCancel] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ─────────────────────────────────────────────────────────────────────────
  // FETCH APPOINTMENTS
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments =
    async () => {
      try {
        setLoading(true);
        setError("");

        const { data } =
          await API.get(
            "/appointments/my"
          );

        setAppointments(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (err) {
        console.error(
          "Fetch appointments error:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
            "Failed to load appointments."
        );
      } finally {
        setLoading(false);
      }
    };

  // ─────────────────────────────────────────────────────────────────────────
  // FILTER
  // ─────────────────────────────────────────────────────────────────────────

  const filtered =
    appointments.filter(
      (appointment) => {
        const now = new Date();

        const appointmentDate =
          new Date(
            appointment.date
          );

        if (
          activeFilter === "All"
        ) {
          return true;
        }

        if (
          activeFilter ===
          "Upcoming"
        ) {
          return (
            appointment.status !==
              "cancelled" &&
            appointment.status !==
              "completed" &&
            appointmentDate >= now
          );
        }

        if (
          activeFilter ===
          "Completed"
        ) {
          return (
            appointment.status ===
            "completed"
          );
        }

        if (
          activeFilter ===
          "Cancelled"
        ) {
          return (
            appointment.status ===
            "cancelled"
          );
        }

        return true;
      }
    );

  // ─────────────────────────────────────────────────────────────────────────
  // STATUS STYLE
  // ─────────────────────────────────────────────────────────────────────────

  const getStatusStyle =
    (status) => {
      switch (status) {
        case "confirmed":
          return {
            className:
              "bg-green-100 text-green-700",
            icon: MdEventAvailable,
          };

        case "pending":
          return {
            className:
              "bg-yellow-100 text-yellow-700",
            icon: MdWarningAmber,
          };

        case "completed":
          return {
            className:
              "bg-gray-100 text-gray-600",
            icon: MdCheckCircle,
          };

        case "cancelled":
          return {
            className:
              "bg-red-100 text-red-600",
            icon: MdCancel,
          };

        default:
          return {
            className:
              "bg-gray-100 text-gray-500",
            icon: MdWarningAmber,
          };
      }
    };

  // ─────────────────────────────────────────────────────────────────────────
  // STATUS LABEL
  // ─────────────────────────────────────────────────────────────────────────

  const getStatusLabel =
    (status) => {
      if (!status) {
        return "Unknown";
      }

      return (
        status.charAt(0).toUpperCase() +
        status.slice(1)
      );
    };

  // ─────────────────────────────────────────────────────────────────────────
  // CANCEL APPOINTMENT
  // ─────────────────────────────────────────────────────────────────────────

  const confirmCancel =
    async () => {
      if (!selectedCancel) {
        return;
      }

      try {
        setError("");

        await API.put(
          `/appointments/cancel/${selectedCancel}`
        );

        setSelectedCancel(null);

        await fetchAppointments();
      } catch (err) {
        console.error(
          "Cancel appointment error:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
            "Unable to cancel appointment."
        );

        setSelectedCancel(null);
      }
    };

  // ─────────────────────────────────────────────────────────────────────────
  // CAN CANCEL?
  // ─────────────────────────────────────────────────────────────────────────

  const canCancel =
    (status) => {
      return (
        status === "pending" ||
        status === "confirmed"
      );
    };

  // ─────────────────────────────────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div>

      {/* Header */}
      <div className="mb-5">

        <h1 className="text-lg font-semibold text-gray-800">
          My Appointments
        </h1>

        <p className="text-xs text-gray-400 mt-1">
          View all your bookings
        </p>

      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-5 flex-wrap">

        {filters.map(
          (filter) => (
            <button
              key={filter}
              onClick={() =>
                setActiveFilter(
                  filter
                )
              }
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${
                activeFilter ===
                filter
                  ? "bg-teal-100 text-teal-700"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {filter}
            </button>
          )
        )}

      </div>

      {/* Appointment List */}
      <div className="flex flex-col gap-3">

        {loading ? (
          <div className="text-center py-12">

            <div className="w-7 h-7 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />

            <p className="text-sm text-gray-400">
              Loading appointments...
            </p>

          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-100 rounded-2xl">

            <p className="text-sm text-gray-400">
              No appointments found
            </p>

          </div>
        ) : (
          filtered.map(
            (appointment) => {

              const statusStyle =
                getStatusStyle(
                  appointment.status
                );

              const StatusIcon =
                statusStyle.icon;

              const initials =
                appointment.doctorId
                  ?.name
                  ?.split(" ")
                  .map(
                    (name) =>
                      name[0]
                  )
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() ||
                "DR";

              return (
                <div
                  key={
                    appointment._id
                  }
                  className="bg-white border border-gray-100 rounded-xl p-4 flex justify-between items-center shadow-sm hover:shadow-md transition"
                >

                  {/* LEFT */}
                  <div className="flex items-center gap-3 min-w-0">

                    <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-semibold flex-shrink-0">
                      {initials}
                    </div>

                    <div className="min-w-0">

                      <div className="text-sm font-semibold text-gray-800 truncate">
                        {
                          appointment
                            .doctorId
                            ?.name
                        }
                      </div>

                      <div className="text-xs text-gray-400">
                        {
                          appointment
                            .doctorId
                            ?.speciality
                        }
                      </div>

                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(
                          appointment.date
                        ).toDateString()}{" "}
                        ·{" "}
                        {
                          appointment.time
                        }
                      </div>

                    </div>

                  </div>

                  {/* RIGHT */}
                  <div className="flex items-center gap-3 flex-shrink-0">

                    <span
                      className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium ${statusStyle.className}`}
                    >

                      <StatusIcon
                        size={13}
                      />

                      {getStatusLabel(
                        appointment.status
                      )}

                    </span>

                    {canCancel(
                      appointment.status
                    ) && (
                      <button
                        onClick={() =>
                          setSelectedCancel(
                            appointment._id
                          )
                        }
                        className="text-xs px-3 py-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition"
                      >
                        Cancel
                      </button>
                    )}

                  </div>

                </div>
              );
            }
          )
        )}

      </div>

      {/* Cancel Modal */}
      {selectedCancel && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">

            <div className="flex justify-between items-center mb-4">

              <h2 className="text-lg font-semibold text-gray-800">
                Cancel Appointment
              </h2>

              <button
                onClick={() =>
                  setSelectedCancel(
                    null
                  )
                }
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <MdClose />
              </button>

            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              Are you sure you want to cancel this appointment?
            </p>

            <div className="flex gap-3 mt-5">

              <button
                onClick={() =>
                  setSelectedCancel(
                    null
                  )
                }
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
              >
                No
              </button>

              <button
                onClick={
                  confirmCancel
                }
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition"
              >
                Yes, Cancel
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}