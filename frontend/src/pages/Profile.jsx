import { useEffect, useState } from "react";
import axios from "axios";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const API = "http://localhost:8080/api/profile";

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!window.confirm("Do you want to save changes?")) return;

    // Validate ID fields before saving
    if (user.userType === "STUDENT" && !user.studentId?.trim()) {
      alert("Student ID is required");
      return;
    }
    if (user.userType === "STAFF" && !user.staffId?.trim()) {
      alert("Staff ID is required");
      return;
    }

    await axios.put(`${API}/update`, user, {
      headers: { Authorization: `Bearer ${token}` },
    });

    alert("Profile updated successfully");
    setEditMode(false);
    fetchProfile();
  };

  const handleDisable = async () => {
    if (!window.confirm("Disable your account? This action is permanent.")) return;
    await axios.delete(`${API}/disable`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    alert("Account disabled");
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    await axios.post(`${API}/upload-pic`, formData, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
    });
    fetchProfile();
  };

  // When userType changes, clear the irrelevant ID field
  const handleUserTypeChange = (newType) => {
    setUser({
      ...user,
      userType: newType,
      studentId: newType === "STUDENT" ? user.studentId : null,
      staffId: newType === "STAFF" ? user.staffId : null,
    });
  };

  if (loading) return <p style={styles.center}>Loading...</p>;
  if (!user) return <p style={styles.center}>No user found</p>;

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* PROFILE IMAGE */}
        <img
          src={
            user.profileImage?.trim()
              ? `http://localhost:8080${user.profileImage}`
              : `https://ui-avatars.com/api/?name=${user.name}`
          }
          alt="profile"
          style={styles.avatar}
        />
        {editMode && <input type="file" onChange={handleUpload} style={styles.file} />}

        {/* NAME */}
        {editMode ? (
          <input style={styles.input} value={user.name || ""}
            onChange={(e) => setUser({ ...user, name: e.target.value })} />
        ) : (
          <h2>{user.name}</h2>
        )}

        {/* ROLE badge (not editable — set by admin) */}
        <span style={styles.badge}>{user.role}</span>

        {/* EMAIL */}
        <p>{user.email}</p>

        {/* PHONE */}
        {editMode ? (
          <input style={styles.input} value={user.phone || ""}
            onChange={(e) => setUser({ ...user, phone: e.target.value })}
            placeholder="Phone" />
        ) : (
          <p>{user.phone || "—"}</p>
        )}

        {/* DEPARTMENT */}
        {editMode ? (
          <input style={styles.input} value={user.department || ""}
            onChange={(e) => setUser({ ...user, department: e.target.value })}
            placeholder="Department" />
        ) : (
          <p>{user.department || "—"}</p>
        )}

        {/* ✅ USER TYPE */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>User Type</label>
          {editMode ? (
            <select style={styles.select} value={user.userType || ""}
              onChange={(e) => handleUserTypeChange(e.target.value)}>
              <option value="">— Select —</option>
              <option value="STUDENT">Student</option>
              <option value="STAFF">Staff</option>
            </select>
          ) : (
            <p style={styles.value}>{user.userType || "Not set"}</p>
          )}
        </div>

        {/* ✅ STUDENT ID — shown when userType is STUDENT */}
        {(user.userType === "STUDENT") && (
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Student ID</label>
            {editMode ? (
              <input style={styles.input} value={user.studentId || ""}
                onChange={(e) => setUser({ ...user, studentId: e.target.value })}
                placeholder="Student ID" />
            ) : (
              <p style={styles.value}>{user.studentId || "Not set"}</p>
            )}
          </div>
        )}

        {/* ✅ STAFF ID — shown when userType is STAFF */}
        {(user.userType === "STAFF") && (
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Staff ID</label>
            {editMode ? (
              <input style={styles.input} value={user.staffId || ""}
                onChange={(e) => setUser({ ...user, staffId: e.target.value })}
                placeholder="Staff ID" />
            ) : (
              <p style={styles.value}>{user.staffId || "Not set"}</p>
            )}
          </div>
        )}

        {/* BUTTONS */}
        {!editMode ? (
          <button style={styles.btn} onClick={() => setEditMode(true)}>Edit Profile</button>
        ) : (
          <>
            <button style={styles.btn} onClick={handleSave}>Save Changes</button>
            <button style={{ ...styles.btn, background: "#9ca3af" }} onClick={() => setEditMode(false)}>
              Cancel
            </button>
          </>
        )}

        <button style={styles.danger} onClick={handleDisable}>Disable Account</button>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    background: "#f3f4f6",
  },

  card: {
    width: "420px",
    maxHeight: "80vh",
    overflowY: "auto",
    padding: "20px",
    borderRadius: "16px",
    background: "white",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    textAlign: "center",
  },

  avatar: {
    width: "110px",
    height: "110px",
    borderRadius: "50%",
    objectFit: "cover",
  },

  input: {
    width: "100%",
    padding: "10px",
    margin: "6px 0",
    borderRadius: "8px",
    border: "1px solid #ddd",
  },

  file: {
    margin: "10px 0",
  },

  badge: {
    display: "inline-block",
    padding: "5px 12px",
    borderRadius: "20px",
    background: "#3b82f6",
    color: "white",
    fontSize: "12px",
    margin: "10px 0",
  },

  btn: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "10px",
    border: "none",
    background: "#111827",
    color: "white",
    cursor: "pointer",
  },

  danger: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "10px",
    border: "none",
    background: "#ef4444",
    color: "white",
    cursor: "pointer",
  },

  center: {
    textAlign: "center",
    marginTop: "50px",
  },
};