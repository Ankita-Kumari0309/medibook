// App.jsx

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FutureVision from "./pages/FutureVision";

import PatientDashboard from "./pages/dashboards/patientDashboard/PatientDashboard";
import DoctorDashboard from "./pages/dashboards/doctorDashboard/DoctorDashboard";
import AdminDashboard from "./pages/dashboards/adminDashboard/AdminDashboard";

import PatientRegister from "./pages/auth/PatientRegister";
import DoctorRegister from "./pages/auth/DoctorRegister";

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (
    allowedRole &&
    user.role !== allowedRole
  ) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <Routes>

      {/* ───────────────────────────────────────────── */}
      {/* PUBLIC ROUTES */}
      {/* ───────────────────────────────────────────── */}

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/register/patient"
        element={<PatientRegister />}
      />

      <Route
        path="/register/doctor"
        element={<DoctorRegister />}
      />

      {/* Future Vision - Public */}
      <Route
        path="/future-vision"
        element={<FutureVision />}
      />


      {/* ───────────────────────────────────────────── */}
      {/* PATIENT */}
      {/* ───────────────────────────────────────────── */}

      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute allowedRole="patient">
            <PatientDashboard />
          </ProtectedRoute>
        }
      />


      {/* ───────────────────────────────────────────── */}
      {/* DOCTOR */}
      {/* ───────────────────────────────────────────── */}

      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute allowedRole="doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />


      {/* ───────────────────────────────────────────── */}
      {/* ADMIN */}
      {/* ───────────────────────────────────────────── */}

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;