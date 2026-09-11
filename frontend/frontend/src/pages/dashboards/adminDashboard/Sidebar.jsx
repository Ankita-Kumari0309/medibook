import { useAuth } from "../../../context/AuthContext";

import {
  MdDashboard,
  MdMedicalServices,
  MdPeople,
  MdEventNote,
  MdPerson,
  MdLogout,
  MdInsights,
} from "react-icons/md";

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────

const navMain = [
  {
    id: "overview",
    label: "Dashboard",
    icon: MdDashboard,
  },
  {
    id: "doctors",
    label: "Doctors",
    icon: MdMedicalServices,
  },
  {
    id: "patients",
    label: "Patients",
    icon: MdPeople,
  },
  {
    id: "appointments",
    label: "Appointments",
    icon: MdEventNote,
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: MdInsights,
  },
];

const navAccount = [
  {
    id: "profile",
    label: "Profile",
    icon: MdPerson,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────────────────────────────────────

const THEME = {
  background:
    "linear-gradient(160deg, #0c1a2e 0%, #0f2744 55%, #0369a1 100%)",

  glowTop:
    "rgba(14,165,233,0.12)",

  glowBottom:
    "rgba(56,189,248,0.08)",

  border:
    "rgba(255,255,255,0.07)",

  sectionLabel:
    "rgba(125,211,252,0.4)",

  mutedText:
    "rgba(255,255,255,0.5)",

  activeBackground:
    "rgba(14,165,233,0.18)",

  activeBorder:
    "rgba(14,165,233,0.2)",

  activeText:
    "#7dd3fc",

  activeBar:
    "#38bdf8",

  activeIconBackground:
    "rgba(14,165,233,0.2)",

  hoverBackground:
    "rgba(255,255,255,0.07)",

  badgeBackground:
    "rgba(251,191,36,0.2)",

  badgeText:
    "#fbbf24",

  logoBackground:
    "rgba(255,255,255,0.1)",

  logoBorder:
    "rgba(255,255,255,0.15)",

  logoStroke:
    "#38bdf8",

  userCardBackground:
    "rgba(255,255,255,0.07)",

  userCardBorder:
    "rgba(255,255,255,0.10)",

  userIconBackground:
    "rgba(14,165,233,0.25)",

  userIconBorder:
    "rgba(14,165,233,0.3)",

  userIconText:
    "#7dd3fc",

  onlineDot:
    "#34d399",

  onlineDotBorder:
    "#0f2744",

  roleText:
    "rgba(125,211,252,0.55)",

  logoutText:
    "rgba(255,255,255,0.4)",

  logoutHoverBackground:
    "rgba(239,68,68,0.1)",

  logoutHoverText:
    "#fca5a5",
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION LABEL
// ─────────────────────────────────────────────────────────────────────────────

function SectionLabel({ label }) {
  return (
    <div className="flex items-center gap-2 px-3 mb-1.5 mt-5">
      <span
        className="text-[9px] font-bold tracking-[0.14em] uppercase"
        style={{
          color: THEME.sectionLabel,
        }}
      >
        {label}
      </span>

      <div
        className="flex-1 h-px"
        style={{
          background: THEME.border,
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NAV ITEM
// ─────────────────────────────────────────────────────────────────────────────

function NavItem({
  item,
  active,
  onClick,
  badge,
}) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={() =>
        onClick(item.id)
      }
      className="relative flex items-center gap-2.5 w-full px-3 py-2.5 rounded-[10px] text-sm font-medium text-left transition-all duration-150 mb-0.5"
      style={{
        background: active
          ? THEME.activeBackground
          : "transparent",

        color: active
          ? THEME.activeText
          : THEME.mutedText,

        border: active
          ? `1px solid ${THEME.activeBorder}`
          : "1px solid transparent",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background =
            THEME.hoverBackground;

          e.currentTarget.style.color =
            "#fff";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background =
            "transparent";

          e.currentTarget.style.color =
            THEME.mutedText;
        }
      }}
    >
      {/* Active bar */}

      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] rounded-r-full"
          style={{
            background:
              THEME.activeBar,
          }}
        />
      )}

      {/* Icon */}

      <span
        className="w-[30px] h-[30px] rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
        style={{
          background: active
            ? THEME.activeIconBackground
            : "transparent",
        }}
      >
        <Icon size={15} />
      </span>

      {/* Label */}

      <span className="truncate">
        {item.label}
      </span>

      {/* Badge */}

      {badge != null &&
        badge > 0 && (
          <span
            className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{
              background:
                THEME.badgeBackground,
              color:
                THEME.badgeText,
            }}
          >
            {badge}
          </span>
        )}

      {/* Active dot */}

      {active &&
        !badge && (
          <span
            className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{
              background:
                THEME.activeBar,
            }}
          />
        )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────

export default function Sidebar({
  activeSection,
  setActiveSection,
  onLogout,
  pendingDoctors,
}) {
  const { user } = useAuth();

  // ─────────────────────────────────────
  // USER INITIALS
  // ─────────────────────────────────────

  const initials = user?.name
    ? user.name
        .split(" ")
        .map(
          (name) => name[0]
        )
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AD";

  return (
    <aside
      className="
        w-60
        h-screen
        flex
        flex-col
        flex-shrink-0
        sticky
        top-0
        overflow-hidden
        relative
      "
      style={{
        background:
          THEME.background,
      }}
    >
      {/* ─────────────────────────────────────
          AMBIENT GLOW — TOP
      ───────────────────────────────────── */}

      <div
        className="absolute -top-14 -left-10 w-44 h-44 rounded-full pointer-events-none"
        style={{
          background:
            THEME.glowTop,
          filter:
            "blur(40px)",
        }}
      />

      {/* ─────────────────────────────────────
          AMBIENT GLOW — BOTTOM
      ───────────────────────────────────── */}

      <div
        className="absolute bottom-16 -right-8 w-36 h-36 rounded-full pointer-events-none"
        style={{
          background:
            THEME.glowBottom,
          filter:
            "blur(36px)",
        }}
      />

      {/* ─────────────────────────────────────
          LOGO
      ───────────────────────────────────── */}

      <div
        className="relative flex items-center gap-2.5 px-4 pt-5 pb-4 flex-shrink-0"
        style={{
          borderBottom:
            `1px solid ${THEME.border}`,
        }}
      >
        <div
          className="p-2 rounded-[10px]"
          style={{
            background:
              THEME.logoBackground,

            border:
              `1px solid ${THEME.logoBorder}`,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M3 12h4l3-9 4 18 3-9h4"
              stroke={
                THEME.logoStroke
              }
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div>
          <div className="text-white font-semibold text-[15px] tracking-[0.01em]">
            MediBook
          </div>

          <div
            className="text-[10px] uppercase tracking-[0.12em] mt-0.5"
            style={{
              color:
                THEME.roleText,
            }}
          >
            Admin Panel
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────
          USER CARD
      ───────────────────────────────────── */}

      <div
        className="relative mx-2.5 mt-3 flex items-center gap-2.5 px-3 py-2.5 rounded-xl flex-shrink-0"
        style={{
          background:
            THEME.userCardBackground,

          border:
            `1px solid ${THEME.userCardBorder}`,
        }}
      >
        {/* Avatar */}

        <div
          className="relative w-9 h-9 rounded-[9px] flex items-center justify-center font-semibold text-xs flex-shrink-0"
          style={{
            background:
              THEME.userIconBackground,

            border:
              `1px solid ${THEME.userIconBorder}`,

            color:
              THEME.userIconText,
          }}
        >
          {initials}

          {/* Online indicator */}

          <span
            className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
            style={{
              background:
                THEME.onlineDot,

              borderColor:
                THEME.onlineDotBorder,
            }}
          />
        </div>

        {/* User information */}

        <div className="min-w-0">
          <div className="text-white text-[13px] font-semibold truncate">
            {user?.name ||
              "Admin"}
          </div>

          <div
            className="text-[11px] mt-0.5 capitalize truncate"
            style={{
              color:
                THEME.roleText,
            }}
          >
            {user?.role ||
              "administrator"}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────
          NAVIGATION
          Only this section scrolls.
      ───────────────────────────────────── */}

      <div className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2 pb-2">
        <SectionLabel label="Main" />

        {navMain.map(
          (item) => (
            <NavItem
              key={item.id}
              item={item}
              active={
                activeSection ===
                item.id
              }
              onClick={
                setActiveSection
              }
              badge={
                item.id ===
                "doctors"
                  ? pendingDoctors
                  : null
              }
            />
          )
        )}

        <SectionLabel label="Account" />

        {navAccount.map(
          (item) => (
            <NavItem
              key={item.id}
              item={item}
              active={
                activeSection ===
                item.id
              }
              onClick={
                setActiveSection
              }
            />
          )
        )}
      </div>

      {/* ─────────────────────────────────────
          LOGOUT
      ───────────────────────────────────── */}

      <div
        className="relative px-2 py-3 flex-shrink-0"
        style={{
          borderTop:
            `1px solid ${THEME.border}`,
        }}
      >
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-150"
          style={{
            background:
              "transparent",

            border: "none",

            color:
              THEME.logoutText,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              THEME.logoutHoverBackground;

            e.currentTarget.style.color =
              THEME.logoutHoverText;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              "transparent";

            e.currentTarget.style.color =
              THEME.logoutText;
          }}
        >
          <span className="w-[30px] h-[30px] rounded-lg flex items-center justify-center flex-shrink-0">
            <MdLogout
              size={15}
            />
          </span>

          Logout
        </button>
      </div>
    </aside>
  );
}