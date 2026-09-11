
import { useState, useEffect, useCallback } from "react";
import {
  MdSave, MdCheckCircle, MdErrorOutline, MdRefresh,
  MdToggleOn, MdToggleOff, MdAdd, MdDelete,
  MdAccessTime, MdCalendarToday, MdEventAvailable,
  MdPeople, MdTimer, MdCoffee,
} from "react-icons/md";
import API from "../../../api/axios";

// ─── Palette (teal-blue, doctor theme) ───────────────────────────────────────
const C = {
  primary:      "#0284c7",
  primaryLight: "#0ea5e9",
  primaryDark:  "#0369a1",
  primaryBg:    "#f0f9ff",
  primaryBorder:"rgba(2,132,199,0.2)",
  primaryGlow:  "rgba(14,165,233,0.15)",
  dark:         "#0c1a2e",
  darkMid:      "#0f2744",
  white10:      "rgba(255,255,255,0.1)",
  white06:      "rgba(255,255,255,0.06)",
  white30:      "rgba(255,255,255,0.3)",
};

// ─── Constants ────────────────────────────────────────────────────────────────
const DAYS = [
  { key: "monday",    label: "Mon", full: "Monday"    },
  { key: "tuesday",   label: "Tue", full: "Tuesday"   },
  { key: "wednesday", label: "Wed", full: "Wednesday" },
  { key: "thursday",  label: "Thu", full: "Thursday"  },
  { key: "friday",    label: "Fri", full: "Friday"    },
  { key: "saturday",  label: "Sat", full: "Saturday"  },
  { key: "sunday",    label: "Sun", full: "Sunday"    },
];

const DEFAULT_SLOT = {
  start: "09:00",
  end: "17:00"
};

const DEFAULT_AVAILABILITY = DAYS.reduce((acc, d) => {
  acc[d.key] = {
    enabled: false,
    slots: [{ ...DEFAULT_SLOT }]
  };
  return acc;
}, {});

const TIME_SLOTS = [];

for (let h = 0; h < 24; h++) {
  for (let m of [0, 30]) {
    TIME_SLOTS.push(
      `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
    );
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtTime(t) {
  if (!t) return "—";

  const [h, m] = t.split(":");
  const hr = parseInt(h, 10);

  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
}

function slotMins(slot) {
  const [sh, sm] = slot.start.split(":").map(Number);
  const [eh, em] = slot.end.split(":").map(Number);

  const d = eh * 60 + em - (sh * 60 + sm);

  return d > 0 ? d : 0;
}

function totalMins(slots = []) {
  return slots.reduce((a, s) => a + slotMins(s), 0);
}

function fmtDur(mins) {
  if (!mins) return "";

  const h = Math.floor(mins / 60);
  const m = mins % 60;

  return `${h > 0 ? h + "h " : ""}${m > 0 ? m + "m" : ""}`.trim();
}

function formatDateDisplay(date) {
  if (!date) return "";

  const [year, month, day] = date.split("-").map(Number);

  const d = new Date(year, month - 1, day);

  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const getTodayString = () => {
  const d = new Date();

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type }) {
  if (!message) return null;

  const ok = type === "success";

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-semibold shadow-2xl"
      style={{
        background: ok
          ? `linear-gradient(135deg,${C.primary},${C.primaryDark})`
          : "linear-gradient(135deg,#ef4444,#dc2626)",
        color: "#fff",
        boxShadow: ok
          ? "0 8px 28px rgba(2,132,199,0.45)"
          : "0 8px 28px rgba(239,68,68,0.4)",
        animation: "slideUp 0.25s ease",
      }}
    >
      {ok ? <MdCheckCircle size={18}/> : <MdErrorOutline size={18}/>}
      {message}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(12px)
          }
          to {
            opacity: 1;
            transform: translateY(0)
          }
        }
      `}</style>
    </div>
  );
}

