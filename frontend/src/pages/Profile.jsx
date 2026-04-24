import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = sessionStorage.getItem("token");
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
    if (!window.confirm("Save changes?")) return;

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

    setEditMode(false);
    fetchProfile();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(`${API}/upload-pic`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      fetchProfile();
      alert("Profile picture updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to upload image");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!user) return <p className="text-center mt-10">No user found</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-15">

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
      >

        {/* TOP BANNER */}
        <div className="h-28 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

        {/* Avatar */}
        <div className="flex flex-col items-center -mt-16">
          <label className="cursor-pointer relative group">
            <motion.img
              whileHover={{ scale: 1.05 }}
              src={
                user.profileImage?.trim()
                  ? `http://localhost:8080/${user.profileImage.replace(/^\/+/, '')}`
                  : `https://ui-avatars.com/api/?name=${user.name}`
              }
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg transition-opacity group-hover:opacity-80"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white bg-black bg-opacity-50 px-2 py-1 rounded text-xs font-semibold">Change</span>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          </label>

          <h2 className="mt-4 text-xl font-semibold">{user.name}</h2>
          <p className="text-gray-500 text-sm">{user.email}</p>

          <span className="mt-2 px-4 py-1 text-xs rounded-full bg-blue-500 text-white">
            {user.role}
          </span>
        </div>

        {/* Fields */}
        <div className="px-6 py-4 space-y-4 mt-4">

          <InputField label="Phone" value={user.phone} editMode={editMode}
            onChange={(val) => setUser({ ...user, phone: val })} />

          <InputField label="Department" value={user.department} editMode={editMode}
            onChange={(val) => setUser({ ...user, department: val })} />

          {/* User Type */}
          <div>
            <label className="text-sm text-gray-500">User Type</label>
            {editMode ? (
              <select
                className="w-full mt-1 p-2 rounded-lg border"
                value={user.userType || ""}
                onChange={(e) => setUser({ ...user, userType: e.target.value })}
              >
                <option value="">Select</option>
                <option value="STUDENT">Student</option>
                <option value="STAFF">Staff</option>
              </select>
            ) : (
              <p className="font-medium">{user.userType || "-"}</p>
            )}
          </div>

          {/* Conditional Fields */}
          {user.userType === "STUDENT" && (
            <InputField label="Student ID" value={user.studentId} editMode={editMode}
              onChange={(val) => setUser({ ...user, studentId: val })} />
          )}

          {user.userType === "STAFF" && (
            <InputField label="Staff ID" value={user.staffId} editMode={editMode}
              onChange={(val) => setUser({ ...user, staffId: val })} />
          )}
        </div>

        {/* Buttons */}
        <div className="mt-6 space-y-2">
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="w-full py-2 rounded-xl bg-black text-white hover:bg-gray-800 transition"
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="w-full py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Save Changes
              </button>

              <button
                onClick={() => setEditMode(false)}
                className="w-full py-2 rounded-xl bg-gray-300 hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </>
          )}

          <button className="w-full py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition">
            Disable Account
          </button>
        </div>

      </motion.div>
    </div>
  );
}

function InputField({ label, value, editMode, onChange }) {
  return (
    <div>
      <label className="text-sm text-gray-500">{label}</label>
      {editMode ? (
        <input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full mt-1 p-2 rounded-lg border focus:ring-2 focus:ring-blue-400 outline-none transition"
        />
      ) : (
        <p className="font-medium">{value || "-"}</p>
      )}
    </div>
  );
}
