import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function UserDashboard({ user }) {
  const [tickets, setTickets] = useState(() => {
    const stored = localStorage.getItem("cbcTickets");
    return stored ? JSON.parse(stored) : [];
  });

  const [filterStatus, setFilterStatus] = useState("all");

  const relatedTickets = tickets.filter((t) => {
    const assignedEmail = t.assignedToEmail || "";
    const assignedName = t.assignedToName || t.assignedTo || "";
    return (
      t.reportedBy === user.email ||
      assignedEmail === user.email ||
      assignedName === user.name ||
      assignedEmail === user.email
    );
  });

  const filteredTickets =
    filterStatus === "all"
      ? tickets
      : tickets.filter((t) => t.status === filterStatus);

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in-progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    related: relatedTickets.length,
  };

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

  const shouldShowInstruction = (ticket) => {
    const assignedEmail = ticket.assignedToEmail || "";
    const assignedName = ticket.assignedToName || ticket.assignedTo || "";
    return (
      ticket.specialInstruction &&
      (ticket.reportedBy === user.email || assignedEmail === user.email || assignedName === user.name)
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Incident Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, <span className="font-semibold">{user.name}</span>. All registered users can view tickets and assignment updates here.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
            <p className="text-gray-600 text-sm font-semibold mb-1">Total Incidents</p>
            <p className="text-4xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <p className="text-gray-600 text-sm font-semibold mb-1">Open</p>
            <p className="text-4xl font-bold text-gray-900">{stats.open}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <p className="text-gray-600 text-sm font-semibold mb-1">In Progress</p>
            <p className="text-4xl font-bold text-gray-900">{stats.inProgress}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
            <p className="text-gray-600 text-sm font-semibold mb-1">Resolved</p>
            <p className="text-4xl font-bold text-gray-900">{stats.resolved}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
            <p className="text-gray-600 text-sm font-semibold mb-1">Your Related Tickets</p>
            <p className="text-4xl font-bold text-gray-900">{stats.related}</p>
          </div>
        </div>

        <div className="mb-6">
          <Link
            to="/create-ticket"
            className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-lg shadow transition transform hover:scale-105"
          >
            + Create New Ticket
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { status: "all", label: "All" },
              { status: "open", label: "Open" },
              { status: "in-progress", label: "In Progress" },
              { status: "resolved", label: "Resolved" },
            ].map((item) => (
              <button
                key={item.status}
                onClick={() => setFilterStatus(item.status)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filterStatus === item.status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredTickets.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg font-semibold mb-2">No tickets found</p>
              <p>
                {filterStatus === "all"
                  ? "Create your first ticket to get started!"
                  : "No tickets with this status."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">S/L</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">System</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Reported By</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Assigned To</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Special Instruction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTickets.map((ticket, idx) => {
                    const assignedTo = ticket.assignedToName || ticket.assignedTo || "Unassigned";
                    return (
                      <tr key={ticket.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{idx + 1}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(ticket.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{ticket.systemName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{ticket.reportedByName || ticket.reportedBy}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{assignedTo}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(ticket.status)}`}>
                            {ticket.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {shouldShowInstruction(ticket) ? (
                            <span className="block rounded-full bg-yellow-50 text-yellow-800 px-3 py-1 text-xs font-semibold border border-yellow-200">
                              {ticket.specialInstruction}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