// ─── Summary Card ─────────────────────────────────────────────────────────────
function SummaryCard({
  availability,
  dateOverrides,
  breakTime,
  consultationDuration,
  maxPatientsPerDay
}) {
  const activeDays = DAYS.filter(d => availability[d.key]?.enabled);

  const offDays = DAYS.filter(d => !availability[d.key]?.enabled);

  const activeDates = dateOverrides.filter(
    d => d.enabled && d.date
  );

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: `linear-gradient(160deg,${C.dark} 0%,${C.darkMid} 100%)`,
        border: `1px solid ${C.white10}`,
        boxShadow: `0 16px 48px rgba(2,132,199,0.18), inset 0 1px 0 ${C.white10}`,
      }}
    >

      {/* Header */}
      <div
        className="flex items-center gap-3 px-6 py-5 border-b"
        style={{ borderColor: C.white10 }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(14,165,233,0.15)" }}
        >
          <MdEventAvailable size={18} style={{ color: C.primaryLight }}/>
        </div>

        <div>
          <p className="text-white font-bold text-sm leading-tight">
            Availability Overview
          </p>

          <p
            className="text-xs mt-0.5"
            style={{ color: C.white30 }}
          >
            {activeDays.length} of 7 days active
            {activeDates.length > 0
              ? ` · ${activeDates.length} date${activeDates.length !== 1 ? "s" : ""} configured`
              : ""}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div
        className="grid grid-cols-3 border-b"
        style={{ borderColor: C.white10 }}
      >
        {[
          {
            icon: <MdTimer size={14}/>,
            label: "Per Visit",
            val: `${consultationDuration}m`
          },
          {
            icon: <MdPeople size={14}/>,
            label: "Max/Day",
            val: maxPatientsPerDay
          },
          {
            icon: <MdCoffee size={14}/>,
            label: "Break",
            val: breakTime?.start
              ? fmtTime(breakTime.start)
              : "—"
          },
        ].map((s, i) => (
          <div
            key={i}
            className="px-4 py-3"
            style={{
              background: C.white06,
              borderRight:
                i < 2
                  ? `1px solid ${C.white10}`
                  : "none",
            }}
          >
            <div
              className="flex items-center gap-1 mb-1"
              style={{ color: "rgba(14,165,233,0.6)" }}
            >
              {s.icon}
              <span className="text-[9px] uppercase tracking-widest">
                {s.label}
              </span>
            </div>

            <div className="text-white font-bold text-sm">
              {s.val}
            </div>
          </div>
        ))}
      </div>

      {/* Date-wise summary */}
      {activeDates.length > 0 && (
        <div
          className="p-5 border-b"
          style={{ borderColor: C.white10 }}
        >
          <p
            className="text-[10px] uppercase tracking-widest font-bold mb-2"
            style={{ color: C.white30 }}
          >
            Date-wise Availability
          </p>

          <div className="space-y-2">
            {activeDates.map((item) => (
              <div
                key={item.date}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{
                  background: "rgba(14,165,233,0.07)",
                  border: "1px solid rgba(14,165,233,0.14)"
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg,${C.primaryLight},${C.primary})`,
                    color: "#fff"
                  }}
                >
                  <MdCalendarToday size={18}/>
                </div>

                <div className="flex-1 min-w-0">
                  <div
                    className="text-xs font-bold truncate"
                    style={{ color: "#7dd3fc" }}
                  >
                    {formatDateDisplay(item.date)}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {(item.slots || []).map((slot, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg"
                        style={{
                          background: "rgba(14,165,233,0.12)",
                          color: "#bae6fd"
                        }}
                      >
                        <MdAccessTime size={9}/>
                        {fmtTime(slot.start)} – {fmtTime(slot.end)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active weekly days */}
      <div className="p-5 space-y-2">
        {activeDays.length === 0 ? (
          <p
            className="text-center py-6 text-sm"
            style={{ color: C.white30 }}
          >
            No weekly working days configured
          </p>
        ) : (
          activeDays.map(day => {
            const d = availability[day.key];
            const mins = totalMins(d.slots);

            return (
              <div
                key={day.key}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{
                  background: "rgba(14,165,233,0.07)",
                  border: "1px solid rgba(14,165,233,0.14)"
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-black text-xs"
                  style={{
                    background: `linear-gradient(135deg,${C.primaryLight},${C.primary})`,
                    color: "#fff"
                  }}
                >
                  {day.label}
                </div>

                <div className="flex-1 flex flex-wrap gap-1.5">
                  {d.slots.map((sl, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg"
                      style={{
                        background: "rgba(14,165,233,0.12)",
                        color: "#7dd3fc"
                      }}
                    >
                      <MdAccessTime size={10}/>
                      {fmtTime(sl.start)} – {fmtTime(sl.end)}
                    </span>
                  ))}
                </div>

                <span
                  className="text-xs font-semibold flex-shrink-0"
                  style={{ color: "#38bdf8" }}
                >
                  {fmtDur(mins)}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Off day pills */}
      {offDays.length > 0 && (
        <div className="px-5 pb-5 flex flex-wrap gap-1.5">
          {offDays.map(d => (
            <span
              key={d.key}
              className="text-[11px] px-2.5 py-1 rounded-lg font-medium"
              style={{
                background: "rgba(255,255,255,0.04)",
                color: "rgba(255,255,255,0.18)"
              }}
            >
              {d.full} · Off
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Day Row ──────────────────────────────────────────────────────────────────
function DayRow({ day, value, onChange }) {
  const enabled = value?.enabled ?? false;

  const slots = value?.slots?.length
    ? value.slots
    : [{ ...DEFAULT_SLOT }];

  const set = (patch) =>
    onChange(day.key, {
      enabled,
      slots,
      ...patch
    });

  const updateSlot = (i, field, val) => {
    const next = slots.map((s, idx) =>
      idx === i
        ? { ...s, [field]: val }
        : s
    );

    set({ slots: next });
  };

  return (
    <div
      className="rounded-2xl border transition-all duration-200 overflow-hidden"
      style={{
        background: enabled
          ? `linear-gradient(135deg,rgba(2,132,199,0.05),rgba(6,182,212,0.03))`
          : "#fafbfc",
        borderColor: enabled
          ? C.primaryBorder
          : "#e5e7eb",
        boxShadow: enabled
          ? `0 2px 16px ${C.primaryGlow}`
          : "none",
      }}
    >

      {/* Toggle row */}
      <div className="flex items-center gap-3 px-4 py-3">

        <button
          onClick={() => set({ enabled: !enabled })}
          className="transition-transform hover:scale-110 flex-shrink-0"
          style={{
            fontSize: 34,
            color: enabled
              ? C.primary
              : "#d1d5db",
            lineHeight: 1
          }}
        >
          {enabled
            ? <MdToggleOn/>
            : <MdToggleOff/>
          }
        </button>

        <div className="flex-1">
          <span
            className="font-bold text-sm"
            style={{
              color: enabled
                ? C.primaryDark
                : "#9ca3af"
            }}
          >
            {day.full}
          </span>

          {enabled && (
            <span
              className="ml-2 text-[10px] font-semibold"
              style={{ color: C.primary }}
            >
              {slots.length} slot{slots.length !== 1 ? "s" : ""} ·{" "}
              {fmtDur(totalMins(slots))}
            </span>
          )}
        </div>

        {!enabled && (
          <span className="text-xs italic text-gray-300">
            Day off
          </span>
        )}
      </div>

      {/* Slot rows */}
      {enabled && (
        <div className="px-4 pb-4 space-y-2">

          <div
            className="h-px"
            style={{
              background: `linear-gradient(90deg,${C.primaryBorder},transparent)`
            }}
          />

          {slots.map((slot, i) => {

            const dur = slotMins(slot);

            return (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.85)",
                  border: `1px solid ${C.primaryBorder}`
                }}
              >

                <span
                  className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  style={{
                    background: "rgba(2,132,199,0.1)",
                    color: C.primary
                  }}
                >
                  {i + 1}
                </span>

                <MdAccessTime
                  size={14}
                  style={{
                    color: C.primary,
                    flexShrink: 0
                  }}
                />

                {/* From */}
                <div className="flex flex-col">

                  <label className="text-[8px] uppercase tracking-widest text-gray-400 mb-0.5">
                    From
                  </label>

                  <select
                    value={slot.start}
                    onChange={e =>
                      updateSlot(
                        i,
                        "start",
                        e.target.value
                      )
                    }
                    className="text-xs font-semibold rounded-lg px-2 py-1.5 outline-none"
                    style={{
                      border: `1.5px solid ${C.primaryBorder}`,
                      color: C.primaryDark,
                      background: C.primaryBg
                    }}
                  >
                    {TIME_SLOTS.map(t => (
                      <option key={t} value={t}>
                        {fmtTime(t)}
                      </option>
                    ))}
                  </select>

                </div>

                <span className="text-gray-300 text-sm">
                  →
                </span>

                {/* To */}
                <div className="flex flex-col">

                  <label className="text-[8px] uppercase tracking-widest text-gray-400 mb-0.5">
                    To
                  </label>

                  <select
                    value={slot.end}
                    onChange={e =>
                      updateSlot(
                        i,
                        "end",
                        e.target.value
                      )
                    }
                    className="text-xs font-semibold rounded-lg px-2 py-1.5 outline-none"
                    style={{
                      border: `1.5px solid ${C.primaryBorder}`,
                      color: C.primaryDark,
                      background: C.primaryBg
                    }}
                  >
                    {TIME_SLOTS.map(t => (
                      <option key={t} value={t}>
                        {fmtTime(t)}
                      </option>
                    ))}
                  </select>

                </div>

                <div className="flex-1"/>

                {dur > 0 && (
                  <span
                    className="text-[10px] font-semibold px-2 py-1 rounded-lg hidden sm:block"
                    style={{
                      background: "rgba(2,132,199,0.08)",
                      color: C.primary
                    }}
                  >
                    {fmtDur(dur)}
                  </span>
                )}

                {slots.length > 1 && (
                  <button
                    onClick={() =>
                      set({
                        slots: slots.filter(
                          (_, idx) => idx !== i
                        )
                      })
                    }
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition hover:scale-105"
                    style={{
                      background: "rgba(239,68,68,0.07)",
                      color: "#ef4444"
                    }}
                  >
                    <MdDelete size={14}/>
                  </button>
                )}

              </div>
            );
          })}

          <button
            onClick={() =>
              set({
                slots: [
                  ...slots,
                  { ...DEFAULT_SLOT }
                ]
              })
            }
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold w-full transition"
            style={{
              border: `1.5px dashed ${C.primaryBorder}`,
              color: C.primary,
              background: "transparent"
            }}
          >
            <MdAdd size={15}/>
            Add time slot
          </button>

        </div>
      )}
    </div>
  );
}

// ─── Date Availability Row ────────────────────────────────────────────────────
function DateAvailabilityRow({ item, index, onChange, onDelete }) {

  const slots =
    item?.slots?.length
      ? item.slots
      : [{ ...DEFAULT_SLOT }];

  const updateSlot = (slotIndex, field, value) => {
    const nextSlots = slots.map((slot, i) =>
      i === slotIndex
        ? { ...slot, [field]: value }
        : slot
    );

    onChange(index, {
      ...item,
      enabled: true,
      slots: nextSlots
    });
  };

  const addSlot = () => {
    onChange(index, {
      ...item,
      enabled: true,
      slots: [
        ...slots,
        { ...DEFAULT_SLOT }
      ]
    });
  };

  const deleteSlot = (slotIndex) => {
    if (slots.length === 1) return;

    onChange(index, {
      ...item,
      slots: slots.filter(
        (_, i) => i !== slotIndex
      )
    });
  };

  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        background: item.enabled
          ? "linear-gradient(135deg,rgba(2,132,199,0.05),rgba(6,182,212,0.03))"
          : "#fafbfc",
        borderColor: item.enabled
          ? C.primaryBorder
          : "#e5e7eb",
        boxShadow: item.enabled
          ? `0 2px 16px ${C.primaryGlow}`
          : "none"
      }}
    >

      {/* Date Header */}
      <div className="flex items-center gap-3 mb-3">

        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: "rgba(2,132,199,0.1)",
            color: C.primary
          }}
        >
          <MdCalendarToday size={18}/>
        </div>

        <div className="flex-1">

          <label className="text-[8px] uppercase tracking-widest text-gray-400 block mb-1">
            Date
          </label>

          <input
            type="date"
            min={getTodayString()}
            value={item.date || ""}
            onChange={e =>
              onChange(index, {
                ...item,
                date: e.target.value,
                enabled: true
              })
            }
            className="text-sm font-semibold rounded-lg px-3 py-2 outline-none"
            style={{
              border: `1.5px solid ${C.primaryBorder}`,
              color: C.primaryDark,
              background: C.primaryBg
            }}
          />

        </div>

        <button
          onClick={() => onDelete(index)}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition hover:scale-105"
          style={{
            background: "rgba(239,68,68,0.07)",
            color: "#ef4444"
          }}
        >
          <MdDelete size={15}/>
        </button>

      </div>

      {/* Time Slots */}
      <div className="space-y-2">

        {slots.map((slot, slotIndex) => (
          <div
            key={slotIndex}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.85)",
              border: `1px solid ${C.primaryBorder}`
            }}
          >

            <span
              className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0"
              style={{
                background: "rgba(2,132,199,0.1)",
                color: C.primary
              }}
            >
              {slotIndex + 1}
            </span>

            <MdAccessTime
              size={14}
              style={{
                color: C.primary,
                flexShrink: 0
              }}
            />

            <div className="flex flex-col">

              <label className="text-[8px] uppercase tracking-widest text-gray-400 mb-0.5">
                From
              </label>

              <select
                value={slot.start}
                onChange={e =>
                  updateSlot(
                    slotIndex,
                    "start",
                    e.target.value
                  )
                }
                className="text-xs font-semibold rounded-lg px-2 py-1.5 outline-none"
                style={{
                  border: `1.5px solid ${C.primaryBorder}`,
                  color: C.primaryDark,
                  background: C.primaryBg
                }}
              >
                {TIME_SLOTS.map(t => (
                  <option key={t} value={t}>
                    {fmtTime(t)}
                  </option>
                ))}
              </select>

            </div>

            <span className="text-gray-300 text-sm">
              →
            </span>

            <div className="flex flex-col">

              <label className="text-[8px] uppercase tracking-widest text-gray-400 mb-0.5">
                To
              </label>

              <select
                value={slot.end}
                onChange={e =>
                  updateSlot(
                    slotIndex,
                    "end",
                    e.target.value
                  )
                }
                className="text-xs font-semibold rounded-lg px-2 py-1.5 outline-none"
                style={{
                  border: `1.5px solid ${C.primaryBorder}`,
                  color: C.primaryDark,
                  background: C.primaryBg
                }}
              >
                {TIME_SLOTS.map(t => (
                  <option key={t} value={t}>
                    {fmtTime(t)}
                  </option>
                ))}
              </select>

            </div>

            <div className="flex-1"/>

            {slotMins(slot) > 0 && (
              <span
                className="text-[10px] font-semibold px-2 py-1 rounded-lg hidden sm:block"
                style={{
                  background: "rgba(2,132,199,0.08)",
                  color: C.primary
                }}
              >
                {fmtDur(slotMins(slot))}
              </span>
            )}

            {slots.length > 1 && (
              <button
                onClick={() =>
                  deleteSlot(slotIndex)
                }
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: "rgba(239,68,68,0.07)",
                  color: "#ef4444"
                }}
              >
                <MdDelete size={14}/>
              </button>
            )}

          </div>
        ))}

        <button
          onClick={addSlot}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold w-full transition"
          style={{
            border: `1.5px dashed ${C.primaryBorder}`,
            color: C.primary,
            background: "transparent"
          }}
        >
          <MdAdd size={15}/>
          Add time slot
        </button>

      </div>
    </div>
  );
}

// ─── Setting Row ──────────────────────────────────────────────────────────────
function SettingRow({ icon, label, hint, children }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
      style={{
        background: "#fff",
        border: `1px solid ${C.primaryBorder}`
      }}
    >

      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(2,132,199,0.08)" }}
      >
        <span style={{ color: C.primary }}>
          {icon}
        </span>
      </div>

      <div className="flex-1">

        <p className="text-sm font-semibold text-gray-700">
          {label}
        </p>

        {hint && (
          <p className="text-[11px] text-gray-400">
            {hint}
          </p>
        )}

      </div>

      {children}

    </div>
  );
}

const selStyle = {
  border: "1.5px solid rgba(2,132,199,0.2)",
  color: "#0369a1",
  background: "#f0f9ff",
  borderRadius: 10,
  padding: "6px 10px",
  fontSize: 13,
  fontWeight: 600,
  outline: "none",
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ClinicalAvailability() {

  const [availability, setAvailability] =
    useState(DEFAULT_AVAILABILITY);

  const [dateOverrides, setDateOverrides] =
    useState([]);

  const [consultationDuration, setConsult] =
    useState(30);

  const [maxPatientsPerDay, setMaxPat] =
    useState(20);

  const [breakTime, setBreak] =
    useState({
      start: "13:00",
      end: "14:00"
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [toast, setToast] =
    useState({
      message: "",
      type: ""
    });

  const showToast = (msg, type = "success") => {
    setToast({
      message: msg,
      type
    });

    setTimeout(() => {
      setToast({
        message: "",
        type: ""
      });
    }, 3000);
  };

  // ── Fetch ───────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {

    setLoading(true);

    try {

      const { data } =
        await API.get("/doctor/availability");

      if (data) {

        const av =
          data.availability || {};

        const merged =
          DAYS.reduce((acc, d) => {

            const bd =
              av[d.key];

            if (bd) {

              if (
                bd.slots &&
                bd.slots.length > 0
              ) {

                acc[d.key] = {
                  enabled:
                    bd.enabled ?? false,
                  slots:
                    bd.slots
                };

              } else if (
                bd.start &&
                bd.end
              ) {

                acc[d.key] = {
                  enabled:
                    bd.enabled ?? false,
                  slots: [
                    {
                      start: bd.start,
                      end: bd.end
                    }
                  ]
                };

              } else {

                acc[d.key] = {
                  enabled:
                    bd.enabled ?? false,
                  slots: [
                    { ...DEFAULT_SLOT }
                  ]
                };
              }

            } else {

              acc[d.key] = {
                enabled: false,
                slots: [
                  { ...DEFAULT_SLOT }
                ]
              };

            }

            return acc;

          }, {});

        setAvailability(merged);

        setDateOverrides(
          Array.isArray(data.dateOverrides)
            ? data.dateOverrides
            : []
        );

        setConsult(
          data.consultationDuration ?? 30
        );

        setMaxPat(
          data.maxPatientsPerDay ?? 20
        );

        setBreak(
          data.breakTime ?? {
            start: "13:00",
            end: "14:00"
          }
        );
      }

    } catch {

      showToast(
        "Could not load availability",
        "error"
      );

    } finally {

      setLoading(false);

    }

  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Save ────────────────────────────────────────────────────────────────
  const handleSave = async () => {

    setSaving(true);

    try {

      await API.put(
        "/doctor/availability",
        {
          availability,
          dateOverrides,
          consultationDuration,
          maxPatientsPerDay,
          breakTime,
        }
      );

      showToast(
        "Availability saved!",
        "success"
      );

    } catch (e) {

      showToast(
        e?.response?.data?.message ||
        "Failed to save",
        "error"
      );

    } finally {

      setSaving(false);

    }
  };

  const handleDayChange = (key, val) =>
    setAvailability(prev => ({
      ...prev,
      [key]: val
    }));

  // ── Date-wise handlers ──────────────────────────────────────────────────

  const addDateOverride = () => {

    const usedDates =
      new Set(
        dateOverrides.map(d => d.date)
      );

    let nextDate =
      getTodayString();

    // Prevent duplicate date
    if (usedDates.has(nextDate)) {

      const d = new Date();

      for (let i = 1; i <= 365; i++) {

        const next =
          new Date(
            d.getFullYear(),
            d.getMonth(),
            d.getDate() + i
          );

        const year =
          next.getFullYear();

        const month =
          String(next.getMonth() + 1)
            .padStart(2, "0");

        const day =
          String(next.getDate())
            .padStart(2, "0");

        const candidate =
          `${year}-${month}-${day}`;

        if (!usedDates.has(candidate)) {
          nextDate = candidate;
          break;
        }
      }
    }

    setDateOverrides(prev => [
      ...prev,
      {
        date: nextDate,
        enabled: true,
        slots: [
          { ...DEFAULT_SLOT }
        ]
      }
    ]);
  };

  const updateDateOverride = (index, value) => {

    setDateOverrides(prev =>
      prev.map((item, i) =>
        i === index
          ? value
          : item
      )
    );

  };

  const deleteDateOverride = (index) => {

    setDateOverrides(prev =>
      prev.filter(
        (_, i) => i !== index
      )
    );

  };

  const activeDays =
    DAYS.filter(
      d => availability[d.key]?.enabled
    ).length;

  return (

    <div
      className="min-h-screen p-4 md:p-6 space-y-5"
      style={{
        background: "#f0f9ff"
      }}
    >

      <Toast {...toast}/>

      {/* ── Header ── */}
      <div
        className="relative overflow-hidden rounded-2xl px-6 py-5"
        style={{
          background:
            `linear-gradient(135deg,${C.dark} 0%,${C.darkMid} 100%)`,
          boxShadow:
            "0 12px 40px rgba(2,132,199,0.25)"
        }}
      >

        <div
          className="absolute -top-6 -right-6 w-32 h-32 rounded-full pointer-events-none"
          style={{
            background: C.primary,
            opacity: 0.08
          }}
        />

        <div
          className="relative flex items-center justify-between gap-4"
        >

          <div>

            <div className="flex items-center gap-2 mb-1">

              <MdCalendarToday
                size={15}
                style={{
                  color: C.primaryLight
                }}
              />

              <span
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{
                  color: C.primaryLight
                }}
              >
                Doctor Dashboard
              </span>

            </div>

            <h1
              className="text-white font-black text-xl leading-tight"
            >
              Clinical Availability
            </h1>

            <p
              className="text-sm mt-0.5"
              style={{
                color: C.white30
              }}
            >
              {activeDays > 0
                ? `${activeDays} working day${activeDays !== 1 ? "s" : ""} configured`
                : "No days configured yet"}
            </p>

          </div>

          <div className="flex items-center gap-2 flex-shrink-0">

            <button
              onClick={fetchData}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition hover:scale-105"
              style={{
                background: C.white10,
                color: "#fff"
              }}
            >
              <MdRefresh size={18}/>
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition hover:scale-105 disabled:opacity-50"
              style={{
                background:
                  `linear-gradient(135deg,${C.primaryLight},${C.primary})`,
                color: "#fff",
                boxShadow:
                  "0 4px 14px rgba(2,132,199,0.4)"
              }}
            >
              <MdSave size={16}/>
              {saving ? "Saving…" : "Save"}
            </button>

          </div>

        </div>
      </div>

      {/* ── Summary ── */}
      <SummaryCard
        availability={availability}
        dateOverrides={dateOverrides}
        breakTime={breakTime}
        consultationDuration={consultationDuration}
        maxPatientsPerDay={maxPatientsPerDay}
      />

      {/* ── Settings ── */}
      <div>

        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 px-1">
          Session Settings
        </p>

        <div className="space-y-2">

          <SettingRow
            icon={<MdTimer size={16}/>}
            label="Consultation Duration"
            hint="Time allocated per patient"
          >
            <select
              value={consultationDuration}
              onChange={e =>
                setConsult(Number(e.target.value))
              }
              style={selStyle}
            >
              {[10,15,20,30,45,60,90].map(m => (
                <option key={m} value={m}>
                  {m} minutes
                </option>
              ))}
            </select>
          </SettingRow>

          <SettingRow
            icon={<MdPeople size={16}/>}
            label="Max Patients Per Day"
            hint="Daily appointment cap"
          >
            <input
              type="number"
              min={1}
              max={100}
              value={maxPatientsPerDay}
              onChange={e =>
                setMaxPat(Number(e.target.value))
              }
              className="w-16 text-center font-bold outline-none"
              style={{
                ...selStyle,
                padding: "6px 8px"
              }}
            />
          </SettingRow>

          <SettingRow
            icon={<MdCoffee size={16}/>}
            label="Break Time"
            hint="Blocked from patient bookings"
          >
            <div className="flex items-center gap-2">

              <select
                value={breakTime.start}
                onChange={e =>
                  setBreak(p => ({
                    ...p,
                    start: e.target.value
                  }))
                }
                style={selStyle}
              >
                {TIME_SLOTS.map(t => (
                  <option key={t} value={t}>
                    {fmtTime(t)}
                  </option>
                ))}
              </select>

              <span className="text-gray-300">
                –
              </span>

              <select
                value={breakTime.end}
                onChange={e =>
                  setBreak(p => ({
                    ...p,
                    end: e.target.value
                  }))
                }
                style={selStyle}
              >
                {TIME_SLOTS.map(t => (
                  <option key={t} value={t}>
                    {fmtTime(t)}
                  </option>
                ))}
              </select>

            </div>
          </SettingRow>

        </div>
      </div>

      {/* ── Date-wise Schedule ── */}
      <div>

        <div className="flex items-center justify-between mb-2 px-1">

          <div>

            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Date-wise Schedule
            </p>

            <p className="text-xs text-gray-400 mt-0.5">
              Set the exact dates and times when patients can book you.
            </p>

          </div>

          <button
            onClick={addDateOverride}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition hover:scale-105"
            style={{
              background:
                `linear-gradient(135deg,${C.primaryLight},${C.primary})`,
              color: "#fff",
              boxShadow:
                "0 4px 14px rgba(2,132,199,0.25)"
            }}
          >
            <MdAdd size={15}/>
            Add Date
          </button>

        </div>

        <div className="space-y-2.5">

          {dateOverrides.length === 0 ? (

            <div
              className="rounded-2xl p-6 text-center"
              style={{
                background: "#fff",
                border: `1px dashed ${C.primaryBorder}`
              }}
            >

              <MdCalendarToday
                size={28}
                style={{
                  color: C.primaryLight,
                  margin: "0 auto 8px"
                }}
              />

              <p className="text-sm font-semibold text-gray-600">
                No date-wise availability configured
              </p>

              <p className="text-xs text-gray-400 mt-1">
                Add a date and set the time slots patients can book.
              </p>

            </div>

          ) : (

            dateOverrides.map((item, index) => (

              <DateAvailabilityRow
                key={`${item.date}-${index}`}
                item={item}
                index={index}
                onChange={updateDateOverride}
                onDelete={deleteDateOverride}
              />

            ))

          )}

        </div>
      </div>

      {/* ── Weekly Schedule ── */}
      <div>

        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 px-1">
          Weekly Schedule
        </p>

        <div className="space-y-2.5">

          {loading

            ? Array.from({
                length: 7
              }).map((_, i) => (

                <div
                  key={i}
                  className="h-14 rounded-2xl animate-pulse"
                  style={{
                    background: "#dbeafe"
                  }}
                />

              ))

            : DAYS.map(day => (

                <DayRow
                  key={day.key}
                  day={day}
                  value={availability[day.key]}
                  onChange={handleDayChange}
                />

              ))

          }

        </div>

      </div>

      {/* ── Footer ── */}
      <div
        className="flex items-center justify-between px-4 py-3.5 rounded-2xl"
        style={{
          background: "rgba(2,132,199,0.05)",
          border: `1px solid ${C.primaryBorder}`
        }}
      >

        <p className="text-xs text-gray-500">
          Changes apply to{" "}
          <strong
            style={{
              color: C.primary
            }}
          >
            future bookings only
          </strong>
        </p>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm transition hover:scale-105 disabled:opacity-50"
          style={{
            background:
              `linear-gradient(135deg,${C.primaryLight},${C.primary})`,
            color: "#fff",
            boxShadow:
              "0 4px 14px rgba(2,132,199,0.35)"
          }}
        >
          <MdSave size={15}/>
          {saving ? "Saving…" : "Save Changes"}
        </button>

      </div>

    </div>
  );
}
