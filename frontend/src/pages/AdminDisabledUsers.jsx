import { useEffect, useState } from "react";
import { getAllUsers, enableUser } from "../api/adminService";
import { useNavigate } from "react-router-dom";

function AdminDisabledUsers() {

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
        const res = await getAllUsers(token);

        const disabled = res.data.filter(u => u.status === "DISABLED");

        setUsers(disabled);
    } catch (err) {
        console.error("Error fetching users", err);
    }
};

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEnable = async (id) => {

    if (!window.confirm("Enable this user?")) return;

    await enableUser(id, token);

    alert("User enabled");

    fetchUsers();
  };

  // 🔎 Search filter
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase()) ||
    user.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">

      <h2 className="text-2xl font-bold mb-4">
        Disabled Users
      </h2>

      {/* 🔎 Search + Back Button in same line */}
      <div className="mb-4 flex items-center justify-between gap-4">

        <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            className="border px-4 py-2 rounded w-full max-w-md"
            onChange={(e) => setSearch(e.target.value)}
        />

        {/* 🔙 Manage Users Button */}
        <button
            onClick={() => navigate("/admin/manage-users")}
            className="bg-green-500 text-white px-4 py-2 rounded whitespace-nowrap"
        >
            Manage Users
        </button>

      </div>

      <table className="w-full border">

        <thead className="bg-gray-200">

          <tr>
            <th className="p-3">Name</th>
            <th>Email</th>
            <th>Action</th>
          </tr>

        </thead>

        <tbody>

          {users.map(user => (

            <tr key={user.id} className="border-b">

              <td className="p-3">{user.name}</td>
              <td>{user.email}</td>

              <td>

                <button
                  onClick={() => handleEnable(user.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Enable
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default AdminDisabledUsers;