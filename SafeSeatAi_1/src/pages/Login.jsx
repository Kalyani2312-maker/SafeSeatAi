import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [role, setRole] = useState("parent");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:9091/api/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const user = await response.json();

      console.log("Logged in user:", user);

      // Backend returned no user
      if (!user) {
        alert("Invalid email or password");
        return;
      }

      // Check selected role with database role
      if (user.role.toLowerCase() !== role) {
        alert(
          `This account is registered as ${user.role}. Please select the correct role.`
        );
        return;
      }

      // Save logged-in user
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user.role);

      // Role-based dashboard
      if (user.role.toLowerCase() === "parent") {
        navigate("/parent-dashboard");
      } else if (user.role.toLowerCase() === "driver") {
        navigate("/driver-dashboard");
      } else if (user.role.toLowerCase() === "admin") {
        navigate("/admin-dashboard");
      } else {
        alert("Unknown user role.");
      }

    } catch (error) {
      console.error("Login Error:", error);

      alert(
        "❌ Login failed. Please check your email/password and make sure Eclipse backend is running on port 9091."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-logo">🛡️</div>

        <h1>Welcome Back</h1>

        <p className="subtitle">
          Login to your SafeSeat AI account
        </p>

        <div className="role-container">

          <button
            className={
              role === "parent"
                ? "role-btn active"
                : "role-btn"
            }
            onClick={() => setRole("parent")}
            type="button"
          >
            👨‍👩‍👧
            <span>Parent</span>
          </button>

          <button
            className={
              role === "driver"
                ? "role-btn active"
                : "role-btn"
            }
            onClick={() => setRole("driver")}
            type="button"
          >
            🚌
            <span>Driver</span>
          </button>

          <button
            className={
              role === "admin"
                ? "role-btn active"
                : "role-btn"
            }
            onClick={() => setRole("admin")}
            type="button"
          >
            👨‍💼
            <span>Admin</span>
          </button>

        </div>

        <form onSubmit={handleLogin}>

          <label>Email Address</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="forgot">
            <a href="#forgot">Forgot Password?</a>
          </div>

          <button
            className="login-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login →"}
          </button>

        </form>

        <div className="register-text">
          Don't have an account?
          <Link to="/register">Create Account</Link>
        </div>

        <Link className="back-home" to="/">
          ← Back to Home
        </Link>

      </div>
    </div>
  );
}

export default Login;