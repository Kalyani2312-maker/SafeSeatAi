import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:9091";

function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [users, setUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [journeys, setJourneys] = useState([]);
  const [locations, setLocations] = useState([]);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [studentSearch, setStudentSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");

  // =========================
  // FORMS
  // =========================

  const [studentForm, setStudentForm] = useState({
    studentName: "",
    rollNo: "",
    className: "",
    parentId: "",
    busId: "",
  });

  const [busForm, setBusForm] = useState({
    busNumber: "",
    driverName: "",
    route: "",
  });

  const [driverForm, setDriverForm] = useState({
    driverName: "",
    phone: "",
    licenseNumber: "",
  });

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "PARENT",
    mobileNumber: "",
  });

  // =========================
  // EDITING
  // =========================

  const [editingStudent, setEditingStudent] = useState(null);
  const [editingBus, setEditingBus] = useState(null);
  const [editingDriver, setEditingDriver] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  // =========================
  // SHOW FORMS
  // =========================

  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showBusForm, setShowBusForm] = useState(false);
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);

  // =========================================================
  // LOAD STUDENTS
  // =========================================================

  const loadStudents = useCallback(async () => {
    try {
      const response = await fetch(`${API}/api/students`);

      if (!response.ok) {
        throw new Error("Student API error");
      }

      const data = await response.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Students:", error);
    }
  }, []);

  // =========================================================
  // LOAD BUSES
  // =========================================================

  const loadBuses = useCallback(async () => {
    try {
      const response = await fetch(`${API}/api/buses`);

      if (!response.ok) {
        throw new Error("Bus API error");
      }

      const data = await response.json();
      setBuses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Buses:", error);
    }
  }, []);

  // =========================================================
  // LOAD DRIVERS
  // =========================================================

  const loadDrivers = useCallback(async () => {
    try {
      const response = await fetch(`${API}/api/drivers`);

      if (!response.ok) {
        throw new Error("Driver API error");
      }

      const data = await response.json();
      setDrivers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Drivers:", error);
    }
  }, []);

  // =========================================================
  // LOAD USERS
  // =========================================================

  const loadUsers = useCallback(async () => {
    try {
      const response = await fetch(`${API}/api/users`);

      if (!response.ok) {
        throw new Error("User API error");
      }

      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Users:", error);
    }
  }, []);

  // =========================================================
  // LOAD ALERTS
  // =========================================================

  const loadAlerts = useCallback(async () => {
    try {
      const response = await fetch(`${API}/api/alerts`);

      if (!response.ok) {
        throw new Error("Alert API error");
      }

      const data = await response.json();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Alerts:", error);
    }
  }, []);

  // =========================================================
  // LOAD JOURNEYS
  // =========================================================

  const loadJourneys = useCallback(async () => {
    try {
      const response = await fetch(`${API}/api/journeys`);

      if (!response.ok) {
        throw new Error("Journey API error");
      }

      const data = await response.json();
      setJourneys(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Journeys:", error);
    }
  }, []);

  // =========================================================
  // LOAD GPS
  // =========================================================

  const loadLocations = useCallback(async () => {
    try {
      const response = await fetch(
        `${API}/api/emergency-location`
      );

      if (!response.ok) {
        throw new Error("GPS API error");
      }

      const data = await response.json();
      setLocations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("GPS:", error);
    }
  }, []);

  // =========================================================
  // LOAD EVERYTHING
  // =========================================================

  const loadAllData = useCallback(async () => {
    setLoading(true);

    await Promise.all([
      loadStudents(),
      loadBuses(),
      loadDrivers(),
      loadUsers(),
      loadAlerts(),
      loadJourneys(),
      loadLocations(),
    ]);

    setLoading(false);
  }, [
    loadStudents,
    loadBuses,
    loadDrivers,
    loadUsers,
    loadAlerts,
    loadJourneys,
    loadLocations,
  ]);

  useEffect(() => {
    loadAllData();

    const timer = setInterval(() => {
      loadAllData();
    }, 5000);

    return () => clearInterval(timer);
  }, [loadAllData]);

  // =========================================================
  // FILTERED DATA
  // =========================================================

  const activeAlerts = useMemo(() => {
    return alerts.filter(
      (alert) =>
        String(alert.status || "ACTIVE").toUpperCase() !==
        "RESOLVED"
    );
  }, [alerts]);

  const filteredStudents = useMemo(() => {
    const search = studentSearch.toLowerCase();

    return students.filter((student) => {
      return (
        String(student.studentName || "")
          .toLowerCase()
          .includes(search) ||
        String(student.rollNo || "")
          .toLowerCase()
          .includes(search) ||
        String(student.className || "")
          .toLowerCase()
          .includes(search)
      );
    });
  }, [students, studentSearch]);

  const filteredUsers = useMemo(() => {
    const search = userSearch.toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        String(user.name || "")
          .toLowerCase()
          .includes(search) ||
        String(user.email || "")
          .toLowerCase()
          .includes(search) ||
        String(user.mobileNumber || "")
          .includes(search);

      const matchesRole =
        userRoleFilter === "ALL" ||
        String(user.role || "").toUpperCase() === userRoleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, userSearch, userRoleFilter]);

  // =========================================================
  // STUDENT
  // =========================================================

  const handleStudentChange = (e) => {
    setStudentForm({
      ...studentForm,
      [e.target.name]: e.target.value,
    });
  };

  const saveStudent = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        studentName: studentForm.studentName,
        rollNo: studentForm.rollNo,
        className: studentForm.className,
        parentId: studentForm.parentId
          ? Number(studentForm.parentId)
          : null,
        busId: studentForm.busId
          ? Number(studentForm.busId)
          : null,
      };

      const url = editingStudent
        ? `${API}/api/students/${editingStudent}`
        : `${API}/api/students`;

      const response = await fetch(url, {
        method: editingStudent ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Student save failed");
      }

      setMessage(
        editingStudent
          ? "Student updated successfully."
          : "Student added successfully."
      );

      resetStudentForm();
      await loadStudents();
    } catch (error) {
      console.error(error);
      setMessage("Failed to save student.");
    }
  };

  const editStudent = (student) => {
    setEditingStudent(student.id);

    setStudentForm({
      studentName: student.studentName || "",
      rollNo: student.rollNo || "",
      className: student.className || "",
      parentId: student.parentId || "",
      busId: student.busId || "",
    });

    setShowStudentForm(true);
  };

  const deleteStudent = async (id) => {
    if (!window.confirm("Delete this student?")) return;

    try {
      const response = await fetch(
        `${API}/api/students/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setMessage("Student deleted successfully.");
      await loadStudents();
    } catch (error) {
      console.error(error);
      setMessage("Failed to delete student.");
    }
  };

  const resetStudentForm = () => {
    setStudentForm({
      studentName: "",
      rollNo: "",
      className: "",
      parentId: "",
      busId: "",
    });

    setEditingStudent(null);
    setShowStudentForm(false);
  };

  // =========================================================
  // BUS
  // =========================================================

  const handleBusChange = (e) => {
    setBusForm({
      ...busForm,
      [e.target.name]: e.target.value,
    });
  };

  const saveBus = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        busNumber: busForm.busNumber,
        driverName: busForm.driverName,
        route: busForm.route,
      };

      const url = editingBus
        ? `${API}/api/buses/${editingBus}`
        : `${API}/api/buses`;

      const response = await fetch(url, {
        method: editingBus ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Bus save failed");
      }

      setMessage(
        editingBus
          ? "Bus updated successfully."
          : "Bus added successfully."
      );

      resetBusForm();
      await loadBuses();
    } catch (error) {
      console.error(error);
      setMessage("Failed to save bus.");
    }
  };

  const editBus = (bus) => {
    setEditingBus(bus.id);

    setBusForm({
      busNumber: bus.busNumber || "",
      driverName: bus.driverName || "",
      route: bus.route || "",
    });

    setShowBusForm(true);
  };

  const deleteBus = async (id) => {
    if (!window.confirm("Delete this bus?")) return;

    try {
      const response = await fetch(
        `${API}/api/buses/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setMessage("Bus deleted successfully.");
      await loadBuses();
    } catch (error) {
      console.error(error);
      setMessage("Failed to delete bus.");
    }
  };

  const resetBusForm = () => {
    setBusForm({
      busNumber: "",
      driverName: "",
      route: "",
    });

    setEditingBus(null);
    setShowBusForm(false);
  };

  // =========================================================
  // DRIVER
  // =========================================================

  const handleDriverChange = (e) => {
    setDriverForm({
      ...driverForm,
      [e.target.name]: e.target.value,
    });
  };

  const saveDriver = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        driverName: driverForm.driverName,
        phone: driverForm.phone,
        licenseNumber: driverForm.licenseNumber,
      };

      const url = editingDriver
        ? `${API}/api/drivers/${editingDriver}`
        : `${API}/api/drivers`;

      const response = await fetch(url, {
        method: editingDriver ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Driver save failed");
      }

      setMessage(
        editingDriver
          ? "Driver updated successfully."
          : "Driver added successfully."
      );

      resetDriverForm();
      await loadDrivers();
    } catch (error) {
      console.error(error);
      setMessage("Failed to save driver.");
    }
  };

  const editDriver = (driver) => {
    setEditingDriver(driver.id);

    setDriverForm({
      driverName: driver.driverName || "",
      phone: driver.phone || "",
      licenseNumber: driver.licenseNumber || "",
    });

    setShowDriverForm(true);
  };

  const deleteDriver = async (id) => {
    if (!window.confirm("Delete this driver?")) return;

    try {
      const response = await fetch(
        `${API}/api/drivers/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setMessage("Driver deleted successfully.");
      await loadDrivers();
    } catch (error) {
      console.error(error);
      setMessage("Failed to delete driver.");
    }
  };

  const resetDriverForm = () => {
    setDriverForm({
      driverName: "",
      phone: "",
      licenseNumber: "",
    });

    setEditingDriver(null);
    setShowDriverForm(false);
  };

  // =========================================================
  // USER
  // =========================================================

  const handleUserChange = (e) => {
    setUserForm({
      ...userForm,
      [e.target.name]: e.target.value,
    });
  };

  const saveUser = async (e) => {
    e.preventDefault();

    if (!/^[0-9]{10}$/.test(userForm.mobileNumber)) {
      setMessage("Enter a valid 10 digit mobile number.");
      return;
    }

    try {
      const payload = {
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
        mobileNumber: userForm.mobileNumber,
      };

      if (!editingUser) {
        payload.password = userForm.password;
      }

      const url = editingUser
        ? `${API}/api/users/${editingUser}`
        : `${API}/api/users/register`;

      const response = await fetch(url, {
        method: editingUser ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("User save failed");
      }

      setMessage(
        editingUser
          ? "User updated successfully."
          : "User added successfully."
      );

      resetUserForm();
      await loadUsers();
    } catch (error) {
      console.error(error);
      setMessage("Failed to save user.");
    }
  };

  const editUser = (user) => {
    setEditingUser(user.id);

    setUserForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "PARENT",
      mobileNumber: user.mobileNumber || "",
    });

    setShowUserForm(true);
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      const response = await fetch(
        `${API}/api/users/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setMessage("User deleted successfully.");
      await loadUsers();
    } catch (error) {
      console.error(error);
      setMessage("Failed to delete user.");
    }
  };

  const resetUserForm = () => {
    setUserForm({
      name: "",
      email: "",
      password: "",
      role: "PARENT",
      mobileNumber: "",
    });

    setEditingUser(null);
    setShowUserForm(false);
  };

  // =========================================================
  // ALERT RESOLVE
  // =========================================================

  const resolveAlert = async (id) => {
    try {
      const response = await fetch(
        `${API}/api/alerts/${id}/resolve`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        throw new Error("Resolve failed");
      }

      setMessage(`Alert #${id} resolved successfully.`);
      await loadAlerts();
    } catch (error) {
      console.error(error);
      setMessage("Failed to resolve alert.");
    }
  };

  // =========================================================
  // JOURNEY DELETE
  // =========================================================

  const deleteJourney = async (id) => {
    if (!window.confirm("Delete this journey history?")) return;

    try {
      const response = await fetch(
        `${API}/api/journeys/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setMessage("Journey deleted.");
      await loadJourneys();
    } catch (error) {
      console.error(error);
      setMessage("Failed to delete journey.");
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="admin-dashboard">

      {/* ================= NAVBAR ================= */}

      <nav className="admin-navbar">

        <div className="admin-brand">
          <div className="brand-icon">🛡️</div>

          <div>
            <h2>SafeSeat AI</h2>
            <span>Admin Control Center</span>
          </div>
        </div>

        <div className="nav-right">
          <Link to="/">Home</Link>

          <button
            type="button"
            onClick={logout}
          >
            Logout
          </button>
        </div>

      </nav>

      {/* ================= HEADER ================= */}

      <div className="admin-header">

        <div>
          <div className="dashboard-label">
            ADMIN CONTROL PANEL
          </div>

          <h1>Admin Dashboard</h1>

          <p>
            Monitor students, buses, users, journeys,
            safety alerts and emergency locations.
          </p>
        </div>

        <button
          type="button"
          className="primary-btn"
          onClick={loadAllData}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "🔄 Refresh System"}
        </button>

      </div>

      {/* ================= MESSAGE ================= */}

      {message && (
        <div className="dashboard-message">
          <span>✓ {message}</span>

          <button
            type="button"
            onClick={() => setMessage("")}
          >
            ×
          </button>
        </div>
      )}

      {/* ================= SYSTEM STATUS ================= */}

      <div className="system-status-bar">

        <span>
          <i className="online-dot"></i>
          System Online
        </span>

        <span>
          Auto Refresh: 5 sec
        </span>

        <span>
          Safety Monitoring Active
        </span>

      </div>

      {/* ================= STATS ================= */}

      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon">👨‍🎓</div>
          <div>
            <h3>{students.length}</h3>
            <p>Students</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🚌</div>
          <div>
            <h3>{buses.length}</h3>
            <p>Buses</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👨‍✈️</div>
          <div>
            <h3>{drivers.length}</h3>
            <p>Drivers</p>
          </div>
        </div>

        <div className="stat-card alert-stat">
          <div className="stat-icon">🚨</div>
          <div>
            <h3>{activeAlerts.length}</h3>
            <p>Active Alerts</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div>
            <h3>{users.length}</h3>
            <p>Users</p>
          </div>
        </div>

      </div>

      {/* =====================================================
          STUDENT MANAGEMENT
      ===================================================== */}

      <section className="management-card">

        <div className="card-header">

          <div>
            <h2>👨‍🎓 Student Management</h2>
            <p>
              Register and manage students assigned to school buses.
            </p>
          </div>

          <button
            type="button"
            className="primary-btn"
            onClick={() =>
              setShowStudentForm(!showStudentForm)
            }
          >
            {showStudentForm
              ? "Close Form"
              : "+ Add Student"}
          </button>

        </div>

        {showStudentForm && (
          <form
            className="management-form"
            onSubmit={saveStudent}
          >

            <input
              name="studentName"
              placeholder="Student Full Name"
              value={studentForm.studentName}
              onChange={handleStudentChange}
              required
            />

            <input
              name="rollNo"
              placeholder="Student ID / Roll No"
              value={studentForm.rollNo}
              onChange={handleStudentChange}
              required
            />

            <input
              name="className"
              placeholder="Class"
              value={studentForm.className}
              onChange={handleStudentChange}
              required
            />

            <input
              name="parentId"
              type="number"
              placeholder="Parent User ID"
              value={studentForm.parentId}
              onChange={handleStudentChange}
            />

            <input
              name="busId"
              type="number"
              placeholder="Bus ID"
              value={studentForm.busId}
              onChange={handleStudentChange}
            />

            <div className="form-actions">

              <button
                type="submit"
                className="primary-btn"
              >
                {editingStudent
                  ? "Update Student"
                  : "Save Student"}
              </button>

              <button
                type="button"
                className="secondary-btn"
                onClick={resetStudentForm}
              >
                Cancel
              </button>

            </div>

          </form>
        )}

        <div className="table-toolbar">

          <input
            type="text"
            placeholder="🔍 Search student..."
            value={studentSearch}
            onChange={(e) =>
              setStudentSearch(e.target.value)
            }
          />

          <span>
            {filteredStudents.length} students
          </span>

        </div>

        <div className="table-container">

          <table>

            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Student ID</th>
                <th>Class</th>
                <th>Parent ID</th>
                <th>Bus ID</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id}>

                    <td>{student.id}</td>

                    <td className="strong-text">
                      {student.studentName}
                    </td>

                    <td>
                      <span className="id-badge">
                        {student.rollNo}
                      </span>
                    </td>

                    <td>{student.className}</td>

                    <td>{student.parentId || "-"}</td>

                    <td>{student.busId || "-"}</td>

                    <td className="action-cell">

                      <button
                        type="button"
                        className="small-btn"
                        onClick={() =>
                          editStudent(student)
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="small-btn danger"
                        onClick={() =>
                          deleteStudent(student.id)
                        }
                      >
                        Delete
                      </button>

                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

      </section>

      {/* =====================================================
          BUS MANAGEMENT
      ===================================================== */}

      <section className="management-card">

        <div className="card-header">

          <div>
            <h2>🚌 Bus Management</h2>
            <p>
              Manage school buses, drivers and routes.
            </p>
          </div>

          <button
            type="button"
            className="primary-btn"
            onClick={() =>
              setShowBusForm(!showBusForm)
            }
          >
            {showBusForm
              ? "Close Form"
              : "+ Add Bus"}
          </button>

        </div>

        {showBusForm && (
          <form
            className="management-form"
            onSubmit={saveBus}
          >

            <input
              name="busNumber"
              placeholder="Bus Number"
              value={busForm.busNumber}
              onChange={handleBusChange}
              required
            />

            <input
              name="driverName"
              placeholder="Driver Name"
              value={busForm.driverName}
              onChange={handleBusChange}
            />

            <input
              name="route"
              placeholder="School Route"
              value={busForm.route}
              onChange={handleBusChange}
            />

            <div className="form-actions">

              <button
                type="submit"
                className="primary-btn"
              >
                {editingBus
                  ? "Update Bus"
                  : "Save Bus"}
              </button>

              <button
                type="button"
                className="secondary-btn"
                onClick={resetBusForm}
              >
                Cancel
              </button>

            </div>

          </form>
        )}

        <div className="table-container">

          <table>

            <thead>
              <tr>
                <th>ID</th>
                <th>Bus Number</th>
                <th>Driver</th>
                <th>Route</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {buses.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    No buses found.
                  </td>
                </tr>
              ) : (
                buses.map((bus) => (
                  <tr key={bus.id}>

                    <td>{bus.id}</td>

                    <td>
                      <span className="bus-number">
                        🚌 {bus.busNumber}
                      </span>
                    </td>

                    <td>
                      {bus.driverName || "-"}
                    </td>

                    <td>
                      {bus.route || "-"}
                    </td>

                    <td className="action-cell">

                      <button
                        type="button"
                        className="small-btn"
                        onClick={() =>
                          editBus(bus)
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="small-btn danger"
                        onClick={() =>
                          deleteBus(bus.id)
                        }
                      >
                        Delete
                      </button>

                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

      </section>

      {/* =====================================================
          DRIVER MANAGEMENT
      ===================================================== */}

      <section className="management-card">

        <div className="card-header">

          <div>
            <h2>👨‍✈️ Driver Management</h2>
            <p>
              Manage driver contact and license information.
            </p>
          </div>

          <button
            type="button"
            className="primary-btn"
            onClick={() =>
              setShowDriverForm(!showDriverForm)
            }
          >
            {showDriverForm
              ? "Close Form"
              : "+ Add Driver"}
          </button>

        </div>

        {showDriverForm && (
          <form
            className="management-form"
            onSubmit={saveDriver}
          >

            <input
              name="driverName"
              placeholder="Driver Full Name"
              value={driverForm.driverName}
              onChange={handleDriverChange}
              required
            />

            <input
              name="phone"
              type="tel"
              placeholder="Phone Number"
              value={driverForm.phone}
              onChange={handleDriverChange}
            />

            <input
              name="licenseNumber"
              placeholder="Driving License Number"
              value={driverForm.licenseNumber}
              onChange={handleDriverChange}
            />

            <div className="form-actions">

              <button
                type="submit"
                className="primary-btn"
              >
                {editingDriver
                  ? "Update Driver"
                  : "Save Driver"}
              </button>

              <button
                type="button"
                className="secondary-btn"
                onClick={resetDriverForm}
              >
                Cancel
              </button>

            </div>

          </form>
        )}

        <div className="table-container">

          <table>

            <thead>
              <tr>
                <th>ID</th>
                <th>Driver</th>
                <th>Phone</th>
                <th>License</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {drivers.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    No drivers found.
                  </td>
                </tr>
              ) : (
                drivers.map((driver) => (
                  <tr key={driver.id}>

                    <td>{driver.id}</td>

                    <td className="strong-text">
                      {driver.driverName}
                    </td>

                    <td>
                      {driver.phone || "-"}
                    </td>

                    <td>
                      {driver.licenseNumber || "-"}
                    </td>

                    <td className="action-cell">

                      <button
                        type="button"
                        className="small-btn"
                        onClick={() =>
                          editDriver(driver)
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="small-btn danger"
                        onClick={() =>
                          deleteDriver(driver.id)
                        }
                      >
                        Delete
                      </button>

                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

      </section>

      {/* =====================================================
          USER & CONTACT MANAGEMENT
      ===================================================== */}

      <section className="management-card full-width-card">

        <div className="card-header">

          <div>
            <h2>👥 User & Contact Management</h2>

            <p>
              Manage Parent, Teacher, Driver and Admin accounts
              with emergency contact numbers.
            </p>
          </div>

          <button
            type="button"
            className="primary-btn"
            onClick={() =>
              setShowUserForm(!showUserForm)
            }
          >
            {showUserForm
              ? "Close Form"
              : "+ Add User"}
          </button>

        </div>

        {showUserForm && (
          <form
            className="management-form"
            onSubmit={saveUser}
          >

            <input
              name="name"
              placeholder="Full Name"
              value={userForm.name}
              onChange={handleUserChange}
              required
            />

            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={userForm.email}
              onChange={handleUserChange}
              required
            />

            {!editingUser && (
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={userForm.password}
                onChange={handleUserChange}
                required
              />
            )}

            <select
              name="role"
              value={userForm.role}
              onChange={handleUserChange}
            >
              <option value="PARENT">Parent</option>
              <option value="TEACHER">Teacher</option>
              <option value="DRIVER">Driver</option>
              <option value="ADMIN">Admin</option>
            </select>

            <input
              name="mobileNumber"
              type="tel"
              placeholder="10 Digit Mobile Number"
              value={userForm.mobileNumber}
              onChange={handleUserChange}
              maxLength="10"
              pattern="[0-9]{10}"
              required
            />

            <div className="form-actions">

              <button
                type="submit"
                className="primary-btn"
              >
                {editingUser
                  ? "Update User"
                  : "Save User"}
              </button>

              <button
                type="button"
                className="secondary-btn"
                onClick={resetUserForm}
              >
                Cancel
              </button>

            </div>

          </form>
        )}

        <div className="table-toolbar user-toolbar">

          <input
            type="text"
            placeholder="🔍 Search name, email or mobile..."
            value={userSearch}
            onChange={(e) =>
              setUserSearch(e.target.value)
            }
          />

          <select
            value={userRoleFilter}
            onChange={(e) =>
              setUserRoleFilter(e.target.value)
            }
          >
            <option value="ALL">All Roles</option>
            <option value="PARENT">Parent</option>
            <option value="TEACHER">Teacher</option>
            <option value="DRIVER">Driver</option>
            <option value="ADMIN">Admin</option>
          </select>

        </div>

        <div className="table-container">

          <table>

            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Mobile</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (

                  <tr key={user.id}>

                    <td>{user.id}</td>

                    <td className="strong-text">
                      {user.name}
                    </td>

                    <td>
                      {user.email}
                    </td>

                    <td>

                      <span
                        className={`role-badge ${String(
                          user.role || ""
                        ).toLowerCase()}`}
                      >
                        {user.role}
                      </span>

                    </td>

                    <td>

                      {user.mobileNumber ? (
                        <a
                          className="mobile-link"
                          href={`tel:${user.mobileNumber}`}
                        >
                          📞 {user.mobileNumber}
                        </a>
                      ) : (
                        "-"
                      )}

                    </td>

                    <td className="action-cell">

                      <button
                        type="button"
                        className="small-btn"
                        onClick={() =>
                          editUser(user)
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="small-btn danger"
                        onClick={() =>
                          deleteUser(user.id)
                        }
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                ))
              )}

            </tbody>

          </table>

        </div>

      </section>

      {/* =====================================================
          SAFETY ALERTS
      ===================================================== */}

      <section className="management-card full-width-card">

        <div className="card-header">

          <div>
            <h2>🚨 Safety Alert Center</h2>

            <p>
              Monitor emergency, safety button,
              door and child-left-behind alerts.
            </p>
          </div>

          <button
            type="button"
            className="refresh-btn"
            onClick={loadAlerts}
          >
            🔄 Refresh Alerts
          </button>

        </div>

        <div className="alert-summary">

          <div className="alert-summary-card">
            <span>🚨</span>
            <strong>{activeAlerts.length}</strong>
            <small>Active</small>
          </div>

          <div className="alert-summary-card">
            <span>🟢</span>
            <strong>
              {alerts.length - activeAlerts.length}
            </strong>
            <small>Resolved</small>
          </div>

          <div className="alert-summary-card">
            <span>📋</span>
            <strong>{alerts.length}</strong>
            <small>Total History</small>
          </div>

        </div>

        <div className="alerts-container">

          {alerts.length === 0 ? (
            <div className="empty-state">
              🟢 No safety alerts found.
            </div>
          ) : (
            alerts
              .slice()
              .reverse()
              .map((alert) => {

                const status = String(
                  alert.status || "ACTIVE"
                ).toUpperCase();

                const isActive = status !== "RESOLVED";

                return (
                  <div
                    className={
                      isActive
                        ? "alert-item active"
                        : "alert-item resolved"
                    }
                    key={alert.id}
                  >

                    <div className="alert-main">

                      <div className="alert-icon">
                        {isActive ? "🚨" : "✓"}
                      </div>

                      <div>

                        <h3>
                          {alert.alertType ||
                            alert.type ||
                            "Safety Alert"}
                        </h3>

                        <p>
                          Alert ID: {alert.id}
                        </p>

                      </div>

                    </div>

                    <div className="alert-actions">

                      <span
                        className={
                          isActive
                            ? "status-badge danger-status"
                            : "status-badge resolved-status"
                        }
                      >
                        {status}
                      </span>

                      {isActive && (
                        <button
                          type="button"
                          className="small-btn resolve-btn"
                          onClick={() =>
                            resolveAlert(alert.id)
                          }
                        >
                          Resolve
                        </button>
                      )}

                    </div>

                  </div>
                );
              })
          )}

        </div>

      </section>

      {/* =====================================================
          JOURNEY MANAGEMENT
      ===================================================== */}

      <section className="management-card full-width-card">

        <div className="card-header">

          <div>
            <h2>🛣️ Journey Management</h2>

            <p>
              View school bus journey history and completion status.
            </p>
          </div>

        </div>

        <div className="table-container">

          <table>

            <thead>

              <tr>
                <th>ID</th>
                <th>Bus ID</th>
                <th>Expected Start</th>
                <th>Expected End</th>
                <th>Actual Start</th>
                <th>Actual End</th>
                <th>Status</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody>

              {journeys.length === 0 ? (
                <tr>
                  <td colSpan="8">
                    No journeys found.
                  </td>
                </tr>
              ) : (
                journeys
                  .slice()
                  .reverse()
                  .map((journey) => (

                    <tr key={journey.id}>

                      <td>
                        {journey.id}
                      </td>

                      <td>
                        🚌 {journey.busId || "-"}
                      </td>

                      <td>
                        {journey.expectedStartTime || "-"}
                      </td>

                      <td>
                        {journey.expectedEndTime || "-"}
                      </td>

                      <td>
                        {journey.actualStartTime || "-"}
                      </td>

                      <td>
                        {journey.actualEndTime || "-"}
                      </td>

                      <td>

                        <span
                          className={
                            String(
                              journey.status || ""
                            ).toUpperCase() ===
                            "COMPLETED"
                              ? "status-badge resolved-status"
                              : "status-badge danger-status"
                          }
                        >
                          {journey.status || "-"}
                        </span>

                      </td>

                      <td>

                        <button
                          type="button"
                          className="small-btn danger"
                          onClick={() =>
                            deleteJourney(journey.id)
                          }
                        >
                          Delete
                        </button>

                      </td>

                    </tr>

                  ))
              )}

            </tbody>

          </table>

        </div>

      </section>

      {/* =====================================================
          GPS TRACKER
      ===================================================== */}

      <section className="management-card full-width-card">

        <div className="card-header">

          <div>
            <h2>📍 Emergency GPS Tracker</h2>

            <p>
              Latest emergency GPS locations reported by the system.
            </p>
          </div>

          <button
            type="button"
            className="refresh-btn"
            onClick={loadLocations}
          >
            🔄 Refresh GPS
          </button>

        </div>

        <div className="gps-status-card">

          <div>
            <span className="gps-icon">📍</span>
          </div>

          <div>
            <strong>
              GPS Monitoring System
            </strong>

            <p>
              {locations.length > 0
                ? "Emergency location data available"
                : "No emergency location recorded"}
            </p>
          </div>

        </div>

        <div className="table-container">

          <table>

            <thead>

              <tr>
                <th>ID</th>
                <th>Bus ID</th>
                <th>Student ID</th>
                <th>Latitude</th>
                <th>Longitude</th>
                <th>Timestamp</th>
                <th>Map</th>
              </tr>

            </thead>

            <tbody>

              {locations.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    No GPS locations found.
                  </td>
                </tr>
              ) : (
                locations
                  .slice()
                  .reverse()
                  .map((location) => (

                    <tr key={location.id}>

                      <td>
                        {location.id}
                      </td>

                      <td>
                        {location.busId || "-"}
                      </td>

                      <td>
                        {location.studentId || "-"}
                      </td>

                      <td>
                        {location.latitude || "-"}
                      </td>

                      <td>
                        {location.longitude || "-"}
                      </td>

                      <td>
                        {location.timestamp || "-"}
                      </td>

                      <td>

                        {location.latitude &&
                        location.longitude ? (

                          <button
                            type="button"
                            className="small-btn map-btn"
                            onClick={() =>
                              window.open(
                                `https://www.google.com/maps?q=${location.latitude},${location.longitude}`,
                                "_blank"
                              )
                            }
                          >
                            🗺️ Map
                          </button>

                        ) : (
                          "-"
                        )}

                      </td>

                    </tr>

                  ))
              )}

            </tbody>

          </table>

        </div>

      </section>

      {/* ================= FOOTER ================= */}

      <footer className="admin-footer">

        <div className="footer-logo">
          🛡️ SafeSeat AI
        </div>

        <p>
          Intelligent School Bus Safety, Attendance
          & Emergency Alert System
        </p>

        <small>
          Every Child. Every Journey. Always Safe.
        </small>

      </footer>

    </div>
  );
}

export default AdminDashboard;