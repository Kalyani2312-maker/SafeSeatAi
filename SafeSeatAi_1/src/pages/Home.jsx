import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const API = "http://localhost:9091";
const BUS_ID = 1;

function Home() {
  const navigate = useNavigate();

  const [bus, setBus] = useState(null);
  const [students, setStudents] = useState([]);
  const [journeys, setJourneys] = useState([]);
  const [safety, setSafety] = useState(null);
  const [gps, setGps] = useState(null);

  const loadData = async () => {
    try {
      const [busRes, studentRes, journeyRes, safetyRes, gpsRes] =
        await Promise.all([
          fetch(`${API}/api/buses/${BUS_ID}`),
          fetch(`${API}/api/students`),
          fetch(`${API}/api/journeys`),
          fetch(`${API}/api/safety`),
          fetch(`${API}/api/emergency-location/latest`),
        ]);

      if (busRes.ok) setBus(await busRes.json());
      if (studentRes.ok) setStudents(await studentRes.json());
      if (journeyRes.ok) setJourneys(await journeyRes.json());
      if (safetyRes.ok) {
        const data = await safetyRes.json();
        setSafety(
          Array.isArray(data)
            ? data.sort((a, b) => b.id - a.id)[0]
            : data
        );
      }
      if (gpsRes.ok) setGps(await gpsRes.json());
    } catch (error) {
      console.error("Home data error:", error);
    }
  };

  useEffect(() => {
    loadData();

    const timer = setInterval(loadData, 5000);

    return () => clearInterval(timer);
  }, []);

  const latestJourney = journeys
    .filter((j) => Number(j.busId) === BUS_ID)
    .sort((a, b) => b.id - a.id)[0];

  const journeyActive = latestJourney?.status === "ACTIVE";

  const leftBehind = safety?.leftBehind === true;
  const emergency = safety?.alertSent === true;

  let safetyTitle = "All Children Safe";
  let safetyClass = "safe";

  if (leftBehind) {
    safetyTitle = "Child Left Behind";
    safetyClass = "danger";
  } else if (emergency) {
    safetyTitle = "Safety Alert";
    safetyClass = "warning";
  }

  return (
    <div className="home-page">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-logo">🛡️</div>

          <div>
            <h2>SafeSeat AI</h2>
            <span>Smart School Bus Safety</span>
          </div>
        </div>

        <div className="sidebar-status">
          <span className="online-dot"></span>
          <div>
            <strong>System Online</strong>
            <small>Safety Monitoring Active</small>
          </div>
        </div>

        <nav className="side-nav">

          <button
            className="active"
            onClick={() => navigate("/")}
          >
            <span>🏠</span>
            Dashboard
          </button>

          <button onClick={() => navigate("/features")}>
            <span>⭐</span>
            Features
          </button>

          <button onClick={() => navigate("/about")}>
            <span>ℹ️</span>
            About
          </button>

          <button onClick={() => navigate("/dashboard")}>
            <span>📊</span>
            Dashboards
          </button>

          <button onClick={() => navigate("/login")}>
            <span>🔐</span>
            Login
          </button>

        </nav>

        <div className="sidebar-bottom">
          <div className="shield-small">🛡️</div>

          <strong>Safe transport.</strong>
          <p>Smart monitoring for every journey.</p>
        </div>

      </aside>


      {/* MAIN CONTENT */}
      <main className="main-content">

        {/* TOP BAR */}
        <header className="topbar">

          <div>
            <span className="top-label">
              SMART SCHOOL TRANSPORT
            </span>

            <h1>SafeSeat AI</h1>
          </div>

          <div className="top-actions">

            <div className="system-live">
              <span></span>
              System Online
            </div>

            <button
              className="top-login"
              onClick={() => navigate("/login")}
            >
              Login
            </button>

          </div>

        </header>


        {/* HERO */}
        <section className="hero-section">

          <div className="hero-content">

            <div className="hero-badge">
              <span>●</span>
              INTELLIGENT CHILD SAFETY SYSTEM
            </div>

            <h2>
              Every Child.
              <br />
              <span>Every Journey.</span>
              <br />
              Always Safe.
            </h2>

            <p>
              SafeSeat AI combines QR attendance, AI safety monitoring,
              live GPS tracking and emergency alerts to create a
              complete school bus safety ecosystem.
            </p>

            <div className="hero-buttons">

              <button
                className="primary-btn"
                onClick={() => navigate("/login")}
              >
                Get Started
                <span>→</span>
              </button>

              <button
                className="secondary-btn"
                onClick={() => navigate("/features")}
              >
                Explore Features
              </button>

            </div>

          </div>


          <div className="hero-visual">

            <div className="bus-orbit orbit-one"></div>
            <div className="bus-orbit orbit-two"></div>

            <div className="hero-bus-card">

              <div className="bus-card-top">
                <span>LIVE BUS</span>
                <strong>● LIVE</strong>
              </div>

              <div className="big-bus">🚌</div>

              <h3>
                {bus?.busNumber || "MH12AB1001"}
              </h3>

              <p>
                {bus?.route || "Route A"}
              </p>

              <div className="hero-bus-stats">

                <div>
                  <strong>{students.length || 3}</strong>
                  <span>Students</span>
                </div>

                <div>
                  <strong>{journeyActive ? "ACTIVE" : "IDLE"}</strong>
                  <span>Journey</span>
                </div>

                <div>
                  <strong>{gps ? "ACTIVE" : "READY"}</strong>
                  <span>GPS</span>
                </div>

              </div>

            </div>

          </div>

        </section>


        {/* LIVE STATUS */}
        <section className="status-grid">

          <div className={`status-card ${safetyClass}`}>

            <div className="status-icon">🛡️</div>

            <div>
              <small>SAFETY STATUS</small>
              <h3>{safetyTitle}</h3>
              <p>
                {leftBehind
                  ? "Immediate attention required."
                  : emergency
                  ? "Emergency assistance is active."
                  : "All monitored children are safe."}
              </p>
            </div>

          </div>


          <div className="status-card">

            <div className="status-icon">📍</div>

            <div>
              <small>GPS TRACKING</small>
              <h3>{gps ? "Active" : "Ready"}</h3>
              <p>
                {gps
                  ? "Live bus location available"
                  : "Waiting for GPS tracking"}
              </p>
            </div>

          </div>


          <div className="status-card">

            <div className="status-icon">🚨</div>

            <div>
              <small>EMERGENCY SYSTEM</small>
              <h3>Ready</h3>
              <p>Emergency SOS monitoring enabled</p>
            </div>

          </div>

        </section>


        {/* CONNECTED PLATFORM */}
        <section className="section">

          <div className="section-heading">

            <div>
              <span>CONNECTED PLATFORM</span>

              <h2>
                One System.
                <br />
                Complete Safety.
              </h2>
            </div>

            <p>
              SafeSeat AI connects students, parents, drivers and
              administrators through one intelligent safety platform.
            </p>

          </div>


          <div className="platform-grid">


            <div
              className="platform-card driver-card"
              onClick={() => navigate("/driver-dashboard")}
            >

              <div className="platform-icon">🚌</div>

              <div className="arrow-icon">→</div>

              <span className="platform-label">DRIVER</span>

              <h3>Driver Dashboard</h3>

              <p>
                Manage journeys, scan student QR codes, monitor
                attendance and trigger emergency SOS.
              </p>

              <div className="platform-preview">

                <strong>● LIVE</strong>

                <div>
                  <span>Driver</span>
                  <b>Ramesh Patil</b>
                </div>

                <div>
                  <span>Bus</span>
                  <b>MH12AB1001</b>
                </div>

              </div>

              <button>
                Open Driver Dashboard →
              </button>

            </div>


            <div
              className="platform-card parent-card"
              onClick={() => navigate("/parent-dashboard")}
            >

              <div className="platform-icon">👨‍👩‍👧</div>

              <div className="arrow-icon">→</div>

              <span className="platform-label">PARENT</span>

              <h3>Parent Dashboard</h3>

              <p>
                Monitor your child's bus journey, live location,
                safety status and emergency alerts.
              </p>

              <div className="platform-preview">

                <strong>● SAFE</strong>

                <div>
                  <span>Child Safety</span>
                  <b>Real-time monitoring</b>
                </div>

                <div>
                  <span>GPS</span>
                  <b>Live Tracking</b>
                </div>

              </div>

              <button>
                Open Parent Dashboard →
              </button>

            </div>


            <div
              className="platform-card student-card"
              onClick={() => navigate("/login")}
            >

              <div className="platform-icon">🎓</div>

              <div className="arrow-icon">→</div>

              <span className="platform-label">STUDENT</span>

              <h3>Student Dashboard</h3>

              <p>
                Access digital QR identity, attendance information
                and school bus journey details.
              </p>

              <div className="platform-preview">

                <strong>● ACTIVE</strong>

                <div>
                  <span>Digital Identity</span>
                  <b>QR Student ID</b>
                </div>

                <div>
                  <span>Attendance</span>
                  <b>Bus Journey</b>
                </div>

              </div>

              <button>
                Login to Continue →
              </button>

            </div>


            <div
              className="platform-card admin-card"
              onClick={() => navigate("/admin-dashboard")}
            >

              <div className="platform-icon">👨‍💼</div>

              <div className="arrow-icon">→</div>

              <span className="platform-label">ADMIN</span>

              <h3>Admin Dashboard</h3>

              <p>
                Manage students, buses, drivers, journeys,
                alerts and complete system monitoring.
              </p>

              <div className="platform-preview">

                <strong>● ONLINE</strong>

                <div>
                  <span>Safety Control</span>
                  <b>Central Monitoring</b>
                </div>

                <div>
                  <span>Management</span>
                  <b>Complete Control</b>
                </div>

              </div>

              <button>
                Open Admin Dashboard →
              </button>

            </div>

          </div>

        </section>


        {/* FEATURES */}
        <section className="section features-section">

          <div className="section-heading centered">

            <div>
              <span>POWERFUL FEATURES</span>

              <h2>
                Built for
                <br />
                Child Safety.
              </h2>
            </div>

            <p>
              Advanced technology designed to prevent child safety
              incidents and provide complete journey visibility.
            </p>

          </div>


          <div className="features-grid">

            <div className="feature-card">
              <div>📱</div>
              <h3>QR Attendance</h3>
              <p>
                Fast and secure student boarding verification
                using QR codes.
              </p>
            </div>

            <div className="feature-card">
              <div>🤖</div>
              <h3>AI Safety Detection</h3>
              <p>
                Intelligent monitoring detects potential
                child safety issues.
              </p>
            </div>

            <div className="feature-card">
              <div>📍</div>
              <h3>Live GPS Tracking</h3>
              <p>
                Track school bus location during the entire journey.
              </p>
            </div>

            <div className="feature-card">
              <div>🚨</div>
              <h3>Emergency SOS</h3>
              <p>
                Instantly send emergency alerts to parents
                and administrators.
              </p>
            </div>

            <div className="feature-card">
              <div>🔔</div>
              <h3>Instant Alerts</h3>
              <p>
                Safety notifications help parents respond
                quickly to incidents.
              </p>
            </div>

            <div className="feature-card">
              <div>🚪</div>
              <h3>Door Monitoring</h3>
              <p>
                Monitor bus door status as part of the
                safety system.
              </p>
            </div>

          </div>

        </section>


        {/* ABOUT */}
        <section className="about-section">

          <div className="about-visual">

            <div className="about-shield">
              🛡️
            </div>

            <div className="about-ring ring-one"></div>
            <div className="about-ring ring-two"></div>

            <span className="floating-card card-one">
              QR
            </span>

            <span className="floating-card card-two">
              GPS
            </span>

            <span className="floating-card card-three">
              AI
            </span>

          </div>


          <div className="about-content">

            <span>ABOUT SAFESEAT AI</span>

            <h2>
              Making Every School
              <br />
              Journey Safer.
            </h2>

            <p>
              SafeSeat AI is an intelligent school bus safety and
              monitoring platform designed to protect children
              before, during and after their bus journey.
            </p>

            <p>
              The system combines QR attendance, AI-based safety
              detection, live GPS tracking, emergency SOS and
              centralized dashboards to create a complete child
              safety ecosystem.
            </p>

            <button
              className="primary-btn"
              onClick={() => navigate("/about")}
            >
              Learn More →
            </button>

            <div className="about-points">

              <div>
                <strong>01</strong>
                <h3>Child Safety</h3>
                <p>
                  Continuous safety monitoring during the journey.
                </p>
              </div>

              <div>
                <strong>02</strong>
                <h3>Smart Technology</h3>
                <p>
                  AI, QR and GPS technologies working together.
                </p>
              </div>

              <div>
                <strong>03</strong>
                <h3>Parent Confidence</h3>
                <p>
                  Real-time visibility and safety notifications.
                </p>
              </div>

              <div>
                <strong>04</strong>
                <h3>School Control</h3>
                <p>
                  Centralized administration and monitoring.
                </p>
              </div>

            </div>

          </div>

        </section>


        {/* CTA */}
        <section className="cta-section">

          <div className="cta-shield">
            🛡️
          </div>

          <div>

            <span>READY TO GET STARTED?</span>

            <h2>
              Keep Every Child Safe
              <br />
              on Every Journey.
            </h2>

            <p>
              Access the SafeSeat AI dashboard and experience
              intelligent school bus safety monitoring.
            </p>

          </div>

          <button
            onClick={() => navigate("/login")}
          >
            Login to SafeSeat AI →
          </button>

        </section>


        {/* FOOTER */}
        <footer className="footer">

          <div className="footer-brand">

            <div className="footer-logo">
              🛡️
            </div>

            <div>
              <strong>SafeSeat AI</strong>
              <span>
                Intelligent School Bus Safety System
              </span>
            </div>

          </div>

          <div className="footer-tagline">
            Every Child. Every Journey. Always Safe.
          </div>

          <div className="footer-copy">
            © 2026 SafeSeat AI
          </div>

        </footer>

      </main>

    </div>
  );
}

export default Home;