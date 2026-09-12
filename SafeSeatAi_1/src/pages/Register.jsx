import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "PARENT",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      setMessage("⚠️ Please fill all fields.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        "http://localhost:9091/api/users/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      const data = await response.json();

      console.log("Registered User:", data);

      setMessage("✅ Account created successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 1200);

    } catch (error) {
      console.error(error);
      setMessage(
        "❌ Registration failed. Please check if Eclipse backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      <div className="register-card">

        <div className="register-icon">🛡️</div>

        <h1>SafeSeat AI</h1>

        <p className="register-subtitle">
          Create your account
        </p>

        <form onSubmit={handleRegister}>

          <label>Full Name</label>

          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
          />

          <label>Email Address</label>

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          />

          <label>Password</label>

          <input
            type="password"
            name="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
          />

          <label>Register As</label>

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="PARENT">👨‍👩‍👧 Parent</option>
            <option value="DRIVER">🚌 Driver</option>
            <option value="ADMIN">👨‍💼 Admin</option>
          </select>

          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account →"}
          </button>

        </form>

        {message && (
          <p className="register-message">
            {message}
          </p>
        )}

        <p className="login-text">
          Already have an account?
          <span onClick={() => navigate("/login")}>
            {" "}Login
          </span>
        </p>

        <p
          className="back-home"
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </p>

      </div>

    </div>
  );
}

export default Register;