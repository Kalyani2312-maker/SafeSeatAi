import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages folder
import Home from "./pages/Home";
import Login from "./pages/Login";
import ParentDashboard from "./pages/ParentDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import AdminDashboard from "./pages/AdminDashboard";

// Components folder
import Features from "./components/Features";
import About from "./components/About";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Main Pages */}
        <Route path="/features" element={<Features />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* User Dashboards */}
        <Route
          path="/parent-dashboard"
          element={<ParentDashboard />}
        />

        <Route
          path="/driver-dashboard"
          element={<DriverDashboard />}
        />

        <Route
          path="/admin-dashboard"
          element={<AdminDashboard />}
        />

        {/* Unknown URL */}
        <Route path="*" element={<Home />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;