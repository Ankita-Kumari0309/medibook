import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  MdAutoAwesome,
  MdSend,
  MdAccessTime,
  MdVerified,
  MdPerson,
  MdRefresh,
  MdInfoOutline,
  MdArrowForward,
  MdClose,
  MdCheckCircle,
  MdMic,
  MdStop,
  MdLanguage,
} from "react-icons/md";

import API from "../../../api/axios";

// ─────────────────────────────────────────────────────────────────────────────
// LANGUAGES
// ─────────────────────────────────────────────────────────────────────────────

const VOICE_LANGUAGES = [
  { code: "auto", label: "Auto detect" },

  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "bn", label: "Bengali" },
  { code: "gu", label: "Gujarati" },
  { code: "kn", label: "Kannada" },
  { code: "ml", label: "Malayalam" },
  { code: "mr", label: "Marathi" },
  { code: "or", label: "Odia" },
  { code: "pa", label: "Punjabi" },
  { code: "ta", label: "Tamil" },
  { code: "te", label: "Telugu" },
  { code: "ur", label: "Urdu" },
  { code: "as", label: "Assamese" },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const getLanguageLabel = (code) => {
  return (
    VOICE_LANGUAGES.find(
      (item) => item.code === code
    )?.label || code
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE
// ─────────────────────────────────────────────────────────────────────────────

function MessageBubble({
  message,
}) {
  const isUser =
    message.role === "user";

  return (
    <div
      className={`flex gap-3 ${
        isUser
          ? "justify-end"
          : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white flex items-center justify-center flex-shrink-0">
          <MdAutoAwesome size={18} />
        </div>
      )}

      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
          isUser
            ? "bg-teal-600 text-white rounded-br-md"
            : "bg-gray-100 text-gray-700 rounded-bl-md"
        }`}
      >
        {message.content}
      </div>

      {isUser && (
        <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0">
          <MdPerson size={18} />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BOOKING MODAL
// ─────────────────────────────────────────────────────────────────────────────

function BookingModal({
  doctor,
  onClose,
}) {
  const [date, setDate] =
    useState("");

  const [time, setTime] =
    useState("");

  const [note, setNote] =
    useState("");

  const [availability, setAvailability] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [bookingLoading, setBookingLoading] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [error, setError] =
    useState("");

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  useEffect(() => {
    const fetchAvailability =
      async () => {
        try {
          setLoading(true);

          const { data } =
            await API.get(
              `/doctor/availability/${doctor._id}`
            );

          setAvailability(
            data
          );
        } catch (err) {
          console.error(err);

          setError(
            err.response?.data?.message ||
              "Failed to load doctor availability."
          );
        } finally {
          setLoading(false);
        }
      };

    fetchAvailability();
  }, [doctor._id]);

  const getSlotsForDate =
    () => {
      if (
        !date ||
        !availability
      ) {
        return [];
      }

      const days = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];

      const [year, month, day] =
        date
          .split("-")
          .map(Number);

      const localDate =
        new Date(
          year,
          month - 1,
          day
        );

      const dayName =
        days[
          localDate.getDay()
        ];

      return (
        availability.slots?.[
          dayName
        ] || []
      );
    };

  const slots =
    getSlotsForDate();

  const handleBooking =
    async () => {
      if (
        !date ||
        !time
      ) {
        return;
      }

      setBookingLoading(
        true
      );

      setError("");

      try {
        await API.post(
          "/appointments",
          {
            doctorId:
              doctor._id,
            date,
            time,
            note,
          }
        );

        setSuccess(true);
      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
            "Booking failed. Please try again."
        );
      } finally {
        setBookingLoading(
          false
        );
      }
    };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-8 w-full max-w-md text-center shadow-xl">

          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />

          <p className="text-gray-500 text-sm">
            Loading doctor availability...
          </p>

        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">

        <div className="bg-white rounded-3xl p-6 w-full max-w-md text-center shadow-2xl">

          <MdCheckCircle
            size={60}
            className="text-teal-500 mx-auto mb-3"
          />

          <h2 className="text-xl font-bold">
            Appointment Confirmed!
          </h2>

          <div className="mt-4 text-sm text-gray-600 space-y-2 text-left bg-teal-50 p-4 rounded-xl">

            <p>
              <b>Doctor:</b>{" "}
              {doctor.name}
            </p>

            <p>
              <b>Speciality:</b>{" "}
              {doctor.speciality}
            </p>

            <p>
              <b>Date:</b> {date}
            </p>

            <p>
              <b>Time:</b> {time}
            </p>

            <p>
              <b>Fee:</b> ₹
              {doctor.fees}
            </p>

          </div>

          <button
            onClick={onClose}
            className="mt-5 w-full bg-teal-600 text-white py-2.5 rounded-xl font-semibold"
          >
            Done
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">

      <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">

        <div className="flex justify-between items-center mb-4">

          <div>
            <h2 className="text-lg font-bold">
              Book Appointment
            </h2>

            <p className="text-xs text-gray-400">
              Select a date and available time
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center"
          >
            <MdClose size={20} />
          </button>

        </div>

        <div className="bg-teal-50 p-4 rounded-2xl mb-5">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center font-bold">

              {doctor.name
                ?.split(" ")
                .map(
                  (n) => n[0]
                )
                .join("")
                .slice(0, 2)
                .toUpperCase()}

            </div>

            <div>

              <p className="font-bold">
                {doctor.name}
              </p>

              <p className="text-sm text-gray-500">
                {doctor.speciality}
              </p>

            </div>

          </div>

          <div className="flex justify-between mt-3 text-sm">

            <p className="text-purple-500">
              {doctor.experience
                ? `${doctor.experience} years experience`
                : "Experience not listed"}
            </p>

            <p className="text-teal-600 font-bold">
              ₹{doctor.fees}
            </p>

          </div>

        </div>

        <label className="text-xs text-gray-500 font-medium mb-1 block">
          Select Date
        </label>

        <input
          type="date"
          min={today}
          value={date}
          onChange={(e) => {
            setDate(
              e.target.value
            );

            setTime("");

            setError("");
          }}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 mb-4"
        />

        <label className="text-xs text-gray-500 font-medium mb-1 block">
          Select Time Slot
        </label>

        <div className="flex flex-wrap gap-2 mb-4">

          {!date && (
            <p className="text-xs text-gray-400">
              Select a date to view available time slots.
            </p>
          )}

          {date &&
            slots.length ===
              0 && (
              <p className="text-xs text-red-500">
                No slots are available for this date.
              </p>
            )}

          {slots.map(
            (slot) => (
              <button
                key={slot}
                onClick={() => {
                  setTime(
                    slot
                  );
                  setError(
                    ""
                  );
                }}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border ${
                  time === slot
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <MdAccessTime
                  size={12}
                />
                {slot}
              </button>
            )
          )}

        </div>

        <label className="text-xs text-gray-500 font-medium mb-1 block">
          Issue / Note
          <span className="text-gray-400">
            {" "}
            (optional)
          </span>
        </label>

        <textarea
          value={note}
          onChange={(e) =>
            setNote(
              e.target.value
            )
          }
          rows={3}
          placeholder="Describe your issue..."
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-4 resize-none"
        />

        {error && (
          <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">
            {error}
          </p>
        )}

        <button
          onClick={
            handleBooking
          }
          disabled={
            !date ||
            !time ||
            bookingLoading
          }
          className="w-full bg-gradient-to-r from-teal-600 to-emerald-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
        >
          {bookingLoading
            ? "Confirming..."
            : "Confirm Booking"}
        </button>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCTOR CARD
// ─────────────────────────────────────────────────────────────────────────────

function RecommendationCard({
  doctor,
  onBook,
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">

      <div className="flex items-start gap-3">

        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center font-bold">

          {doctor.name
            ?.split(" ")
            .map(
              (n) => n[0]
            )
            .join("")
            .slice(0, 2)
            .toUpperCase()}

        </div>

        <div className="flex-1 min-w-0">

          <div className="flex items-center gap-1">

            <h3 className="font-bold text-gray-800 truncate">
              {doctor.name}
            </h3>

            <MdVerified
              size={16}
              className="text-teal-500"
            />

          </div>

          <p className="text-xs text-teal-600 font-semibold">
            {doctor.speciality}
          </p>

        </div>

        <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded-full">
          {doctor.matchScore}% match
        </span>

      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">

        <div className="bg-gray-50 rounded-xl px-3 py-2">

          <p className="text-[10px] text-gray-400 uppercase">
            Experience
          </p>

          <p className="text-sm font-bold text-gray-700">
            {doctor.experience
              ? `${doctor.experience} years`
              : "Not listed"}
          </p>

        </div>

        <div className="bg-gray-50 rounded-xl px-3 py-2">

          <p className="text-[10px] text-gray-400 uppercase">
            Booking
          </p>

          <p className="text-sm font-bold text-teal-600">
            Choose date
          </p>

        </div>

      </div>

      <div className="mt-3 bg-blue-50 rounded-xl px-3 py-2">

        <p className="text-[11px] text-blue-700">
          Recommended based on specialty relevance and doctor experience.
        </p>

      </div>

      <button
        onClick={() =>
          onBook(doctor)
        }
        className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-500 text-white py-2.5 rounded-xl text-sm font-semibold"
      >
        View & Book
        <MdArrowForward size={16} />
      </button>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

export default function AICareAssistant() {
  const [messages, setMessages] =
    useState([
      {
        role: "assistant",
        content:
          "Hi! I'm MediBook AI Care Assistant. Tell me what you're experiencing. I'll ask a few relevant questions before suggesting suitable doctors.",
      },
    ]);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [recording, setRecording] =
    useState(false);

  const [transcribing, setTranscribing] =
    useState(false);

  const [language, setLanguage] =
    useState("auto");

  const [detectedLanguage, setDetectedLanguage] =
    useState("");

  const [analysis, setAnalysis] =
    useState(null);

  const [recommendations, setRecommendations] =
    useState([]);

  const [selectedDoctor, setSelectedDoctor] =
    useState(null);

  const [error, setError] =
    useState("");

  const mediaRecorderRef =
    useRef(null);

  const audioChunksRef =
    useRef([]);

  const streamRef =
    useRef(null);

  // ─────────────────────────────────────────────────────────────────────────
  // SEND
  // ─────────────────────────────────────────────────────────────────────────

  const sendMessage =
    async () => {
      if (
        !input.trim() ||
        loading
      ) {
        return;
      }

      const userMessage =
        input.trim();

      const updatedMessages =
        [
          ...messages,
          {
            role: "user",
            content:
              userMessage,
          },
        ];

      setMessages(
        updatedMessages
      );

      setInput("");
      setError("");
      setLoading(true);

      try {
        const { data } =
          await API.post(
            "/ai/care-recommendation",
            {
              messages:
                updatedMessages.map(
                  (msg) => ({
                    role:
                      msg.role,
                    content:
                      msg.content,
                  })
                ),

              message:
                userMessage,

              // IMPORTANT:
              // If Hindi is active, send "hi",
              // not "Hindi".
              language:
                language || "auto",
            }
          );

        /*
          Backend returns ISO code.
          Save it.
        */
        if (
          data.language
        ) {
          setLanguage(
            data.language
          );

          setDetectedLanguage(
            data.language
          );
        }

        if (
          data.type ===
          "question"
        ) {
          setMessages(
            (prev) => [
              ...prev,
              {
                role:
                  "assistant",
                content:
                  data.question,
              },
            ]
          );

          return;
        }

        if (
          data.type ===
          "complete"
        ) {
          setAnalysis(
            data.analysis ||
              null
          );

          setRecommendations(
            data.recommendations ||
              []
          );

          setMessages(
            (prev) => [
              ...prev,
              {
                role:
                  "assistant",
                content:
                  data.message ||
                  "I've analyzed the information you provided.",
              },
            ]
          );
        }
      } catch (err) {
        console.error(
          "AI CARE ERROR:",
          err
        );

        const message =
          err.response?.data
            ?.message ||
          "Unable to connect to the AI assistant.";

        setError(message);

        setMessages(
          (prev) => [
            ...prev,
            {
              role:
                "assistant",
              content:
                "I couldn't process that request right now. Please try again.",
            },
          ]
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  // ─────────────────────────────────────────────────────────────────────────
  // START RECORDING
  // ─────────────────────────────────────────────────────────────────────────

  const startRecording =
    async () => {
      if (
        recording ||
        transcribing ||
        loading
      ) {
        return;
      }

      setError("");

      try {
        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              audio: true,
            }
          );

        streamRef.current =
          stream;

        const supportedMime =
          [
            "audio/webm;codecs=opus",
            "audio/webm",
            "audio/mp4",
          ].find(
            (mime) =>
              MediaRecorder.isTypeSupported(
                mime
              )
          );

        const recorder =
          supportedMime
            ? new MediaRecorder(
                stream,
                {
                  mimeType:
                    supportedMime,
                }
              )
            : new MediaRecorder(
                stream
              );

        audioChunksRef.current =
          [];

        recorder.ondataavailable =
          (event) => {
            if (
              event.data &&
              event.data.size >
                0
            ) {
              audioChunksRef.current.push(
                event.data
              );
            }
          };

        recorder.onstop =
          async () => {
            try {
              setRecording(
                false
              );

              setTranscribing(
                true
              );

              const actualType =
                recorder.mimeType ||
                "audio/webm";

              const extension =
                actualType.includes(
                  "mp4"
                )
                  ? "mp4"
                  : "webm";

              const blob =
                new Blob(
                  audioChunksRef.current,
                  {
                    type:
                      actualType,
                  }
                );

              const formData =
                new FormData();

              formData.append(
                "audio",
                blob,
                `voice.${extension}`
              );

              /*
                IMPORTANT:

                language must be the CODE:
                hi, mr, en, etc.

                never:
                Hindi, Marathi, English
              */
              formData.append(
                "language",
                language ===
                  "auto"
                  ? "auto"
                  : language
              );

              const { data } =
                await API.post(
                  "/ai/transcribe",
                  formData
                );

              const transcript =
                data?.text?.trim();

              if (
                !transcript
              ) {
                throw new Error(
                  "No speech could be detected."
                );
              }

              setInput(
                transcript
              );

              /*
                Always remember ISO code.
              */
              if (
                data.detectedLanguage
              ) {
                setLanguage(
                  data.detectedLanguage
                );

                setDetectedLanguage(
                  data.detectedLanguage
                );
              }
            } catch (err) {
              console.error(
                "VOICE ERROR:",
                err
              );

              setError(
                err.response?.data
                  ?.message ||
                  err.message ||
                  "Unable to transcribe audio."
              );
            } finally {
              setTranscribing(
                false
              );
            }
          };

        recorder.start();

        mediaRecorderRef.current =
          recorder;

        setRecording(
          true
        );
      } catch (err) {
        console.error(err);

        setError(
          err.message ||
            "Unable to access microphone."
        );
      }
    };

  // ─────────────────────────────────────────────────────────────────────────
  // STOP
  // ─────────────────────────────────────────────────────────────────────────

  const stopRecording =
    () => {
      const recorder =
        mediaRecorderRef.current;

      if (
        recorder &&
        recorder.state !==
          "inactive"
      ) {
        recorder.stop();
      }

      if (
        streamRef.current
      ) {
        streamRef.current
          .getTracks()
          .forEach(
            (track) =>
              track.stop()
          );

        streamRef.current =
          null;
      }
    };

  // ─────────────────────────────────────────────────────────────────────────
  // RESET
  // ─────────────────────────────────────────────────────────────────────────

  const handleReset =
    () => {
      if (recording) {
        stopRecording();
      }

      setMessages([
        {
          role:
            "assistant",
          content:
            "Hi! I'm MediBook AI Care Assistant. Tell me what you're experiencing. I'll ask a few relevant questions before suggesting suitable doctors.",
        },
      ]);

      setInput("");

      setLanguage(
        "auto"
      );

      setDetectedLanguage(
        ""
      );

      setAnalysis(
        null
      );

      setRecommendations(
        []
      );

      setSelectedDoctor(
        null
      );

      setError("");
    };

  // ─────────────────────────────────────────────────────────────────────────
  // KEYBOARD
  // ─────────────────────────────────────────────────────────────────────────

  const handleKeyDown =
    (e) => {
      if (
        e.key ===
          "Enter" &&
        !e.shiftKey
      ) {
        e.preventDefault();

        sendMessage();
      }
    };

  // ─────────────────────────────────────────────────────────────────────────
  // LANGUAGE SELECT
  // ─────────────────────────────────────────────────────────────────────────

  const handleLanguageChange =
    (e) => {
      const value =
        e.target.value;

      setLanguage(
        value
      );

      setDetectedLanguage(
        value ===
          "auto"
          ? ""
          : value
      );
    };

  // ─────────────────────────────────────────────────────────────────────────
  // CLEANUP
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current
          .state !==
          "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }

      if (
        streamRef.current
      ) {
        streamRef.current
          .getTracks()
          .forEach(
            (track) =>
              track.stop()
          );
      }
    };
  }, []);

  return (
    <div className="space-y-5">

      {/* HEADER */}
      <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-slate-900 via-teal-900 to-teal-700">

        <div className="relative">

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-cyan-200 text-[11px] font-bold uppercase tracking-widest">

            <MdAutoAwesome size={14} />

            AI-Powered

          </div>

          <h1 className="text-2xl font-black text-white mt-3">
            MediBook AI Care Assistant
          </h1>

          <p className="text-teal-100/70 text-sm mt-1">
            Describe your concern using text or multilingual voice input. The assistant will continue the conversation in your language.
          </p>

        </div>
      </div>

      {/* MAIN */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-5">

        {/* CHAT */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <MdAutoAwesome size={20} />
              </div>

              <div>

                <p className="font-bold text-gray-800">
                  AI Care Assistant
                </p>

                <p className="text-xs text-gray-400">
                  Multilingual conversational healthcare navigation
                </p>

              </div>

            </div>

            <button
              onClick={
                handleReset
              }
              className="w-9 h-9 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center"
            >
              <MdRefresh size={17} />
            </button>

          </div>

          {/* MESSAGES */}
          <div className="p-5 space-y-4 min-h-[420px] max-h-[520px] overflow-y-auto">

            {messages.map(
              (
                message,
                index
              ) => (
                <MessageBubble
                  key={
                    index
                  }
                  message={
                    message
                  }
                />
              )
            )}

            {loading && (
              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <MdAutoAwesome size={18} />
                </div>

                <div className="bg-gray-100 rounded-2xl px-4 py-3">

                  <div className="flex gap-1">

                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:100ms]" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:200ms]" />

                  </div>

                </div>

              </div>
            )}

          </div>

          {/* LANGUAGE */}
          <div className="px-5 pb-3">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">

                <MdLanguage
                  size={16}
                  className="text-teal-500"
                />

                <span className="text-xs font-semibold text-gray-500">
                  Conversation language
                </span>

              </div>

              <select
                value={
                  language
                }
                onChange={
                  handleLanguageChange
                }
                disabled={
                  loading ||
                  recording ||
                  transcribing
                }
                className="border border-gray-200 rounded-xl px-3 py-2 text-xs"
              >

                {VOICE_LANGUAGES.map(
                  (
                    item
                  ) => (
                    <option
                      key={
                        item.code
                      }
                      value={
                        item.code
                      }
                    >
                      {
                        item.label
                      }
                    </option>
                  )
                )}

              </select>

            </div>

            {detectedLanguage && (
              <p className="text-[10px] text-gray-400 mt-1">
                Active language:{" "}
                {getLanguageLabel(
                  detectedLanguage
                )}
              </p>
            )}

          </div>

          {/* INPUT */}
          <div className="p-5 pt-2 border-t border-gray-100">

            <div className="flex items-end gap-2">

              <textarea
                value={input}
                onChange={(e) =>
                  setInput(
                    e.target.value
                  )
                }
                onKeyDown={
                  handleKeyDown
                }
                rows={2}
                placeholder="Type your concern or use the microphone..."
                disabled={
                  recording ||
                  transcribing
                }
                className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-300"
              />

              <button
                type="button"
                onClick={
                  recording
                    ? stopRecording
                    : startRecording
                }
                disabled={
                  loading ||
                  transcribing
                }
                className={`w-12 h-12 rounded-xl text-white flex items-center justify-center ${
                  recording
                    ? "bg-red-500 animate-pulse"
                    : "bg-slate-700"
                } disabled:opacity-40`}
              >
                {recording ? (
                  <MdStop size={20} />
                ) : (
                  <MdMic size={20} />
                )}
              </button>

              <button
                onClick={
                  sendMessage
                }
                disabled={
                  loading ||
                  recording ||
                  transcribing ||
                  !input.trim()
                }
                className="w-12 h-12 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 text-white flex items-center justify-center disabled:opacity-40"
              >
                <MdSend size={19} />
              </button>

            </div>

            {recording && (
              <p className="text-[11px] text-red-500 mt-2">
                ● Listening... click the microphone to stop.
              </p>
            )}

            {transcribing && (
              <p className="text-[11px] text-teal-600 mt-2">
                Transcribing your voice...
              </p>
            )}

          </div>

        </div>

        {/* RIGHT */}
        <div className="space-y-5">

          {analysis ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

              <div className="flex items-center gap-2 mb-4">

                <div className="w-1 h-5 bg-teal-500 rounded-full" />

                <h2 className="font-bold text-gray-800">
                  AI Analysis
                </h2>

              </div>

              <div className="bg-teal-50 rounded-xl p-4">

                <p className="text-[10px] uppercase text-teal-500 font-bold">
                  Suggested Specialty
                </p>

                <p className="text-xl font-black text-teal-700 mt-1">
                  {
                    analysis.speciality
                  }
                </p>

                {analysis.confidence !==
                  null &&
                  analysis.confidence !==
                    undefined && (
                    <p className="text-xs text-teal-600 mt-1">
                      AI confidence:{" "}
                      {Math.round(
                        analysis.confidence *
                          100
                      )}
                      %
                    </p>
                  )}

                {analysis.reason && (
                  <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                    {
                      analysis.reason
                    }
                  </p>
                )}

              </div>

              {analysis.duration && (
                <div className="mt-3 bg-gray-50 rounded-xl px-3 py-2">

                  <p className="text-[10px] uppercase text-gray-400 font-bold">
                    Duration
                  </p>

                  <p className="text-sm font-semibold">
                    {
                      analysis.duration
                    }
                  </p>

                </div>
              )}

              {analysis.severity && (
                <div className="mt-2 bg-gray-50 rounded-xl px-3 py-2">

                  <p className="text-[10px] uppercase text-gray-400 font-bold">
                    Reported Severity
                  </p>

                  <p className="text-sm font-semibold">
                    {
                      analysis.severity
                    }
                  </p>

                </div>
              )}

              {analysis.symptoms?.length >
                0 && (
                <div className="mt-4">

                  <p className="text-[10px] uppercase text-gray-400 font-bold mb-2">
                    Extracted Symptoms
                  </p>

                  <div className="flex flex-wrap gap-2">

                    {analysis.symptoms.map(
                      (
                        symptom
                      ) => (
                        <span
                          key={
                            symptom
                          }
                          className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs"
                        >
                          {
                            symptom
                          }
                        </span>
                      )
                    )}

                  </div>

                </div>
              )}

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

              <div className="flex items-center gap-2 mb-3">

                <MdInfoOutline
                  className="text-teal-500"
                  size={20}
                />

                <p className="font-bold text-gray-700">
                  How it works
                </p>

              </div>

              <div className="space-y-3">

                {[
                  "Type or speak your concern in your preferred language.",
                  "Voice input is converted into text using multilingual speech recognition.",
                  "The assistant asks deterministic questions in the same language.",
                  "Symptoms and duration are extracted.",
                  "AI identifies the most relevant specialty.",
                  "Choose a recommended doctor and book a date and time.",
                ].map(
                  (
                    step,
                    index
                  ) => (
                    <div
                      key={
                        step
                      }
                      className="flex items-start gap-3"
                    >

                      <div className="w-6 h-6 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center text-xs font-bold">
                        {
                          index +
                          1
                        }
                      </div>

                      <p className="text-sm text-gray-500">
                        {
                          step
                        }
                      </p>

                    </div>
                  )
                )}

              </div>

            </div>
          )}

          {recommendations.length >
            0 && (
            <div>

              <div className="flex items-center gap-2 mb-3">

                <div className="w-1 h-5 bg-teal-500 rounded-full" />

                <h2 className="font-bold text-gray-800">
                  Recommended Doctors
                </h2>

              </div>

              <div className="space-y-3">

                {recommendations.map(
                  (
                    doctor
                  ) => (
                    <RecommendationCard
                      key={
                        doctor._id
                      }
                      doctor={
                        doctor
                      }
                      onBook={
                        setSelectedDoctor
                      }
                    />
                  )
                )}

              </div>

            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">

            <div className="flex gap-2">

              <MdInfoOutline
                size={17}
                className="text-amber-500 flex-shrink-0"
              />

              <p className="text-[11px] leading-relaxed text-amber-700">
                This assistant provides healthcare-navigation recommendations only. It does not diagnose conditions or provide treatment advice.
              </p>

            </div>

          </div>

        </div>
      </div>

      {selectedDoctor && (
        <BookingModal
          doctor={
            selectedDoctor
          }
          onClose={() =>
            setSelectedDoctor(
              null
            )
          }
        />
      )}

    </div>
  );
}