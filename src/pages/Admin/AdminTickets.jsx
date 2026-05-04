import React, { useState, useMemo } from "react";

const defaultUsers = [
  { email: "jahidul@cbc.com", name: "Jahidul Balat" },
  { email: "sifat@cbc.com", name: "Sifat Nur Billah" },
  { email: "supriya@cbc.com", name: "Supriya Das Gupta" },
  { email: "tanim@cbc.com", name: "Tanim Mahmud" },
  { email: "cito@cbc.com", name: "CITO" },
  { email: "eazuddin@cbc.com", name: "Eaz Uddin" },
  { email: "tudu@cbc.com", name: "Tudu" },
  { email: "abubakar@cbc.com", name: "Abu Bakar Siddiq" },
  { email: "shah@cbc.com", name: "Shah Mohammad Al Noor" },
  { email: "salman@cbc.com", name: "Salman Ahmed" },
  { email: "sm.maruph@cbc.com", name: "S. M. Maruph" },
  { email: "raiyan@cbc.com", name: "Raiyan" },
];

export default function AdminTickets({ user }) {
  const [tickets, setTickets] = useState(() => {
    const stored = localStorage.getItem("cbcTickets");
    return stored ? JSON.parse(stored) : [];
  });

  const [filterStatus, setFilterStatus] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const availableUsers = useMemo(() => {
    const stored = localStorage.getItem("cbcUsers");
    const usersMap = new Map();

    if (stored) {
      JSON.parse(stored).forEach((u) => {
        if (u.email) usersMap.set(u.email, { email: u.email, name: u.name });
      });
    }

    defaultUsers.forEach((u) => usersMap.set(u.email, u));
    if (user?.email) usersMap.set(user.email, { email: user.email, name: user.name });

    return Array.from(usersMap.values());
  }, [user]);

  // Filter tickets
  const filteredTickets =
    filterStatus === "all"
      ? tickets
      : tickets.filter((t) => t.status === filterStatus);

  const getRiskColor = (risk) => {
    const colors = {
      HIGH: "bg-red-100 text-red-800 border-red-300",
      MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-300",
      LOW: "bg-green-100 text-green-800 border-green-300",
    };
    return colors[risk] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getStatusColor = (status) => {
    const colors = {
      open: "bg-blue-100 text-blue-800 border-blue-300",
      "in-progress": "bg-orange-100 text-orange-800 border-orange-300",
      resolved: "bg-green-100 text-green-800 border-green-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const handleEditClick = (ticket) => {
    setEditingId(ticket.id);
    setEditData({
      ...ticket,
      assignedToEmail: ticket.assignedToEmail || "",
      assignedToName: ticket.assignedToName || ticket.assignedTo || "",
    });
  };

  const handleSave = () => {
    const assigned = availableUsers.find((u) => u.email === editData.assignedToEmail);
    const updatedTickets = tickets.map((t) =>
      t.id === editData.id
        ? {
            ...editData,
            assignedToEmail: editData.assignedToEmail || "",
            assignedToName: assigned?.name || editData.assignedToName || editData.assignedTo || "",
          }
        : t
    );
    setTickets(updatedTickets);
    localStorage.setItem("cbcTickets", JSON.stringify(updatedTickets));
    setEditingId(null);
    setEditData({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Manage Tickets</h1>
          <p className="text-gray-600">
            Total Tickets: <span className="font-semibold">{tickets.length}</span>
          </p>
        </div>

        {/* FILTERS */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filterStatus === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              All ({tickets.length})
            </button>
            <button
              onClick={() => setFilterStatus("open")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filterStatus === "open"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Open ({tickets.filter((t) => t.status === "open").length})
            </button>
            <button
              onClick={() => setFilterStatus("in-progress")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filterStatus === "in-progress"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              In Progress ({tickets.filter((t) => t.status === "in-progress").length})
            </button>
            <button
              onClick={() => setFilterStatus("resolved")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filterStatus === "resolved"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Resolved ({tickets.filter((t) => t.status === "resolved").length})
            </button>
          </div>
        </div>

        {/* TICKETS TABLE */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredTickets.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg font-semibold mb-2">No tickets found</p>
              <p>No tickets with this status</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">S/L</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Reported By</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Assigned To</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">System</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Branch</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Risk</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Instruction</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTickets.map((ticket) => {
                    const assignedTo = ticket.assignedToName || ticket.assignedTo || "Unassigned";
                    return (
                      <tr key={ticket.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{ticket.sl}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(ticket.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{ticket.reportedByName || ticket.reportedBy}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{assignedTo}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{ticket.systemName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{ticket.department}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{ticket.branch}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRiskColor(ticket.riskLabel)}`}>
                            {ticket.riskLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {ticket.specialInstruction ? (
                            <span className="inline-flex items-center rounded-full bg-yellow-50 text-yellow-800 px-3 py-1 text-xs font-semibold border border-yellow-200">
                              {ticket.specialInstruction}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(ticket.status)}`}>
                            {ticket.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleEditClick(ticket)}
                            className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* EDIT MODAL */}
        {editingId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Edit Ticket #{editData.sl}</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                    <select
                      value={editData.status}
                      onChange={(e) => handleInputChange("status", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Assigned To</label>
                    <select
                      value={editData.assignedToEmail || ""}
                      onChange={(e) => handleInputChange("assignedToEmail", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                    >
                      <option value="">Unassigned</option>
                      {availableUsers.map((u) => (
                        <option key={u.email} value={u.email}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Down Time</label>
                    <input
                      type="text"
                      value={editData.downTime || ""}
                      onChange={(e) => handleInputChange("downTime", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                      placeholder="e.g., 9:30 AM"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Up Time</label>
                    <input
                      type="text"
                      value={editData.upTime || ""}
                      onChange={(e) => handleInputChange("upTime", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                      placeholder="e.g., 11:45 AM"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Special Instruction</label>
                  <textarea
                    value={editData.specialInstruction || ""}
                    onChange={(e) => handleInputChange("specialInstruction", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 resize-none"
                    rows="3"
                    placeholder="Add a special instruction for the assigned user"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Resolution</label>
                  <textarea
                    value={editData.resolution || ""}
                    onChange={(e) => handleInputChange("resolution", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 resize-none"
                    rows="3"
                    placeholder="How was the issue resolved?"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Remarks by Supervisor</label>
                  <textarea
                    value={editData.remarksByAdmin || ""}
                    onChange={(e) => handleInputChange("remarksByAdmin", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 resize-none"
                    rows="2"
                    placeholder="Additional remarks..."
                  ></textarea>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
