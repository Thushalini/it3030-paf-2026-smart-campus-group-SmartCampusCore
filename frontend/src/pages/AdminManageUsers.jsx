import { useEffect, useState } from "react";
import {
  getAllUsers,
  assignRole,
  deleteUser,
  updateUser,
} from "../api/adminService";

import { useNavigate } from "react-router-dom";

function AdminManageUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState(null);

  const [roleFilter, setRoleFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers(token);

      // only active users
      const activeUsers = res.data.filter((u) => u.status !== "DISABLED");

      setUsers(activeUsers);
    } catch (err) {
      console.error(err);
      alert("Failed to load users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ROLE UPDATE
  const handleRoleChange = async (id, newRole) => {
    if (!window.confirm(`Change role to ${newRole}?`)) return;

    try {
      await assignRole(id, newRole, token);
      alert("Role updated");
      fetchUsers();
    } catch (err) {
      alert("Role update failed");
    }
  };

  // DISABLE USER
  const handleDisable = async (id) => {
    if (!window.confirm("Disable this user?")) return;

    try {
      await deleteUser(id, token);
      alert("User disabled");
      fetchUsers();
    } catch (err) {
      alert("Disable failed");
    }
  };

  // EDIT
  const handleEdit = (user) => {
    setEditingUser(user);
  };

  // UPDATE USER
  const handleUpdateUser = async () => {
    if (!window.confirm("Save changes?")) return;

    try {
      await updateUser(editingUser.id, editingUser, token);
      alert("User updated");
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert("Update failed");
    }
  };

  // SEARCH + FILTER
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter ? user.role === roleFilter : true;
    const matchesType = typeFilter ? user.userType === typeFilter : true;

    return matchesSearch && matchesRole && matchesType;
  });

  return (
    <div className="h-screen bg-gradient-to-br from-gray-100 to-blue-100 p-6">

      <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-2xl p-6 h-full flex flex-col">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">

          <h2 className="text-3xl font-bold text-gray-800">
            User Management
          </h2>

          <button
            onClick={() => navigate("/admin/disabled-users")}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Disabled Users
          </button>

        </div>

        {/* FILTERS */}
        <div className="flex gap-3 mb-4">

          <input
            type="text"
            placeholder="Search user..."
            className="border px-4 py-2 rounded"
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border px-3 py-2 rounded"
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
            <option value="TECHNICIAN">TECHNICIAN</option>
          </select>

          <select
            className="border px-3 py-2 rounded"
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="STUDENT">STUDENT</option>
            <option value="STAFF">STAFF</option>
          </select>

        </div>

        {/* TABLE SCROLL AREA */}
        <div className="overflow-y-auto flex-grow border rounded-lg">

          <table className="w-full border-collapse">

            <thead className="sticky top-0 bg-gray-200">

              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Department</th>
                <th className="p-3">User Type</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>

            </thead>

            <tbody>

              {filteredUsers.map((user) => (

                <tr key={user.id} className="border-b hover:bg-gray-50">

                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.department || "-"}</td>
                  <td className="p-3">{user.userType}</td>

                  <td className="p-3">

                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                      className="border rounded px-2 py-1"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="TECHNICIAN">TECHNICIAN</option>
                    </select>

                  </td>

                  <td className="p-3">{user.status}</td>

                  <td className="p-3 flex gap-2">

                    <button
                      onClick={() => handleEdit(user)}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDisable(user.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Disable
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {/* EDIT MODAL */}

        {editingUser && (

          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">

            <div className="bg-white p-6 rounded-xl w-96">

              <h3 className="text-xl font-bold mb-4">Edit User</h3>

              <input
                value={editingUser.name}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, name: e.target.value })
                }
                className="border p-2 w-full mb-2"
                placeholder="Name"
              />

              <input 
                value={editingUser.phone || ""} 
                onChange={(e) => 
                  setEditingUser({ ...editingUser, phone: e.target.value }) 
                } 
                className="border p-2 w-full mb-2" 
                placeholder="Phone" 
              />

              <input
                value={editingUser.department || ""}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    department: e.target.value,
                  })
                }
                className="border p-2 w-full mb-2"
                placeholder="Department"
              />

              <select
                value={editingUser.userType}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    userType: e.target.value,
                  })
                }
                className="border p-2 w-full mb-2"
              >
                <option value="STUDENT">STUDENT</option>
                <option value="STAFF">STAFF</option>
              </select>

              {editingUser.userType === "STUDENT" && (
                <input
                  value={editingUser.studentId || ""}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      studentId: e.target.value,
                    })
                  }
                  className="border p-2 w-full mb-2"
                  placeholder="Student ID"
                />
              )}

              {editingUser.userType === "STAFF" && (
                <input
                  value={editingUser.staffId || ""}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      staffId: e.target.value,
                    })
                  }
                  className="border p-2 w-full mb-2"
                  placeholder="Staff ID"
                />
              )}

              <div className="flex justify-end gap-2 mt-4">

                <button
                  onClick={() => setEditingUser(null)}
                  className="bg-gray-400 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>

                <button
                  onClick={handleUpdateUser}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Save
                </button>

              </div>

            </div>

          </div>

        )}

      </div>
    </div>
  );
}

export default AdminManageUsers;