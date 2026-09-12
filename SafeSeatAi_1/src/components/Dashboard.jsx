import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const dashboards = [
    {
      icon: "👨‍👩‍👧",
      title: "Parent Dashboard",
      description:
        "Parents can monitor their child's bus journey, safety status, GPS location and alerts.",
      features: [
        "Child Safety Status",
        "Live Bus Tracking",
        "Safety Alerts",
        "Journey Information",
      ],
      path: "/parent-dashboard",
      button: "Open Parent Dashboard",
    },
    {
      icon: "🚌",
      title: "Driver Dashboard",
      description:
        "Drivers can manage journeys, scan student QR codes, track attendance and send emergency alerts.",
      features: [
        "QR Attendance",
        "Journey Management",
        "GPS Tracking",
        "Emergency SOS",
      ],
      path: "/driver-dashboard",
      button: "Open Driver Dashboard",
    },
    {
      icon: "🏫",
      title: "Admin Dashboard",
      description:
        "School administrators can manage students, buses, drivers, journeys and safety alerts.",
      features: [
        "Student Management",
        "Bus Management",
        "Driver Management",
        "Safety Monitoring",
      ],
      path: "/admin-dashboard",
      button: "Open Admin Dashboard",
    },
  ];

  return (
    <div className="dashboard-page">

      {/* Navbar */}
      <nav className="dashboard-navbar">

        <div
          className="dashboard-logo"
          onClick={() => navigate("/")}
        >
          🚌

          <div>
            <strong>SafeSeat AI</strong>
            <span>School Bus Safety</span>
          </div>
        </div>

        <div className="dashboard-nav-links">

          <button onClick={() => navigate("/")}>
            Dashboard
          </button>

          <button onClick={() => navigate("/features")}>
            Features
          </button>

          <button onClick={() => navigate("/about")}>
            About
          </button>

          <button className="active">
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
      <section className="dashboard-hero">

        <div className="dashboard-hero-content">

          <span className="dashboard-badge">
            📊 SAFESEAT AI PLATFORM
          </span>

          <h1>
            Connected
            <span> Dashboards</span>
          </h1>

          <p>
            One intelligent platform connecting parents, drivers and
            school administrators to create a safer transportation
            network.
          </p>

        </div>

      </section>

      {/* Dashboard Cards */}
      <section className="dashboard-section">

        <div className="dashboard-section-title">

          <span>CHOOSE YOUR DASHBOARD</span>

          <h2>
            One Platform.
            <span> Three Perspectives.</span>
          </h2>

          <p>
            Each dashboard provides role-specific tools and
            information for safer school transportation.
          </p>

        </div>

        <div className="dashboard-grid">

          {dashboards.map((dashboard, index) => (

            <div
              className="dashboard-role-card"
              key={index}
            >

              <div className="dashboard-card-top">

                <div className="dashboard-role-icon">
                  {dashboard.icon}
                </div>

                <span className="dashboard-role-number">
                  0{index + 1}
                </span>

              </div>

              <h3>
                {dashboard.title}
              </h3>

              <p>
                {dashboard.description}
              </p>

              <div className="dashboard-feature-list">

                {dashboard.features.map(
                  (feature, featureIndex) => (

                    <div
                      key={featureIndex}
                      className="dashboard-feature"
                    >
                      <span>✓</span>
                      {feature}
                    </div>

                  )
                )}

              </div>

              <button
                className="dashboard-open-btn"
                onClick={() => navigate(dashboard.path)}
              >
                {dashboard.button}
                <span>→</span>
              </button>

            </div>

          ))}

        </div>

      </section>

      {/* System Status */}
      <section className="system-status">

        <div className="system-status-icon">
          🟢
        </div>

        <div>
          <h3>
            SafeSeat AI System Online
          </h3>

          <p>
            Connected platform for intelligent school bus
            safety monitoring.
          </p>
        </div>

        <div className="system-status-info">

          <div>
            <strong>QR</strong>
            <span>Attendance</span>
          </div>

          <div>
            <strong>GPS</strong>
            <span>Tracking</span>
          </div>

          <div>
            <strong>AI</strong>
            <span>Safety</span>
          </div>

          <div>
            <strong>SOS</strong>
            <span>Emergency</span>
          </div>

        </div>

      </section>

      {/* CTA */}
      <section className="dashboard-cta">

        <h2>
          Need access to the system?
        </h2>

        <p>
          Login to continue to your personalized SafeSeat AI dashboard.
        </p>

        <button
          onClick={() => navigate("/login")}
        >
          Login to SafeSeat AI →
        </button>

      </section>

      {/* Footer */}
      <footer className="dashboard-footer">

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

export default Dashboard;