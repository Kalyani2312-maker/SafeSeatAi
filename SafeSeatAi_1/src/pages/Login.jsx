import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:9091";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = form.email.trim();
    const password = form.password;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
  const response = await fetch(
    `${API}/api/users/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );
      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Invalid email or password."
        );
      }

      const user = data.user || data;

      if (!user) {
        throw new Error("Invalid response from server.");
      }

      console.log("SafeSeat AI User:", user);

      // Save user
      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      // Save token if available
      const token = data.token || user.token;

      if (token) {
        localStorage.setItem("token", token);
      }

      // Remember me
      if (rememberMe) {
        localStorage.setItem(
          "rememberMe",
          "true"
        );
      } else {
        localStorage.removeItem("rememberMe");
      }

      // Get role
      const role = String(
        user.role ||
          user.userRole ||
          user.type ||
          ""
      ).toLowerCase();

      console.log("SafeSeat AI Role:", role);

      // Role-based dashboard
      switch (role) {
        case "admin":
          navigate("/admin-dashboard", {
            replace: true,
          });
          break;

        case "driver":
          navigate("/driver-dashboard", {
            replace: true,
          });
          break;

        case "parent":
          navigate("/parent-dashboard", {
            replace: true,
          });
          break;

        case "student":
          setError(
            "Student dashboard is not configured yet."
          );
          break;

        default:
          setError(
            "Login successful, but your account role is not configured."
          );
      }
    } catch (err) {
      console.error(
        "SafeSeat AI Login Error:",
        err
      );

      if (
        err instanceof TypeError ||
        err.message === "Failed to fetch"
      ) {
        setError(
          "Unable to connect to SafeSeat AI server. Please make sure the backend is running on port 8080."
        );
      } else {
        setError(
          err.message ||
            "Login failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert(
      "Please contact your school administrator to reset your password."
    );
  };

  const handleSupport = () => {
    alert(
      "Please contact your school administrator for assistance."
    );
  };

  return (
    <main className="login-page">

      {/* LEFT BRANDING */}
      <section className="login-brand">
        <div className="brand-content">

          <div className="brand-logo">
            <span className="logo-shield">
              🛡️
            </span>
          </div>

          <p className="brand-label">
            SCHOOL BUS SAFETY SYSTEM
          </p>

          <h1>SafeSeat AI</h1>

          <div className="system-status">
            <span className="status-dot"></span>
            SYSTEM ONLINE
          </div>

          <p className="brand-tagline">
            Every Child. Every Journey.
            <br />
            <strong>Always Safe.</strong>
          </p>

          <p className="brand-description">
            Intelligent school transportation
            technology designed to keep students
            safe before, during and after every
            journey.
          </p>

          <div className="brand-features">

            <div className="feature-item">
              <span className="feature-check">
                ✓
              </span>

              <div>
                <strong>
                  Smart Safety Monitoring
                </strong>

                <small>
                  Real-time journey protection
                </small>
              </div>
            </div>

            <div className="feature-item">
              <span className="feature-check">
                ✓
              </span>

              <div>
                <strong>
                  QR Attendance
                </strong>

                <small>
                  Secure student boarding
                </small>
              </div>
            </div>

            <div className="feature-item">
              <span className="feature-check">
                ✓
              </span>

              <div>
                <strong>
                  Live GPS & Emergency SOS
                </strong>

                <small>
                  Complete journey visibility
                </small>
              </div>
            </div>

          </div>

          <div className="brand-security">
            <span>🔐</span>

            <div>
              <strong>
                Secure Platform
              </strong>

              <small>
                Protected school transportation
                system
              </small>
            </div>
          </div>

        </div>

        <div className="brand-footer">
          © {new Date().getFullYear()} SafeSeat AI
        </div>
      </section>


      {/* LOGIN SECTION */}
      <section className="login-section">

        <div className="login-card">

          {/* MOBILE LOGO */}
          <div className="mobile-logo">

            <div className="mobile-logo-icon">
              🛡️
            </div>

            <div>
              <strong>
                SafeSeat AI
              </strong>

              <small>
                SCHOOL BUS SAFETY
              </small>
            </div>

          </div>


          {/* HEADER */}
          <header className="login-header">

            <p className="welcome-text">
              SECURE ACCESS
            </p>

            <h2>
              Welcome back
            </h2>

            <p>
              Sign in to access your SafeSeat AI
              dashboard and manage school bus
              safety.
            </p>

          </header>


          {/* LOGIN FORM */}
          <form
            onSubmit={handleSubmit}
            noValidate
          >

            {/* EMAIL */}
            <div className="form-group">

              <label htmlFor="email">
                Email Address
              </label>

              <div className="input-wrapper">

                <span
                  className="input-icon"
                  aria-hidden="true"
                >
                  ✉
                </span>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  disabled={loading}
                  required
                />

              </div>

            </div>


            {/* PASSWORD */}
            <div className="form-group">

              <div className="password-label-row">

                <label htmlFor="password">
                  Password
                </label>

                <button
                  type="button"
                  className="forgot-button"
                  onClick={handleForgotPassword}
                  disabled={loading}
                >
                  Forgot password?
                </button>

              </div>

              <div className="input-wrapper">

                <span
                  className="input-icon"
                  aria-hidden="true"
                >
                  🔒
                </span>

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  disabled={loading}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  disabled={loading}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword
                    ? "🙈"
                    : "👁️"}
                </button>

              </div>

            </div>


            {/* ERROR */}
            {error && (
              <div
                className="login-error"
                role="alert"
              >
                <span className="error-icon">
                  !
                </span>

                <div>
                  <strong>
                    Login failed
                  </strong>

                  <p>
                    {error}
                  </p>
                </div>
              </div>
            )}


            {/* REMEMBER ME */}
            <div className="remember-row">

              <label className="remember-label">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(
                      e.target.checked
                    )
                  }
                  disabled={loading}
                />

                <span>
                  Remember me
                </span>

              </label>

            </div>


            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="spinner"></span>

                  <span>
                    Signing in...
                  </span>
                </>
              ) : (
                <>
                  <span>
                    Sign in securely
                  </span>

                  <span className="arrow">
                    →
                  </span>
                </>
              )}

            </button>

          </form>


          {/* SECURITY DIVIDER */}
          <div className="login-divider">
            <span>
              SAFESEAT AI SECURITY
            </span>
          </div>


          {/* SECURITY MESSAGE */}
          <div className="security-note">

            <div className="security-icon">
              🛡️
            </div>

            <div>

              <strong>
                Your safety matters
              </strong>

              <p>
                Your account information is
                protected through secure
                authentication.
              </p>

            </div>

          </div>


          {/* SUPPORT */}
          <div className="login-footer">

            <p>
              Need help accessing your account?
            </p>

            <button
              type="button"
              onClick={handleSupport}
              disabled={loading}
            >
              Contact Support
            </button>

          </div>


          {/* MINI BRANDING */}
          <div className="login-brand-mini">

            <span>🛡️</span>

            <strong>
              SafeSeat AI
            </strong>

            <span>•</span>

            <small>
              Intelligent School Bus Safety
            </small>

          </div>

        </div>

      </section>

    </main>
  );
}