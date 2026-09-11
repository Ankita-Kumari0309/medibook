import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

import {
  Brain,
  Activity,
  MessageCircle,
  ShieldCheck,
  Building2,
  Users,
  Database,
  Lock,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Stethoscope,
} from "lucide-react";

const futureGoals = [
  {
    icon: Brain,
    title: "Doctor AI Consultation Copilot",
    category: "Doctor Experience",
    color: "#8b5cf6",
    desc:
      "Help doctors structure and summarize their own consultation notes while keeping clinical decisions entirely under doctor control.",
    outcomes: [
      "Structured consultation summaries",
      "Reduced documentation effort",
      "Doctor-reviewed AI drafts",
      "No autonomous clinical decisions",
    ],
  },

  {
    icon: Activity,
    title: "Longitudinal Patient Health History",
    category: "Clinical Continuity",
    color: "#0d9488",
    desc:
      "Connect relevant previous consultations, health records, vitals and uploaded reports to make long-term patient history easier to review.",
    outcomes: [
      "Timeline-based patient history",
      "Relevant previous consultations",
      "Health trend visualization",
      "Context-aware record retrieval",
    ],
  },

  {
    icon: MessageCircle,
    title: "Expanded Multilingual Healthcare Access",
    category: "Accessibility",
    color: "#0891b2",
    desc:
      "Expand conversational and voice-based healthcare support across more Indian languages and regional language variations.",
    outcomes: [
      "More Indian languages",
      "Improved voice accessibility",
      "Persistent conversation language",
      "Better regional accessibility",
    ],
  },

  {
    icon: ShieldCheck,
    title: "Secure & Responsible Healthcare AI",
    category: "Security",
    color: "#10b981",
    desc:
      "Strengthen MediBook with privacy-focused infrastructure and safeguards appropriate for a production healthcare environment.",
    outcomes: [
      "Encryption",
      "Audit trails",
      "Consent management",
      "Access monitoring",
    ],
  },

  {
    icon: Building2,
    title: "Hospital & Diagnostic Integration",
    category: "Healthcare Ecosystem",
    color: "#f59e0b",
    desc:
      "Connect MediBook with hospitals, laboratories, pharmacies and other healthcare systems through secure integrations.",
    outcomes: [
      "Diagnostic report integration",
      "Hospital workflow connectivity",
      "Healthcare data interoperability",
      "Secure external system access",
    ],
  },

  {
    icon: Users,
    title: "Personalized Patient Continuity",
    category: "Patient Experience",
    color: "#ec4899",
    desc:
      "Provide continuity across future consultations while keeping sensitive information securely scoped to authorized users.",
    outcomes: [
      "Better history continuity",
      "Relevant previous records",
      "Personalized patient experience",
      "Role-aware information access",
    ],
  },

  {
    icon: Database,
    title: "Production-Scale AI Infrastructure",
    category: "Scalability",
    color: "#6366f1",
    desc:
      "Evolve the prototype into a scalable healthcare platform with dedicated infrastructure for documents, retrieval, monitoring and high availability.",
    outcomes: [
      "Dedicated vector infrastructure",
      "Async document processing",
      "Monitoring and observability",
      "Scalable storage architecture",
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function FutureVision() {
  const navigate = useNavigate();

  const { dark, setDark } =
    useContext(ThemeContext);

  const colors = {
    bg: dark
      ? "#0a0f1e"
      : "#f0faf8",

    surface: dark
      ? "#111827"
      : "#ffffff",

    surfaceAlt: dark
      ? "#0d1520"
      : "#eaf9f6",

    text: dark
      ? "#f1f5f9"
      : "#0d1f1c",

    muted: dark
      ? "#94a3b8"
      : "#4b7a72",

    border: dark
      ? "rgba(20,184,166,0.18)"
      : "rgba(20,184,166,0.20)",

    primary: "#0d9488",
  };

  const gradient =
    "linear-gradient(135deg, #0d9488, #0891b2)";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.bg,
        color: colors.text,
        fontFamily:
          "'DM Sans', system-ui, sans-serif",
        transition:
          "background 0.3s ease, color 0.3s ease",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
        }

        .future-card {
          transition: all 0.25s ease;
        }

        .future-card:hover {
          transform: translateY(-6px);
        }

        .future-link:hover {
          color: #5eead4 !important;
        }
      `}</style>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* NAVBAR */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <nav
        style={{
          height: 68,
          position: "sticky",
          top: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 5%",
          background: dark
            ? "rgba(10,15,30,0.92)"
            : "rgba(255,255,255,0.92)",
          backdropFilter:
            "blur(16px)",
          borderBottom:
            `1px solid ${colors.border}`,
        }}
      >
        {/* Logo */}

        <div
          onClick={() =>
            navigate("/")
          }
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: gradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Activity
              size={20}
              color="#fff"
              strokeWidth={2.5}
            />
          </div>

          <span
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: colors.primary,
            }}
          >
            Medi
            <span
              style={{
                color: colors.text,
              }}
            >
              Book
            </span>
          </span>
        </div>

        {/* Nav */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <button
            onClick={() =>
              navigate("/")
            }
            style={{
              padding:
                "9px 16px",
              borderRadius: 10,
              border:
                `1px solid ${colors.border}`,
              background:
                "transparent",
              color:
                colors.muted,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Home
          </button>

          <button
            onClick={() =>
              setDark(!dark)
            }
            style={{
              padding: "9px 14px",
              borderRadius: 10,
              border:
                `1px solid ${colors.border}`,
              background:
                colors.surface,
              color:
                colors.primary,
              cursor: "pointer",
            }}
          >
            {dark
              ? "Light"
              : "Dark"}
          </button>

          <button
            onClick={() =>
              navigate(
                "/register"
              )
            }
            style={{
              padding:
                "9px 18px",
              borderRadius: 10,
              border: "none",
              background: gradient,
              color: "#fff",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* HERO */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <section
        style={{
          padding:
            "110px 5% 90px",
          background:
            dark
              ? "linear-gradient(160deg,#0a0f1e,#0d1a24,#0a1628)"
              : "linear-gradient(160deg,#e6faf7,#f0faf8,#e8f5e9)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display:
              "inline-flex",
            alignItems:
              "center",
            gap: 8,
            padding:
              "7px 16px",
            borderRadius:
              999,
            background:
              dark
                ? "rgba(13,148,136,0.14)"
                : "rgba(13,148,136,0.10)",
            border:
              "1px solid rgba(13,148,136,0.22)",
            color:
              colors.primary,
            fontSize: 12,
            fontWeight: 700,
            textTransform:
              "uppercase",
            letterSpacing:
              1.5,
            marginBottom:
              22,
          }}
        >
          <Sparkles size={14} />
          Product Roadmap
        </div>

        <h1
          style={{
            maxWidth: 850,
            margin:
              "0 auto 20px",
            fontSize:
              "clamp(38px,6vw,68px)",
            lineHeight: 1.08,
            fontWeight: 800,
            fontFamily:
              "'DM Serif Display', serif",
          }}
        >
          The Future of
          <br />
          <span
            style={{
              background:
                gradient,
              WebkitBackgroundClip:
                "text",
              WebkitTextFillColor:
                "transparent",
            }}
          >
            MediBook
          </span>
        </h1>

        <p
          style={{
            maxWidth: 700,
            margin: "0 auto",
            color:
              colors.muted,
            fontSize: 17,
            lineHeight: 1.8,
          }}
        >
          MediBook is designed to grow from a
          connected healthcare platform into a
          secure, accessible and responsible
          healthcare ecosystem.
        </p>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* CURRENT → FUTURE */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <section
        style={{
          padding:
            "80px 5%",
          background:
            colors.surface,
        }}
      >
        <div
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns:
              "1fr auto 1fr",
            gap: 24,
            alignItems:
              "center",
          }}
        >
          {/* Current */}

          <div
            style={{
              padding: 30,
              borderRadius: 20,
              background:
                colors.surfaceAlt,
              border:
                `1px solid ${colors.border}`,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color:
                  colors.primary,
                letterSpacing:
                  1.5,
                textTransform:
                  "uppercase",
                marginBottom:
                  12,
              }}
            >
              Today
            </div>

            <h3
              style={{
                margin:
                  "0 0 12px",
                fontSize: 24,
                fontWeight: 800,
              }}
            >
              Smart Healthcare Platform
            </h3>

            <p
              style={{
                color:
                  colors.muted,
                lineHeight: 1.7,
                fontSize: 14,
              }}
            >
              Appointment management,
              availability, health records,
              multilingual AI care navigation
              and medical-document RAG.
            </p>
          </div>

          {/* Arrow */}

          <div
            style={{
              width: 48,
              height: 48,
              borderRadius:
                "50%",
              background:
                gradient,
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              boxShadow:
                "0 8px 24px rgba(13,148,136,0.25)",
            }}
          >
            <ArrowRight
              color="#fff"
              size={22}
            />
          </div>

          {/* Future */}

          <div
            style={{
              padding: 30,
              borderRadius: 20,
              background:
                colors.surface,
              border:
                `1px solid ${colors.border}`,
              boxShadow:
                "0 8px 30px rgba(13,148,136,0.07)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color:
                  colors.primary,
                letterSpacing:
                  1.5,
                textTransform:
                  "uppercase",
                marginBottom:
                  12,
              }}
            >
              Tomorrow
            </div>

            <h3
              style={{
                margin:
                  "0 0 12px",
                fontSize: 24,
                fontWeight: 800,
              }}
            >
              Connected Healthcare Ecosystem
            </h3>

            <p
              style={{
                color:
                  colors.muted,
                lineHeight: 1.7,
                fontSize: 14,
              }}
            >
              Smarter doctor workflows,
              longitudinal patient history,
              broader language support,
              healthcare integrations and
              stronger security.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* FUTURE GOALS */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <section
        style={{
          padding:
            "100px 5%",
          background:
            colors.bg,
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin:
              "0 auto",
          }}
        >
          <div
            style={{
              textAlign:
                "center",
              marginBottom:
                56,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color:
                  colors.primary,
                letterSpacing:
                  2,
                textTransform:
                  "uppercase",
              }}
            >
              Future Outcomes
            </span>

            <h2
              style={{
                fontSize:
                  "clamp(30px,4vw,46px)",
                fontWeight: 800,
                fontFamily:
                  "'DM Serif Display', serif",
                margin:
                  "10px 0 14px",
              }}
            >
              Building Beyond the Current Platform
            </h2>

            <p
              style={{
                maxWidth: 680,
                margin:
                  "0 auto",
                color:
                  colors.muted,
                fontSize: 16,
                lineHeight: 1.75,
              }}
            >
              These are planned directions rather
              than features currently represented as
              fully implemented in the platform.
            </p>
          </div>

          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(300px,1fr))",
              gap: 24,
            }}
          >
            {futureGoals.map(
              (goal) => {
                const Icon =
                  goal.icon;

                return (
                  <div
                    key={
                      goal.title
                    }
                    className="future-card"
                    style={{
                      background:
                        colors.surface,
                      border:
                        `1px solid ${colors.border}`,
                      borderRadius:
                        22,
                      padding:
                        "30px 28px",
                      boxShadow:
                        dark
                          ? "0 6px 24px rgba(0,0,0,0.24)"
                          : "0 6px 24px rgba(13,148,136,0.06)",
                    }}
                    onMouseEnter={(
                      e
                    ) => {
                      e.currentTarget.style.borderColor =
                        colors.primary;
                      e.currentTarget.style.boxShadow =
                        "0 18px 40px rgba(13,148,136,0.13)";
                    }}
                    onMouseLeave={(
                      e
                    ) => {
                      e.currentTarget.style.borderColor =
                        colors.border;
                      e.currentTarget.style.boxShadow =
                        dark
                          ? "0 6px 24px rgba(0,0,0,0.24)"
                          : "0 6px 24px rgba(13,148,136,0.06)";
                    }}
                  >
                    {/* Icon + Category */}

                    <div
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "space-between",
                        marginBottom:
                          22,
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 54,
                          height: 54,
                          borderRadius:
                            15,
                          background:
                            `${goal.color}16`,
                          border:
                            `1px solid ${goal.color}30`,
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                        }}
                      >
                        <Icon
                          size={25}
                          color={
                            goal.color
                          }
                        />
                      </div>

                      <span
                        style={{
                          padding:
                            "6px 10px",
                          borderRadius:
                            999,
                          background:
                            `${goal.color}12`,
                          color:
                            goal.color,
                          fontSize: 10,
                          fontWeight:
                            800,
                          textTransform:
                            "uppercase",
                          letterSpacing:
                            0.8,
                        }}
                      >
                        {
                          goal.category
                        }
                      </span>
                    </div>

                    <h3
                      style={{
                        fontSize:
                          19,
                        fontWeight:
                          800,
                        marginBottom:
                          12,
                      }}
                    >
                      {
                        goal.title
                      }
                    </h3>

                    <p
                      style={{
                        color:
                          colors.muted,
                        fontSize:
                          14,
                        lineHeight:
                          1.75,
                        marginBottom:
                          20,
                      }}
                    >
                      {
                        goal.desc
                      }
                    </p>

                    <div
                      style={{
                        display:
                          "flex",
                        flexDirection:
                          "column",
                        gap: 9,
                      }}
                    >
                      {goal.outcomes.map(
                        (outcome) => (
                          <div
                            key={
                              outcome
                            }
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: 8,
                              fontSize:
                                12,
                              color:
                                colors.muted,
                            }}
                          >
                            <CheckCircle
                              size={
                                14
                              }
                              color={
                                goal.color
                              }
                            />

                            {
                              outcome
                            }
                          </div>
                        )
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SECURITY PRINCIPLE */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <section
        style={{
          padding:
            "90px 5%",
          background:
            colors.surface,
        }}
      >
        <div
          style={{
            maxWidth:
              950,
            margin:
              "0 auto",
          }}
        >
          <div
            style={{
              padding:
                "42px 40px",
              borderRadius:
                24,
              background:
                dark
                  ? "linear-gradient(135deg,rgba(13,148,136,0.14),rgba(8,145,178,0.10))"
                  : "linear-gradient(135deg,rgba(13,148,136,0.08),rgba(8,145,178,0.07))",
              border:
                "1px solid rgba(13,148,136,0.20)",
              textAlign:
                "center",
            }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius:
                  16,
                background:
                  "rgba(13,148,136,0.12)",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                margin:
                  "0 auto 18px",
              }}
            >
              <Lock
                size={27}
                color={
                  colors.primary
                }
              />
            </div>

            <h2
              style={{
                fontSize:
                  "clamp(25px,3vw,34px)",
                fontWeight:
                  800,
                fontFamily:
                  "'DM Serif Display', serif",
                marginBottom:
                  12,
              }}
            >
              AI With Human Control
            </h2>

            <p
              style={{
                maxWidth:
                  720,
                margin:
                  "0 auto",
                color:
                  colors.muted,
                fontSize:
                  15,
                lineHeight:
                  1.8,
              }}
            >
              A central goal of MediBook's future
              is to make AI more useful without
              making it the final decision-maker.
              Patients and healthcare professionals
              remain in control of important
              healthcare decisions.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* CTA */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <section
        style={{
          padding:
            "90px 5%",
          textAlign:
            "center",
          background:
            "linear-gradient(135deg,#0f766e,#0891b2,#0d9488)",
        }}
      >
        <div
          style={{
            maxWidth:
              700,
            margin:
              "0 auto",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color:
                "rgba(255,255,255,0.7)",
              letterSpacing:
                2,
              textTransform:
                "uppercase",
              marginBottom:
                14,
            }}
          >
            Explore MediBook
          </div>

          <h2
            style={{
              fontSize:
                "clamp(30px,5vw,52px)",
              fontWeight:
                800,
              color:
                "#fff",
              fontFamily:
                "'DM Serif Display', serif",
              marginBottom:
                18,
            }}
          >
            Healthcare Today.
            <br />
            A Bigger Vision Tomorrow.
          </h2>

          <p
            style={{
              color:
                "rgba(255,255,255,0.75)",
              fontSize: 17,
              lineHeight:
                1.7,
              marginBottom:
                32,
            }}
          >
            Explore the current MediBook platform
            and see how these future outcomes can
            extend its capabilities.
          </p>

          <button
            onClick={() =>
              navigate("/")
            }
            style={{
              padding:
                "14px 28px",
              borderRadius:
                12,
              border: "none",
              background:
                "#fff",
              color:
                colors.primary,
              fontWeight:
                800,
              fontSize:
                15,
              cursor:
                "pointer",
              display:
                "inline-flex",
              alignItems:
                "center",
              gap: 8,
            }}
          >
            Explore MediBook
            <ArrowRight size={17} />
          </button>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* FOOTER */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <footer
        style={{
          background:
            dark
              ? "#070d18"
              : "#0f2820",
          padding:
            "32px 5%",
        }}
      >
        <div
          style={{
            maxWidth:
              1100,
            margin:
              "0 auto",
            display:
              "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            flexWrap:
              "wrap",
            gap: 14,
          }}
        >
          <span
            style={{
              color:
                "rgba(255,255,255,0.4)",
              fontSize:
                13,
            }}
          >
            © 2026 MediBook.
            All rights reserved.
          </span>

          <button
            onClick={() =>
              navigate("/")
            }
            style={{
              border: "none",
              background:
                "transparent",
              color:
                "#5eead4",
              cursor:
                "pointer",
              display:
                "flex",
              alignItems:
                "center",
              gap: 6,
              fontSize:
                13,
            }}
          >
            <ArrowLeft size={14} />
            Back to MediBook
          </button>
        </div>
      </footer>
    </div>
  );
}