import {
  useEffect,
  useState,
  useCallback,
} from "react";

import API from "../../../api/axios";

import {
  MdTrendingUp,
  MdBloodtype,
  MdAir,
  MdDescription,
  MdDownload,
  MdErrorOutline,
  MdRefresh,
  MdOpenInNew,
  MdThermostat,
  MdAutoAwesome,
  MdSend,
  MdClose,
  MdUploadFile,
  MdCheckCircle,
} from "react-icons/md";

// ─────────────────────────────────────────────────────────────────────────────
// VITAL CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const VITAL_MAP = [
  {
    keys: ["bp", "Blood Pressure"],
    label: "Blood Pressure",
    unit: "mmHg",
    icon: MdTrendingUp,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    keys: ["sugar", "Sugar"],
    label: "Sugar",
    unit: "mg/dL",
    icon: MdBloodtype,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    keys: ["spo2", "SpO2"],
    label: "SpO2",
    unit: "%",
    icon: MdAir,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    keys: ["temperature"],
    label: "Temperature",
    unit: "°F",
    icon: MdThermostat,
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// STATUS
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_STYLE = {
  Good: "bg-green-50 text-green-700",
  Normal: "bg-yellow-50 text-yellow-700",
  Bad: "bg-red-50 text-red-700",
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function fmtDate(dateStr) {
  if (!dateStr) return "—";

  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function findVital(records, keys) {
  if (!records) return null;

  for (const key of keys) {
    if (
      records[key] !== undefined &&
      records[key] !== null &&
      records[key] !== ""
    ) {
      return records[key];
    }
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// ERROR BANNER
// ─────────────────────────────────────────────────────────────────────────────

function ErrorBanner({ message, onRetry }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 mb-4">
      <MdErrorOutline size={18} />

      <span className="flex-1 text-sm">
        {message}
      </span>

      <button
        onClick={onRetry}
        className="w-8 h-8 rounded-lg hover:bg-red-100 flex items-center justify-center"
      >
        <MdRefresh size={18} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VITAL CARD
// ─────────────────────────────────────────────────────────────────────────────

function VitalCard({ cfg, value }) {
  const Icon = cfg.icon;

  return (
    <div
      className={`p-4 rounded-xl shadow-sm border border-gray-100 ${cfg.bg}`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`${cfg.color} text-xl`} />

        <div>
          <p className="text-xs text-gray-500">
            {cfg.label}
          </p>

          <p className="font-bold text-gray-800">
            {value || "--"}{" "}
            {value && cfg.unit}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AI DOCUMENT MODAL
// ─────────────────────────────────────────────────────────────────────────────

function AIDocumentModal({
  document,
  onClose,
}) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");

  const askQuestion = async () => {
    if (!question.trim() || asking) {
      return;
    }

    try {
      setAsking(true);
      setError("");

      const { data } = await API.post(
        `/ai-documents/${document.id}/ask`,
        {
          question: question.trim(),
        }
      );

      setAnswer(data.answer || "");
      setSources(data.sources || []);
      setQuestion("");
    } catch (err) {
      console.error("Document question error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to answer the question."
      );
    } finally {
      setAsking(false);
    }
  };

  const clearAnswer = () => {
    setAnswer("");
    setSources([]);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
              <MdAutoAwesome size={20} />
            </div>

            <div>
              <h2 className="font-bold text-gray-800">
                AI Health Document Assistant
              </h2>

              <p className="text-xs text-gray-400 mt-0.5">
                {document.name}
              </p>
            </div>

          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500 flex items-center justify-center transition"
          >
            <MdClose size={19} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* ───────────────────────── SUMMARY ───────────────────────── */}

          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-teal-500 rounded-full" />

              <h3 className="font-bold text-gray-800">
                AI Summary
              </h3>
            </div>

            <div className="space-y-3">

              {document.summary?.overview && (
                <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-teal-600">
                    Overview
                  </p>

                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                    {document.summary.overview}
                  </p>
                </div>
              )}

              {[
                ["Key Findings", "keyFindings"],
                ["Important Values", "importantValues"],
                ["Medicines Mentioned", "medicinesMentioned"],
                ["Doctor Recommendations", "doctorRecommendations"],
                ["Follow-up Information", "followUpInformation"],
              ].map(([title, key]) => {
                const items =
                  document.summary?.[key];

                if (!Array.isArray(items) || items.length === 0) {
                  return null;
                }

                return (
                  <div
                    key={key}
                    className="bg-gray-50 border border-gray-100 rounded-xl p-4"
                  >
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                      {title}
                    </p>

                    <ul className="mt-2 space-y-1.5">
                      {items.map((item, index) => (
                        <li
                          key={`${key}-${index}`}
                          className="text-sm text-gray-600 leading-relaxed"
                        >
                          <span className="text-teal-500 font-bold">
                            •
                          </span>{" "}
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}

            </div>

            <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <p className="text-[11px] text-amber-700 leading-relaxed">
                This explanation is based on your uploaded document. It does not provide a medical diagnosis or replace professional medical advice.
              </p>
            </div>
          </div>

          {/* ───────────────────────── RAG CHAT ───────────────────────── */}

          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-teal-500 rounded-full" />

              <h3 className="font-bold text-gray-800">
                Ask About This Document
              </h3>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 min-h-[400px] flex flex-col">

              {!answer ? (
                <div className="flex-1 flex items-center justify-center text-center px-4">

                  <div className="w-full">

                    <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center mx-auto mb-4">
                      <MdAutoAwesome size={26} />
                    </div>

                    <p className="text-sm font-bold text-gray-700">
                      Ask questions about your report
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      Answers are grounded in the uploaded document.
                    </p>

                    <div className="mt-5 space-y-2">

                      {[
                        "What are the main findings?",
                        "Which values are outside the reference range?",
                        "What did the doctor recommend?",
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() =>
                            setQuestion(suggestion)
                          }
                          className="block w-full text-left text-xs bg-white border border-gray-200 text-gray-600 rounded-xl px-3 py-2.5 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700 transition"
                        >
                          {suggestion}
                        </button>
                      ))}

                    </div>
                  </div>

                </div>
              ) : (
                <div className="flex-1 space-y-4 overflow-y-auto">

                  {/* Question/answer area */}
                  <div className="bg-teal-600 text-white rounded-2xl rounded-br-md px-4 py-3 text-sm leading-relaxed">
                    {answer}
                  </div>

                  {/* Sources */}
                  {sources.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-3">

                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                          Retrieved Sources
                        </p>

                        <button
                          onClick={clearAnswer}
                          className="text-[10px] text-teal-600 font-semibold hover:text-teal-700"
                        >
                          New question
                        </button>
                      </div>

                      {sources.map((source, index) => (
                        <div
                          key={`${source.chunk}-${index}`}
                          className="border-t first:border-t-0 border-gray-100 py-2"
                        >
                          <span className="text-[10px] font-bold text-teal-600">
                            Source {source.chunk}
                          </span>

                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            {source.preview}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}

              {error && (
                <div className="mt-3 bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-xs text-red-600">
                  {error}
                </div>
              )}

              <div className="mt-4 flex items-center gap-2">

                <input
                  value={question}
                  onChange={(e) =>
                    setQuestion(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey
                    ) {
                      e.preventDefault();
                      askQuestion();
                    }
                  }}
                  placeholder="Ask something about this report..."
                  className="flex-1 border border-gray-200 bg-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-400"
                />

                <button
                  onClick={askQuestion}
                  disabled={
                    asking ||
                    !question.trim()
                  }
                  className="w-11 h-11 rounded-xl bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  {asking ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <MdSend size={18} />
                  )}
                </button>

              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AI UPLOAD CARD
// ─────────────────────────────────────────────────────────────────────────────

function AIUploadCard({
  onAnalyzed,
}) {
  const [file, setFile] =
    useState(null);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleUpload =
    async () => {
      if (!file || uploading) {
        return;
      }

      try {
        setUploading(true);
        setError("");

        const formData =
          new FormData();

        formData.append(
          "file",
          file
        );

        const { data } =
          await API.post(
            "/ai-documents/upload",
            formData,
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );

        onAnalyzed(
          data.document
        );

        setFile(null);
      } catch (err) {
        console.error(
          "AI document upload error:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
            "Unable to analyze document."
        );
      } finally {
        setUploading(false);
      }
    };

  return (
    <div className="bg-white border border-teal-100 rounded-2xl shadow-sm overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 bg-teal-50 border-b border-teal-100">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
            <MdAutoAwesome size={20} />
          </div>

          <div className="min-w-0">
            <h2 className="font-bold text-gray-800">
              Understand a Medical Document
            </h2>

            <p className="text-xs text-gray-500 mt-0.5">
              Upload a report and let AI explain it in simple language.
            </p>
          </div>

        </div>

      </div>

      {/* Body */}
      <div className="p-5">

        <label
          className={`flex items-center justify-center gap-3 border-2 border-dashed rounded-xl px-4 py-6 cursor-pointer transition ${
            file
              ? "border-teal-400 bg-teal-50"
              : "border-gray-200 hover:border-teal-300 hover:bg-teal-50/50"
          }`}
        >

          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0">
            <MdUploadFile size={22} />
          </div>

          <div className="text-center min-w-0">

            <p className="text-sm font-semibold text-gray-700 truncate max-w-[300px]">
              {file
                ? file.name
                : "Choose a medical document"}
            </p>

            <p className="text-[11px] text-gray-400 mt-1">
              PDF, JPG or PNG
            </p>

            <p className="text-[10px] text-gray-400 mt-0.5">
              Medical report, prescription, lab report or consultation note
            </p>

          </div>

          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => {
              const selected =
                e.target.files?.[0] ||
                null;

              setFile(
                selected
              );

              setError("");
            }}
          />

        </label>

        {error && (
          <div className="mt-3 px-3 py-2 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600">
            {error}
          </div>
        )}

        <div className="flex items-center gap-2 mt-4">

          {file && (
            <button
              onClick={() => {
                setFile(null);
                setError("");
              }}
              disabled={uploading}
              className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-40"
            >
              Remove
            </button>
          )}

          <button
            onClick={handleUpload}
            disabled={
              !file ||
              uploading
            }
            className={`${
              file
                ? "flex-1"
                : "w-full"
            } bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing document...
              </>
            ) : (
              <>
                <MdAutoAwesome size={17} />
                Analyze with AI
              </>
            )}
          </button>

        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORT CARD
// ─────────────────────────────────────────────────────────────────────────────

function ReportCard({
  record,
  onAIAnalyze,
}) {
  const status =
    record.status ||
    "Normal";

  return (
    <div className="p-4 border-b last:border-0 space-y-3">

      {/* Header */}
      <div className="flex justify-between items-center">

        <div>
          <p className="text-sm font-semibold text-gray-800">
            Dr.{" "}
            {record.doctor?.name ||
              "Unknown"}
          </p>

          <p className="text-xs text-gray-400">
            {fmtDate(
              record.appointment?.date
            )}{" "}
            ·{" "}
            {record.appointment?.time ||
              "—"}
          </p>
        </div>

        <span
          className={`text-xs px-2 py-1 rounded-full font-semibold ${
            STATUS_STYLE[status] ||
            "bg-gray-50 text-gray-600"
          }`}
        >
          {status}
        </span>

      </div>

      {/* Vitals */}
      <div className="grid grid-cols-2 gap-2 text-xs">

        {VITAL_MAP.map((cfg) => {
          const value =
            findVital(
              record.records,
              cfg.keys
            );

          if (!value) {
            return null;
          }

          const Icon = cfg.icon;

          return (
            <div
              key={cfg.label}
              className="flex items-center gap-2"
            >
              <Icon
                className={cfg.color}
              />

              <span className="text-gray-500">
                {cfg.label}:
              </span>

              <span className="font-semibold text-gray-800">
                {value}{" "}
                {cfg.unit}
              </span>
            </div>
          );
        })}

        {Object.keys(
          record.records || {}
        ).length === 0 && (
          <p className="text-gray-300 col-span-2">
            No vitals added
          </p>
        )}

      </div>

      {/* Notes */}
      {record.notes && (
        <p className="text-xs text-gray-500 italic border-t pt-2">
          {record.notes}
        </p>
      )}

      {/* Report File */}
      {record.fileUrl && (
        <div className="flex items-center gap-3 text-sm flex-wrap">

          <MdDescription className="text-gray-400" />

          <a
            href={`http://localhost:5000${record.fileUrl}`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 font-semibold flex items-center gap-1 hover:text-blue-700"
          >
            <MdOpenInNew />
            View
          </a>

          <a
            href={`http://localhost:5000${record.fileUrl}`}
            download
            className="text-green-600 font-semibold flex items-center gap-1 hover:text-green-700"
          >
            <MdDownload />
            Download
          </a>

          <button
            onClick={() =>
              onAIAnalyze(record)
            }
            className="text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1 transition"
          >
            <MdAutoAwesome />
            Understand with AI
          </button>

        </div>
      )}

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

export default function HealthRecords() {
  const [records, setRecords] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [aiDocument, setAIDocument] =
    useState(null);

  // ─────────────────────────────────────────────────────────────────────────
  // FETCH RECORDS
  // ─────────────────────────────────────────────────────────────────────────

  const fetchRecords =
    useCallback(async () => {
      setLoading(true);

      try {
        const { data } =
          await API.get(
            "/health-records/my"
          );

        setRecords(
          Array.isArray(data)
            ? data
            : []
        );

        setError("");
      } catch (err) {
        console.error(
          "Health records error:",
          err
        );

        setError(
          "Failed to load health records."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const latestRecord =
    records.length > 0
      ? records[0]
      : null;

  const latestVitals =
    VITAL_MAP.map(
      (cfg) => ({
        cfg,
        value: latestRecord
          ? findVital(
              latestRecord.records,
              cfg.keys
            )
          : null,
      })
    );

  // ─────────────────────────────────────────────────────────────────────────
  // ANALYZE EXISTING HEALTH RECORD FILE
  // ─────────────────────────────────────────────────────────────────────────

  const analyzeExistingRecord =
    async (record) => {
      if (!record?.fileUrl) {
        setError(
          "No document is attached to this health record."
        );

        return;
      }

      try {
        setError("");

        const response =
          await fetch(
            `http://localhost:5000${record.fileUrl}`
          );

        if (!response.ok) {
          throw new Error(
            "Unable to read the report file."
          );
        }

        const blob =
          await response.blob();

        const fileName =
          record.fileUrl
            .split("/")
            .pop() ||
          "medical-report";

        const file =
          new File(
            [blob],
            fileName,
            {
              type:
                blob.type ||
                "application/pdf",
            }
          );

        const formData =
          new FormData();

        formData.append(
          "file",
          file
        );

        const { data } =
          await API.post(
            "/ai-documents/upload",
            formData,
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );

        setAIDocument(
          data.document
        );
      } catch (err) {
        console.error(
          "Existing document AI error:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
            err.message ||
            "Unable to analyze this document."
        );
      }
    };

  return (
    <div className="p-6 space-y-6">

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* HEADER */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <div>
        <h1 className="text-xl font-bold text-gray-800">
          Health Records
        </h1>

        <p className="text-xs text-gray-400 mt-1">
          View your medical history and understand uploaded reports with AI.
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <ErrorBanner
          message={error}
          onRetry={fetchRecords}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* AI DOCUMENT SECTION */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <AIUploadCard
        onAnalyzed={
          setAIDocument
        }
      />

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* LATEST RECORD */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      {latestRecord && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />

          Latest record from Dr.{" "}
          {latestRecord.doctor?.name ||
            "Unknown"}

          <span>•</span>

          {fmtDate(
            latestRecord.appointment?.date
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* VITALS */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {latestVitals.map(
          ({ cfg, value }) => (
            <VitalCard
              key={cfg.label}
              cfg={cfg}
              value={value}
            />
          )
        )}

      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MEDICAL HISTORY */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        <div className="p-4 border-b border-gray-100">

          <div className="flex items-center gap-2">

            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <MdDescription size={17} />
            </div>

            <div>
              <p className="font-semibold text-gray-700">
                Medical History
              </p>

              <p className="text-[11px] text-gray-400">
                Your previous consultations and health records
              </p>
            </div>

          </div>

        </div>

        {loading ? (
          <div className="p-8 text-center">

            <div className="w-7 h-7 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />

            <p className="text-sm text-gray-400">
              Loading health records...
            </p>

          </div>
        ) : records.length === 0 ? (
          <div className="p-10 text-center">

            <MdDescription
              size={36}
              className="mx-auto text-gray-200 mb-2"
            />

            <p className="text-sm text-gray-400">
              No health records found.
            </p>

          </div>
        ) : (
          records.map(
            (record) => (
              <ReportCard
                key={record._id}
                record={record}
                onAIAnalyze={
                  analyzeExistingRecord
                }
              />
            )
          )
        )}

      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* AI MODAL */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      {aiDocument && (
        <AIDocumentModal
          document={
            aiDocument
          }
          onClose={() =>
            setAIDocument(
              null
            )
          }
        />
      )}

    </div>
  );
}