import { useNavigate } from "react-router-dom";
import "./About.css";

function About() {
  const navigate = useNavigate();

  return (
    <div className="about-page">

      {/* Navbar */}
      <nav className="about-navbar">

        <div
          className="about-logo"
          onClick={() => navigate("/")}
        >
          🚌

          <div>
            <strong>SafeSeat AI</strong>
            <span>School Bus Safety</span>
          </div>
        </div>

        <div className="about-nav-links">

          <button onClick={() => navigate("/")}>
            Dashboard
          </button>

          <button onClick={() => navigate("/features")}>
            Features
          </button>

          <button className="active">
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
      <section className="about-hero">

        <div className="about-hero-content">

          <span className="about-badge">
            🛡️ ABOUT SAFESEAT AI
          </span>

          <h1>
            Building a
            <span> Safer Future</span>
            <br />
            for School Transportation
          </h1>

          <p>
            SafeSeat AI is an intelligent school bus safety platform
            designed to help schools, parents and drivers protect
            children throughout their daily journey.
          </p>

        </div>

      </section>

      {/* About System */}
      <section className="about-main">

        <div className="about-text">

          <span className="small-title">
            OUR MISSION
          </span>

          <h2>
            Every Child.
            <br />
            Every Journey.
            <br />
            <span>Always Safe.</span>
          </h2>

          <p>
            School transportation involves thousands of children
            travelling every day. SafeSeat AI provides a centralized
            safety system that helps monitor attendance, journeys,
            child presence and emergency situations.
          </p>

          <p>
            Our goal is to reduce the risk of children being left
            behind in school buses and provide parents and schools
            with timely safety information.
          </p>

          <button
            onClick={() => navigate("/features")}
            className="about-primary-btn"
          >
            Explore Our Features →
          </button>

        </div>

        {/* Mission Cards */}
        <div className="about-cards">

          <div className="about-card">
            <div className="about-card-icon">👶</div>
            <h3>Child Safety</h3>
            <p>
              Focused on protecting children throughout their
              complete school transportation journey.
            </p>
          </div>

          <div className="about-card">
            <div className="about-card-icon">🤖</div>
            <h3>Smart Technology</h3>
            <p>
              Uses AI, QR scanning, GPS and real-time monitoring
              to improve transportation safety.
            </p>
          </div>

          <div className="about-card">
            <div className="about-card-icon">👨‍👩‍👧</div>
            <h3>Parent Confidence</h3>
            <p>
              Provides parents with useful information about
              their child's bus journey and safety.
            </p>
          </div>

          <div className="about-card">
            <div className="about-card-icon">🏫</div>
            <h3>School Control</h3>
            <p>
              Gives administrators a centralized platform to
              monitor students, buses, journeys and alerts.
            </p>
          </div>

        </div>

      </section>

      {/* How It Works */}
      <section className="about-how">

        <div className="section-title">

          <span>HOW IT WORKS</span>

          <h2>
            One Connected
            <span> Safety Network</span>
          </h2>

        </div>

        <div className="about-flow">

          <div className="flow-card">
            <div>01</div>
            <h3>Student Registration</h3>
            <p>
              Student and parent information is securely registered
              in the system.
            </p>
          </div>

          <div className="flow-arrow">→</div>

          <div className="flow-card">
            <div>02</div>
            <h3>QR Attendance</h3>
            <p>
              Students scan their QR ID while boarding the bus.
            </p>
          </div>

          <div className="flow-arrow">→</div>

          <div className="flow-card">
            <div>03</div>
            <h3>Live Monitoring</h3>
            <p>
              Bus journey, GPS and safety conditions are monitored.
            </p>
          </div>

          <div className="flow-arrow">→</div>

          <div className="flow-card">
            <div>04</div>
            <h3>Safety Alert</h3>
            <p>
              Emergency or child safety conditions generate alerts.
            </p>
          </div>

        </div>

      </section>

      {/* CTA */}
      <section className="about-cta">

        <h2>
          Protect Every Journey with SafeSeat AI
        </h2>

        <p>
          Smart technology. Real-time monitoring. Better child safety.
        </p>

        <button onClick={() => navigate("/dashboard")}>
          View Dashboard →
        </button>

      </section>

      {/* Footer */}
      <footer className="about-footer">

        <div>
          <strong>SafeSeat AI</strong>
          <p>
            Every Child. Every Journey. Always Safe.
          </p>
        </div>

        <p>
          © 2026 SafeSeat AI. All Rights Reserved.
        </p>

      </footer>

    </div>
  );
}

export default About;