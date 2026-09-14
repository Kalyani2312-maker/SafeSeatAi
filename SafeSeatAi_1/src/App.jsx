import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import ParentDashboard from "./pages/ParentDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import Features from "./components/Features";
import About from "./components/About";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/features" element={<Features />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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

        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;