import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

const API =
  import.meta.env.VITE_API_URL ||
  "http://localhost:9091";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("PARENT");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (password.length < 4) {
      setError("Password must contain at least 4 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API}/api/users/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
            role,
          }),
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      let data;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();

        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : data?.message ||
              data?.error ||
              "Registration failed."
        );
      }

      setSuccess(
        "Account created successfully! Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      console.error(err);

      if (
        err.message === "Failed to fetch" ||
        err.message.includes("NetworkError")
      ) {
        setError(
          "Unable to connect to SafeSeat AI server."
        );
      } else {
        setError(
          err.message ||
            "Registration failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      <div className="register-card">

        <div className="register-logo">
          🛡️
        </div>

        <h1>SafeSeat AI</h1>

        <p className="register-subtitle">
          Create your secure account
        </p>

        {error && (
          <div className="register-error">
            {error}
          </div>
        )}

        {success && (
          <div className="register-success">
            {success}
          </div>
        )}

        <form onSubmit={handleRegister}>

          <div className="register-group">
            <label>Full Name</label>

            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="register-group">
            <label>Email Address</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="register-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Create password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />
          </div>

          <div className="register-group">
            <label>Account Type</label>

            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value)
              }
            >
              <option value="PARENT">Parent</option>
              <option value="DRIVER">Driver</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="register-submit"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account →"}
          </button>

        </form>

        <div className="register-login">
          Already have an account?{" "}
          <Link to="/login">
            Sign In
          </Link>
        </div>

      </div>

    </div>
  );
}

export default Register;