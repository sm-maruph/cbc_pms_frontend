import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import {
  Search, Filter, Clock, User, Server, AlertCircle,
  CheckCircle, Edit, Trash2, Plus, X,
  Activity, TrendingUp, FileText, Zap, AlertTriangle
} from "lucide-react";

// Import API functions
import { getTickets, updateTicket, deleteTicket } from "../../services/api";

/* USERS (for assignee names – kept as is) */
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

const statusConfig = {
  open: { color: "bg-red-100 text-red-700 border-red-200", icon: AlertCircle, label: "Open" },
  "in-progress": { color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Activity, label: "In Progress" },
  resolved: { color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle, label: "Resolved" }
};

const riskConfig = {
  low: { color: "bg-blue-100 text-blue-700", label: "Low" },
  medium: { color: "bg-orange-100 text-orange-700", label: "Medium" },
  high: { color: "bg-red-100 text-red-700", label: "High" }
};

const COLORS = {
  open: "#ef4444",
  "in-progress": "#eab308",
  resolved: "#22c55e",
  low: "#3b82f6",
  medium: "#f97316",
  high: "#ef4444"
};

export default function UserDashboard({ user }) {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editTicket, setEditTicket] = useState(null);
  const [deleteWarning, setDeleteWarning] = useState(null);
  const [resolutionPopup, setResolutionPopup] = useState(null);
  const [resolutionData, setResolutionData] = useState({ rootCause: "", upTime: "" });

  const [notifications, setNotifications] = useState([]);

  const token = localStorage.getItem("cbcToken");
  console.log("UserDashboard mounted with token:", token);

  // Helper: convert API ticket object to local format (preserves all expected fields)
  const formatTicket = (apiTicket) => ({
    ...apiTicket,
    id: apiTicket.id.toString(),
    riskLevel: apiTicket.risk_label ? apiTicket.risk_label.toLowerCase() : "low",
    reportedByName: apiTicket.reportedByName || "",
    assignedToName: apiTicket.assigned_to_name
      ? (defaultUsers.find(u => u.email === apiTicket.assigned_to_name)?.name || apiTicket.assigned_to_name)
      : "",
    downTime: apiTicket.down_time ? new Date(apiTicket.down_time).toLocaleString() : "",
    upTime: apiTicket.up_time ? new Date(apiTicket.up_time).toLocaleString() : "",
    date: apiTicket.date ? new Date(apiTicket.date).toISOString().split("T")[0] : "",
  });

  // Fetch tickets from API
  const fetchTickets = async () => {
    if (!token) {
      notify("Not authenticated", "error");
      return;
    }
    try {
      console.log("Fetching tickets with token:", token.slice(0, 20) + "...");
      const data = await getTickets(token);
      console.log("Raw API response:", data);
      setTickets(data.map(formatTicket));
    } catch (err) {
      notify("Failed to load tickets", "error");
      console.error(err);
    }
  };

  // useEffect(() => {
  //   fetchTickets();
  // }, []); // runs once on mount



  useEffect(() => {
    const fetchTickets = async () => {
        if (!token) {
            console.log("No token, skipping fetch");
            return;
        }
        try {
            const data = await getTickets(token);
            console.log("Tickets received:", data);
            setTickets(data.map(formatTicket));
        } catch (err) {
            notify("Failed to load tickets", "error");
            console.error(err);
        }
    };
    fetchTickets();
}, [token]); // re‑fetch when token changes

  // Notification helper (unchanged)
  const notify = (msg, type = "success") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  // Update field in edit modal
  const updateField = (field, value) => {
    setEditTicket((prev) => ({ ...prev, [field]: value }));
  };

  const setClock = (field) => {
    updateField(field, new Date().toLocaleString());
  };

  // Save edited ticket – send only changed fields to API
  const saveTicket = async () => {
    if (!editTicket) return;
    try {
      const payload = {};
      if (editTicket.systemName !== undefined) payload.system_name = editTicket.systemName;
      if (editTicket.department !== undefined) payload.department = editTicket.department;
      if (editTicket.branch !== undefined) payload.branch = editTicket.branch;
      if (editTicket.affectedUser !== undefined) payload.affected_user = editTicket.affectedUser;
      if (editTicket.riskLevel !== undefined) payload.risk_label = editTicket.riskLevel.toUpperCase();
      if (editTicket.downTime !== undefined) payload.down_time = editTicket.downTime;
      if (editTicket.upTime !== undefined) payload.up_time = editTicket.upTime;
      if (editTicket.problemDetails !== undefined) payload.problem_details = editTicket.problemDetails;

      await updateTicket(editTicket.id, payload, token);
      notify("Ticket updated successfully");
      setSelectedTicket(null);
      setEditTicket(null);
      fetchTickets(); // refresh list
    } catch (err) {
      notify("Update failed", "error");
    }
  };

  const confirmDelete = (id) => {
    setDeleteWarning(id);
  };

  const handleDelete = async (id) => {
    try {
      await deleteTicket(id, token);
      notify("Ticket deleted successfully");
      setSelectedTicket(null);
      setEditTicket(null);
      setDeleteWarning(null);
      fetchTickets();
    } catch (err) {
      notify("Delete failed", "error");
    }
  };

  // Helper to update just status (without popup) for non‑resolved transitions
  const updateTicketStatus = async (id, newStatus) => {
    try {
      await updateTicket(id, { status: newStatus }, token);
      notify("Status updated");
      fetchTickets();
    } catch (err) {
      notify("Status update failed", "error");
    }
  };

  // Status change handler – shows resolution popup only when moving to "resolved"
  const handleStatusChange = (ticket, newStatus) => {
    if (newStatus === "resolved") {
      setResolutionPopup(ticket);
      setResolutionData({
        rootCause: ticket.rootCause || "",
        upTime: ticket.upTime || ""
      });
    } else {
      updateTicketStatus(ticket.id, newStatus);
    }
  };

  // Confirm resolution with root cause and up time
  const confirmResolution = async () => {
    try {
      await updateTicket(resolutionPopup.id, {
        status: "resolved",
        root_cause: resolutionData.rootCause,
        up_time: resolutionData.upTime,
      }, token);
      notify("Ticket resolved successfully");
      setResolutionPopup(null);
      setResolutionData({ rootCause: "", upTime: "" });
      fetchTickets();
    } catch (err) {
      notify("Resolution failed", "error");
    }
  };

  const setUpTimeNow = () => {
    setResolutionData(prev => ({
      ...prev,
      upTime: new Date().toLocaleString()
    }));
  };

  // Stats derived from tickets (replaces old localStorage stats)
  const stats = useMemo(() => {
    const open = tickets.filter(t => t.status === "open").length;
    const progress = tickets.filter(t => t.status === "in-progress").length;
    const resolved = tickets.filter(t => t.status === "resolved").length;
    const highRisk = tickets.filter(t => t.riskLevel === "high").length;
    const mediumRisk = tickets.filter(t => t.riskLevel === "medium").length;
    const lowRisk = tickets.filter(t => t.riskLevel === "low").length;
    return { open, progress, resolved, total: tickets.length, highRisk, mediumRisk, lowRisk };
  }, [tickets]);

  // Filtered and sorted tickets
  const filtered = useMemo(() => {
    return tickets
      .filter((t) => filterStatus === "all" || t.status === filterStatus)
      .filter((t) =>
        (t.systemName || "").toLowerCase().includes(search.toLowerCase()) ||
        (t.reportedByName || "").toLowerCase().includes(search.toLowerCase()) ||
        (t.problemDetails || "").toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === "date") return new Date(b.date) - new Date(a.date);
        if (sortBy === "status") return a.status.localeCompare(b.status);
        if (sortBy === "risk") {
          const riskOrder = { high: 3, medium: 2, low: 1 };
          return (riskOrder[b.riskLevel] || 1) - (riskOrder[a.riskLevel] || 1);
        }
        return 0;
      });
  }, [tickets, search, filterStatus, sortBy]);

  const statusChartData = [
    { name: "Open", value: stats.open, color: COLORS.open },
    { name: "In Progress", value: stats.progress, color: COLORS["in-progress"] },
    { name: "Resolved", value: stats.resolved, color: COLORS.resolved },
  ].filter(item => item.value > 0);

  const riskChartData = [
    { name: "Low Risk", value: stats.lowRisk, color: COLORS.low },
    { name: "Medium Risk", value: stats.mediumRisk, color: COLORS.medium },
    { name: "High Risk", value: stats.highRisk, color: COLORS.high },
  ].filter(item => item.value > 0);

  // Ensure riskLevel exists for all tickets (fallback)
  useEffect(() => {
    if (tickets.some(t => !t.riskLevel)) {
      const fixed = tickets.map(t => ({ ...t, riskLevel: t.riskLevel || "low" }));
      setTickets(fixed);
    }
  }, [tickets]);

  // ----------------------------------------------------------------------
  // JSX – exactly the same as your original, no design changes
  // ----------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">

      {/* NOTIFICATIONS */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 animate-slide-in ${
              n.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            {n.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-medium">{n.msg}</span>
          </div>
        ))}
      </div>

      {/* RESOLUTION POPUP */}
      {resolutionPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Resolve Ticket</h3>
                <p className="text-sm text-gray-500">#{resolutionPopup.id} - {resolutionPopup.systemName}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Root Cause <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Describe the root cause of the issue..."
                  value={resolutionData.rootCause}
                  onChange={(e) => setResolutionData(prev => ({ ...prev, rootCause: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Up Time <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Select date/time or click Now"
                    value={resolutionData.upTime}
                    onChange={(e) => setResolutionData(prev => ({ ...prev, upTime: e.target.value }))}
                    required
                  />
                  <button
                    onClick={setUpTimeNow}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-sm font-medium"
                  >
                    <Clock size={16} />
                    Now
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setResolutionPopup(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmResolution}
                disabled={!resolutionData.rootCause || !resolutionData.upTime}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE WARNING MODAL */}
      {deleteWarning && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Delete Ticket</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this ticket? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteWarning(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteWarning)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Incident Dashboard
            </h1>
            <p className="text-gray-500 mt-1">Welcome back, {user.name}</p>
          </div>
          <Link
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
            to="/create-ticket"
          >
            <Plus size={18} />
            New Ticket
          </Link>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs">Total</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="text-blue-600" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs">Open</p>
              <p className="text-2xl font-bold text-red-600">{stats.open}</p>
            </div>
            <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="text-red-600" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.progress}</p>
            </div>
            <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Activity className="text-yellow-600" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            </div>
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* PIE CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <h2 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <TrendingUp size={18} /> Status Distribution
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <h2 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <AlertCircle size={18} /> Risk Distribution
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={riskChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {riskChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-xl shadow-sm p-3 mb-4 border border-gray-100">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              className="pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search..."
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setFilterStatus(e.target.value)}
            value={filterStatus}
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setSortBy(e.target.value)}
            value={sortBy}
          >
            <option value="date">Sort by Date</option>
            <option value="status">Sort by Status</option>
            <option value="risk">Sort by Risk</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-3 text-left font-semibold text-gray-600">#</th>
                <th className="p-3 text-left font-semibold text-gray-600">Date</th>
                <th className="p-3 text-left font-semibold text-gray-600">Reported By</th>
                <th className="p-3 text-left font-semibold text-gray-600">Assigned To</th>
                <th className="p-3 text-left font-semibold text-gray-600">System</th>
                <th className="p-3 text-left font-semibold text-gray-600">Problem</th>
                <th className="p-3 text-left font-semibold text-gray-600">Down Time</th>
                <th className="p-3 text-left font-semibold text-gray-600">Up Time</th>
                <th className="p-3 text-left font-semibold text-gray-600">Risk</th>
                <th className="p-3 text-left font-semibold text-gray-600">Status</th>
                <th className="p-3 text-center font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <FileText size={32} />
                      <p>No tickets found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((t, i) => {
                  const risk = riskConfig[t.riskLevel] || riskConfig.low;
                  return (
                    <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="p-3 text-gray-500">{i + 1}</td>
                      <td className="p-3 text-gray-600 whitespace-nowrap">{t.date}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <User size={12} className="text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-700">{t.reportedByName}</span>
                        </div>
                       </td>
                      <td className="p-3 text-gray-600">{t.assignedToName || "-"}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <Server size={12} className="text-gray-400" />
                          <span className="text-gray-700">{t.systemName}</span>
                        </div>
                       </td>
                      <td className="p-3 text-gray-600 max-w-[180px] truncate" title={t.problemDetails}>
                        {t.problemDetails}
                       </td>
                      <td className="p-3 text-gray-500 text-xs whitespace-nowrap">
                        {t.downTime ? (
                          <div className="flex items-center gap-1">
                            <Clock size={12} />
                            {t.downTime}
                          </div>
                        ) : "-"}
                       </td>
                      <td className="p-3 text-gray-500 text-xs whitespace-nowrap">
                        {t.upTime ? (
                          <div className="flex items-center gap-1">
                            <Clock size={12} />
                            {t.upTime}
                          </div>
                        ) : "-"}
                       </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${risk.color}`}>
                          {risk.label}
                        </span>
                       </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <div className={`h-1.5 w-1.5 rounded-full ${t.status === "open" ? "bg-red-500" : t.status === "in-progress" ? "bg-yellow-500" : "bg-green-500"}`} />
                          <select
                            value={t.status}
                            onChange={(e) => handleStatusChange(t, e.target.value)}
                            className="text-xs border-0 bg-transparent focus:ring-1 focus:ring-blue-500 rounded cursor-pointer"
                          >
                            <option value="open">Open</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </div>
                       </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                            onClick={() => {
                              setSelectedTicket(t);
                              setEditTicket({ ...t });
                            }}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                            onClick={() => confirmDelete(t.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                       </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL */}
      {selectedTicket && editTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Edit Ticket</h2>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1 hover:bg-gray-100 rounded transition"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">System Name</label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editTicket.systemName || ""}
                    onChange={(e) => updateField("systemName", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editTicket.department || ""}
                    onChange={(e) => updateField("department", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editTicket.branch || ""}
                    onChange={(e) => updateField("branch", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Affected User</label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editTicket.affectedUser || ""}
                    onChange={(e) => updateField("affectedUser", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editTicket.riskLevel || "low"}
                    onChange={(e) => updateField("riskLevel", e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Down Time</label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editTicket.downTime || ""}
                      onChange={(e) => updateField("downTime", e.target.value)}
                      placeholder="Select or click clock"
                    />
                    <button
                      onClick={() => setClock("downTime")}
                      className="px-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm"
                    >
                      Clock
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Up Time</label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editTicket.upTime || ""}
                      onChange={(e) => updateField("upTime", e.target.value)}
                      placeholder="Select or click clock"
                    />
                    <button
                      onClick={() => setClock("upTime")}
                      className="px-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm"
                    >
                      Clock
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Problem Details</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editTicket.problemDetails || ""}
                  onChange={(e) => updateField("problemDetails", e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between items-center p-4 border-t border-gray-100 bg-gray-50">
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                onClick={() => {
                  setSelectedTicket(null);
                  confirmDelete(editTicket.id);
                }}
              >
                <Trash2 size={14} />
                Delete
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={saveTicket}
                  className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:shadow-lg transition text-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}


