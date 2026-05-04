import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function AdminDashboard({ user }) {
  const [tickets, setTickets] = useState(() => {
    const stored = localStorage.getItem("cbcTickets");
    return stored ? JSON.parse(stored) : [];
  });

  const [users, setUsers] = useState(() => {
    const stored = localStorage.getItem("cbcUsers");
    return stored ? JSON.parse(stored) : [];
  });

  // Calculate statistics
  const stats = {
    totalTickets: tickets.length,
    totalUsers: users.length,
    openTickets: tickets.filter(t => t.status === "open").length,
    inProgressTickets: tickets.filter(t => t.status === "in-progress").length,
    resolvedTickets: tickets.filter(t => t.status === "resolved").length,
    highRiskTickets: tickets.filter(t => t.riskLabel === "HIGH").length,
  };

  // Get recent tickets
  const recentTickets = tickets
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, <span className="font-semibold">{user.name}</span>
          </p>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Tickets */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
            <p className="text-gray-600 text-sm font-semibold mb-1">Total Tickets</p>
            <p className="text-4xl font-bold text-gray-900">{stats.totalTickets}</p>
            <p className="text-xs text-gray-500 mt-2">Across all departments</p>
          </div>

          {/* Open Tickets */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <p className="text-gray-600 text-sm font-semibold mb-1">Open Tickets</p>
            <p className="text-4xl font-bold text-gray-900">{stats.openTickets}</p>
            <p className="text-xs text-gray-500 mt-2">Awaiting assignment</p>
          </div>

          {/* In Progress */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <p className="text-gray-600 text-sm font-semibold mb-1">In Progress</p>
            <p className="text-4xl font-bold text-gray-900">{stats.inProgressTickets}</p>
            <p className="text-xs text-gray-500 mt-2">Being worked on</p>
          </div>

          {/* Resolved */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
            <p className="text-gray-600 text-sm font-semibold mb-1">Resolved</p>
            <p className="text-4xl font-bold text-gray-900">{stats.resolvedTickets}</p>
            <p className="text-xs text-gray-500 mt-2">Completed today</p>
          </div>

          {/* High Risk */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600">
            <p className="text-gray-600 text-sm font-semibold mb-1">High Risk</p>
            <p className="text-4xl font-bold text-gray-900">{stats.highRiskTickets}</p>
            <p className="text-xs text-gray-500 mt-2">Needs immediate attention</p>
          </div>

          {/* Registered Users */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
            <p className="text-gray-600 text-sm font-semibold mb-1">Registered Users</p>
            <p className="text-4xl font-bold text-gray-900">{stats.totalUsers}</p>
            <p className="text-xs text-gray-500 mt-2">Active accounts</p>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/admin/tickets"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-lg shadow transition transform hover:scale-105 text-center"
          >
            📋 Manage Tickets
          </Link>
          <Link
            to="/admin/users"
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-6 rounded-lg shadow transition transform hover:scale-105 text-center"
          >
            👥 Manage Users
          </Link>
          <Link
            to="/admin"
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 px-6 rounded-lg shadow transition transform hover:scale-105 text-center"
          >
            📊 Generate Reports
          </Link>
        </div>

        {/* RECENT TICKETS */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Recent Tickets</h2>
          </div>
          {recentTickets.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No tickets yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">S/L</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Reported By</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">System</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Problem</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Risk</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentTickets.map((ticket, idx) => (
                    <tr key={ticket.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {ticket.sl}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(ticket.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {ticket.reportedByName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {ticket.systemName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {ticket.problemDetails.substring(0, 30)}...
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          ticket.riskLabel === "HIGH" 
                            ? "bg-red-100 text-red-800 border border-red-300"
                            : ticket.riskLabel === "MEDIUM"
                            ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                            : "bg-green-100 text-green-800 border border-green-300"
                        }`}>
                          {ticket.riskLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          ticket.status === "open"
                            ? "bg-blue-100 text-blue-800 border border-blue-300"
                            : ticket.status === "in-progress"
                            ? "bg-orange-100 text-orange-800 border border-orange-300"
                            : "bg-green-100 text-green-800 border border-green-300"
                        }`}>
                          {ticket.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="p-6 border-t border-gray-200">
            <Link
              to="/admin/tickets"
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
            >
              View all tickets →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
