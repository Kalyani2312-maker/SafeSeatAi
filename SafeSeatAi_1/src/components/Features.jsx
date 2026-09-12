import { useNavigate } from "react-router-dom";
import "./Features.css";

function Features() {
  const navigate = useNavigate();

  const features = [
    {
      icon: "🤖",
      title: "AI Child Detection",
      description:
        "AI-based monitoring helps detect whether a child is still inside the school bus after the journey.",
    },
    {
      icon: "📱",
      title: "QR Attendance",
      description:
        "Students can scan their QR ID cards while boarding the bus for quick and secure attendance.",
    },
    {
      icon: "📍",
      title: "Live GPS Tracking",
      description:
        "Parents and administrators can monitor the latest bus location during the journey.",
    },
    {
      icon: "🚨",
      title: "Emergency SOS",
      description:
        "Emergency SOS allows an alert to be sent when immediate assistance is required.",
    },
    {
      icon: "🔔",
      title: "Safety Alerts",
      description:
        "The system generates alerts for child safety, emergency situations and abnormal bus conditions.",
    },
    {
      icon: "🚪",
      title: "Door Monitoring",
      description:
        "Bus door status can be monitored to improve child safety during the journey.",
    },
    {
      icon: "👨‍👩‍👧",
      title: "Parent Notifications",
      description:
        "Parents can receive important safety and journey updates through the connected system.",
    },
    {
      icon: "📊",
      title: "Smart Dashboard",
      description:
        "Admin, driver and parent dashboards provide centralized access to important information.",
    },
    {
      icon: "🛡️",
      title: "Child Left-Behind Detection",
      description:
        "The system checks journey completion and child presence to identify possible left-behind situations.",
    },
  ];

  return (
    <div className="features-page">

      {/* Navbar */}
      <nav className="features-navbar">

        <div
          className="features-logo"
          onClick={() => navigate("/")}
        >
          🚌
          <div>
            <strong>SafeSeat AI</strong>
            <span>School Bus Safety</span>
          </div>
        </div>

        <div className="features-nav-links">

          <button onClick={() => navigate("/")}>
            Dashboard
          </button>

          <button className="active">
            Features
          </button>

          <button onClick={() => navigate("/about")}>
            About
          </button>

          <button onClick={() => navigate("/dashboard")}>
            Dashboards
          </button>

          <button
            className="login-nav-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>

        </div>
      </nav>

      {/* Hero */}
      <section className="features-hero">

        <div className="features-hero-content">

          <span className="hero-badge">
            🛡️ SMART SCHOOL BUS SAFETY
          </span>

          <h1>
            Powerful Features for
            <span> Safer Journeys</span>
          </h1>

          <p>
            SafeSeat AI combines intelligent monitoring, QR attendance,
            GPS tracking and emergency alerts to create a safer school
            transportation experience.
          </p>

        </div>

      </section>

      {/* Features */}
      <section className="features-section">

        <div className="section-title">

          <span>WHAT WE PROVIDE</span>

          <h2>
            Complete Safety
            <span> Solution</span>
          </h2>

          <p>
            Everything required to monitor and protect children during
            their school bus journey.
          </p>

        </div>

        <div className="features-grid">

          {features.map((feature, index) => (
            <div
              className="feature-card"
              key={index}
            >

              <div className="feature-icon">
                {feature.icon}
              </div>

              <h3>{feature.title}</h3>

              <p>{feature.description}</p>

              <div className="feature-number">
                0{index + 1}
              </div>

            </div>
          ))}

        </div>

      </section>

      {/* CTA */}
      <section className="features-cta">

        <div>

          <h2>
            Ready to make school journeys safer?
          </h2>

          <p>
            Explore the SafeSeat AI dashboard and experience
            intelligent school bus safety.
          </p>

        </div>

        <button
          onClick={() => navigate("/dashboard")}
        >
          Explore Dashboard →
        </button>

      </section>

      {/* Footer */}
      <footer className="features-footer">

        <div>
          <strong>SafeSeat AI</strong>
          <p>
            Every Child. Every Journey. Always Safe.
          </p>
        </div>

        <p>
          © 2026 SafeSeat AI. Smart School Bus Safety System.
        </p>

      </footer>

    </div>
  );
}

export default Features;