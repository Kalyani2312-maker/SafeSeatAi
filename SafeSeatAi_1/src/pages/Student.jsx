import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import "./Student.css";

// Local Spring Boot backend
const API =
  import.meta.env.VITE_API_URL ||
  "http://localhost:9091";

function Student() {
  const [student, setStudent] = useState({
    studentName: "",
    rollNo: "",
    className: "",
    parentId: "",
    busId: "",
    busStartDate: "",
  });

  const [savedStudent, setSavedStudent] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setStudent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    setMessage("");
    setSavedStudent(null);

    if (
      !student.studentName.trim() ||
      !student.rollNo.trim() ||
      !student.className.trim() ||
      !student.parentId ||
      !student.busId
    ) {
      setMessage("⚠️ Please fill all required fields.");
      return;
    }

    const requestData = {
      studentName: student.studentName.trim(),
      rollNo: student.rollNo.trim(),
      className: student.className.trim(),
      parentId: Number(student.parentId),
      busId: Number(student.busId),
      busStatus: "ACTIVE",
      busStartDate: student.busStartDate || null,
    };

    try {
      setLoading(true);

      console.log(
        "Sending student data:",
        requestData
      );

      const response = await fetch(
        `${API}/api/students`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      const text = await response.text();

      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      console.log(
        "Student API response:",
        response.status,
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            text ||
            `Server error ${response.status}`
        );
      }

      setSavedStudent(data);

      setMessage(
        `✅ ${data.studentName} added successfully! QR generated.`
      );

      setStudent({
        studentName: "",
        rollNo: "",
        className: "",
        parentId: "",
        busId: "",
        busStartDate: "",
      });
    } catch (error) {
      console.error(
        "Student save error:",
        error
      );

      if (
        error instanceof TypeError &&
        error.message === "Failed to fetch"
      ) {
        setMessage(
          "❌ Failed to fetch. Make sure Spring Boot is running on http://localhost:9091."
        );
      } else {
        setMessage(
          `❌ ${error.message || "Failed to save student."}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!savedStudent) {
      return;
    }

    const canvas =
      document.getElementById("student-qr");

    if (!canvas) {
      setMessage("❌ QR code not available.");
      return;
    }

    const pngUrl = canvas.toDataURL(
      "image/png"
    );

    const downloadLink =
      document.createElement("a");

    downloadLink.href = pngUrl;
    downloadLink.download =
      `${savedStudent.rollNo}_QR.png`;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="student-page">
      <div className="student-container">

        {/* HEADER */}
        <div className="student-header">
          <div className="student-icon">
            👨‍🎓
          </div>

          <div>
            <h1>Student Management</h1>

            <p>
              Add student and generate unique QR
              identity
            </p>
          </div>
        </div>

        <div className="student-grid">

          {/* ADD STUDENT */}
          <div className="student-card">

            <h2>➕ Add Student</h2>

            <form onSubmit={handleSave}>

              <label>
                Student Name *
              </label>

              <input
                type="text"
                name="studentName"
                placeholder="Enter student name"
                value={student.studentName}
                onChange={handleChange}
                disabled={loading}
              />

              <label>
                Student ID *
              </label>

              <input
                type="text"
                name="rollNo"
                placeholder="Example: S005"
                value={student.rollNo}
                onChange={handleChange}
                disabled={loading}
              />

              <label>
                Class *
              </label>

              <input
                type="text"
                name="className"
                placeholder="Example: 10-A"
                value={student.className}
                onChange={handleChange}
                disabled={loading}
              />

              <label>
                Parent ID *
              </label>

              <input
                type="number"
                name="parentId"
                placeholder="Example: 1"
                value={student.parentId}
                onChange={handleChange}
                disabled={loading}
              />

              <label>
                Bus ID *
              </label>

              <input
                type="number"
                name="busId"
                placeholder="Example: 1"
                value={student.busId}
                onChange={handleChange}
                disabled={loading}
              />

              <label>
                Bus Start Date
              </label>

              <input
                type="date"
                name="busStartDate"
                value={student.busStartDate}
                onChange={handleChange}
                disabled={loading}
              />

              <button
                type="submit"
                className="save-student-btn"
                disabled={loading}
              >
                {loading
                  ? "Saving Student..."
                  : "Add Student & Generate QR"}
              </button>

            </form>

            {message && (
              <div className="student-message">
                {message}
              </div>
            )}

          </div>

          {/* QR SECTION */}
          <div className="student-card qr-card">

            <h2>🔳 Student QR Code</h2>

            {!savedStudent ? (
              <div className="qr-empty">

                <div className="qr-empty-icon">
                  📱
                </div>

                <p>
                  Add a student to generate
                  their unique QR code.
                </p>

              </div>
            ) : (
              <>
                <div className="student-preview">

                  <h3>
                    {savedStudent.studentName}
                  </h3>

                  <p>
                    Student ID:
                    <strong>
                      {" "}
                      {savedStudent.rollNo}
                    </strong>
                  </p>

                  <p>
                    Class:
                    <strong>
                      {" "}
                      {savedStudent.className}
                    </strong>
                  </p>

                  <p>
                    Parent ID:
                    <strong>
                      {" "}
                      {savedStudent.parentId}
                    </strong>
                  </p>

                  <p>
                    Bus ID:
                    <strong>
                      {" "}
                      {savedStudent.busId}
                    </strong>
                  </p>

                  <p>
                    Bus Status:
                    <strong>
                      {" "}
                      {savedStudent.busStatus ||
                        "ACTIVE"}
                    </strong>
                  </p>

                  <p>
                    Database ID:
                    <strong>
                      {" "}
                      {savedStudent.id}
                    </strong>
                  </p>

                </div>

                <div className="qr-box">

                  <QRCodeCanvas
                    id="student-qr"
                    value={savedStudent.rollNo}
                    size={220}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                    includeMargin={true}
                  />

                </div>

                <p className="qr-data">
                  QR Data:
                  <strong>
                    {" "}
                    {savedStudent.rollNo}
                  </strong>
                </p>

                <button
                  type="button"
                  className="download-qr-btn"
                  onClick={downloadQR}
                >
                  ⬇️ Download QR
                </button>

              </>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}

export default Student;