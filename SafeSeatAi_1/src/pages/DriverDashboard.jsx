import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import { QRCodeCanvas } from "qrcode.react";
import "./DriverDashboard.css";

function DriverDashboard() {
  const navigate = useNavigate();

  // =========================================================
  // API CONFIGURATION
  // =========================================================

  const API = "http://localhost:9091";
  const BUS_ID = 1;
  const BUS_NUMBER = "MH12AB1001";

  // =========================================================
  // USER
  // =========================================================

  const user = JSON.parse(
    localStorage.getItem("user") ||
      localStorage.getItem("safeSeatUser") ||
      "{}"
  );

  // =========================================================
  // DRIVER INFORMATION
  // =========================================================

  const [driver] = useState({
    driverName: user?.name || "Nilam Yogesh Bhame",
    email: user?.email || "nilam@gmail.com",
    busNumber: BUS_NUMBER,
    capacity: 40,
    route: "School Route A",
  });

  // =========================================================
  // STUDENTS
  // =========================================================

  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);

  // =========================================================
  // JOURNEY / SAFETY
  // =========================================================

  const [doorOpen, setDoorOpen] = useState(false);
  const [routeStarted, setRouteStarted] = useState(false);
  const [childPresent, setChildPresent] = useState(true);
  const [leftBehind, setLeftBehind] = useState(false);
  const [alert, setAlert] = useState(false);

  const [journeyId, setJourneyId] = useState(null);
  const [journeyLoading, setJourneyLoading] = useState(false);

  // =========================================================
  // GPS
  // =========================================================

  const [gpsLocation, setGpsLocation] = useState(null);
  const [gpsTracking, setGpsTracking] = useState(false);
  const [gpsError, setGpsError] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);

  // =========================================================
  // QR
  // =========================================================

  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannedStudent, setScannedStudent] = useState(null);
  const [scanMessage, setScanMessage] = useState("");
  const [attendance, setAttendance] = useState({});
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const scannerRef = useRef(null);
  const scanProcessingRef = useRef(false);
  const attendanceLoadingRef = useRef(false);

  // Keep ref synchronized
  useEffect(() => {
    attendanceLoadingRef.current = attendanceLoading;
  }, [attendanceLoading]);

  // =========================================================
  // LOAD STUDENTS - ONLY ONCE
  // =========================================================

  const loadStudents = async () => {
    try {
      setStudentsLoading(true);

      const response = await fetch(`${API}/api/students`);

      if (!response.ok) {
        throw new Error("Failed to load students");
      }

      const data = await response.json();

      console.log("📚 ALL STUDENTS:", data);

      const activeStudents = data.filter((student) => {
        const busId = Number(student.busId);

        const status = String(
          student.busStatus || "ACTIVE"
        ).toUpperCase();

        return busId === BUS_ID && status === "ACTIVE";
      });

      console.log(
        `🚌 ACTIVE STUDENTS FOR BUS ${BUS_ID}:`,
        activeStudents
      );

      setStudents(activeStudents);
    } catch (error) {
      console.error("❌ Student loading error:", error);
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // =========================================================
  // LOAD ATTENDANCE - ONLY ONCE
  // =========================================================

  const loadAttendance = async () => {
    try {
      const response = await fetch(
        `${API}/api/attendance/bus/${BUS_ID}`
      );

      if (!response.ok) {
        throw new Error("Failed to load attendance");
      }

      const data = await response.json();

      console.log("📊 Attendance from MySQL:", data);

      const attendanceMap = {};

      data.forEach((record) => {
        if (
          String(record.status || "").toUpperCase() ===
          "BOARDED"
        ) {
          attendanceMap[record.studentId] = {
            id: record.id,
            studentId: record.studentId,
            studentName: record.studentName,
            rollNo: record.rollNo,
            busId: record.busId,
            busNumber: record.busNumber,
            status: record.status,
            time: record.attendanceTime,
          };
        }
      });

      setAttendance(attendanceMap);
    } catch (error) {
      console.error("❌ Attendance loading error:", error);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  // =========================================================
  // QR SCANNER
  // =========================================================

  useEffect(() => {
    if (!scannerOpen) {
      return;
    }

    scanProcessingRef.current = false;

    const startScanner = async () => {
      try {
        const scanner = new Html5QrcodeScanner(
          "qr-reader",
          {
            fps: 10,
            qrbox: {
              width: 250,
              height: 250,
            },
            rememberLastUsedCamera: true,
            showTorchButtonIfSupported: true,
          },
          false
        );

        scannerRef.current = scanner;

        const handleScanSuccess = (decodedText) => {
          if (
            scanProcessingRef.current ||
            attendanceLoadingRef.current
          ) {
            return;
          }

          scanProcessingRef.current = true;

          processQRCode(decodedText);
        };

        const handleScanError = (errorMessage) => {
          console.log("QR scanner:", errorMessage);
        };

        scanner.render(
          handleScanSuccess,
          handleScanError
        );
      } catch (error) {
        console.error("❌ QR Scanner Error:", error);

        setScanMessage(
          "❌ Camera could not be started.\n\n" +
            "Please allow camera permission in your browser."
        );

        scanProcessingRef.current = false;
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .clear()
          .catch((error) => {
            console.log("Scanner cleanup:", error);
          });

        scannerRef.current = null;
      }
    };
  }, [scannerOpen]);

  // =========================================================
  // PROCESS QR CODE
  // =========================================================

  const processQRCode = async (decodedText) => {
    if (attendanceLoadingRef.current) {
      scanProcessingRef.current = false;
      return;
    }

    const qrValue = String(decodedText || "")
      .trim()
      .toUpperCase();

    console.log("📱 QR SCANNED:", qrValue);

    if (!qrValue) {
      scanProcessingRef.current = false;
      return;
    }

    // FIND STUDENT
    const student = students.find(
      (item) =>
        String(item.rollNo || "")
          .trim()
          .toUpperCase() === qrValue ||
        String(item.id || "").trim() === qrValue
    );

    // INVALID QR
    if (!student) {
      setScannedStudent(null);

      setScanMessage(
        "❌ Invalid QR Code\n\n" +
          "Student not found for this bus."
      );

      window.alert(
        "❌ INVALID STUDENT QR\n\n" +
          `QR Value: ${qrValue}\n\n` +
          `This student is not registered for Bus ${driver.busNumber}.`
      );

      scanProcessingRef.current = false;
      return;
    }

    // DUPLICATE SCAN
    if (attendance[student.id]) {
      setScannedStudent(student);

      setScanMessage(
        `⚠️ ${student.studentName} is already marked as boarded.`
      );

      window.alert(
        "⚠️ ALREADY SCANNED\n\n" +
          `Student: ${student.studentName}\n` +
          `Student ID: ${student.rollNo}\n\n` +
          "Boarding attendance is already recorded."
      );

      scanProcessingRef.current = false;
      return;
    }

    // TIME
    const now = new Date();

    const time = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // ATTENDANCE DATA
    const attendanceData = {
      studentId: student.id,
      studentName: student.studentName,
      rollNo: student.rollNo,
      busId: BUS_ID,
      busNumber: driver.busNumber,
      status: "BOARDED",
      attendanceTime: time,
    };

    try {
      setAttendanceLoading(true);
      attendanceLoadingRef.current = true;

      console.log(
        "📤 SENDING ATTENDANCE:",
        attendanceData
      );

      const response = await fetch(
        `${API}/api/attendance`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(attendanceData),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

      const savedAttendance =
        await response.json();

      console.log(
        "✅ ATTENDANCE SAVED TO MYSQL:",
        savedAttendance
      );

      const attendanceRecord = {
        id: savedAttendance.id,
        studentId: student.id,
        studentName: student.studentName,
        rollNo: student.rollNo,
        busId: BUS_ID,
        busNumber: driver.busNumber,
        status: "BOARDED",
        time:
          savedAttendance.attendanceTime ||
          time,
      };

      setAttendance((previous) => ({
        ...previous,
        [student.id]: attendanceRecord,
      }));

      setScannedStudent(student);

      setScanMessage(
        `✅ Boarding Confirmed\n` +
          `${student.studentName}\n` +
          `Student ID: ${student.rollNo}\n` +
          `Time: ${attendanceRecord.time}\n\n` +
          `💾 Attendance saved to MySQL`
      );

      window.alert(
        "✅ BOARDING CONFIRMED!\n\n" +
          `Student: ${student.studentName}\n` +
          `Student ID: ${student.rollNo}\n` +
          `Bus: ${driver.busNumber}\n` +
          `Time: ${attendanceRecord.time}\n\n` +
          "💾 Attendance saved to MySQL."
      );

      setTimeout(() => {
        setScannerOpen(false);
        scanProcessingRef.current = false;
      }, 500);
    } catch (error) {
      console.error(
        "❌ ATTENDANCE DATABASE ERROR:",
        error
      );

      setScannedStudent(null);

      setScanMessage(
        "❌ Attendance could not be saved.\n\n" +
          "Please check Spring Boot backend."
      );

      window.alert(
        "❌ ATTENDANCE SAVE FAILED!\n\n" +
          "QR was detected, but attendance could not be saved to MySQL.\n\n" +
          "Make sure Spring Boot is running on port 9091."
      );

      scanProcessingRef.current = false;
    } finally {
      setAttendanceLoading(false);
      attendanceLoadingRef.current = false;
    }
  };

  // =========================================================
  // OPEN QR SCANNER
  // =========================================================

  const scanQR = () => {
    if (
      studentsLoading ||
      students.length === 0
    ) {
      window.alert(
        "⚠️ No active students found for this bus."
      );

      return;
    }

    setScannedStudent(null);
    setScanMessage("");
    setScannerOpen(true);
  };

  // =========================================================
  // CLOSE QR SCANNER
  // =========================================================

  const closeQRScanner = () => {
    if (scannerRef.current) {
      scannerRef.current
        .clear()
        .catch((error) => {
          console.log("Scanner close:", error);
        });

      scannerRef.current = null;
    }

    scanProcessingRef.current = false;
    attendanceLoadingRef.current = false;

    setScannerOpen(false);
    setScanMessage("");
  };

  // =========================================================
  // FIRST STUDENT
  // =========================================================

  const getFirstStudentId = () => {
    if (
      !students ||
      students.length === 0
    ) {
      window.alert(
        "⚠️ No active students found for this bus."
      );

      return null;
    }

    return students[0].id;
  };

  // =========================================================
  // GPS TRACKING
  // =========================================================

  const startGPSTracking = () => {
    if (gpsLoading) {
      return;
    }

    if (!navigator.geolocation) {
      setGpsError(
        "GPS is not supported by this browser."
      );

      return;
    }

    setGpsError("");
    setGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const locationData = {
          latitude:
            position.coords.latitude,
          longitude:
            position.coords.longitude,
          accuracy:
            position.coords.accuracy,
        };

        setGpsLocation(locationData);
        setGpsTracking(true);

        console.log(
          "📍 GPS LOCATION:",
          locationData
        );

        try {
          const response = await fetch(
            `${API}/api/emergency-location`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                busId: BUS_ID,
                latitude:
                  locationData.latitude,
                longitude:
                  locationData.longitude,
                accuracy:
                  locationData.accuracy,
                studentId:
                  students.length > 0
                    ? students[0].id
                    : null,
              }),
            }
          );

          if (!response.ok) {
            throw new Error(
              "GPS location save failed"
            );
          }

          const savedLocation =
            await response.json();

          console.log(
            "✅ GPS LOCATION SAVED:",
            savedLocation
          );

          window.alert(
            "📍 GPS Location Saved Successfully!\n\n" +
              "Latitude: " +
              locationData.latitude.toFixed(
                6
              ) +
              "\nLongitude: " +
              locationData.longitude.toFixed(
                6
              )
          );
        } catch (error) {
          console.error(
            "❌ GPS Save Error:",
            error
          );

          setGpsError(
            "GPS received but could not be saved to database."
          );

          setGpsTracking(false);
        } finally {
          setGpsLoading(false);
        }
      },
      (error) => {
        console.error(
          "GPS Error:",
          error
        );

        setGpsTracking(false);
        setGpsLoading(false);

        if (error.code === 1) {
          setGpsError(
            "Location permission denied."
          );
        } else if (error.code === 2) {
          setGpsError(
            "GPS location unavailable."
          );
        } else {
          setGpsError(
            "Unable to get GPS location."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // =========================================================
  // VIEW GPS LOCATION
  // =========================================================

  const viewGPSLocation = () => {
    if (!gpsLocation) {
      window.alert(
        "📍 GPS location is not available yet."
      );

      return;
    }

    const url =
      `https://www.google.com/maps?q=` +
      `${gpsLocation.latitude},${gpsLocation.longitude}`;

    window.open(url, "_blank");
  };

  // =========================================================
  // DOOR TOGGLE
  // =========================================================

  const toggleDoor = async () => {
    const studentId =
      getFirstStudentId();

    if (!studentId) {
      return;
    }

    const newDoorStatus =
      !doorOpen;

    setDoorOpen(newDoorStatus);

    if (newDoorStatus === true) {
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
              studentId,
              busId: BUS_ID,
              alertType:
                "DOOR_OPEN",
              message:
                "Bus door has been opened.",
              status: "ACTIVE",
            }),
          }
        );

        if (!response.ok) {
          throw new Error(
            "Door alert failed"
          );
        }

        const result =
          await response.json();

        console.log(
          "🚪 DOOR ALERT:",
          result
        );

        window.alert(
          "🚪 Door Open Alert!\n\n" +
            "Bus door is OPEN.\n" +
            "Safety alert recorded successfully."
        );
      } catch (error) {
        console.error(
          "Door Alert Error:",
          error
        );

        window.alert(
          "⚠️ Door opened, but alert could not be saved."
        );
      }
    }
  };

  // =========================================================
  // CHILD PRESENCE
  // =========================================================

  const toggleChildPresence = () => {
    const newStatus =
      !childPresent;

    setChildPresent(newStatus);

    if (newStatus) {
      setLeftBehind(false);
    }
  };

  // =========================================================
  // JOURNEY START / COMPLETE
  // =========================================================

  const toggleRoute = async () => {
    if (journeyLoading) {
      return;
    }

    const studentId =
      getFirstStudentId();

    if (!studentId) {
      return;
    }

    setJourneyLoading(true);

    try {
      // =====================================================
      // START JOURNEY
      // =====================================================

      if (!routeStarted) {
        const startTime =
          new Date()
            .toTimeString()
            .slice(0, 5);

        const response =
          await fetch(
            `${API}/api/journeys`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                busId: BUS_ID,
                expectedStartTime:
                  "08:00",
                expectedEndTime:
                  "09:00",
                actualStartTime:
                  startTime,
                actualEndTime: null,
                status: "ACTIVE",
              }),
            }
          );

        if (!response.ok) {
          throw new Error(
            "Journey start failed"
          );
        }

        const journey =
          await response.json();

        console.log(
          "🚌 JOURNEY STARTED:",
          journey
        );

        setJourneyId(journey.id);
        setRouteStarted(true);
        setLeftBehind(false);
        setAlert(false);

        window.alert(
          "🚌 Journey Started Successfully!\n\n" +
            "Bus journey is now ACTIVE."
        );

        return;
      }

      // =====================================================
      // CHECK JOURNEY ID
      // =====================================================

      if (!journeyId) {
        throw new Error(
          "Journey ID not found"
        );
      }

      // =====================================================
      // COMPLETE JOURNEY
      // =====================================================

      const endTime =
        new Date()
          .toTimeString()
          .slice(0, 5);

      const response =
        await fetch(
          `${API}/api/journeys/${journeyId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              busId: BUS_ID,
              expectedStartTime:
                "08:00",
              expectedEndTime:
                "09:00",
              actualStartTime:
                "08:00",
              actualEndTime:
                endTime,
              status: "COMPLETED",
            }),
          }
        );

      if (!response.ok) {
        throw new Error(
          "Journey completion failed"
        );
      }

      const journey =
        await response.json();

      console.log(
        "🏁 JOURNEY COMPLETED:",
        journey
      );

      setRouteStarted(false);
      setJourneyId(null);

      // =====================================================
      // AUTOMATIC SAFETY CHECK
      // =====================================================

      try {
        const safetyResponse =
          await fetch(
            `${API}/api/safety/check`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                studentId:
                  studentId,
                busId: BUS_ID,
                childPresent:
                  childPresent,
                doorOpen:
                  doorOpen,
                routeCompleted:
                  true,
              }),
            }
          );

        if (!safetyResponse.ok) {
          throw new Error(
            "Safety check failed"
          );
        }

        const safetyResult =
          await safetyResponse.json();

        console.log(
          "🛡️ SAFETY RESULT:",
          safetyResult
        );

        // CHILD LEFT BEHIND

        if (
          safetyResult.leftBehind ===
          true
        ) {
          setLeftBehind(true);
          setAlert(true);

          try {
            const alertResponse =
              await fetch(
                `${API}/api/alerts`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type":
                      "application/json",
                  },
                  body: JSON.stringify({
                    studentId:
                      studentId,
                    busId: BUS_ID,
                    alertType:
                      "CHILD_LEFT_BEHIND",
                    message:
                      "Child is still detected inside the bus after journey completion.",
                    status:
                      "ACTIVE",
                  }),
                }
              );

            if (!alertResponse.ok) {
              throw new Error(
                "Child left-behind alert failed"
              );
            }

            console.log(
              "🚨 CHILD LEFT-BEHIND ALERT SAVED"
            );
          } catch (alertError) {
            console.error(
              "Alert Save Error:",
              alertError
            );
          }

          window.alert(
            "🚨 CHILD LEFT BEHIND DETECTED!\n\n" +
              "Journey completed.\n" +
              "Child is still detected inside the bus.\n\n" +
              "🚨 Safety alert saved."
          );
        } else {
          setLeftBehind(false);
          setAlert(false);

          window.alert(
            "🟢 Journey Completed Successfully!\n\n" +
              "No child left behind detected."
          );
        }
      } catch (safetyError) {
        console.error(
          "Safety Check Error:",
          safetyError
        );

        window.alert(
          "⚠️ Journey completed, but automatic safety check failed."
        );
      }
    } catch (error) {
      console.error(
        "Journey Error:",
        error
      );

      window.alert(
        "❌ Journey operation failed.\n\n" +
          "Please check Spring Boot on port 9091."
      );
    } finally {
      setJourneyLoading(false);
    }
  };

  // =========================================================
  // SAFETY BUTTON
  // =========================================================

  const safetyButton = async () => {
    if (journeyLoading) {
      return;
    }

    const studentId =
      getFirstStudentId();

    if (!studentId) {
      return;
    }

    try {
      const response =
        await fetch(
          `${API}/api/alerts`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              studentId:
                studentId,
              busId: BUS_ID,
              alertType:
                "SAFETY_BUTTON",
              message:
                "Safety button pressed by driver for immediate child safety assistance.",
              status:
                "ACTIVE",
            }),
          }
        );

      if (!response.ok) {
        throw new Error(
          "Safety button alert failed"
        );
      }

      const result =
        await response.json();

      console.log(
        "🛡️ SAFETY BUTTON:",
        result
      );

      setAlert(true);

      window.alert(
        "🛡️ SAFETY BUTTON ACTIVATED!\n\n" +
          "Immediate safety alert has been generated.\n" +
          "Alert saved successfully in SafeSeat AI."
      );

      setTimeout(() => {
        setAlert(false);
      }, 5000);
    } catch (error) {
      console.error(
        "Safety Button Error:",
        error
      );

      window.alert(
        "⚠️ Safety Button pressed, but alert could not be saved."
      );
    }
  };

  // =========================================================
  // EMERGENCY SOS
  // =========================================================

  const emergencyAlert = async () => {
    const studentId =
      getFirstStudentId();

    if (!studentId) {
      return;
    }

    setAlert(true);

    try {
      const response =
        await fetch(
          `${API}/api/alerts`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              studentId:
                studentId,
              busId: BUS_ID,
              alertType:
                "EMERGENCY",
              message:
                "Emergency alert sent by driver for child safety.",
              status:
                "ACTIVE",
            }),
          }
        );

      if (!response.ok) {
        throw new Error(
          "Emergency alert failed"
        );
      }

      const result =
        await response.json();

      console.log(
        "🚨 EMERGENCY ALERT:",
        result
      );

      window.alert(
        "🚨 Emergency Alert Sent!\n\n" +
          "Parent and Admin will be notified."
      );
    } catch (error) {
      console.error(
        "Emergency Alert Error:",
        error
      );

      window.alert(
        "⚠️ Emergency alert could not be saved."
      );
    }

    setTimeout(() => {
      setAlert(false);
    }, 5000);
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("safeSeatUser");
    localStorage.removeItem("role");

    navigate("/login");
  };

  // =========================================================
  // BOARDED COUNT
  // =========================================================

  const boardedCount =
    students.filter(
      (student) => attendance[student.id]
    ).length;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="driver-dashboard">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="dashboard-navbar">

        <div className="dashboard-logo">

          <div className="logo-shield">
            🛡️
          </div>

          <div>
            <div className="logo-title">
              SafeSeat <span>AI</span>
            </div>

            <div className="logo-subtitle">
              School Bus Safety System
            </div>
          </div>

        </div>

        <div className="driver-nav-right">

          <div className="driver-panel-label">
            🚌 Driver Panel
          </div>

          <button
            type="button"
            className="logout-btn"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </nav>

      {/* =====================================================
          WELCOME
      ===================================================== */}

      <section className="welcome-section">

        <div className="welcome-content">

          <div className="small-label">
            DRIVER DASHBOARD
          </div>

          <h1>
            Welcome,{" "}
            {user?.name ||
              "Nilam Yogesh Bhame"}{" "}
            👋
          </h1>

          <p>
            Manage your school bus journey
            and monitor student safety
            from one place.
          </p>

        </div>

        <div
          className={
            leftBehind
              ? "safe-badge danger-badge"
              : alert
              ? "safe-badge emergency-badge"
              : routeStarted
              ? "safe-badge active-badge"
              : "safe-badge"
          }
        >
          {leftBehind
            ? "🔴 Child Left Behind"
            : alert
            ? "🚨 Emergency Alert"
            : routeStarted
            ? "🟢 Journey Active"
            : "⚪ Journey Not Started"}
        </div>

      </section>

      {/* =====================================================
          QUICK STATS
      ===================================================== */}

      <section className="stats-section">

        <div className="stat-card">

          <div className="stat-icon bus-icon">
            🚌
          </div>

          <div>
            <span>Assigned Bus</span>
            <strong>
              {driver.busNumber}
            </strong>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon student-icon">
            👨‍🎓
          </div>

          <div>
            <span>Total Students</span>
            <strong>
              {students.length}
            </strong>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon journey-icon">
            🛣️
          </div>

          <div>
            <span>Journey</span>

            <strong>
              {routeStarted
                ? "ACTIVE"
                : "NOT STARTED"}
            </strong>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon safety-icon">
            🛡️
          </div>

          <div>
            <span>Safety Status</span>

            <strong>
              {leftBehind
                ? "ALERT"
                : "SAFE"}
            </strong>
          </div>

        </div>

      </section>

      {/* =====================================================
          MAIN GRID
      ===================================================== */}

      <section className="dashboard-grid">

        {/* ===================================================
            ASSIGNED BUS
        =================================================== */}

        <div className="dashboard-card bus-card">

          <div className="card-header">

            <div className="card-icon">
              🚌
            </div>

            <div>
              <h3>Assigned Bus</h3>

              <span className="card-small-text">
                Bus information
              </span>
            </div>

          </div>

          <div className="info-list">

            <div className="info-row">
              <span>Bus Number</span>

              <strong>
                {driver.busNumber}
              </strong>
            </div>

            <div className="info-row">
              <span>Capacity</span>

              <strong>
                {driver.capacity} Students
              </strong>
            </div>

            <div className="info-row">
              <span>Route</span>

              <strong>
                {driver.route}
              </strong>
            </div>

          </div>

          <div
            className={
              routeStarted
                ? "status-safe full-status"
                : "status-warning full-status"
            }
          >
            {routeStarted
              ? "🟢 Journey Running"
              : "⚪ Journey Not Started"}
          </div>

        </div>

        {/* ===================================================
            DRIVER INFORMATION
        =================================================== */}

        <div className="dashboard-card">

          <div className="card-header">

            <div className="card-icon">
              👨‍✈️
            </div>

            <div>
              <h3>Driver Information</h3>

              <span className="card-small-text">
                Account details
              </span>
            </div>

          </div>

          <div className="info-list">

            <div className="info-row">

              <span>Name</span>

              <strong>
                {driver.driverName}
              </strong>

            </div>

            <div className="info-row">

              <span>Email</span>

              <strong className="email-text">
                {driver.email}
              </strong>

            </div>

          </div>

          <div className="status-safe full-status">
            🟢 Driver Account Active
          </div>

        </div>

        {/* ===================================================
            JOURNEY
        =================================================== */}

        <div className="dashboard-card journey-card">

          <div className="card-header">

            <div className="card-icon">
              🛣️
            </div>

            <div>
              <h3>Journey Status</h3>

              <span className="card-small-text">
                Bus trip management
              </span>
            </div>

          </div>

          {leftBehind ? (

            <div className="journey-message danger-message">

              🚨 Child Left Behind

              <p>
                Journey completed but a
                child is still detected
                inside the bus.
              </p>

            </div>

          ) : routeStarted ? (

            <div className="journey-message safe-message">

              🟢 Journey Active

              <p>
                Your school bus journey
                is currently active.
              </p>

            </div>

          ) : (

            <div className="journey-message warning-message">

              ⚪ Journey Not Started

              <p>
                Start the journey when
                the bus trip begins.
              </p>

            </div>

          )}

          <button
            type="button"
            className="primary-btn"
            onClick={toggleRoute}
            disabled={
              journeyLoading ||
              studentsLoading ||
              students.length === 0
            }
          >
            {journeyLoading
              ? "Processing..."
              : routeStarted
              ? "🏁 Complete Journey"
              : "▶ Start Journey"}
          </button>

        </div>

        {/* ===================================================
            QR SCANNER
        =================================================== */}

        <div className="dashboard-card qr-card">

          <div className="card-header">

            <div className="card-icon">
              📱
            </div>

            <div>
              <h3>Student QR Scanner</h3>

              <span className="card-small-text">
                Boarding attendance
              </span>
            </div>

          </div>

          {!scannerOpen ? (

            <>

              <div className="qr-preview">

                <div className="qr-symbol">
                  ▦
                </div>

                <p>
                  Scan student's QR code
                  to record boarding
                  attendance.
                </p>

              </div>

              <button
                type="button"
                className="primary-btn"
                onClick={scanQR}
                disabled={
                  studentsLoading ||
                  students.length === 0 ||
                  attendanceLoading
                }
              >
                📱 Scan Student QR
              </button>

            </>

          ) : (

            <div className="qr-scanner-area">

              <div
                id="qr-reader"
                style={{
                  width: "100%",
                  maxWidth: "420px",
                  margin: "0 auto",
                }}
              ></div>

              {attendanceLoading && (
                <div
                  className="status-warning full-status"
                  style={{
                    marginTop: "12px",
                  }}
                >
                  ⏳ Saving attendance...
                </div>
              )}

              <button
                type="button"
                className="secondary-btn"
                onClick={closeQRScanner}
                disabled={
                  attendanceLoading
                }
                style={{
                  marginTop: "15px",
                }}
              >
                ✖ Close Scanner
              </button>

            </div>

          )}

          {scanMessage && (

            <div
              className={
                scannedStudent
                  ? "scan-success"
                  : "scan-error"
              }
              style={{
                marginTop: "15px",
                padding: "15px",
                borderRadius: "10px",
                whiteSpace: "pre-line",
              }}
            >
              {scanMessage}
            </div>

          )}

          <div
            style={{
              marginTop: "18px",
              padding: "14px",
              background: "#f4f8fc",
              borderRadius: "10px",
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
            }}
          >

            <span>
              👨‍🎓 Boarding Attendance
            </span>

            <strong>
              {boardedCount} /{" "}
              {students.length}
            </strong>

          </div>

        </div>

        {/* ===================================================
            STUDENT QR CODES
        =================================================== */}

        <div className="dashboard-card">

          <div className="card-header">

            <div className="card-icon">
              🔳
            </div>

            <div>
              <h3>Student QR Codes</h3>

              <span className="card-small-text">
                Registered student QR codes
              </span>
            </div>

          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "20px",
              marginTop: "20px",
            }}
          >

            <div
              style={{
                textAlign: "center",
                padding: "15px",
                border:
                  "1px solid #e2e8f0",
                borderRadius: "12px",
                background: "#fff",
              }}
            >

              <QRCodeCanvas
                value="S003"
                size={160}
                level="H"
                includeMargin={true}
              />

              <h4>Rohan More</h4>

              <p>
                Student ID:{" "}
                <strong>S003</strong>
              </p>

              <small>
                Scan this QR in Driver
                Dashboard
              </small>

            </div>

            <div
              style={{
                textAlign: "center",
                padding: "15px",
                border:
                  "1px solid #e2e8f0",
                borderRadius: "12px",
                background: "#fff",
              }}
            >

              <QRCodeCanvas
                value="S004"
                size={160}
                level="H"
                includeMargin={true}
              />

              <h4>Riya Jadhav</h4>

              <p>
                Student ID:{" "}
                <strong>S004</strong>
              </p>

              <small>
                Scan this QR in Driver
                Dashboard
              </small>

            </div>

          </div>

        </div>

        {/* ===================================================
            STUDENTS
        =================================================== */}

        <div className="dashboard-card student-card">

          <div className="card-header">

            <div className="card-icon">
              👨‍🎓
            </div>

            <div>
              <h3>Students on Bus</h3>

              <span className="card-small-text">
                Boarding attendance
              </span>
            </div>

          </div>

          <div className="student-list">

            {studentsLoading ? (

              <div className="status-warning full-status">
                ⏳ Loading students...
              </div>

            ) : students.length === 0 ? (

              <div className="status-danger full-status">
                ⚠️ No active students
                assigned to this bus.
              </div>

            ) : (

              students.map((student) => {

                const record =
                  attendance[
                    student.id
                  ];

                return (
                  <div
                    className="student-item"
                    key={student.id}
                  >

                    <div className="student-avatar">
                      👤
                    </div>

                    <div className="student-details">

                      <strong>
                        {student.studentName}
                      </strong>

                      <span>
                        Student ID:{" "}
                        {student.rollNo}
                      </span>

                      {record && (

                        <small
                          style={{
                            display:
                              "block",
                            marginTop:
                              "4px",
                            color:
                              "#16803c",
                          }}
                        >
                          🕐 Boarded at{" "}
                          {record.time}
                        </small>

                      )}

                    </div>

                    <span
                      className={
                        record
                          ? "student-safe"
                          : "student-danger"
                      }
                    >
                      {record
                        ? "✓"
                        : "○"}
                    </span>

                  </div>
                );

              })

            )}

          </div>

          {students.length > 0 && (

            <div
              className={
                boardedCount ===
                students.length
                  ? "status-safe full-status"
                  : "status-warning full-status"
              }
              style={{
                marginTop: "15px",
              }}
            >
              {boardedCount ===
              students.length
                ? "🟢 All Students Boarded"
                : `🟡 ${
                    students.length -
                    boardedCount
                  } Student(s) Pending`}
            </div>

          )}

        </div>

        {/* ===================================================
            DOOR
        =================================================== */}

        <div className="dashboard-card">

          <div className="card-header">

            <div className="card-icon">
              🚪
            </div>

            <div>
              <h3>Bus Door Status</h3>

              <span className="card-small-text">
                Door monitoring
              </span>
            </div>

          </div>

          <div
            className={
              doorOpen
                ? "big-status danger-status"
                : "big-status safe-status"
            }
          >
            {doorOpen
              ? "🔴 Door is OPEN"
              : "🟢 Door is CLOSED"}
          </div>

          <p className="card-description">
            Monitor the bus door before
            and after the journey.
          </p>

          <button
            type="button"
            className="secondary-btn"
            onClick={toggleDoor}
            disabled={
              studentsLoading ||
              students.length === 0
            }
          >
            {doorOpen
              ? "🔒 Close Door"
              : "🚪 Open Door"}
          </button>

        </div>

        {/* ===================================================
            CHILD PRESENCE
        =================================================== */}

        <div className="dashboard-card">

          <div className="card-header">

            <div className="card-icon">
              👤
            </div>

            <div>
              <h3>Child Presence</h3>

              <span className="card-small-text">
                Safety detection
              </span>
            </div>

          </div>

          <div
            className={
              childPresent
                ? "big-status safe-status"
                : "big-status danger-status"
            }
          >
            {childPresent
              ? "🟢 Child Detected"
              : "🔴 Child Not Detected"}
          </div>

          <p className="card-description">
            {childPresent
              ? "Child is currently detected inside the bus."
              : "No child is currently detected."}
          </p>

          <button
            type="button"
            className="secondary-btn"
            onClick={
              toggleChildPresence
            }
          >
            Test Child Sensor
          </button>

        </div>

        {/* ===================================================
            GPS
        =================================================== */}

        <div className="dashboard-card gps-card">

          <div className="card-header">

            <div className="card-icon">
              📍
            </div>

            <div>
              <h3>
                Emergency GPS Tracker
              </h3>

              <span className="card-small-text">
                Live bus location
              </span>
            </div>

          </div>

          {gpsTracking ? (

            <div className="big-status safe-status">
              🟢 GPS Tracking Active
            </div>

          ) : (

            <div className="big-status warning-status">
              ⚪ GPS Not Started
            </div>

          )}

          {gpsLocation ? (

            <div className="gps-details">

              <div className="gps-row">

                <span>Latitude</span>

                <strong>
                  {gpsLocation.latitude.toFixed(
                    6
                  )}
                </strong>

              </div>

              <div className="gps-row">

                <span>Longitude</span>

                <strong>
                  {gpsLocation.longitude.toFixed(
                    6
                  )}
                </strong>

              </div>

              <div className="gps-row">

                <span>Accuracy</span>

                <strong>
                  {Math.round(
                    gpsLocation.accuracy
                  )} meters
                </strong>

              </div>

              {students.length > 0 && (

                <div className="gps-row">

                  <span>Student</span>

                  <strong>
                    {students[0].studentName}
                  </strong>

                </div>

              )}

              {students.length > 0 && (

                <div className="gps-row">

                  <span>Student ID</span>

                  <strong>
                    {students[0].rollNo}
                  </strong>

                </div>

              )}

            </div>

          ) : (

            <p className="card-description">
              📍 Start GPS tracking to
              save the bus location.
            </p>

          )}

          {gpsError && (

            <div className="gps-error">
              ⚠️ {gpsError}
            </div>

          )}

          <div className="button-row">

            <button
              type="button"
              className="primary-btn"
              onClick={
                startGPSTracking
              }
              disabled={gpsLoading}
            >
              {gpsLoading
                ? "⏳ Getting GPS..."
                : "📍 Start GPS"}
            </button>

            {gpsLocation && (

              <button
                type="button"
                className="secondary-btn"
                onClick={
                  viewGPSLocation
                }
              >
                🗺️ View Map
              </button>

            )}

          </div>

        </div>

        {/* ===================================================
            SAFETY MONITOR
        =================================================== */}

        <div className="dashboard-card">

          <div className="card-header">

            <div className="card-icon">
              🛡️
            </div>

            <div>
              <h3>Safety Monitor</h3>

              <span className="card-small-text">
                Real-time safety status
              </span>
            </div>

          </div>

          {leftBehind ? (

            <div className="monitor-alert danger-monitor">

              <strong>
                🚨 CHILD LEFT BEHIND
              </strong>

              <p>
                Child is still detected
                inside the bus after
                journey completion.
              </p>

            </div>

          ) : doorOpen ? (

            <div className="monitor-alert danger-monitor">

              <strong>
                🚨 SAFETY WARNING
              </strong>

              <p>
                Bus door is currently
                open.
              </p>

            </div>

          ) : !childPresent ? (

            <div className="monitor-alert danger-monitor">

              <strong>
                🚨 SAFETY WARNING
              </strong>

              <p>
                Child presence is not
                detected.
              </p>

            </div>

          ) : (

            <div className="monitor-alert safe-monitor">

              <strong>
                🟢 ALL CLEAR
              </strong>

              <p>
                No immediate safety issue
                detected.
              </p>

            </div>

          )}

        </div>

        {/* ===================================================
            SAFETY BUTTON
        =================================================== */}

        <div className="dashboard-card safety-card">

          <div className="card-header">

            <div className="card-icon safety-icon-large">
              🛡️
            </div>

            <div>
              <h3>Safety Button</h3>

              <span className="card-small-text">
                Immediate assistance
              </span>
            </div>

          </div>

          <p className="card-description">
            Press the safety button if
            immediate child safety
            assistance is required.
          </p>

          <button
            type="button"
            className="safety-btn"
            onClick={safetyButton}
            disabled={
              studentsLoading ||
              students.length === 0
            }
          >
            🛡️ Activate Safety Button
          </button>

        </div>

        {/* ===================================================
            EMERGENCY SOS
        =================================================== */}

        <div className="dashboard-card emergency-card">

          <div className="card-header">

            <div className="card-icon emergency-icon">
              🚨
            </div>

            <div>
              <h3>Emergency SOS</h3>

              <span className="card-small-text">
                Emergency alert system
              </span>
            </div>

          </div>

          {alert ? (

            <div className="big-status danger-status">
              🚨 Emergency Alert Sent
            </div>

          ) : (

            <p className="card-description">
              Send an emergency alert to
              registered parents and
              administrator.
            </p>

          )}

          <button
            type="button"
            className="emergency-btn"
            onClick={
              emergencyAlert
            }
            disabled={
              studentsLoading ||
              students.length === 0
            }
          >
            🚨 Send Emergency SOS
          </button>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="dashboard-footer">

        <div className="footer-logo">
          🛡️ SafeSeat AI
        </div>

        <p>
          Intelligent School Bus Safety,
          Attendance & Emergency Alert
          System
        </p>

        <span>
          © 2026 SafeSeat AI
        </span>

      </footer>

    </div>
  );
}

export default DriverDashboard;