import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Clock, User, Server, AlertCircle, CheckCircle,
  Activity, FileText, Plus, X, Eye, Calendar,
  Search, Filter, Edit
} from "lucide-react";

// Import API functions
import { getMyTickets, updateTicket } from "../../services/api";

const statusConfig = {
  open: { color: "bg-red-100 text-red-700 border-red-200", label: "Open", icon: AlertCircle },
  "in-progress": { color: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "In Progress", icon: Activity },
  resolved: { color: "bg-green-100 text-green-700 border-green-200", label: "Resolved", icon: CheckCircle }
};

const riskConfig = {
  low: { color: "bg-blue-100 text-blue-700", label: "Low" },
  medium: { color: "bg-orange-100 text-orange-700", label: "Medium" },
  high: { color: "bg-red-100 text-red-700", label: "High" }
};

export default function MyTickets({ user }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("assigned");
  const [search, setSearch] = useState("");
  const [viewTicket, setViewTicket] = useState(null);
  const [editTicket, setEditTicket] = useState(null);
  const [resolutionPopup, setResolutionPopup] = useState(null);
  const [resolutionData, setResolutionData] = useState({ rootCause: "", upTime: "" });
  const [notifications, setNotifications] = useState([]);

  const token = localStorage.getItem("cbcToken");
  const currentUserEmail = user?.email || localStorage.getItem("userEmail");
  const currentUserName = user?.name || currentUserEmail?.split('@')[0] || "User";

  // Fetch tickets
  const fetchTickets = async () => {
    if (!token) {
      notify("Not authenticated", "error");
      setLoading(false);
      return;
    }
    try {
      const data = await getMyTickets(token);
      setTickets(data);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      notify("Failed to load tickets", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [token]);

  // Notification helper
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

  // Save edited ticket
  const saveTicket = async () => {
    if (!editTicket) return;
    try {
      const payload = {};
      if (editTicket.system_name !== undefined) payload.system_name = editTicket.system_name;
      if (editTicket.department !== undefined) payload.department = editTicket.department;
      if (editTicket.branch !== undefined) payload.branch = editTicket.branch;
      if (editTicket.affected_user !== undefined) payload.affected_user = editTicket.affected_user;
      if (editTicket.risk_label !== undefined) payload.risk_label = editTicket.risk_label;
      if (editTicket.down_time !== undefined) payload.down_time = editTicket.down_time;
      if (editTicket.up_time !== undefined) payload.up_time = editTicket.up_time;
      if (editTicket.problem_details !== undefined) payload.problem_details = editTicket.problem_details;
      if (editTicket.pc_name !== undefined) payload.pc_name = editTicket.pc_name;
      if (editTicket.remarks !== undefined) payload.remarks = editTicket.remarks;
      if (editTicket.status !== undefined) payload.status = editTicket.status;

      await updateTicket(editTicket.id, payload, token);
      notify("Ticket updated successfully");
      setEditTicket(null);
      fetchTickets();
    } catch (err) {
      notify("Update failed", "error");
    }
  };

  // Update ticket status
  const updateTicketStatus = async (id, newStatus) => {
    try {
      await updateTicket(id, { status: newStatus }, token);
      notify(`Status changed to ${newStatus}`);
      fetchTickets();
    } catch (err) {
      notify("Status update failed", "error");
    }
  };

  // Handle status change from dropdown
  const handleStatusChange = async (ticket, newStatus) => {
    if (newStatus === "resolved") {
      setResolutionPopup(ticket);
      setResolutionData({
        rootCause: ticket.root_cause || "",
        upTime: ticket.up_time || ""
      });
    } else {
      await updateTicketStatus(ticket.id, newStatus);
    }
  };

  // Confirm resolution
  const confirmResolution = async () => {
    try {
      let upTimeFormatted = resolutionData.upTime;
      if (upTimeFormatted) {
        const parsedDate = new Date(upTimeFormatted);
        if (!isNaN(parsedDate.getTime())) {
          upTimeFormatted = parsedDate.toISOString();
        } else {
          upTimeFormatted = new Date().toISOString();
        }
      } else {
        upTimeFormatted = new Date().toISOString();
      }

      await updateTicket(resolutionPopup.id, {
        status: "resolved",
        root_cause: resolutionData.rootCause,
        up_time: upTimeFormatted,
      }, token);
      notify("Ticket resolved successfully");
      setResolutionPopup(null);
      setResolutionData({ rootCause: "", upTime: "" });
      fetchTickets();
    } catch (err) {
      console.error("Resolution error:", err);
      notify("Resolution failed", "error");
    }
  };

  const setUpTimeNow = () => {
    setResolutionData(prev => ({
      ...prev,
      upTime: new Date().toISOString()
    }));
  };

  // Check permissions
  const canEditTicket = (ticket) => {
    return ticket.reported_by_email === currentUserEmail || ticket.assigned_to_email === currentUserEmail;
  };

  const canChangeStatus = (ticket) => {
    if (ticket.status === "open") return true;
    return ticket.reported_by_email === currentUserEmail || ticket.assigned_to_email === currentUserEmail;
  };

  // Filter tickets
  const filteredTickets = useMemo(() => {
    let filtered = tickets.filter(ticket => {
      if (ticket.status !== "open" && ticket.status !== "in-progress") return false;
      
      if (activeTab === "assigned") {
        return ticket.assigned_to_email === currentUserEmail;
      } else {
        return ticket.reported_by_email === currentUserEmail;
      }
    });

    if (search) {
      filtered = filtered.filter(ticket =>
        (ticket.system_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (ticket.problem_details || "").toLowerCase().includes(search.toLowerCase()) ||
        (ticket.ticket_sl || "").toLowerCase().includes(search.toLowerCase())
      );
    }

    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return filtered;
  }, [tickets, activeTab, search, currentUserEmail]);

  // Helper functions
  const getUserName = (email) => {
    if (!email) return "Unassigned";
    return email.split('@')[0];
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  const formatDateTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {/* NOTIFICATIONS */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg animate-slide-in ${
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
                <p className="text-sm text-gray-500">#{resolutionPopup.ticket_sl} - {resolutionPopup.system_name}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Root Cause <span className="text-red-500">*</span></label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Describe the root cause..."
                  value={resolutionData.rootCause}
                  onChange={(e) => setResolutionData(prev => ({ ...prev, rootCause: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Up Time <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <input
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={resolutionData.upTime}
                    onChange={(e) => setResolutionData(prev => ({ ...prev, upTime: e.target.value }))}
                  />
                  <button onClick={setUpTimeNow} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2">
                    <Clock size={16} />Now
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setResolutionPopup(null)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={confirmResolution} disabled={!resolutionData.rootCause || !resolutionData.upTime} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">Confirm Resolution</button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW TICKET MODAL */}
      {viewTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText size={20} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Ticket Details</h2>
                  <p className="text-xs text-gray-500">SL: {viewTicket.ticket_sl}</p>
                </div>
              </div>
              <button onClick={() => setViewTicket(null)} className="p-1 hover:bg-gray-100 rounded">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">Ticket SL</p><p className="font-medium">{viewTicket.ticket_sl || "-"}</p></div>
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">System Name</p><p className="font-medium">{viewTicket.system_name || "-"}</p></div>
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">Department</p><p className="font-medium">{viewTicket.department || "-"}</p></div>
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">Branch</p><p className="font-medium">{viewTicket.branch || "-"}</p></div>
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">Affected User</p><p className="font-medium">{viewTicket.affected_user || "-"}</p></div>
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">PC Name</p><p className="font-medium">{viewTicket.pc_name || "-"}</p></div>
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">Risk Level</p><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${riskConfig[viewTicket.risk_label?.toLowerCase()]?.color || "bg-gray-100"}`}>{viewTicket.risk_label || "-"}</span></div>
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">Status</p><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[viewTicket.status]?.color || "bg-gray-100"}`}>{statusConfig[viewTicket.status]?.label || viewTicket.status}</span></div>
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">Assigned To</p><p className="font-medium">{viewTicket.assigned_to_name || "Unassigned"}</p></div>
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">Reported By</p><p className="font-medium">{viewTicket.reportedByName || getUserName(viewTicket.reported_by_email)}</p></div>
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">Report Date</p><p className="font-medium">{formatDate(viewTicket.date)}</p></div>
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">Created At</p><p className="font-medium">{formatDateTime(viewTicket.created_at)}</p></div>
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">Updated At</p><p className="font-medium">{formatDateTime(viewTicket.updated_at)}</p></div>
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">Down Time</p><p className="font-medium">{formatDateTime(viewTicket.down_time)}</p></div>
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">Up Time</p><p className="font-medium">{formatDateTime(viewTicket.up_time)}</p></div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-4"><p className="text-xs text-gray-500 mb-2">Problem Details</p><p className="text-gray-800 whitespace-pre-wrap">{viewTicket.problem_details || "-"}</p></div>
              {viewTicket.root_cause && <div className="bg-gray-50 rounded-lg p-4 mb-4"><p className="text-xs text-gray-500 mb-2">Root Cause</p><p className="text-gray-800 whitespace-pre-wrap">{viewTicket.root_cause}</p></div>}
              {viewTicket.resolution && <div className="bg-gray-50 rounded-lg p-4 mb-4"><p className="text-xs text-gray-500 mb-2">Resolution</p><p className="text-gray-800 whitespace-pre-wrap">{viewTicket.resolution}</p></div>}
              {viewTicket.remarks && <div className="bg-gray-50 rounded-lg p-4"><p className="text-xs text-gray-500 mb-2">Remarks</p><p className="text-gray-800 whitespace-pre-wrap">{viewTicket.remarks}</p></div>}
            </div>
            <div className="flex justify-end p-4 border-t bg-gray-50">
              <button onClick={() => setViewTicket(null)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT TICKET MODAL */}
      {editTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Edit Ticket</h2>
              <button onClick={() => setEditTicket(null)} className="p-1 hover:bg-gray-100 rounded"><X size={18} /></button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">System Name</label><input className="w-full border rounded-lg px-3 py-2" value={editTicket.system_name || ""} onChange={(e) => updateField("system_name", e.target.value)} /></div>
                <div><label className="block text-sm font-medium mb-1">Department</label><input className="w-full border rounded-lg px-3 py-2" value={editTicket.department || ""} onChange={(e) => updateField("department", e.target.value)} /></div>
                <div><label className="block text-sm font-medium mb-1">Branch</label><input className="w-full border rounded-lg px-3 py-2" value={editTicket.branch || ""} onChange={(e) => updateField("branch", e.target.value)} /></div>
                <div><label className="block text-sm font-medium mb-1">Affected User</label><input className="w-full border rounded-lg px-3 py-2" value={editTicket.affected_user || ""} onChange={(e) => updateField("affected_user", e.target.value)} /></div>
                <div><label className="block text-sm font-medium mb-1">PC Name</label><input className="w-full border rounded-lg px-3 py-2" value={editTicket.pc_name || ""} onChange={(e) => updateField("pc_name", e.target.value)} /></div>
                <div><label className="block text-sm font-medium mb-1">Risk Level</label><select className="w-full border rounded-lg px-3 py-2" value={editTicket.risk_label || "MEDIUM"} onChange={(e) => updateField("risk_label", e.target.value)}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></div>
                <div><label className="block text-sm font-medium mb-1">Status</label><select className="w-full border rounded-lg px-3 py-2" value={editTicket.status || "open"} onChange={(e) => updateField("status", e.target.value)} disabled={!canChangeStatus(editTicket)}><option value="open">Open</option><option value="in-progress">In Progress</option><option value="resolved">Resolved</option></select></div>
                <div><label className="block text-sm font-medium mb-1">Down Time</label><div className="flex gap-2"><input className="flex-1 border rounded-lg px-3 py-2" value={editTicket.down_time ? new Date(editTicket.down_time).toLocaleString() : ""} onChange={(e) => updateField("down_time", e.target.value)} /><button onClick={() => setClock("down_time")} className="px-3 bg-gray-100 rounded-lg">Clock</button></div></div>
                <div><label className="block text-sm font-medium mb-1">Up Time</label><div className="flex gap-2"><input className="flex-1 border rounded-lg px-3 py-2" value={editTicket.up_time ? new Date(editTicket.up_time).toLocaleString() : ""} onChange={(e) => updateField("up_time", e.target.value)} /><button onClick={() => setClock("up_time")} className="px-3 bg-gray-100 rounded-lg">Clock</button></div></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Remarks</label><textarea rows={2} className="w-full border rounded-lg px-3 py-2" value={editTicket.remarks || ""} onChange={(e) => updateField("remarks", e.target.value)} /></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Problem Details</label><textarea rows={3} className="w-full border rounded-lg px-3 py-2" value={editTicket.problem_details || ""} onChange={(e) => updateField("problem_details", e.target.value)} /></div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
              <button onClick={() => setEditTicket(null)} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={saveTicket} className="px-4 py-2 bg-green-600 text-white rounded-lg">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">My Tickets</h1>
            <p className="text-gray-500 mt-1">Welcome back, {currentUserName}</p>
          </div>
          <Link className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105" to="/create-ticket">
            <Plus size={18} /> New Ticket
          </Link>
        </div>
      </div>

      {/* TABS */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-2">
          <button onClick={() => setActiveTab("assigned")} className={`px-4 py-2 rounded-t-lg transition ${activeTab === "assigned" ? "bg-white text-blue-600 border-t border-l border-r border-gray-200 font-semibold" : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"}`}>
            Assigned to Me ({tickets.filter(t => t.assigned_to_email === currentUserEmail && t.status !== "resolved").length})
          </button>
          <button onClick={() => setActiveTab("created")} className={`px-4 py-2 rounded-t-lg transition ${activeTab === "created" ? "bg-white text-blue-600 border-t border-l border-r border-gray-200 font-semibold" : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"}`}>
            Created by Me ({tickets.filter(t => t.reported_by_email === currentUserEmail && t.status !== "resolved").length})
          </button>
        </nav>
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Search tickets by system, problem, or ticket SL..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* TICKETS TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-3 text-left font-semibold text-gray-600">SL No</th>
                <th className="p-3 text-left font-semibold text-gray-600">Date</th>
                <th className="p-3 text-left font-semibold text-gray-600">System</th>
                <th className="p-3 text-left font-semibold text-gray-600">Problem</th>
                <th className="p-3 text-left font-semibold text-gray-600">Risk</th>
                <th className="p-3 text-left font-semibold text-gray-600">Status</th>
                <th className="p-3 text-center font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-400"><div className="flex flex-col items-center gap-2"><FileText size={32} /><p>No active tickets found</p><Link to="/create-ticket" className="text-blue-500 hover:text-blue-600 text-sm mt-2">Create a new ticket →</Link></div></td></tr>
              ) : (
                filteredTickets.map((ticket) => {
                  const risk = riskConfig[ticket.risk_label?.toLowerCase()] || riskConfig.low;
                  const status = statusConfig[ticket.status] || statusConfig.open;
                  const StatusIcon = status.icon;
                  return (
                    <tr key={ticket.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="p-3 text-gray-500 font-mono text-xs">{ticket.ticket_sl}</td>
                      <td className="p-3 text-gray-600 whitespace-nowrap">{formatDate(ticket.date)}</td>
                      <td className="p-3"><div className="flex items-center gap-1.5"><Server size={12} className="text-gray-400" /><span className="text-gray-700">{ticket.system_name || "-"}</span></div></td>
                      <td className="p-3 text-gray-600 max-w-[250px] truncate" title={ticket.problem_details}>{ticket.problem_details || "-"}</td>
                      <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${risk.color}`}>{risk.label}</span></td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <StatusIcon size={12} className={ticket.status === "open" ? "text-red-500" : "text-yellow-500"} />
                          <select value={ticket.status} onChange={(e) => handleStatusChange(ticket, e.target.value)} className="text-xs border-0 bg-transparent focus:ring-1 focus:ring-blue-500 rounded cursor-pointer" disabled={!canChangeStatus(ticket)}>
                            <option value="open">Open</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-1 text-blue-600 hover:bg-blue-50 rounded transition" onClick={() => setViewTicket(ticket)} title="View Details"><Eye size={16} /></button>
                          {canEditTicket(ticket) && (
                            <button className="p-1 text-green-600 hover:bg-green-50 rounded transition" onClick={() => setEditTicket({ ...ticket })} title="Edit Ticket"><Edit size={16} /></button>
                          )}
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

      {filteredTickets.length > 0 && (
        <p className="text-xs text-gray-400 text-center mt-4">Showing only Open and In Progress tickets. Resolved tickets are archived.</p>
      )}

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}