import { useNavigate } from "react-router-dom";
import {
  useEffect,
  useRef,
  useState,
  useContext,
} from "react";
import { ThemeContext } from "../context/ThemeContext";
import TourGuide from "../components/TourGuide";

import {
  Heart,
  Brain,
  Bone,
  Eye,
  Smile,
  Microscope,
  Baby,
  Scan,
  ShieldCheck,
  Zap,
  MessageCircle,
  Search,
  CalendarCheck,
  CheckCircle,
  Star,
  Moon,
  Sun,
  Phone,
  Mail,
  MapPin,
  Clock,
  TrendingUp,
  Activity,
  ArrowRight,
  Menu,
  X,
  FileText,
  Mic,
  Sparkles,
} from "lucide-react";

import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";

// ─────────────────────────────────────────────────────────────────────────────
// SPECIALITIES
// ─────────────────────────────────────────────────────────────────────────────

const specialities = [
  {
    icon: Heart,
    name: "Cardiology",
    desc: "Heart & vascular care",
    color: "#ef4444",
  },
  {
    icon: Brain,
    name: "Neurology",
    desc: "Brain & nervous system",
    color: "#8b5cf6",
  },
  {
    icon: Bone,
    name: "Orthopedics",
    desc: "Bones & joints",
    color: "#f59e0b",
  },
  {
    icon: Eye,
    name: "Ophthalmology",
    desc: "Eye care",
    color: "#06b6d4",
  },
  {
    icon: Smile,
    name: "Dentistry",
    desc: "Oral health",
    color: "#10b981",
  },
  {
    icon: Microscope,
    name: "Dermatology",
    desc: "Skin care",
    color: "#ec4899",
  },
  {
    icon: Baby,
    name: "Pediatrics",
    desc: "Child health",
    color: "#3b82f6",
  },
  {
    icon: Scan,
    name: "Radiology",
    desc: "Imaging & diagnostics",
    color: "#0d9488",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT HIGHLIGHTS
// ─────────────────────────────────────────────────────────────────────────────

const productHighlights = [
  {
    value: "AI",
    label: "Care Navigation",
    icon: Sparkles,
  },
  {
    value: "12+",
    label: "Language Support",
    icon: Mic,
  },
  {
    value: "RAG",
    label: "Document Q&A",
    icon: FileText,
  },
  {
    value: "RBAC",
    label: "Role-Based Access",
    icon: ShieldCheck,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HOW IT WORKS
// ─────────────────────────────────────────────────────────────────────────────

const steps = [
  {
    icon: Search,
    title: "Find a Doctor",
    desc:
      "Explore approved doctors by speciality, experience and availability.",
    step: "01",
  },
  {
    icon: CalendarCheck,
    title: "Choose a Slot",
    desc:
      "View actual doctor availability and select a convenient appointment time.",
    step: "02",
  },
  {
    icon: CheckCircle,
    title: "Get Confirmed",
    desc:
      "Track your appointment from booking through doctor confirmation and completion.",
    step: "03",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// AI FEATURES
// ─────────────────────────────────────────────────────────────────────────────

const aiFeatures = [
  {
    icon: MessageCircle,
    title: "AI Care Assistant",
    tag: "Multilingual AI",
    color: "#0d9488",
    tourId: "ai-care-assistant",
    desc:
      "Describe your concern naturally using text or voice. MediBook asks controlled follow-up questions, extracts relevant information and identifies the most relevant medical specialty.",
    points: [
      "Text and voice interaction",
      "Indian language support",
      "Controlled follow-up questions",
      "Specialty-based doctor recommendations",
    ],
  },
  {
    icon: FileText,
    title: "AI Medical Document Assistant",
    tag: "RAG + AI",
    color: "#0891b2",
    tourId: "medical-documents",
    desc:
      "Upload a medical report or consultation document, get an AI-generated explanation and ask questions grounded in the uploaded content.",
    points: [
      "PDF and image uploads",
      "Text extraction and OCR",
      "AI document summarization",
      "RAG-based question answering",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Human-Controlled Healthcare AI",
    tag: "Safety First",
    color: "#8b5cf6",
    tourId: "security",
    desc:
      "AI is designed as an assistive layer. Core booking, records and healthcare workflows remain under patient and doctor control.",
    points: [
      "No autonomous diagnosis",
      "No autonomous prescriptions",
      "Human review remains important",
      "Role-based access controls",
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// TESTIMONIALS
// ─────────────────────────────────────────────────────────────────────────────

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Patient",
    text:
      "Booking my cardiology appointment was simple, and the platform made it easy to keep my healthcare information in one place.",
    avatar: "PS",
    rating: 5,
  },
  {
    name: "Rahul Mehta",
    role: "Patient",
    text:
      "The AI assistant made it easier to understand which specialist I should look for before booking an appointment.",
    avatar: "RM",
    rating: 5,
  },
  {
    name: "Anjali Singh",
    role: "Parent",
    text:
      "I liked being able to keep reports and appointments together instead of managing everything separately.",
    avatar: "AS",
    rating: 5,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// TEAM
// ─────────────────────────────────────────────────────────────────────────────

const team = [
  {
    name: "Dr. Arun Kapoor",
    role: "Chief Medical Officer",
    specialty: "Cardiology",
    exp: "22 yrs",
    initials: "AK",
  },
  {
    name: "Dr. Meena Iyer",
    role: "Head of Neurology",
    specialty: "Neurology",
    exp: "18 yrs",
    initials: "MI",
  },
  {
    name: "Dr. Vikram Nair",
    role: "Lead Surgeon",
    specialty: "Orthopedics",
    exp: "15 yrs",
    initials: "VN",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// INTERSECTION OBSERVER
// ─────────────────────────────────────────────────────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HOME
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const navigate = useNavigate();

  const { dark, setDark } =
    useContext(ThemeContext);

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [isMobile, setIsMobile] =
    useState(window.innerWidth < 768);

  const [scrolled, setScrolled] =
    useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // TOUR GUIDE
  // ─────────────────────────────────────────────────────────────────────────

  const [showTour, setShowTour] =
    useState(false);

  const startTour = () => {
    setMenuOpen(false);
    setShowTour(true);
  };

  const handleTourFinish = () => {
    setShowTour(false);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RESPONSIVE
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(
        window.innerWidth < 768
      );
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () =>
      window.removeEventListener(
        "resize",
        handleResize
      );
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // THEME
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const savedTheme =
      localStorage.getItem("theme");

    if (savedTheme === "dark") {
      setDark(true);
    }
  }, [setDark]);

  // ─────────────────────────────────────────────────────────────────────────
  // SCROLL
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const onScroll = () => {
      setScrolled(
        window.scrollY > 20
      );
    };

    window.addEventListener(
      "scroll",
      onScroll
    );

    return () =>
      window.removeEventListener(
        "scroll",
        onScroll
      );
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // VIEW REFS
  // ─────────────────────────────────────────────────────────────────────────

  const aboutRef = useRef(null);

  const [heroRef, heroInView] =
    useInView(0.1);

  const [statsRef, statsInView] =
    useInView(0.2);

  const [specRef, specInView] =
    useInView(0.1);

  const [stepsRef, stepsInView] =
    useInView(0.1);

  const [aiRef, aiInView] =
    useInView(0.1);

  const [testRef, testInView] =
    useInView(0.1);

  const [ctaRef, ctaInView] =
    useInView(0.2);

  // ─────────────────────────────────────────────────────────────────────────
  // NAVIGATION
  // ─────────────────────────────────────────────────────────────────────────

  const navigationLinks = [
    {
      name: "Specialities",
      id: "specialities",
    },
    {
      name: "How It Works",
      id: "how-it-works",
    },
    {
      name: "AI Features",
      id: "ai-features",
    },
    {
      name: "Testimonials",
      id: "testimonials",
    },
    {
      name: "About Us",
      id: "about",
    },
    {
      name: "Future Vision",
      path: "/future-vision",
    },
  ];

  const handleNavigation =
    (link) => {
      if (link.path) {
        navigate(link.path);
        setMenuOpen(false);
        return;
      }

      document
        .getElementById(link.id)
        ?.scrollIntoView({
          behavior: "smooth",
        });

      setMenuOpen(false);
    };

  const scrollToSection = (id) => {
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
      });

    setMenuOpen(false);
  };

  const scrollToAbout = () => {
    aboutRef.current?.scrollIntoView({
      behavior: "smooth",
    });

    setMenuOpen(false);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // COLORS
  // ─────────────────────────────────────────────────────────────────────────

  const c = {
    bg: dark
      ? "#0a0f1e"
      : "#f0faf8",

    surface: dark
      ? "#111827"
      : "#ffffff",

    border: dark
      ? "rgba(20,184,166,0.18)"
      : "rgba(20,184,166,0.20)",

    text: dark
      ? "#f1f5f9"
      : "#0d1f1c",

    textMuted: dark
      ? "#94a3b8"
      : "#4b7a72",

    primary: "#0d9488",

    navBg: scrolled
      ? dark
        ? "rgba(10,15,30,0.94)"
        : "rgba(255,255,255,0.93)"
      : "transparent",
  };

  const grad =
    `linear-gradient(135deg, ${c.primary}, #0891b2)`;

  const gradHero = dark
    ? "linear-gradient(160deg, #0a0f1e 0%, #0d1a24 50%, #0a1628 100%)"
    : "linear-gradient(160deg, #e6faf7 0%, #f0faf8 50%, #e8f5e9 100%)";

  const font =
    "'DM Sans', system-ui, sans-serif";

  return (
    <div
      style={{
        fontFamily: font,
        background: c.bg,
        minHeight: "100vh",
        overflowX: "hidden",
        color: c.text,
        transition:
          "background 0.4s, color 0.4s",
      }}
    >
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* GLOBAL STYLES */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
        }

        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: ${c.primary};
          border-radius: 99px;
        }

        .nav-link {
          font-size: 13px;
          font-weight: 600;
          color: ${c.textMuted};
          cursor: pointer;
          transition: color 0.2s;
          text-decoration: none;
          white-space: nowrap;
        }

        .nav-link:hover {
          color: ${c.primary};
        }
      `}</style>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TOUR GUIDE */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <TourGuide
        runTour={showTour}
        onFinish={handleTourFinish}
      />

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* NAVBAR */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          padding: "0 5%",
          height: 68,
          background: c.navBg,
          backdropFilter: scrolled
            ? "blur(16px)"
            : "none",
          boxShadow: scrolled
            ? "0 1px 28px rgba(13,148,136,0.1)"
            : "none",
          transition:
            "all 0.35s ease",
          borderBottom: scrolled
            ? `1px solid ${c.border}`
            : "none",
        }}
      >
        {/* Logo */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
          }}
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: grad,
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              boxShadow:
                "0 4px 14px rgba(13,148,136,0.4)",
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
              color: c.primary,
              letterSpacing:
                "-0.5px",
            }}
          >
            Medi
            <span
              style={{
                color: c.text,
              }}
            >
              Book
            </span>
          </span>
        </div>

        {/* Desktop navigation */}

        {!isMobile ? (
          <div
            style={{
              display: "flex",
              gap: 20,
              alignItems:
                "center",
            }}
          >
            {navigationLinks.map(
              (link) => (
                <span
                  key={
                    link.name
                  }
                  className="nav-link"
                  onClick={() =>
                    handleNavigation(
                      link
                    )
                  }
                >
                  {link.name}
                </span>
              )
            )}
          </div>
        ) : (
          <button
            onClick={() =>
              setMenuOpen(true)
            }
            style={{
              border: "none",
              background:
                "transparent",
              color: c.text,
              cursor: "pointer",
            }}
          >
            <Menu />
          </button>
        )}

        {/* Right controls */}

        <div
          style={{
            display: isMobile
              ? "none"
              : "flex",
            gap: 10,
            alignItems:
              "center",
          }}
        >
          <button
            onClick={() =>
              setDark(!dark)
            }
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              border:
                `1.5px solid ${c.border}`,
              background:
                c.surface,
              color:
                c.primary,
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              cursor:
                "pointer",
            }}
          >
            {dark ? (
              <Sun size={17} />
            ) : (
              <Moon size={17} />
            )}
          </button>

          {/* HOW MEDIBOOK WORKS */}

          <button
            data-tour="how-medibook-works"
            onClick={startTour}
            style={{
              padding:
                "9px 16px",
              borderRadius: 10,
              border:
                `1.5px solid ${c.primary}`,
              background:
                dark
                  ? "rgba(13,148,136,0.10)"
                  : "rgba(255,255,255,0.75)",
              color:
                c.primary,
              fontWeight: 700,
              fontSize: 13,
              cursor:
                "pointer",
              fontFamily: font,
            }}
          >
            How MediBook Works
          </button>

          <button
            onClick={() =>
              navigate("/login")
            }
            style={{
              padding:
                "9px 20px",
              borderRadius: 10,
              border:
                `1.5px solid ${c.primary}`,
              background:
                "transparent",
              color:
                c.primary,
              fontWeight: 600,
              fontSize: 14,
              cursor:
                "pointer",
              fontFamily: font,
            }}
          >
            Login
          </button>

          <button
            onClick={() =>
              navigate(
                "/register"
              )
            }
            style={{
              padding:
                "9px 20px",
              borderRadius: 10,
              border: "none",
              background: grad,
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              cursor:
                "pointer",
              fontFamily: font,
              boxShadow:
                "0 4px 16px rgba(13,148,136,0.35)",
            }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MOBILE MENU */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      {menuOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "80%",
            maxWidth: 340,
            height: "100vh",
            background:
              c.surface,
            padding: 24,
            zIndex: 200,
            boxShadow:
              "-10px 0 40px rgba(0,0,0,0.15)",
            overflowY: "auto",
          }}
        >
          <button
            onClick={() =>
              setMenuOpen(false)
            }
            style={{
              border: "none",
              background:
                "transparent",
              color: c.text,
              cursor:
                "pointer",
              marginBottom: 20,
            }}
          >
            <X />
          </button>

          {/* Mobile tour button */}

          <button
            data-tour="how-medibook-works"
            onClick={startTour}
            style={{
              width: "100%",
              padding:
                "12px 16px",
              borderRadius: 10,
              border:
                `1.5px solid ${c.primary}`,
              background:
                "transparent",
              color:
                c.primary,
              cursor:
                "pointer",
              fontWeight: 700,
              marginBottom: 20,
            }}
          >
            How MediBook Works
          </button>

          {navigationLinks.map(
            (link) => (
              <div
                key={
                  link.name
                }
                style={{
                  margin:
                    "18px 0",
                  cursor:
                    "pointer",
                  color:
                    c.text,
                  fontWeight:
                    600,
                }}
                onClick={() =>
                  handleNavigation(
                    link
                  )
                }
              >
                {link.name}
              </div>
            )
          )}

          <div
            style={{
              display:
                "flex",
              gap: 8,
              marginTop: 20,
            }}
          >
            <button
              onClick={() =>
                navigate(
                  "/login"
                )
              }
              style={{
                padding:
                  "10px 18px",
                borderRadius:
                  10,
                border:
                  `1px solid ${c.primary}`,
                background:
                  "transparent",
                color:
                  c.primary,
                cursor:
                  "pointer",
              }}
            >
              Login
            </button>

            <button
              onClick={() =>
                navigate(
                  "/register"
                )
              }
              style={{
                padding:
                  "10px 18px",
                borderRadius:
                  10,
                border: "none",
                background:
                  grad,
                color: "#fff",
                cursor:
                  "pointer",
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* HERO */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <section
        ref={heroRef}
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent:
            "center",
          flexDirection:
            "column",
          textAlign: "center",
          padding:
            "110px 5% 70px",
          background:
            gradHero,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background grid */}

        <div
          style={{
            position:
              "absolute",
            inset: 0,
            opacity:
              dark
                ? 0.04
                : 0.06,
            backgroundImage:
              `radial-gradient(circle, ${c.primary} 1px, transparent 1px)`,
            backgroundSize:
              "40px 40px",
            pointerEvents:
              "none",
          }}
        />

        {/* Glow */}

        <div
          style={{
            position:
              "absolute",
            top: "8%",
            left: "-8%",
            width: 500,
            height: 500,
            borderRadius:
              "50%",
            background:
              dark
                ? "rgba(13,148,136,0.12)"
                : "rgba(13,148,136,0.10)",
            filter:
              "blur(80px)",
            pointerEvents:
              "none",
          }}
        />

        <div
          style={{
            position:
              "absolute",
            bottom: "5%",
            right: "-8%",
            width: 420,
            height: 420,
            borderRadius:
              "50%",
            background:
              dark
                ? "rgba(8,145,178,0.10)"
                : "rgba(245,158,11,0.10)",
            filter:
              "blur(80px)",
            pointerEvents:
              "none",
          }}
        />

        <div
          style={{
            display:
              "inline-flex",
            alignItems:
              "center",
            gap: 8,
            padding:
              "7px 18px",
            background:
              dark
                ? "rgba(13,148,136,0.15)"
                : "rgba(13,148,136,0.10)",
            borderRadius:
              999,
            border:
              "1px solid rgba(13,148,136,0.25)",
            fontSize: 13,
            color:
              c.primary,
            fontWeight:
              700,
            marginBottom:
              32,
            opacity:
              heroInView
                ? 1
                : 0,
            transform:
              heroInView
                ? "translateY(0)"
                : "translateY(20px)",
            transition:
              "all 0.7s ease",
          }}
        >
          <ShieldCheck
            size={14}
            strokeWidth={2.5}
          />
          Smart Healthcare Platform
        </div>

        <h1
          style={{
            fontSize:
              "clamp(38px,6.5vw,78px)",
            fontWeight: 800,
            lineHeight: 1.08,
            color:
              c.text,
            marginBottom:
              22,
            maxWidth: 850,
            fontFamily:
              "'DM Serif Display', serif",
            letterSpacing:
              "-1px",
            opacity:
              heroInView
                ? 1
                : 0,
            transform:
              heroInView
                ? "translateY(0)"
                : "translateY(30px)",
            transition:
              "all 0.8s ease 0.1s",
          }}
        >
          Your Health,{" "}
          <span
            style={{
              background:
                "linear-gradient(90deg,#0d9488,#0891b2)",
              WebkitBackgroundClip:
                "text",
              WebkitTextFillColor:
                "transparent",
            }}
          >
            Our Intelligence
          </span>
        </h1>

        <p
          style={{
            fontSize: 18,
            color:
              c.textMuted,
            maxWidth: 650,
            lineHeight: 1.75,
            marginBottom:
              44,
            opacity:
              heroInView
                ? 1
                : 0,
            transform:
              heroInView
                ? "translateY(0)"
                : "translateY(25px)",
            transition:
              "all 0.8s ease 0.2s",
          }}
        >
          Book verified doctors, manage
          appointments and health records,
          and use responsible AI to navigate
          care and understand medical
          documents.
        </p>

        <div
          style={{
            display:
              "flex",
            gap: 14,
            flexWrap:
              "wrap",
            justifyContent:
              "center",
            marginBottom:
              56,
            opacity:
              heroInView
                ? 1
                : 0,
            transform:
              heroInView
                ? "translateY(0)"
                : "translateY(25px)",
            transition:
              "all 0.8s ease 0.3s",
          }}
        >
          <button
            onClick={() =>
              navigate(
                "/register"
              )
            }
            style={{
              padding:
                "15px 34px",
              borderRadius:
                12,
              border: "none",
              background:
                grad,
              color: "#fff",
              fontWeight:
                700,
              fontSize: 16,
              cursor:
                "pointer",
              fontFamily:
                font,
              display:
                "flex",
              alignItems:
                "center",
              gap: 8,
              boxShadow:
                "0 6px 26px rgba(13,148,136,0.4)",
            }}
          >
            Get Started
            <ArrowRight
              size={17}
            />
          </button>

          {/* TOUR BUTTON */}

          <button
            data-tour="how-medibook-works"
            onClick={startTour}
            style={{
              padding:
                "15px 30px",
              borderRadius:
                12,
              border:
                `1.5px solid ${c.primary}`,
              background:
                dark
                  ? "rgba(13,148,136,0.12)"
                  : "rgba(255,255,255,0.8)",
              color:
                c.primary,
              fontWeight:
                700,
              fontSize: 16,
              cursor:
                "pointer",
              fontFamily:
                font,
            }}
          >
            How MediBook Works
          </button>

          <button
            onClick={() =>
              scrollToSection(
                "ai-features"
              )
            }
            style={{
              padding:
                "15px 34px",
              borderRadius:
                12,
              border:
                `1.5px solid ${c.border}`,
              background:
                dark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(255,255,255,0.8)",
              color:
                c.primary,
              fontWeight:
                600,
              fontSize: 16,
              cursor:
                "pointer",
              fontFamily:
                font,
            }}
          >
            Explore AI Features
          </button>
        </div>

        {/* Trust pills */}

        <div
          style={{
            display:
              "flex",
            gap: 14,
            flexWrap:
              "wrap",
            justifyContent:
              "center",
            opacity:
              heroInView
                ? 1
                : 0,
            transform:
              heroInView
                ? "translateY(0)"
                : "translateY(30px)",
            transition:
              "all 0.9s ease 0.4s",
          }}
        >
          {[
            {
              icon:
                ShieldCheck,
              text:
                "Role-Based Access",
            },
            {
              icon:
                Zap,
              text:
                "Live Appointment Slots",
            },
            {
              icon:
                MessageCircle,
              text:
                "Multilingual AI",
            },
            {
              icon:
                FileText,
              text:
                "RAG Document Q&A",
            },
          ].map(
            (item) => (
              <div
                key={
                  item.text
                }
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: 8,
                  padding:
                    "10px 18px",
                  borderRadius:
                    999,
                  background:
                    dark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(255,255,255,0.85)",
                  border:
                    `1px solid ${c.border}`,
                  fontSize:
                    13,
                  fontWeight:
                    600,
                  color:
                    c.textMuted,
                }}
              >
                <item.icon
                  size={15}
                  color={
                    c.primary
                  }
                />
                {
                  item.text
                }
              </div>
            )
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* PRODUCT HIGHLIGHTS */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <section
        ref={statsRef}
        style={{
          background:
            grad,
          padding:
            "56px 5%",
        }}
      >
        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(180px,1fr))",
            gap: 28,
            maxWidth:
              960,
            margin:
              "0 auto",
          }}
        >
          {productHighlights.map(
            (item, index) => (
              <div
                key={
                  item.label
                }
                style={{
                  textAlign:
                    "center",
                  padding: 10,
                  opacity:
                    statsInView
                      ? 1
                      : 0,
                  transform:
                    statsInView
                      ? "translateY(0)"
                      : "translateY(20px)",
                  transition:
                    `all 0.6s ease ${index * 0.1}s`,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius:
                      14,
                    background:
                      "rgba(255,255,255,0.16)",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    margin:
                      "0 auto 14px",
                  }}
                >
                  <item.icon
                    size={22}
                    color="#fff"
                  />
                </div>

                <div
                  style={{
                    fontSize: 30,
                    fontWeight: 800,
                    color:
                      "#fff",
                    marginBottom:
                      6,
                  }}
                >
                  {
                    item.value
                  }
                </div>

                <div
                  style={{
                    fontSize: 13,
                    color:
                      "rgba(255,255,255,0.72)",
                    textTransform:
                      "uppercase",
                    letterSpacing:
                      "0.5px",
                  }}
                >
                  {
                    item.label
                  }
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SPECIALITIES */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <section
        ref={specRef}
        id="specialities"
        data-tour="specialities"
        style={{
          padding:
            "90px 5%",
          background:
            c.bg,
        }}
      >
        <div
          style={{
            textAlign:
              "center",
            marginBottom:
              52,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color:
                c.primary,
              letterSpacing:
                2,
              textTransform:
                "uppercase",
            }}
          >
            Browse by Category
          </span>

          <h2
            style={{
              fontSize:
                "clamp(28px,4vw,44px)",
              fontWeight: 800,
              color:
                c.text,
              margin:
                "10px 0 12px",
              fontFamily:
                "'DM Serif Display', serif",
            }}
          >
            Find the Right Specialist
          </h2>

          <p
            style={{
              color:
                c.textMuted,
              fontSize: 16,
            }}
          >
            Explore approved doctors across
            multiple medical specialities
          </p>
        </div>

        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(148px,1fr))",
            gap: 20,
            maxWidth:
              980,
            margin:
              "0 auto",
          }}
        >
          {specialities.map(
            (item, index) => (
              <div
                key={
                  item.name
                }
                onClick={() =>
                  navigate(
                    "/register"
                  )
                }
                style={{
                  padding:
                    "30px 16px",
                  borderRadius:
                    18,
                  border:
                    `1.5px solid ${c.border}`,
                  background:
                    c.surface,
                  textAlign:
                    "center",
                  cursor:
                    "pointer",
                  opacity:
                    specInView
                      ? 1
                      : 0,
                  transform:
                    specInView
                      ? "translateY(0)"
                      : "translateY(24px)",
                  transition:
                    `all 0.5s ease ${index * 0.05}s`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(-6px) scale(1.02)";
                  e.currentTarget.style.boxShadow =
                    "0 16px 36px rgba(13,148,136,0.15)";
                  e.currentTarget.style.borderColor =
                    c.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow =
                    "none";
                  e.currentTarget.style.borderColor =
                    c.border;
                }}
              >
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius:
                      16,
                    background:
                      `${item.color}18`,
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    margin:
                      "0 auto 14px",
                  }}
                >
                  <item.icon
                    size={26}
                    color={
                      item.color
                    }
                  />
                </div>

                <div
                  style={{
                    fontWeight:
                      700,
                    fontSize: 14,
                    color:
                      c.text,
                    marginBottom:
                      5,
                  }}
                >
                  {
                    item.name
                  }
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color:
                      c.textMuted,
                  }}
                >
                  {
                    item.desc
                  }
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* HOW IT WORKS */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <section
        ref={stepsRef}
        id="how-it-works"
        data-tour="how-it-works"
        style={{
          padding:
            "90px 5%",
          background:
            dark
              ? "#0d1520"
              : "#e8f8f5",
        }}
      >
        <div
          style={{
            textAlign:
              "center",
            marginBottom:
              60,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color:
                c.primary,
              letterSpacing:
                2,
              textTransform:
                "uppercase",
            }}
          >
            Simple Process
          </span>

          <h2
            style={{
              fontSize:
                "clamp(28px,4vw,44px)",
              fontWeight:
                800,
              color:
                c.text,
              margin:
                "10px 0 12px",
              fontFamily:
                "'DM Serif Display', serif",
            }}
          >
            From Discovery to Care
          </h2>

          <p
            style={{
              color:
                c.textMuted,
              fontSize:
                16,
            }}
          >
            A connected workflow from finding
            a doctor to managing your records
          </p>
        </div>

        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(240px,1fr))",
            gap: 28,
            maxWidth:
              960,
            margin:
              "0 auto",
          }}
        >
          {steps.map(
            (item, index) => (
              <div
                key={
                  item.title
                }
                style={{
                  background:
                    c.surface,
                  borderRadius:
                    22,
                  padding:
                    "44px 32px",
                  textAlign:
                    "center",
                  border:
                    `1px solid ${c.border}`,
                  boxShadow:
                    dark
                      ? "0 4px 28px rgba(0,0,0,0.35)"
                      : "0 4px 28px rgba(13,148,136,0.08)",
                  opacity:
                    stepsInView
                      ? 1
                      : 0,
                  transform:
                    stepsInView
                      ? "translateY(0)"
                      : "translateY(30px)",
                  transition:
                    `all 0.7s ease ${index * 0.15}s`,
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius:
                      20,
                    background:
                      "rgba(13,148,136,0.10)",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    margin:
                      "0 auto 24px",
                  }}
                >
                  <item.icon
                    size={30}
                    color={
                      c.primary
                    }
                  />
                </div>

                <h3
                  style={{
                    fontWeight:
                      700,
                    fontSize: 19,
                    color:
                      c.text,
                    marginBottom:
                      12,
                  }}
                >
                  {
                    item.title
                  }
                </h3>

                <p
                  style={{
                    fontSize: 14,
                    color:
                      c.textMuted,
                    lineHeight:
                      1.7,
                  }}
                >
                  {
                    item.desc
                  }
                </p>
              </div>
            )
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* AI FEATURES */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <section
        ref={aiRef}
        id="ai-features"
        style={{
          padding:
            "100px 5%",
          background:
            c.bg,
        }}
      >
        <div
          style={{
            maxWidth:
              1120,
            margin:
              "0 auto",
          }}
        >
          <div
            style={{
              textAlign:
                "center",
              marginBottom:
                60,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color:
                  c.primary,
                letterSpacing:
                  2,
                textTransform:
                  "uppercase",
              }}
            >
              Intelligent Healthcare
            </span>

            <h2
              style={{
                fontSize:
                  "clamp(28px,4vw,44px)",
                fontWeight:
                  800,
                color:
                  c.text,
                margin:
                  "10px 0 14px",
                fontFamily:
                  "'DM Serif Display', serif",
              }}
            >
              AI That Supports, Not Replaces
            </h2>

            <p
              style={{
                color:
                  c.textMuted,
                fontSize:
                  16,
                maxWidth:
                  700,
                margin:
                  "0 auto",
                lineHeight:
                  1.75,
              }}
            >
              MediBook uses AI where it can
              reduce information and navigation
              friction while keeping patients and
              healthcare professionals in control.
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
            {aiFeatures.map(
              (
                feature,
                index
              ) => {
                const Icon =
                  feature.icon;

                return (
                  <div
                    key={
                      feature.title
                    }
                    data-tour={
                      feature.tourId
                    }
                    style={{
                      background:
                        c.surface,
                      border:
                        `1px solid ${c.border}`,
                      borderRadius:
                        22,
                      padding:
                        30,
                      boxShadow:
                        dark
                          ? "0 4px 24px rgba(0,0,0,0.28)"
                          : "0 4px 20px rgba(13,148,136,0.06)",
                      opacity:
                        aiInView
                          ? 1
                          : 0,
                      transform:
                        aiInView
                          ? "translateY(0)"
                          : "translateY(28px)",
                      transition:
                        `all 0.7s ease ${index * 0.12}s`,
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                        gap: 10,
                        marginBottom:
                          20,
                      }}
                    >
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius:
                            14,
                          background:
                            `${feature.color}15`,
                          border:
                            `1px solid ${feature.color}30`,
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                        }}
                      >
                        <Icon
                          size={24}
                          color={
                            feature.color
                          }
                        />
                      </div>

                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color:
                            feature.color,
                          textTransform:
                            "uppercase",
                          letterSpacing:
                            1,
                          padding:
                            "6px 10px",
                          borderRadius:
                            999,
                          background:
                            `${feature.color}12`,
                        }}
                      >
                        {
                          feature.tag
                        }
                      </span>
                    </div>

                    <h3
                      style={{
                        fontSize:
                          20,
                        fontWeight:
                          800,
                        color:
                          c.text,
                        marginBottom:
                          12,
                      }}
                    >
                      {
                        feature.title
                      }
                    </h3>

                    <p
                      style={{
                        fontSize:
                          14,
                        color:
                          c.textMuted,
                        lineHeight:
                          1.75,
                        marginBottom:
                          20,
                      }}
                    >
                      {
                        feature.desc
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
                      {feature.points.map(
                        (
                          point
                        ) => (
                          <div
                            key={
                              point
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
                                c.textMuted,
                            }}
                          >
                            <CheckCircle
                              size={14}
                              color={
                                feature.color
                              }
                            />
                            {
                              point
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
      {/* TESTIMONIALS */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <section
        ref={testRef}
        id="testimonials"
        style={{
          padding:
            "90px 5%",
          background:
            c.bg,
        }}
      >
        <div
          style={{
            textAlign:
              "center",
            marginBottom:
              52,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color:
                c.primary,
              letterSpacing:
                2,
              textTransform:
                "uppercase",
            }}
          >
            Patient Stories
          </span>

          <h2
            style={{
              fontSize:
                "clamp(28px,4vw,44px)",
              fontWeight:
                800,
              color:
                c.text,
              margin:
                "10px 0",
              fontFamily:
                "'DM Serif Display', serif",
            }}
          >
            Built Around the Patient
          </h2>

          <p
            style={{
              color:
                c.textMuted,
              fontSize:
                16,
            }}
          >
            A connected experience for
            appointments, records and
            AI-assisted healthcare navigation
          </p>
        </div>

        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(280px,1fr))",
            gap: 24,
            maxWidth:
              1000,
            margin:
              "0 auto",
          }}
        >
          {testimonials.map(
            (
              item,
              index
            ) => (
              <div
                key={
                  item.name
                }
                style={{
                  background:
                    c.surface,
                  borderRadius:
                    22,
                  padding:
                    32,
                  border:
                    `1px solid ${c.border}`,
                  opacity:
                    testInView
                      ? 1
                      : 0,
                  transform:
                    testInView
                      ? "translateY(0)"
                      : "translateY(28px)",
                  transition:
                    `all 0.7s ease ${index * 0.12}s`,
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    gap: 4,
                    marginBottom:
                      16,
                  }}
                >
                  {Array(
                    item.rating
                  )
                    .fill(0)
                    .map(
                      (
                        _,
                        starIndex
                      ) => (
                        <Star
                          key={
                            starIndex
                          }
                          size={
                            14
                          }
                          color="#f59e0b"
                          fill="#f59e0b"
                        />
                      )
                    )}
                </div>

                <p
                  style={{
                    color:
                      c.textMuted,
                    fontSize:
                      15,
                    lineHeight:
                      1.75,
                    marginBottom:
                      24,
                  }}
                >
                  "
                  {
                    item.text
                  }
                  "
                </p>

                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius:
                        "50%",
                      background:
                        grad,
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      fontSize:
                        13,
                      fontWeight:
                        800,
                      color:
                        "#fff",
                    }}
                  >
                    {
                      item.avatar
                    }
                  </div>

                  <div>
                    <div
                      style={{
                        fontWeight:
                          700,
                        fontSize:
                          15,
                        color:
                          c.text,
                      }}
                    >
                      {
                        item.name
                      }
                    </div>

                    <div
                      style={{
                        fontSize:
                          12,
                        color:
                          c.primary,
                        fontWeight:
                          600,
                      }}
                    >
                      {
                        item.role
                      }
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* ABOUT */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <section
        ref={
          aboutRef
        }
        id="about"
        data-tour="about"
        style={{
          padding:
            "90px 5%",
          background:
            dark
              ? "#0d1520"
              : "#f0faf8",
        }}
      >
        <div
          style={{
            maxWidth:
              1100,
            margin:
              "0 auto",
          }}
        >
          <div
            style={{
              textAlign:
                "center",
              marginBottom:
                64,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color:
                  c.primary,
                letterSpacing:
                  2,
                textTransform:
                  "uppercase",
              }}
            >
              About MediBook
            </span>

            <h2
              style={{
                fontSize:
                  "clamp(28px,4vw,44px)",
                fontWeight:
                  800,
                color:
                  c.text,
                margin:
                  "10px 0 12px",
                fontFamily:
                  "'DM Serif Display', serif",
              }}
            >
              Connecting Healthcare Workflows
            </h2>

            <p
              style={{
                color:
                  c.textMuted,
                fontSize:
                  16,
                maxWidth:
                  650,
                margin:
                  "0 auto",
                lineHeight:
                  1.75,
              }}
            >
              MediBook brings patients,
              doctors and healthcare
              operations together in one
              connected platform.
            </p>
          </div>

          {/* Values */}

          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(280px,1fr))",
              gap: 28,
              marginBottom:
                60,
            }}
          >
            {[
              {
                icon: Heart,
                title:
                  "Patient First",
                color:
                  "#ef4444",
                desc:
                  "A simple healthcare experience built around appointments, health records, documents and understandable information.",
              },
              {
                icon:
                  ShieldCheck,
                title:
                  "Trust & Control",
                color:
                  "#10b981",
                desc:
                  "Role-based workflows keep patients, doctors and administrators within appropriate access boundaries.",
              },
              {
                icon:
                  TrendingUp,
                title:
                  "Technology with Purpose",
                color:
                  c.primary,
                desc:
                  "AI is added where it can reduce information and navigation friction instead of replacing human decisions.",
              },
            ].map(
              (item) => (
                <div
                  key={
                    item.title
                  }
                  style={{
                    background:
                      c.surface,
                    borderRadius:
                      20,
                    padding:
                      "36px 28px",
                    border:
                      `1px solid ${c.border}`,
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius:
                        14,
                      background:
                        `${item.color}18`,
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      marginBottom:
                        18,
                    }}
                  >
                    <item.icon
                      size={24}
                      color={
                        item.color
                      }
                    />
                  </div>

                  <h3
                    style={{
                      fontWeight:
                        700,
                      fontSize:
                        18,
                      color:
                        c.text,
                      marginBottom:
                        10,
                    }}
                  >
                    {
                      item.title
                    }
                  </h3>

                  <p
                    style={{
                      color:
                        c.textMuted,
                      fontSize:
                        14,
                      lineHeight:
                        1.75,
                    }}
                  >
                    {
                      item.desc
                    }
                  </p>
                </div>
              )
            )}
          </div>

          {/* Team */}

          <div
            style={{
              marginBottom:
                60,
            }}
          >
            <h3
              style={{
                fontSize:
                  "clamp(22px,3vw,32px)",
                fontWeight:
                  800,
                color:
                  c.text,
                marginBottom:
                  8,
                textAlign:
                  "center",
                fontFamily:
                  "'DM Serif Display', serif",
              }}
            >
              Medical Leadership
            </h3>

            <p
              style={{
                color:
                  c.textMuted,
                fontSize:
                  15,
                textAlign:
                  "center",
                marginBottom:
                  36,
              }}
            >
              Guiding MediBook's
              clinical direction
            </p>

            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(240px,1fr))",
                gap: 24,
              }}
            >
              {team.map(
                (
                  member
                ) => (
                  <div
                    key={
                      member.name
                    }
                    style={{
                      background:
                        c.surface,
                      borderRadius:
                        20,
                      padding:
                        "32px 28px",
                      border:
                        `1px solid ${c.border}`,
                      textAlign:
                        "center",
                    }}
                  >
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius:
                          "50%",
                        background:
                          grad,
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        margin:
                          "0 auto 16px",
                        fontSize:
                          22,
                        fontWeight:
                          800,
                        color:
                          "#fff",
                      }}
                    >
                      {
                        member.initials
                      }
                    </div>

                    <div
                      style={{
                        fontWeight:
                          800,
                        fontSize:
                          17,
                        color:
                          c.text,
                        marginBottom:
                          4,
                      }}
                    >
                      {
                        member.name
                      }
                    </div>

                    <div
                      style={{
                        fontSize:
                          13,
                        color:
                          c.primary,
                        fontWeight:
                          600,
                        marginBottom:
                          6,
                      }}
                    >
                      {
                        member.role
                      }
                    </div>

                    <div
                      style={{
                        fontSize:
                          12,
                        color:
                          c.textMuted,
                        marginBottom:
                          10,
                      }}
                    >
                      {
                        member.specialty
                      }
                    </div>

                    <div
                      style={{
                        display:
                          "inline-flex",
                        alignItems:
                          "center",
                        gap: 5,
                        padding:
                          "5px 12px",
                        borderRadius:
                          999,
                        background:
                          dark
                            ? "rgba(13,148,136,0.12)"
                            : "rgba(13,148,136,0.08)",
                        fontSize:
                          12,
                        fontWeight:
                          600,
                        color:
                          c.primary,
                      }}
                    >
                      <Clock
                        size={
                          11
                        }
                      />
                      {
                        member.exp
                      }{" "}
                      Experience
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Contact */}

          <div
            style={{
              background:
                c.surface,
              borderRadius:
                22,
              padding:
                "36px 40px",
              border:
                `1px solid ${c.border}`,
              display:
                "flex",
              flexWrap:
                "wrap",
              gap: 32,
              justifyContent:
                "space-between",
              alignItems:
                "center",
            }}
          >
            <div>
              <h4
                style={{
                  fontWeight:
                    700,
                  fontSize:
                    20,
                  color:
                    c.text,
                  marginBottom:
                    6,
                }}
              >
                Get in Touch
              </h4>

              <p
                style={{
                  color:
                    c.textMuted,
                  fontSize:
                    14,
                }}
              >
                We're here to help
                patients and healthcare
                professionals.
              </p>
            </div>

            <div
              style={{
                display:
                  "flex",
                flexWrap:
                  "wrap",
                gap: 22,
              }}
            >
              {[
                {
                  icon: Phone,
                  text:
                    "+91 98765 43210",
                },
                {
                  icon: Mail,
                  text:
                    "support@medibook.in",
                },
                {
                  icon: MapPin,
                  text:
                    "India",
                },
              ].map(
                (item) => (
                  <div
                    key={
                      item.text
                    }
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius:
                          10,
                        background:
                          "rgba(13,148,136,0.1)",
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                      }}
                    >
                      <item.icon
                        size={16}
                        color={
                          c.primary
                        }
                      />
                    </div>

                    <span
                      style={{
                        fontSize:
                          14,
                        color:
                          c.textMuted,
                      }}
                    >
                      {
                        item.text
                      }
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* CTA */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <section
        ref={ctaRef}
        style={{
          padding:
            "90px 5%",
          textAlign:
            "center",
          background:
            "linear-gradient(135deg,#0f766e,#0891b2,#0d9488)",
          position:
            "relative",
          overflow:
            "hidden",
        }}
      >
        <div
          style={{
            position:
              "absolute",
            top: "-20%",
            left: "-8%",
            width: 500,
            height: 500,
            borderRadius:
              "50%",
            background:
              "rgba(255,255,255,0.05)",
            pointerEvents:
              "none",
          }}
        />

        <div
          style={{
            position:
              "absolute",
            bottom: "-20%",
            right: "-8%",
            width: 400,
            height: 400,
            borderRadius:
              "50%",
            background:
              "rgba(255,255,255,0.05)",
            pointerEvents:
              "none",
          }}
        />

        <div
          style={{
            position:
              "relative",
            zIndex: 1,
            opacity:
              ctaInView
                ? 1
                : 0,
            transform:
              ctaInView
                ? "translateY(0)"
                : "translateY(30px)",
            transition:
              "all 0.8s ease",
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight:
                700,
              color:
                "rgba(255,255,255,0.65)",
              letterSpacing:
                2,
              textTransform:
                "uppercase",
              marginBottom:
                14,
            }}
          >
            Start with MediBook
          </div>

          <h2
            style={{
              fontSize:
                "clamp(28px,5vw,56px)",
              fontWeight:
                800,
              color:
                "#fff",
              marginBottom:
                18,
              fontFamily:
                "'DM Serif Display', serif",
            }}
          >
            A Smarter Healthcare
            <br />
            Experience
          </h2>

          <p
            style={{
              color:
                "rgba(255,255,255,0.72)",
              fontSize:
                18,
              marginBottom:
                44,
            }}
          >
            Explore appointments,
            records and responsible
            AI-powered healthcare assistance.
          </p>

          <button
            data-tour="get-started"
            onClick={() =>
              navigate(
                "/register"
              )
            }
            style={{
              padding:
                "16px 44px",
              borderRadius:
                14,
              border: "none",
              background:
                "#fff",
              color:
                c.primary,
              fontWeight:
                800,
              fontSize:
                17,
              cursor:
                "pointer",
              fontFamily:
                font,
              display:
                "inline-flex",
              alignItems:
                "center",
              gap: 10,
              boxShadow:
                "0 8px 32px rgba(0,0,0,0.2)",
            }}
          >
            Get Started
            <ArrowRight
              size={18}
            />
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
            "60px 5% 32px",
        }}
      >
        <div
          style={{
            maxWidth:
              1200,
            margin:
              "0 auto",
          }}
        >
          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "2fr 1fr 1fr 1fr",
              gap: 40,
              marginBottom:
                52,
            }}
          >
            {/* Brand */}

            <div>
              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: 10,
                  marginBottom:
                    16,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius:
                      9,
                    background:
                      grad,
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                  }}
                >
                  <Activity
                    size={18}
                    color="#fff"
                  />
                </div>

                <span
                  style={{
                    fontSize:
                      20,
                    fontWeight:
                      800,
                    color:
                      "#fff",
                  }}
                >
                  MediBook
                </span>
              </div>

              <p
                style={{
                  color:
                    "rgba(255,255,255,0.45)",
                  lineHeight:
                    1.75,
                  fontSize:
                    14,
                  maxWidth:
                    270,
                  marginBottom:
                    24,
                }}
              >
                A connected healthcare
                platform for appointments,
                health records and responsible
                AI-assisted care.
              </p>

              <div
                style={{
                  display:
                    "flex",
                  gap: 10,
                }}
              >
                {[
                  FaFacebook,
                  FaTwitter,
                  FaInstagram,
                  FaLinkedin,
                ].map(
                  (
                    Icon,
                    index
                  ) => (
                    <div
                      key={
                        index
                      }
                      style={{
                        width:
                          36,
                        height:
                          36,
                        borderRadius:
                          9,
                        background:
                          "rgba(255,255,255,0.07)",
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                      }}
                    >
                      <Icon
                        size={
                          15
                        }
                        color="rgba(255,255,255,0.6)"
                      />
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Footer columns */}

            {[
              {
                title:
                  "Platform",
                links: [
                  "Find Doctors",
                  "Book Appointment",
                  "AI Features",
                  "Specialities",
                ],
              },
              {
                title:
                  "Company",
                links: [
                  "About Us",
                  "Future Vision",
                  "Careers",
                  "Contact",
                ],
              },
              {
                title:
                  "Support",
                links: [
                  "Help Center",
                  "Privacy Policy",
                  "Terms",
                  "Contact",
                ],
              },
            ].map(
              (column) => (
                <div
                  key={
                    column.title
                  }
                >
                  <div
                    style={{
                      color:
                        "#fff",
                      fontWeight:
                        700,
                      marginBottom:
                        18,
                      fontSize:
                        14,
                      textTransform:
                        "uppercase",
                      letterSpacing:
                        "0.4px",
                    }}
                  >
                    {
                      column.title
                    }
                  </div>

                  {column.links.map(
                    (link) => (
                      <div
                        key={
                          link
                        }
                        style={{
                          marginBottom:
                            12,
                          cursor:
                            "pointer",
                          fontSize:
                            14,
                          color:
                            "rgba(255,255,255,0.45)",
                        }}
                        onClick={() => {
                          if (
                            link ===
                            "About Us"
                          ) {
                            scrollToAbout();
                          }

                          if (
                            link ===
                            "AI Features"
                          ) {
                            scrollToSection(
                              "ai-features"
                            );
                          }

                          if (
                            link ===
                            "Specialities"
                          ) {
                            scrollToSection(
                              "specialities"
                            );
                          }

                          if (
                            link ===
                            "Future Vision"
                          ) {
                            navigate(
                              "/future-vision"
                            );
                          }
                        }}
                        onMouseEnter={(
                          e
                        ) => {
                          e.currentTarget.style.color =
                            "#5eead4";
                        }}
                        onMouseLeave={(
                          e
                        ) => {
                          e.currentTarget.style.color =
                            "rgba(255,255,255,0.45)";
                        }}
                      >
                        {
                          link
                        }
                      </div>
                    )
                  )}
                </div>
              )
            )}
          </div>

          <div
            style={{
              borderTop:
                "1px solid rgba(255,255,255,0.07)",
              paddingTop:
                28,
              display:
                "flex",
              justifyContent:
                "space-between",
              flexWrap:
                "wrap",
              gap: 12,
            }}
          >
            <span
              style={{
                color:
                  "rgba(255,255,255,0.35)",
                fontSize:
                  13,
              }}
            >
              © 2026 MediBook.
              All rights reserved.
            </span>

            <span
              style={{
                color:
                  "rgba(255,255,255,0.35)",
                fontSize:
                  13,
                display:
                  "flex",
                alignItems:
                  "center",
                gap: 6,
              }}
            >
              Built with
              <Heart
                size={12}
                color="#ef4444"
                fill="#ef4444"
              />
              for better healthcare
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}