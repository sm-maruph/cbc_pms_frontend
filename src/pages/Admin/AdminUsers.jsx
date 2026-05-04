import React, { useState, useEffect } from "react";

export default function AdminUsers({ user }) {
  const [users, setUsers] = useState(() => {
    const stored = localStorage.getItem("cbcUsers");
    if (!stored) {
      // Initialize with demo admin user
      const demoUsers = [
        {
          id: "admin-1",
          email: "admin@cbc.com",
          name: "Admin User",
          role: "admin",
          department: "IT Management",
          branch: "Head Office",
          registeredAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem("cbcUsers", JSON.stringify(demoUsers));
      return demoUsers;
    }
    return JSON.parse(stored);
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    branch: "",
  });

  const departments = [
    "IT",
    "Finance",
    "Operations",
    "HR",
    "Compliance",
    "Branch Operations",
    "Customer Service",
  ];

  const branches = [
    "Head Office",
    "Colombo Branch",
    "Kandy Branch",
    "Chittagong Branch",
    "Sylhet Branch",
    "Dhaka Branch",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddUser = (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.name.trim() || !formData.email.trim() || !formData.department || !formData.branch) {
      alert("All fields are required");
      return;
    }

    // Check if email already exists
    if (users.some(u => u.email === formData.email)) {
      alert("Email already exists");
      return;
    }

    // Create new user
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      email: formData.email,
      name: formData.name,
      role: "user",
      department: formData.department,
      branch: formData.branch,
      registeredAt: new Date().toISOString(),
      password: "123456", // Default password for new users
    };

    // Add to users list
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem("cbcUsers", JSON.stringify(updatedUsers));

    // Reset form
    setFormData({
      name: "",
      email: "",
      department: "",
      branch: "",
    });
    setShowAddForm(false);
  };

  const handleDeleteUser = (userId) => {
    if (confirm("Are you sure you want to delete this user?")) {
      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
      localStorage.setItem("cbcUsers", JSON.stringify(updatedUsers));
    }
  };

  const getRoleColor = (role) => {
    return role === "admin"
      ? "bg-red-100 text-red-800 border-red-300"
      : "bg-blue-100 text-blue-800 border-blue-300";
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              User Management
            </h1>
            <p className="text-gray-600">
              Total Users: <span className="font-semibold">{users.length}</span>
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-6 rounded-lg shadow transition transform hover:scale-105"
          >
            + Register New User
          </button>
        </div>

        {/* ADD USER FORM */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Register New User</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-600 focus:outline-none bg-white text-gray-900 transition"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-600 focus:outline-none bg-white text-gray-900 transition"
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Department <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-600 focus:outline-none bg-white text-gray-900 transition"
                    required
                  >
                    <option value="">Select a department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Branch <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-600 focus:outline-none bg-white text-gray-900 transition"
                    required
                  >
                    <option value="">Select a branch</option>
                    {branches.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-lg transition"
                >
                  Register User
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* USERS TABLE */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg font-semibold mb-2">No users registered</p>
              <p>Click "Register New User" to add users</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Branch</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Registered</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{u.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{u.department}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{u.branch}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRoleColor(u.role)}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(u.registeredAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {u.id !== user.id && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-red-600 hover:text-red-800 font-semibold text-sm"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* DEFAULT PASSWORD INFO */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">ℹ️ Note:</span> All newly registered users have the default password <span className="font-mono bg-blue-100 px-2 py-1 rounded">123456</span>. They should change it on first login.
          </p>
        </div>
      </div>
    </div>
  );
}
