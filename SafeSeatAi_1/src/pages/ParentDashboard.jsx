import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./ParentDashboard.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:9091";

// =====================================================
// BUS ICON
// =====================================================

const busIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",

  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// =====================================================
// MAP UPDATER
// =====================================================

function MapUpdater({ latitude, longitude }) {
  const map = useMap();

  useEffect(() => {
    if (
      latitude !== null &&
      longitude !== null &&
      !isNaN(latitude) &&
      !isNaN(longitude)
    ) {
      map.setView([latitude, longitude], 16);
    }
  }, [latitude, longitude, map]);

  return null;
}

// =====================================================
// PARENT DASHBOARD
// =====================================================

function ParentDashboard() {
  const navigate = useNavigate();

  // USER
  const [user, setUser] = useState(null);

  // STUDENT / BUS
  const [student, setStudent] = useState(null);
  const [bus, setBus] = useState(null);

  // SAFETY
  const [safety, setSafety] = useState(null);
  const [childPresent, setChildPresent] = useState(true);
  const [doorOpen, setDoorOpen] = useState(false);

  // GPS
  const [gps, setGps] = useState(null);
  const [gpsHistory, setGpsHistory] = useState([]);

  // JOURNEY
  const [journey, setJourney] = useState(null);

  // ALERTS
  const [latestAlert, setLatestAlert] = useState(null);

  // UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  // ===================================================
  // GET USER
  // ===================================================

  useEffect(() => {
    const savedUser =
      localStorage.getItem("safeSeatUser") ||
      localStorage.getItem("user");

    if (!savedUser) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
    } catch (err) {
      console.error("User parsing error:", err);
      navigate("/login");
    }
  }, [navigate]);

  // ===================================================
  // LOAD DASHBOARD DATA
  // ===================================================

  const loadDashboardData = useCallback(
    async (parentId) => {
      if (!parentId) return;

      try {
        setError("");

        // STUDENTS
        const studentResponse = await fetch(
          `${API}/api/students`
        );

        if (!studentResponse.ok) {
          throw new Error("Failed to load students");
        }

        const students = await studentResponse.json();

        const myStudent = students.find(
          (item) =>
            Number(item.parentId) === Number(parentId)
        );

        if (!myStudent) {
          setError(
            "No student is assigned to this parent."
          );
          setLoading(false);
          return;
        }

        setStudent(myStudent);

        // BUS
        const busResponse = await fetch(
          `${API}/api/buses`
        );

        if (busResponse.ok) {
          const buses = await busResponse.json();

          const myBus = buses.find(
            (item) =>
              Number(item.id) ===
              Number(myStudent.busId)
          );

          if (myBus) {
            setBus(myBus);
          }
        }

        // JOURNEY
        const journeyResponse = await fetch(
          `${API}/api/journeys`
        );

        if (journeyResponse.ok) {
          const journeys =
            await journeyResponse.json();

          if (Array.isArray(journeys)) {
            const busJourneys = journeys
              .filter(
                (item) =>
                  Number(item.busId) ===
                  Number(myStudent.busId)
              )
              .sort(
                (a, b) =>
                  Number(b.id || 0) -
                  Number(a.id || 0)
              );

            if (busJourneys.length > 0) {
              setJourney(busJourneys[0]);
            } else {
              setJourney(null);
            }
          }
        }

        // SAFETY
        const safetyResponse = await fetch(
          `${API}/api/safety`
        );

        if (safetyResponse.ok) {
          const safetyData =
            await safetyResponse.json();

          if (Array.isArray(safetyData)) {
            const studentSafety = safetyData
              .filter(
                (item) =>
                  Number(item.studentId) ===
                  Number(myStudent.id)
              )
              .sort(
                (a, b) =>
                  Number(b.id || 0) -
                  Number(a.id || 0)
              );

            if (studentSafety.length > 0) {
              const latestSafety =
                studentSafety[0];

              setSafety(latestSafety);
              setChildPresent(
                latestSafety.childPresent
              );
              setDoorOpen(
                latestSafety.doorOpen
              );
            }
          }
        }

        // GPS
        const gpsResponse = await fetch(
          `${API}/api/emergency-location`
        );

        if (gpsResponse.ok) {
          const gpsData =
            await gpsResponse.json();

          if (Array.isArray(gpsData)) {
            const myGpsData = gpsData
              .filter(
                (item) =>
                  Number(item.busId) ===
                  Number(myStudent.busId)
              )
              .filter(
                (item) =>
                  item.latitude !== null &&
                  item.longitude !== null
              )
              .sort(
                (a, b) =>
                  Number(a.id || 0) -
                  Number(b.id || 0)
              );

            if (myGpsData.length > 0) {
              setGps(
                myGpsData[
                  myGpsData.length - 1
                ]
              );

              setGpsHistory(
                myGpsData.slice(-50)
              );
            } else {
              setGps(null);
              setGpsHistory([]);
            }
          }
        }

        // ALERTS
const alertResponse = await fetch(
  `${API}/api/alerts`
);

if (alertResponse.ok) {
  const alertData = await alertResponse.json();

  if (Array.isArray(alertData)) {

    const myAlerts = alertData
      .filter(
        (item) =>
          Number(item.busId) ===
          Number(myStudent.busId)
      )
      .sort(
        (a, b) =>
          Number(b.id || 0) -
          Number(a.id || 0)
      );

    // Give EMERGENCY alert highest priority
    const emergency = myAlerts.find(
      (item) =>
        String(item.alertType || "")
          .trim()
          .toUpperCase() === "EMERGENCY" &&
        String(item.status || "")
          .trim()
          .toUpperCase() !== "RESOLVED"
    );

    if (emergency) {
      setLatestAlert(emergency);
    } else if (myAlerts.length > 0) {
      setLatestAlert(myAlerts[0]);
    } else {
      setLatestAlert(null);
    }
  }
}

        setLastUpdated(
          new Date().toLocaleTimeString()
        );
      } catch (err) {
        console.error(
          "Dashboard loading error:",
          err
        );

        setError(
          "Unable to connect with SafeSeat AI backend."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ===================================================
  // AUTO REFRESH
  // ===================================================

  useEffect(() => {
    if (!user?.id) return;

    loadDashboardData(user.id);

    const refreshTimer = setInterval(() => {
      loadDashboardData(user.id);
    }, 5000);

    return () => {
      clearInterval(refreshTimer);
    };
  }, [user, loadDashboardData]);

  // ===================================================
  // JOURNEY STATUS
  // ===================================================

  const journeyStatus =
    journey?.status?.toUpperCase() ||
    "NOT STARTED";

  const isJourneyCompleted =
    journeyStatus === "COMPLETED";

  const isJourneyActive =
    journeyStatus === "ACTIVE";

  // ===================================================
  // CHILD LEFT BEHIND
  // ===================================================

  const leftBehind =
    isJourneyCompleted &&
    childPresent;

  // ===================================================
  // DOOR
  // ===================================================

  const toggleDoor = async () => {
    if (!student) return;

    const newDoorStatus = !doorOpen;

    setDoorOpen(newDoorStatus);

    try {
      const response = await fetch(
        `${API}/api/alerts`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            busId: student.busId,
            studentId: student.id,

            alertType: newDoorStatus
              ? "DOOR_OPEN"
              : "DOOR_CLOSED",

            message: newDoorStatus
              ? "Bus door opened"
              : "Bus door closed",

            status: "ACTIVE",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Door update failed"
        );
      }

      setAlert(
        newDoorStatus
          ? "🟠 Bus door opened."
          : "🟢 Bus door closed."
      );
    } catch (err) {
      console.error(err);

      setDoorOpen(!newDoorStatus);

      setAlert(
        "❌ Failed to update door status."
      );
    }
  };

  // ===================================================
  // TEST CHILD SENSOR
  // ===================================================

  const toggleChildPresence = () => {
    const newStatus = !childPresent;

    setChildPresent(newStatus);

    setAlert(
      newStatus
        ? "🟢 Child detected inside bus."
        : "🔴 Child not detected."
    );
  };

  // ===================================================
  // SAFETY CHECK
  // ===================================================

  const checkSafety = async () => {
    if (!student || !bus) {
      setAlert(
        "❌ Student or bus information not available."
      );
      return;
    }

    try {
      setActionLoading(true);

      const response = await fetch(
        `${API}/api/safety/check`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            studentId: student.id,
            busId: bus.id,
            childPresent: childPresent,
            doorOpen: doorOpen,
            routeCompleted:
              journeyStatus === "COMPLETED",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Safety check failed"
        );
      }

      const result =
        await response.json();

      setSafety(result);

      setChildPresent(
        result.childPresent
      );

      setDoorOpen(
        result.doorOpen
      );

      if (
        journeyStatus === "COMPLETED" &&
        result.childPresent
      ) {
        setAlert(
          "🚨 CHILD LEFT BEHIND DETECTED!"
        );
      } else if (result.alertSent) {
        setAlert(
          "⚠️ Safety alert generated."
        );
      } else {
        setAlert(
          "🟢 Child is safe."
        );
      }

      await loadDashboardData(
        user?.id
      );
    } catch (err) {
      console.error(err);

      setAlert(
        "❌ Safety check failed."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ===================================================
  // EMERGENCY ALERT
  // ===================================================

  const emergencyAlert = async () => {
    if (!student || !bus) {
      setAlert(
        "❌ Student or bus information not available."
      );
      return;
    }

    try {
      setActionLoading(true);

      const response = await fetch(
        `${API}/api/alerts`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            busId: bus.id,
            studentId: student.id,
            alertType: "EMERGENCY",
            message:
              "Emergency alert sent by parent.",
            status: "ACTIVE",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Emergency alert failed"
        );
      }

      setAlert(
        "🚨 Emergency Alert Sent Successfully!"
      );

      await loadDashboardData(
        user?.id
      );
    } catch (err) {
      console.error(err);

      setAlert(
        "❌ Failed to send emergency alert."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ===================================================
  // VIEW LOCATION
  // ===================================================

  const viewLocation = () => {
    if (!gps) {
      setAlert(
        "📍 GPS location is currently unavailable."
      );
      return;
    }

    setShowMap(true);
  };

  // ===================================================
  // NAVIGATION
  // ===================================================

  const scrollToSection = (id) => {
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  // ===================================================
  // LOGOUT
  // ===================================================

  const logout = () => {
    localStorage.removeItem(
      "safeSeatUser"
    );

    localStorage.removeItem(
      "user"
    );

    localStorage.removeItem(
      "role"
    );

    navigate("/login");
  };

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <div className="parent-dashboard loading-page">
        <div className="loading-card">
          <div className="loading-logo">
            🛡️
          </div>

          <h2>SafeSeat AI</h2>

          <p>
            Connecting to your child's
            safety system...
          </p>

          <div className="loading-bar">
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  // ===================================================
  // MAIN SAFETY STATUS
  // ===================================================

  let safetyTitle = "🟢 Child Safe";
  let safetyClass = "safe";

  let safetyMessage =
    "Your child is safe and being monitored.";

  if (
    String(latestAlert?.alertType || "").toUpperCase() === "EMERGENCY"
  ) {
    safetyTitle =
      "🚨 Emergency Alert";

    safetyClass = "danger";

    safetyMessage =
      "Emergency assistance has been requested for the bus.";
  } else if (leftBehind) {
    safetyTitle =
      "🔴 Child Left Behind";

    safetyClass = "danger";

    safetyMessage =
      "Your child is still detected inside the bus after route completion.";
  } else if (
    isJourneyActive &&
    childPresent
  ) {
    safetyTitle =
      "🟢 Child Safe";

    safetyClass = "safe";

    safetyMessage =
      "Your child is detected inside the bus during the active journey.";
  } else if (
    isJourneyActive &&
    !childPresent
  ) {
    safetyTitle =
      "⚠️ Child Not Detected";

    safetyClass = "warning";

    safetyMessage =
      "Child presence is currently not detected.";
  } else if (
    isJourneyCompleted &&
    !childPresent
  ) {
    safetyTitle =
      "🟢 Journey Safe";

    safetyClass = "safe";

    safetyMessage =
      "Journey completed successfully. Child is not detected inside the bus.";
  }

  // ===================================================
  // RETURN
  // ===================================================

  return (
    <div className="parent-dashboard">

      {/* PROFESSIONAL NAVBAR */}

      <nav className="parent-navbar">

        <div className="navbar-brand">
          <div className="brand-icon">
            🛡️
          </div>

          <div className="brand-text">
            <strong>SafeSeat AI</strong>

            <small>
              Smart School Bus Safety
            </small>
          </div>
        </div>

        <div className="navbar-links">

          <button
            type="button"
            onClick={() =>
              scrollToSection(
                "dashboard-top"
              )
            }
          >
            🏠 Dashboard
          </button>

          <button
            type="button"
            onClick={() =>
              scrollToSection(
                "child-safety"
              )
            }
          >
            🛡️ Child Safety
          </button>

          <button
            type="button"
            onClick={() =>
              scrollToSection(
                "live-tracking"
              )
            }
          >
            📍 Live Tracking
          </button>

          <button
            type="button"
            onClick={() =>
              scrollToSection(
                "safety-alerts"
              )
            }
          >
            🚨 Alerts
          </button>

        </div>

        <div className="navbar-profile">

          <div className="profile-info">
            <span>Parent</span>

            <strong>
              {user?.name ||
                "Parent"}
            </strong>
          </div>

          <div className="profile-icon">
            👤
          </div>

          <button
            type="button"
            onClick={logout}
            className="logout-btn"
          >
            Logout
          </button>

        </div>

      </nav>

      {/* MAIN */}

      <main
        className="parent-container"
        id="dashboard-top"
      >

        {/* WELCOME */}

        <section className="welcome-section">

          <div>

            <span className="welcome-label">
              PARENT DASHBOARD
            </span>

            <h1>
              Welcome,{" "}
              {user?.name ||
                "Parent"}
            </h1>

            <p>
              Monitor your child's
              school bus journey in
              real time.
            </p>

          </div>

          <div className="welcome-right">

            <div className="live-indicator">
              <span></span>
              LIVE MONITORING
            </div>

            {lastUpdated && (
              <small className="last-updated">
                Updated {lastUpdated}
              </small>
            )}

          </div>

        </section>

        {/* ERROR */}

        {error && (
          <div className="error-card">

            <span>⚠️</span>

            <div>

              <strong>
                Connection Notice
              </strong>

              <p>
                {error}
              </p>

            </div>

          </div>
        )}

        {/* MAIN SAFETY CARD */}

        <section
          className={`main-safety-card ${safetyClass}`}
        >

          <div className="safety-content">

            <span className="safety-label">
              CURRENT SAFETY STATUS
            </span>

            <h2>
              {safetyTitle}
            </h2>

            <p>
              {safetyMessage}
            </p>

          </div>

          <div className="safety-icon">

            {latestAlert?.alertType ===
            "EMERGENCY"
              ? "🚨"
              : leftBehind
              ? "🚨"
              : safetyClass ===
                "warning"
              ? "⚠️"
              : "🛡️"}

          </div>

        </section>

        {/* QUICK STATUS */}

        <section className="quick-status-grid">

          <div className="quick-card">

            <div className="quick-icon child">
              👦
            </div>

            <div>
              <span>CHILD</span>

              <strong>
                {childPresent
                  ? "Detected"
                  : "Not Detected"}
              </strong>
            </div>

            <i
              className={
                childPresent
                  ? "dot green"
                  : "dot red"
              }
            ></i>

          </div>

          <div className="quick-card">

            <div className="quick-icon journey">
              🚌
            </div>

            <div>
              <span>JOURNEY</span>

              <strong>
                {journeyStatus}
              </strong>
            </div>

            <i
              className={
                isJourneyActive
                  ? "dot green"
                  : "dot gray"
              }
            ></i>

          </div>

          <div className="quick-card">

            <div className="quick-icon door">
              🚪
            </div>

            <div>
              <span>BUS DOOR</span>

              <strong>
                {doorOpen
                  ? "OPEN"
                  : "CLOSED"}
              </strong>
            </div>

            <i
              className={
                doorOpen
                  ? "dot orange"
                  : "dot green"
              }
            ></i>

          </div>

          <div className="quick-card">

            <div className="quick-icon gps">
              📍
            </div>

            <div>
              <span>GPS</span>

              <strong>
                {gps
                  ? "ACTIVE"
                  : "OFFLINE"}
              </strong>
            </div>

            <i
              className={
                gps
                  ? "dot green"
                  : "dot gray"
              }
            ></i>

          </div>

        </section>

        {/* DASHBOARD GRID */}

        <div className="dashboard-grid">

          {/* CHILD INFORMATION */}

          <section className="dashboard-card">

            <div className="card-header">

              <div className="card-title">

                <div className="title-icon blue">
                  👦
                </div>

                <div>

                  <h2>
                    Child Information
                  </h2>

                  <p>
                    Registered student
                    details
                  </p>

                </div>

              </div>

            </div>

            {student ? (

              <div className="child-info">

                <div className="info-row">
                  <span>Name</span>

                  <strong>
                    {student.studentName}
                  </strong>
                </div>

                <div className="info-row">
                  <span>Class</span>

                  <strong>
                    {student.className}
                  </strong>
                </div>

                <div className="info-row">
                  <span>Student ID</span>

                  <strong>
                    {student.rollNo}
                  </strong>
                </div>

                <div className="info-row">
                  <span>Bus ID</span>

                  <strong>
                    {student.busId}
                  </strong>
                </div>

                <div className="status-badge safe">
                  <span>●</span>
                  Registered Student
                </div>

              </div>

            ) : (

              <div className="empty-state">
                Student information
                unavailable.
              </div>

            )}

          </section>

          {/* CHILD PRESENCE */}

          <section
            className="dashboard-card"
            id="child-safety"
          >

            <div className="card-header">

              <div className="card-title">

                <div className="title-icon purple">
                  👁️
                </div>

                <div>

                  <h2>
                    Child Presence
                  </h2>

                  <p>
                    Real-time detection
                  </p>

                </div>

              </div>

            </div>

            <div
              className={
                leftBehind
                  ? "presence-status warning"
                  : childPresent
                  ? "presence-status safe"
                  : "presence-status warning"
              }
            >

              <div className="presence-circle">

                {leftBehind
                  ? "🚨"
                  : childPresent
                  ? "🟢"
                  : "🔴"}

              </div>

              <div>

                <strong>

                  {leftBehind
                    ? "Child Left Behind"
                    : childPresent
                    ? "Child Detected"
                    : "Child Not Detected"}

                </strong>

                <p>

                  {leftBehind
                    ? "Child still detected after route completion."
                    : childPresent
                    ? "Child presence detected inside the bus."
                    : "Child presence is currently not detected."}

                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={
                toggleChildPresence
              }
              className="secondary-btn full-btn"
            >
              🧪 Test Child Sensor
            </button>

          </section>

          {/* BUS STATUS */}

          <section className="dashboard-card">

            <div className="card-header">

              <div className="card-title">

                <div className="title-icon orange">
                  🚌
                </div>

                <div>

                  <h2>
                    Bus Status
                  </h2>

                  <p>
                    Current journey
                    information
                  </p>

                </div>

              </div>

            </div>

            <div className="bus-status-title">

              {latestAlert?.alertType ===
              "EMERGENCY"
                ? "🚨 Emergency Alert"
                : leftBehind
                ? "🔴 Bus Safety Warning"
                : isJourneyActive
                ? "🟢 Bus Journey Active"
                : "🟢 Bus Safe"}

            </div>

            <div className="info-row">
              <span>Bus Number</span>

              <strong>
                {bus?.busNumber ||
                  "MH12AB1001"}
              </strong>
            </div>

            <div className="info-row">
              <span>Driver</span>

              <strong>
                {bus?.driverName ||
                  "Not Available"}
              </strong>
            </div>

            <div className="info-row">
              <span>Route</span>

              <strong>
                {bus?.route ||
                  "Route A"}
              </strong>
            </div>

            <div className="info-row">
              <span>Journey</span>

              <strong>

                <span
                  className={
                    isJourneyActive
                      ? "journey-badge active"
                      : "journey-badge"
                  }
                >
                  {journeyStatus}
                </span>

              </strong>
            </div>

          </section>

          {/* DOOR */}

          <section className="dashboard-card">

            <div className="card-header">

              <div className="card-title">

                <div className="title-icon gray">
                  🚪
                </div>

                <div>

                  <h2>
                    Bus Door Status
                  </h2>

                  <p>
                    Door monitoring
                  </p>

                </div>

              </div>

            </div>

            <div
              className={
                doorOpen
                  ? "door-status warning"
                  : "door-status safe"
              }
            >

              <div className="door-icon">

                {doorOpen
                  ? "🔴"
                  : "🟢"}

              </div>

              <div>

                <span>
                  CURRENT STATUS
                </span>

                <strong>
                  {doorOpen
                    ? "Door is OPEN"
                    : "Door is CLOSED"}
                </strong>

              </div>

            </div>

            <button
              type="button"
              onClick={toggleDoor}
              className="secondary-btn full-btn"
            >
              {doorOpen
                ? "🔒 Close Door"
                : "🚪 Open Door"}
            </button>

          </section>

          {/* GPS */}

          <section
            className="dashboard-card gps-card"
            id="live-tracking"
          >

            <div className="card-header">

              <div className="card-title">

                <div className="title-icon green">
                  📍
                </div>

                <div>

                  <h2>
                    Live Bus Tracking
                  </h2>

                  <p>
                    Real-time GPS location
                  </p>

                </div>

              </div>

              {gps && (
                <span className="live-mini">
                  <i></i>
                  LIVE
                </span>
              )}

            </div>

            {gps ? (

              <>
                <div className="gps-status">
                  <span className="gps-pulse">
                    ●
                  </span>

                  GPS Location Available
                </div>

                <div className="gps-bus-details">

                  <div>
                    🚌
                    <strong>
                      {bus?.busNumber ||
                        "MH12AB1001"}
                    </strong>
                  </div>

                  <div>
                    👨‍✈️
                    <span>
                      {bus?.driverName ||
                        "Driver"}
                    </span>
                  </div>

                  <div>
                    🛣️
                    <span>
                      {bus?.route ||
                        "Route A"}
                    </span>
                  </div>

                </div>

                <div className="gps-coordinates">

                  <div>
                    <span>
                      LATITUDE
                    </span>

                    <strong>
                      {Number(
                        gps.latitude
                      ).toFixed(6)}
                    </strong>
                  </div>

                  <div>
                    <span>
                      LONGITUDE
                    </span>

                    <strong>
                      {Number(
                        gps.longitude
                      ).toFixed(6)}
                    </strong>
                  </div>

                </div>

                <div className="gps-time">
                  🕒 Last updated:
                  <strong>
                    {" "}
                    {gps.timestamp ||
                      "Recently"}
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={
                    viewLocation
                  }
                  className="primary-btn full-btn"
                >
                  📍 View Live Location
                </button>

              </>

            ) : (

              <>
                <div className="gps-status unavailable">
                  🟡 GPS Location
                  Unavailable
                </div>

                <p className="gps-message">
                  Waiting for the bus
                  GPS tracker to send
                  location.
                </p>

                <button
                  type="button"
                  disabled
                  className="primary-btn disabled full-btn"
                >
                  📍 Location Unavailable
                </button>
              </>

            )}

          </section>

          {/* SAFETY CONTROLS */}

          <section className="dashboard-card">

            <div className="card-header">

              <div className="card-title">

                <div className="title-icon red">
                  🛡️
                </div>

                <div>

                  <h2>
                    Safety Controls
                  </h2>

                  <p>
                    Emergency & safety
                    actions
                  </p>

                </div>

              </div>

            </div>

            <div className="control-box">

              <button
                type="button"
                onClick={checkSafety}
                disabled={actionLoading}
                className="primary-btn full-btn"
              >
                {actionLoading
                  ? "⏳ Processing..."
                  : "🛡️ Safety Check"}
              </button>

              <button
                type="button"
                onClick={emergencyAlert}
                disabled={actionLoading}
                className="emergency-btn full-btn"
              >
                🚨 Emergency Alert
              </button>

            </div>

            <div className="safety-note">

              <span>🔐</span>

              Use Emergency Alert
              only when immediate
              assistance is required.

            </div>

          </section>

        </div>

        {/* ALERT MESSAGE */}

        {alert && (

          <div
            className={
              leftBehind ||
              latestAlert?.alertType ===
                "EMERGENCY"
                ? "alert-box danger"
                : "alert-box"
            }
          >

            <span className="alert-box-icon">

              {leftBehind ||
              latestAlert?.alertType ===
                "EMERGENCY"
                ? "🚨"
                : "ℹ️"}

            </span>

            <div>

              <strong>
                System Notification
              </strong>

              <p>
                {alert}
              </p>

            </div>

          </div>

        )}

        {/* SAFETY ALERTS */}

        <section
          className="safety-alert-section"
          id="safety-alerts"
        >

          <div className="section-heading">

            <div>

              <span>
                MONITORING
              </span>

              <h2>
                🚨 Safety Alerts
              </h2>

            </div>

            <div className="monitoring-status">
              <i></i>
              Monitoring Active
            </div>

          </div>

          {latestAlert &&
          latestAlert.alertType ===
            "EMERGENCY" ? (

            <div className="alert-item danger">

              <div className="alert-icon">
                🚨
              </div>

              <div className="alert-content">

                <div className="alert-title-row">

                  <strong>
                    Emergency Alert
                  </strong>

                  <span>
                    URGENT
                  </span>

                </div>

                <p>
                  Emergency assistance
                  has been requested for
                  the bus.
                </p>

                <div className="alert-meta">

                  <span>
                    🚌 Bus:{" "}
                    {bus?.busNumber ||
                      "MH12AB1001"}
                  </span>

                  <span>
                    📱 Parent Notification
                  </span>

                  <span>
                    👩‍🏫 Teacher Notification
                  </span>

                </div>

                <small>
                  {latestAlert.message}
                </small>

              </div>

            </div>

          ) : leftBehind ? (

            <div className="alert-item danger">

              <div className="alert-icon">
                🚨
              </div>

              <div className="alert-content">

                <strong>
                  Child Left Behind
                </strong>

                <p>
                  Child left behind
                  detection has been
                  triggered.
                </p>

              </div>

            </div>

          ) : safety?.alertSent &&
            isJourneyCompleted ? (

            <div className="alert-item warning">

              <div className="alert-icon">
                ⚠️
              </div>

              <div className="alert-content">

                <strong>
                  Safety Alert
                </strong>

                <p>
                  Safety monitoring has
                  detected an alert.
                </p>

              </div>

            </div>

          ) : (

            <div className="alert-item safe">

              <div className="alert-icon">
                🟢
              </div>

              <div className="alert-content">

                <strong>
                  All Clear
                </strong>

                <p>
                  {isJourneyActive
                    ? "Journey is active. Child is being monitored."
                    : "No active safety problem detected."}
                </p>

              </div>

            </div>

          )}

        </section>

      </main>

      {/* LIVE MAP MODAL */}

      {showMap && gps && (

        <div
          className="map-overlay"
          onClick={() =>
            setShowMap(false)
          }
        >

          <div
            className="map-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="map-header">

              <div>

                <span className="map-label">
                  LIVE TRACKING
                </span>

                <h2>
                  📍 Live Bus Location
                </h2>

                <p>
                  🚌{" "}
                  {bus?.busNumber ||
                    "MH12AB1001"}

                  {" • "}

                  👨‍✈️{" "}
                  {bus?.driverName ||
                    "Driver"}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowMap(false)
                }
                className="map-close-btn"
              >
                ✕
              </button>

            </div>

            <div className="map-info">

              <div>

                <span>
                  LATITUDE
                </span>

                <strong>
                  {Number(
                    gps.latitude
                  ).toFixed(6)}
                </strong>

              </div>

              <div>

                <span>
                  LONGITUDE
                </span>

                <strong>
                  {Number(
                    gps.longitude
                  ).toFixed(6)}
                </strong>

              </div>

              <div>

                <span>
                  LAST UPDATED
                </span>

                <strong>
                  {gps.timestamp ||
                    "Recently"}
                </strong>

              </div>

            </div>

            <MapContainer
              center={[
                Number(
                  gps.latitude
                ),
                Number(
                  gps.longitude
                ),
              ]}
              zoom={16}
              scrollWheelZoom={true}
              className="live-map"
            >

              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapUpdater
                latitude={Number(
                  gps.latitude
                )}
                longitude={Number(
                  gps.longitude
                )}
              />

              {gpsHistory.length > 1 && (

                <Polyline
                  positions={gpsHistory.map(
                    (location) => [
                      Number(
                        location.latitude
                      ),
                      Number(
                        location.longitude
                      ),
                    ]
                  )}
                />

              )}

              <Marker
                position={[
                  Number(
                    gps.latitude
                  ),
                  Number(
                    gps.longitude
                  ),
                ]}
                icon={busIcon}
              >

                <Popup>

                  <div className="map-popup">

                    <strong>
                      🚌 SafeSeat AI Bus
                    </strong>

                    <br />

                    Bus:{" "}
                    {bus?.busNumber ||
                      "MH12AB1001"}

                    <br />

                    Driver:{" "}
                    {bus?.driverName ||
                      "Driver"}

                    <br />

                    Route:{" "}
                    {bus?.route ||
                      "Route A"}

                    <br />

                    📍{" "}
                    {Number(
                      gps.latitude
                    ).toFixed(6)}
                    ,{" "}
                    {Number(
                      gps.longitude
                    ).toFixed(6)}

                    <br />

                    🕒{" "}
                    {gps.timestamp ||
                      "Recently"}

                  </div>

                </Popup>

              </Marker>

            </MapContainer>

            <div className="map-footer">

              <span>
                🟢 GPS Tracking Active
              </span>

              <span>
                🔄 Updates every 5 seconds
              </span>

            </div>

          </div>

        </div>

      )}

      {/* FOOTER */}

      <footer className="parent-footer">

        <div className="footer-brand">
          🛡️ SafeSeat AI
        </div>

        <p>
          Intelligent School Bus
          Safety System
        </p>

        <span>
          Every Child. Every Journey.
          Always Safe.
        </span>

      </footer>

    </div>
  );
}

export default ParentDashboard;