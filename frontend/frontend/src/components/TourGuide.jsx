import { useEffect, useState } from "react";
import { Joyride, STATUS } from "react-joyride";

// ─────────────────────────────────────────────────────────────────────────────
// HOME TOUR STEPS
// ─────────────────────────────────────────────────────────────────────────────

const HOME_STEPS = [
  {
    target: '[data-tour="how-medibook-works"]',
    content:
      "Welcome to MediBook. This tour explains how the platform connects patients, doctors, appointments, health records and responsible AI assistance.",
    placement: "bottom",
  },

  {
    target: '[data-tour="specialities"]',
    content:
      "Patients can explore medical specialities and identify the type of doctor they may need.",
    placement: "top",
  },

  {
    target: '[data-tour="how-it-works"]',
    content:
      "Patients can find an approved doctor, check available appointment slots, select a convenient time and send a booking request.",
    placement: "top",
  },

  {
    target: '[data-tour="ai-care-assistant"]',
    content:
      "MediBook provides an AI Care Assistant where patients can describe their concern using text or multilingual voice and receive healthcare-navigation support.",
    placement: "top",
  },

  {
    target: '[data-tour="medical-documents"]',
    content:
      "Patients can upload medical reports and use the AI Medical Document Assistant to understand the uploaded document and ask questions based on its content.",
    placement: "top",
  },

  {
    target: '[data-tour="security"]',
    content:
      "AI remains assistive. Healthcare workflows stay under human control, while role-based access separates patient, doctor and administrator permissions.",
    placement: "top",
  },

  {
    target: '[data-tour="about"]',
    content:
      "MediBook connects patients, doctors and healthcare operations into one platform.",
    placement: "top",
  },

  {
    target: '[data-tour="get-started"]',
    content:
      "That's MediBook in a nutshell. Create an account to start exploring the platform.",
    placement: "top",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// TOUR GUIDE
// ─────────────────────────────────────────────────────────────────────────────

export default function TourGuide({
  runTour,
  onFinish,
}) {
  const [run, setRun] = useState(false);

  useEffect(() => {
    setRun(Boolean(runTour));
  }, [runTour]);

  if (!runTour) {
    return null;
  }

  return (
    <Joyride
      steps={HOME_STEPS}
      run={run}
      continuous
      scrollToFirstStep
      onEvent={(data) => {
        const { status, type } = data;

        // Tour finished or skipped
        if (
          status === STATUS.FINISHED ||
          status === STATUS.SKIPPED
        ) {
          setRun(false);
          onFinish?.();
          return;
        }

        // Handle target problems gracefully
        if (type === "error:target_not_found") {
          console.warn(
            "Tour target not found:",
            data.step?.target
          );
        }
      }}
      options={{
        primaryColor: "#0d9488",
        textColor: "#1f2937",
        backgroundColor: "#ffffff",
        arrowColor: "#ffffff",
        overlayColor: "rgba(15, 23, 42, 0.55)",
        showProgress: true,
        showSkipButton: true,
        dismissKeyAction: false,
        overlayClickAction: false,
        spotlightPadding: 8,
        scrollOffset: 80,
      }}
      styles={{
        tooltip: {
          borderRadius: 16,
          padding: 20,
          maxWidth: 380,
          boxShadow:
            "0 20px 50px rgba(15,23,42,0.18)",
        },

        tooltipContent: {
          padding: "4px 0",
          lineHeight: 1.6,
          fontSize: 14,
        },

        tooltipFooter: {
          marginTop: 16,
        },

        buttonPrimary: {
          backgroundColor: "#0d9488",
          borderRadius: 8,
          fontWeight: 600,
          padding: "9px 16px",
        },

        buttonBack: {
          color: "#0d9488",
          marginRight: 8,
        },

        buttonSkip: {
          color: "#6b7280",
        },

        buttonClose: {
          color: "#6b7280",
        },
      }}
      locale={{
        back: "Back",
        close: "Close",
        last: "Finish",
        next: "Next",
        skip: "Skip tour",
      }}
    />
  );
}