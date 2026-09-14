import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const API =
    import.meta.env.VITE_API_URL ||
    "http://localhost:9091";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("PARENT");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const contentType =
        response.headers.get("content-type") || "";

      let data;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      console.log("LOGIN RESPONSE:", data);

      if (!response.ok) {
        const message =
          typeof data === "string"
            ? data
            : data?.message || "Invalid email or password.";

        throw new Error(message);
      }

      // -----------------------------------------
      // USER ROLE
      // -----------------------------------------

      const userRole = String(
        data?.role || role || ""
      )
        .trim()
        .toUpperCase();

      console.log("LOGIN USER:", data);
      console.log("LOGIN ROLE:", userRole);

      // -----------------------------------------
      // SAVE USER
      // -----------------------------------------

      localStorage.setItem(
        "user",
        JSON.stringify(data)
      );

      localStorage.setItem(
        "safeSeatUser",
        JSON.stringify(data)
      );

      localStorage.setItem(
        "userRole",
        userRole
      );

      // -----------------------------------------
      // ROLE VALIDATION
      // -----------------------------------------

      if (!userRole) {
        throw new Error(
          "User role is missing. Please contact administrator."
        );
      }

      // User-selected role and database role
      // should match.
      const selectedRole = String(role)
        .trim()
        .toUpperCase();

      if (selectedRole !== userRole) {
        setError(
          `You selected ${selectedRole}, but this account is registered as ${userRole}.`
        );

        localStorage.removeItem("user");
        localStorage.removeItem("safeSeatUser");
        localStorage.removeItem("userRole");

        return;
      }

      // -----------------------------------------
      // REDIRECT BASED ON REAL DATABASE ROLE
      // -----------------------------------------

      if (userRole === "PARENT") {
        navigate("/parent-dashboard");
        return;
      }

      if (userRole === "DRIVER") {
        navigate("/driver-dashboard");
        return;
      }

      if (userRole === "ADMIN") {
        navigate("/admin-dashboard");
        return;
      }

      setError(
        "Invalid user role. Please contact administrator."
      );

    } catch (error) {
      console.error("LOGIN ERROR:", error);

      setError(
        error.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* =========================================
          LEFT SIDE
      ========================================= */}

      <div className="login-left">

        <div className="login-brand">
          <div className="brand-icon">
            🛡️
          </div>

          <div>
            <h1>SafeSeat AI</h1>

            <p>
              Intelligent School Bus Safety
            </p>
          </div>
        </div>

        <div className="login-left-content">

          <span className="login-badge">
            SMART SCHOOL TRANSPORT
          </span>

          <h2>
            Every Child.
            <br />
            Every Journey.
            <br />
            <span>Always Safe.</span>
          </h2>

          <p>
            SafeSeat AI provides intelligent child
            safety monitoring, QR attendance, live
            journey tracking and emergency alerts
            for schools, parents and drivers.
          </p>

          <div className="login-features">

            <div className="login-feature">
              <span>✓</span>
              <div>
                <strong>QR Attendance</strong>
                <small>
                  Secure student boarding verification
                </small>
              </div>
            </div>

            <div className="login-feature">
              <span>✓</span>
              <div>
                <strong>Live GPS Tracking</strong>
                <small>
                  Monitor school bus journeys
                </small>
              </div>
            </div>

            <div className="login-feature">
              <span>✓</span>
              <div>
                <strong>Emergency Alerts</strong>
                <small>
                  Instant parent and teacher notification
                </small>
              </div>
            </div>

          </div>
        </div>

        <div className="login-left-footer">
          © 2026 SafeSeat AI · Child Safety Network
        </div>

      </div>


      {/* =========================================
          RIGHT SIDE
      ========================================= */}

      <div className="login-right">

        <div className="login-card">

          <div className="login-header">

            <div className="mobile-brand-icon">
              🛡️
            </div>

            <h2>
              Welcome Back
            </h2>

            <p>
              Login to your SafeSeat AI account
            </p>

          </div>


          {/* =====================================
              ERROR MESSAGE
          ===================================== */}

          {error && (
            <div className="login-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}


          {/* =====================================
              ROLE SELECTOR
          ===================================== */}

          <div className="role-section">

            <label>
              Login As
            </label>

            <div className="role-buttons">

              {/* PARENT */}

              <button
                type="button"
                className={
                  role === "PARENT"
                    ? "role-btn active"
                    : "role-btn"
                }
                onClick={() => {
                  setRole("PARENT");
                  setError("");
                }}
              >
                <span className="role-icon">
                  👨‍👩‍👧
                </span>

                <span>
                  Parent
                </span>
              </button>


              {/* DRIVER */}

              <button
                type="button"
                className={
                  role === "DRIVER"
                    ? "role-btn active"
                    : "role-btn"
                }
                onClick={() => {
                  setRole("DRIVER");
                  setError("");
                }}
              >
                <span className="role-icon">
                  🚌
                </span>

                <span>
                  Driver
                </span>
              </button>


              {/* ADMIN */}

              <button
                type="button"
                className={
                  role === "ADMIN"
                    ? "role-btn active"
                    : "role-btn"
                }
                onClick={() => {
                  setRole("ADMIN");
                  setError("");
                }}
              >
                <span className="role-icon">
                  🛡️
                </span>

                <span>
                  Admin
                </span>
              </button>

            </div>

          </div>


          {/* =====================================
              LOGIN FORM
          ===================================== */}

          <form
            onSubmit={handleLogin}
            className="login-form"
          >

            {/* EMAIL */}

            <div className="form-group">

              <label htmlFor="email">
                Email Address
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  ✉️
                </span>

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  autoComplete="email"
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
                  className="forgot-password"
                  onClick={() =>
                    setError(
                      "Please contact the SafeSeat administrator to reset your password."
                    )
                  }
                >
                  Forgot Password?
                </button>

              </div>

              <div className="input-wrapper">

                <span className="input-icon">
                  🔒
                </span>

                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  autoComplete="current-password"
                />

              </div>

            </div>


            {/* =================================
                LOGIN BUTTON
            ================================= */}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="spinner"></span>
                  Logging in...
                </>
              ) : (
                <>
                  Login as {role}
                  <span>→</span>
                </>
              )}

            </button>

          </form>


          {/* =====================================
              REGISTER
          ===================================== */}

          <div className="register-section">

            <span>
              Don't have an account?
            </span>

            <Link to="/register">
              Create Account
            </Link>

          </div>


          {/* =====================================
              SECURITY
          ===================================== */}

          <div className="security-note">

            <span>🔐</span>

            <div>
              <strong>
                Secure Access
              </strong>

              <small>
                Your account is protected by
                SafeSeat AI security.
              </small>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;