import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import {
  Search, Filter, Clock, User, Server, AlertCircle,
  CheckCircle, Edit, Trash2, Plus, X,
  Activity, TrendingUp, FileText, Zap, AlertTriangle,
  Eye, Calendar, ChevronLeft, ChevronRight,
  Printer, Download, Mail, ExternalLink
} from "lucide-react";

// Import API functions
import { getTickets, updateTicket, getAssignableUsers, getTicketBySL } from "../../services/api";


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

// Date filter functions
const getDateFilters = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const startOfWeek = new Date(today);
  const day = today.getDay();
  const diff = day === 0 ? 6 : day - 1;
  startOfWeek.setDate(today.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const startOfQuarter = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);

  const startOfYear = new Date(today.getFullYear(), 0, 1);

  return { today, yesterday, startOfWeek, startOfMonth, startOfQuarter, startOfYear };
};

export default function UserDashboard({ user }) {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedCardFilter, setSelectedCardFilter] = useState(null); // For card click filtering

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editTicket, setEditTicket] = useState(null);
  const [viewTicket, setViewTicket] = useState(null);
  const [resolutionPopup, setResolutionPopup] = useState(null);
  const [resolutionData, setResolutionData] = useState({ rootCause: "", upTime: "" });

  const [notifications, setNotifications] = useState([]);

  const token = localStorage.getItem("cbcToken");
  const currentUserEmail = user?.email || localStorage.getItem("userEmail");

  // ✅ ADD THIS DEBUGGING CODE
  console.log("=== USER DEBUG INFO ===");
  console.log("Current User Object:", user);
  console.log("Current User Email:", currentUserEmail);
  console.log("Token exists:", !!token);



  // Helper: Get user name from email
  const getUserName = (email) => {
    if (!email) return "Unassigned";
    const user = users.find(u => u.email === email);
    return user ? user.name : email.split('@')[0];
  };

  // Helper: convert API ticket object to local format
  // Helper: convert API ticket object to local format
  const formatTicket = (apiTicket) => ({
    ...apiTicket,
    id: apiTicket.id.toString(),
    riskLevel: apiTicket.risk_label ? apiTicket.risk_label.toLowerCase() : "low",
    reportedByName: apiTicket.reportedByName || apiTicket.reporter_name || "",
    assignedToName: apiTicket.assigned_to_name || "Unassigned",  // ✅ Just store raw value first
    assignedToEmail: apiTicket.assigned_to_email || "",
    // Store the raw date string without converting to locale string
    downTime: apiTicket.down_time || "",
    upTime: apiTicket.up_time ? new Date(apiTicket.up_time).toLocaleString() : "",
    date: apiTicket.date ? new Date(apiTicket.date).toISOString().split("T")[0] : "",
    createdAt: apiTicket.created_at ? new Date(apiTicket.created_at) : null,
    affectedUser: apiTicket.affected_user,
    pcName: apiTicket.pc_name,
    problemDetails: apiTicket.problem_details,
    systemName: apiTicket.system_name,
    department: apiTicket.department,
    branch: apiTicket.branch,
    rootCause: apiTicket.root_cause,
    resolution: apiTicket.resolution,
    reported_by_email: apiTicket.reported_by_email,
    ticket_sl: apiTicket.ticket_sl,
    month: apiTicket.month,
    remarks: apiTicket.remarks,
    remarks_by_admin: apiTicket.remarks_by_admin,
    special_instruction: apiTicket.special_instruction,
    updated_at: apiTicket.updated_at,
  });

  // Fetch tickets from API
  const fetchTickets = async () => {
    if (!token) {
      notify("Not authenticated", "error");
      return;
    }
    try {
      const data = await getTickets(token);
      setTickets(data.map(formatTicket));
      // Clean up any emails in assigned_to_name (backward compatibility)
      // setTimeout(() => {
      //   setTickets(prev => prev.map(ticket => {
      //     if (ticket.assignedToName && ticket.assignedToName.includes('@')) {
      //       return { ...ticket, assignedToName: getUserName(ticket.assignedToName) };
      //     }
      //     return ticket;
      //   }));
      // }, 100);
    } catch (err) {
      notify("Failed to load tickets", "error");
      console.error(err);
    }
  };

  // Fetch users for assignment
  const fetchUsers = async () => {
    if (!token) return;
    try {
      const data = await getAssignableUsers(token);
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchUsers();
  }, [token]);


  // Helper: Format downtime as relative time with color
  const getRelativeTime = (downTimeString, status) => {
    // If ticket is resolved, return neutral background
    if (status === 'resolved') {
      return { text: downTimeString, bgColor: 'bg-gray-100', textColor: 'text-gray-500' };
    }

    if (!downTimeString) return { text: 'Not set', bgColor: 'bg-gray-100', textColor: 'text-gray-600' };

    // Try to parse the date string
    let downTime;
    try {
      // Handle different date formats
      if (typeof downTimeString === 'string') {
        // Replace space with T for ISO format compatibility
        const normalized = downTimeString.replace(' ', 'T');
        downTime = new Date(normalized);
      } else {
        downTime = new Date(downTimeString);
      }

      // Check if date is valid
      if (isNaN(downTime.getTime())) {
        console.error('Invalid date:', downTimeString);
        return { text: 'Invalid date', bgColor: 'bg-gray-100', textColor: 'text-gray-600' };
      }
    } catch (e) {
      console.error('Date parsing error:', e);
      return { text: 'Invalid date', bgColor: 'bg-gray-100', textColor: 'text-gray-600' };
    }

    const now = new Date();
    const diffMs = now - downTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    let text = '';
    let bgColor = '';
    let textColor = '';

    // Determine text (ensure non-negative values)
    if (diffMins < 0) {
      text = 'Just now';
    } else if (diffMins < 1) {
      text = 'Just now';
    } else if (diffMins < 60) {
      text = `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      text = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      text = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }

    // Determine color based on age (using positive diffMins)
    const ageMins = Math.max(0, diffMins);
    if (ageMins <= 5) {
      bgColor = 'bg-green-100';
      textColor = 'text-green-700';
    } else if (ageMins <= 30) {
      bgColor = 'bg-orange-100';
      textColor = 'text-orange-700';
    } else {
      bgColor = 'bg-red-100';
      textColor = 'text-red-700';
    }

    return { text, bgColor, textColor };
  };
  // Update assigned names when users are loaded (fixes the email display issue)
  useEffect(() => {
    if (users.length > 0 && tickets.length > 0) {
      setTickets(prev => prev.map(ticket => {
        // Find user by email in assignedToEmail
        const foundUser = users.find(u => u.email === ticket.assignedToEmail);
        if (foundUser && ticket.assignedToName !== foundUser.name) {
          return { ...ticket, assignedToName: foundUser.name };
        }
        // Also handle case where email is stored in assignedToName
        if (ticket.assignedToName && ticket.assignedToName.includes('@')) {
          const userByEmail = users.find(u => u.email === ticket.assignedToName);
          if (userByEmail) {
            return { ...ticket, assignedToName: userByEmail.name, assignedToEmail: userByEmail.email };
          }
        }
        return ticket;
      }));
    }
  }, [users]); // Run whenever users array changes

  // Notification helper
  const notify = (msg, type = "success") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 1000);
  };

  // Update field in edit modal
  const updateField = (field, value) => {
    setEditTicket((prev) => ({ ...prev, [field]: value }));
  };

  const setClock = (field) => {
    updateField(field, new Date().toLocaleString());
  };

  // Assign user to ticket (only for open tickets)
  const assignToUser = async (ticketId, userEmail) => {
    try {
      await updateTicket(ticketId, { assigned_to_email: userEmail, status: "in-progress" }, token);
      const userName = users.find(u => u.email === userEmail)?.name || userEmail;
      notify(`Assigned to ${userName} and status changed to In Progress`);
      fetchTickets();
    } catch (err) {
      notify("Assignment failed", "error");
    }
  };

  // Save edited ticket
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
      if (editTicket.status !== undefined) payload.status = editTicket.status;

      await updateTicket(editTicket.id, payload, token);
      notify("Ticket updated successfully");
      setSelectedTicket(null);
      setEditTicket(null);
      fetchTickets();
    } catch (err) {
      notify("Update failed", "error");
    }
  };

  // Helper to update just status
  const updateTicketStatus = async (id, newStatus) => {
    try {
      await updateTicket(id, { status: newStatus }, token);
      notify("Status updated");
      fetchTickets();
    } catch (err) {
      notify("Status update failed", "error");
    }
  };

  // Status change handler
  const handleStatusChange = (ticket, newStatus) => {

    if (!canChangeStatus(ticket)) {
      notify("You don't have permission to change this ticket's status", "error");
      return;
    }
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

  // Confirm resolution
  // Confirm resolution
  const confirmResolution = async () => {
    try {
      // Convert up_time to proper ISO format for SQL Server
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
      upTime: new Date().toLocaleString()
    }));
  };

  const canEditTicket = (ticket) => {
    // Get emails safely
    const reporterEmail = ticket.reported_by_email || ticket.reportedByEmail;
    const assigneeEmail = ticket.assignedToEmail;

    // Debug logging for each ticket
    console.log(`🔍 Checking ticket ${ticket.id}:`);
    console.log(`   - Reporter email: ${reporterEmail}`);
    console.log(`   - Assignee email: ${assigneeEmail}`);
    console.log(`   - Current user: ${currentUserEmail}`);

    // If no current user email, deny edit
    if (!currentUserEmail) {
      console.warn("⚠️ No current user email found!");
      return false;
    }

    // Check if current user is reporter (case-insensitive)
    const isReporter = reporterEmail &&
      reporterEmail.toLowerCase() === currentUserEmail.toLowerCase();

    // Check if current user is assignee (case-insensitive)
    const isAssignee = assigneeEmail &&
      assigneeEmail.toLowerCase() === currentUserEmail.toLowerCase();

    const canEdit = isReporter || isAssignee;
    console.log(`   - Can edit: ${canEdit} (Reporter: ${isReporter}, Assignee: ${isAssignee})`);

    return canEdit;
  };

  // Check if user can change ticket status
  const canChangeStatus = (ticket) => {
    // Open tickets can be assigned by anyone (will trigger assignment logic)
    if (ticket.status === "open") return true;
    // For non-open tickets, only reporter or assigned user can change status
    return ticket.reported_by_email === currentUserEmail || ticket.assignedToEmail === currentUserEmail;
  };

  // Apply date filter based on creation date
  // Helper: Get start of day for any date
  const startOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // Helper: Get end of day for any date
  const endOfDay = (date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  // Apply date filter based on ticket's date field (not createdAt)
  const applyDateFilter = (ticketsList) => {
    if (dateFilter === "all") return ticketsList;

    const now = new Date();
    const today = startOfDay(now);
    const yesterday = startOfDay(new Date(now.setDate(now.getDate() - 1)));
    now.setDate(now.getDate() + 1); // Restore

    // Start of current week (Monday)
    const startOfWeek = new Date(today);
    const day = today.getDay();
    const diffToMonday = day === 0 ? 6 : day - 1;
    startOfWeek.setDate(today.getDate() - diffToMonday);

    // Start of current month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Start of current quarter
    const startOfQuarter = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);

    // Start of current year
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    return ticketsList.filter(ticket => {
      // Use the date field (which is the ticket's date) for filtering
      if (!ticket.date) return false;

      // Parse the ticket date (format: YYYY-MM-DD)
      const ticketDateParts = ticket.date.split('-');
      const ticketDate = new Date(
        parseInt(ticketDateParts[0]),
        parseInt(ticketDateParts[1]) - 1,
        parseInt(ticketDateParts[2])
      );
      ticketDate.setHours(0, 0, 0, 0);

      switch (dateFilter) {
        case "today":
          return ticketDate.getTime() === today.getTime();
        case "yesterday":
          return ticketDate.getTime() === yesterday.getTime();
        case "week":
          return ticketDate >= startOfWeek && ticketDate <= today;
        case "month":
          return ticketDate >= startOfMonth && ticketDate <= today;
        case "quarter":
          return ticketDate >= startOfQuarter && ticketDate <= today;
        case "year":
          return ticketDate >= startOfYear && ticketDate <= today;
        default:
          return true;
      }
    });
  };

  // Stats derived from tickets (respects date filter)
  const stats = useMemo(() => {
    // First filter by date
    let filteredTickets = [...tickets];

    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const startOfWeek = new Date(today);
      const day = today.getDay();
      const diffToMonday = day === 0 ? 6 : day - 1;
      startOfWeek.setDate(today.getDate() - diffToMonday);

      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfQuarter = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
      const startOfYear = new Date(today.getFullYear(), 0, 1);

      filteredTickets = filteredTickets.filter(ticket => {
        if (!ticket.date) return false;
        const dateParts = ticket.date.split('-');
        const ticketDate = new Date(
          parseInt(dateParts[0]),
          parseInt(dateParts[1]) - 1,
          parseInt(dateParts[2])
        );
        ticketDate.setHours(0, 0, 0, 0);

        switch (dateFilter) {
          case "today": return ticketDate.getTime() === today.getTime();
          case "yesterday": return ticketDate.getTime() === yesterday.getTime();
          case "week": return ticketDate >= startOfWeek && ticketDate <= today;
          case "month": return ticketDate >= startOfMonth && ticketDate <= today;
          case "quarter": return ticketDate >= startOfQuarter && ticketDate <= today;
          case "year": return ticketDate >= startOfYear && ticketDate <= today;
          default: return true;
        }
      });
    }

    const open = filteredTickets.filter(t => t.status === "open").length;
    const progress = filteredTickets.filter(t => t.status === "in-progress").length;
    const resolved = filteredTickets.filter(t => t.status === "resolved").length;
    const activeTickets = filteredTickets.filter(t => t.status !== "resolved");
    const highRisk = activeTickets.filter(t => t.riskLevel === "high").length;
    const mediumRisk = activeTickets.filter(t => t.riskLevel === "medium").length;
    const lowRisk = activeTickets.filter(t => t.riskLevel === "low").length;

    return {
      open, progress, resolved, total: filteredTickets.length,
      highRisk, mediumRisk, lowRisk, activeTotal: activeTickets.length
    };
  }, [tickets, dateFilter]);
  // Handle card click to filter table
  const handleCardClick = (status) => {
    setSelectedCardFilter(status);
    setFilterStatus(status);
  };

  // Filtered and sorted tickets
  const filtered = useMemo(() => {
    let filteredTickets = [...tickets];

    // Apply search filter
    if (search) {
      filteredTickets = filteredTickets.filter(t =>
        (t.systemName || "").toLowerCase().includes(search.toLowerCase()) ||
        (t.reportedByName || "").toLowerCase().includes(search.toLowerCase()) ||
        (t.problemDetails || "").toLowerCase().includes(search.toLowerCase()) ||
        (t.affectedUser || "").toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filteredTickets = filteredTickets.filter(t => t.status === filterStatus);
    }

    // Apply date filter using the date field
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const startOfWeek = new Date(today);
      const day = today.getDay();
      const diffToMonday = day === 0 ? 6 : day - 1;
      startOfWeek.setDate(today.getDate() - diffToMonday);

      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfQuarter = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
      const startOfYear = new Date(today.getFullYear(), 0, 1);

      filteredTickets = filteredTickets.filter(ticket => {
        if (!ticket.date) return false;

        // Parse ticket date (format: YYYY-MM-DD)
        const dateParts = ticket.date.split('-');
        const ticketDate = new Date(
          parseInt(dateParts[0]),
          parseInt(dateParts[1]) - 1,
          parseInt(dateParts[2])
        );
        ticketDate.setHours(0, 0, 0, 0);

        switch (dateFilter) {
          case "today":
            return ticketDate.getTime() === today.getTime();
          case "yesterday":
            return ticketDate.getTime() === yesterday.getTime();
          case "week":
            return ticketDate >= startOfWeek && ticketDate <= today;
          case "month":
            return ticketDate >= startOfMonth && ticketDate <= today;
          case "quarter":
            return ticketDate >= startOfQuarter && ticketDate <= today;
          case "year":
            return ticketDate >= startOfYear && ticketDate <= today;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filteredTickets.sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
      }
      if (sortBy === "status") return a.status.localeCompare(b.status);
      if (sortBy === "risk") {
        const riskOrder = { high: 3, medium: 2, low: 1 };
        return (riskOrder[b.riskLevel] || 1) - (riskOrder[a.riskLevel] || 1);
      }
      return 0;
    });

    return filteredTickets;
  }, [tickets, search, filterStatus, sortBy, dateFilter]);

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

  // Date filter buttons
  const dateFilterButtons = [
    { label: "All", value: "all" },
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "This Week", value: "week" },
    { label: "This Month", value: "month" },
    { label: "This Quarter", value: "quarter" },
    { label: "This Year", value: "year" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">

      {/* NOTIFICATIONS */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 animate-slide-in ${n.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
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

      {/* HEADER */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Incident Dashboard
            </h1>
            <p className="text-gray-500 mt-1">Welcome back, {user?.name || "User"}</p>
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

      {/* STATS CARDS - Clickable */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div
          onClick={() => handleCardClick("all")}
          className={`bg-white rounded-xl shadow-sm p-3 border cursor-pointer transition-all hover:shadow-md ${selectedCardFilter === "all" ? "ring-2 ring-blue-500 shadow-md" : ""
            }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="text-blue-600" size={20} />
            </div>
          </div>
        </div>
        <div
          onClick={() => handleCardClick("open")}
          className={`bg-white rounded-xl shadow-sm p-3 border cursor-pointer transition-all hover:shadow-md ${selectedCardFilter === "open" ? "ring-2 ring-red-500 shadow-md" : ""
            }`}
        >
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
        <div
          onClick={() => handleCardClick("in-progress")}
          className={`bg-white rounded-xl shadow-sm p-3 border cursor-pointer transition-all hover:shadow-md ${selectedCardFilter === "in-progress" ? "ring-2 ring-yellow-500 shadow-md" : ""
            }`}
        >
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
        <div
          onClick={() => handleCardClick("resolved")}
          className={`bg-white rounded-xl shadow-sm p-3 border cursor-pointer transition-all hover:shadow-md ${selectedCardFilter === "resolved" ? "ring-2 ring-green-500 shadow-md" : ""
            }`}
        >
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
              <Legend onClick={(e) => handleCardClick(e.value.toLowerCase().replace(" ", "-"))} />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-400 text-center mt-2">
            * Click on legend or cards to filter
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <h2 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <AlertCircle size={18} /> Risk Assessment (Active Tickets Only)
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
          <p className="text-xs text-gray-400 text-center mt-2">
            * Excludes resolved tickets. Active tickets: {stats.activeTotal}
          </p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100">
        <div className="flex flex-wrap gap-2 items-center mb-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search tickets..."
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setFilterStatus(e.target.value)}
            value={filterStatus}
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setSortBy(e.target.value)}
            value={sortBy}
          >
            <option value="date">Sort by Date</option>
            <option value="status">Sort by Status</option>
            <option value="risk">Sort by Risk</option>
          </select>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <Calendar size={16} className="text-gray-400 self-center" />
          {dateFilterButtons.map((button) => (
            <button
              key={button.value}
              onClick={() => setDateFilter(button.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${dateFilter === button.value
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>

      {/* TICKETS TABLE */}
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
                  const StatusIcon = statusConfig[t.status]?.icon || AlertCircle;
                  return (
                    <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="p-3 text-gray-500">{t.ticket_sl}</td>
                      <td className="p-3 text-gray-600 whitespace-nowrap">{new Date(t.date).toLocaleDateString()}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <User size={12} className="text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-700">{t.reportedByName}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        {t.status === "open" ? (
                          <select
                            value={t.assignedToEmail || ""}
                            onChange={(e) => assignToUser(t.id, e.target.value)}
                            className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Assign to...</option>
                            {users.filter((u, index, self) =>
                              index === self.findIndex((t) => t.email === u.email)
                            ).map((u) => (
                              <option key={u.id} value={u.email}>{u.name}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-gray-600">
                            {users.find(u => u.email === t.assignedToEmail)?.name || t.assignedToName || "Unassigned"}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <Server size={12} className="text-gray-400" />
                          <span className="text-gray-700">{t.systemName}</span>
                        </div>
                      </td>
                      <td className="p-3 text-gray-600 max-w-[180px] truncate" title={t.problemDetails}>
                        {t.problemDetails}
                      </td>
                      <td className="p-3 text-xs whitespace-nowrap">
                        {t.downTime ? (
                          (() => {
                            const { text, bgColor, textColor } = getRelativeTime(t.downTime, t.status);
                            return (
                              <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${bgColor} ${textColor} w-fit`}>
                                <Clock size={12} />
                                <span className="font-medium">{text}</span>
                              </div>
                            );
                          })()
                        ) : (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-500 w-fit">
                            <Clock size={12} />
                            <span>Not set</span>
                          </div>
                        )}
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
                          <StatusIcon size={12} className={t.status === "open" ? "text-red-500" : t.status === "in-progress" ? "text-yellow-500" : "text-green-500"} />
                          <select
                            value={t.status}
                            onChange={(e) => handleStatusChange(t, e.target.value)}
                            className="text-xs border-0 bg-transparent focus:ring-1 focus:ring-blue-500 rounded cursor-pointer"
                            disabled={!canChangeStatus(t)}
                          >
                            <option value="open">Open</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </div>
                        {t.status === "open" && !t.assignedToEmail && (
                          <p className="text-xs text-amber-600 mt-1">Assign first</p>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                            onClick={() => setViewTicket(t)}
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                          {canEditTicket(t) && (
                            <button
                              className="p-1 text-green-600 hover:bg-green-50 rounded transition"
                              onClick={() => {
                                setSelectedTicket(t);
                                setEditTicket({ ...t });
                              }}
                              title="Edit Ticket"
                            >
                              <Edit size={14} />
                            </button>
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

      {/* VIEW TICKET MODAL - Complete with all fields */}
      {viewTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText size={20} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Ticket Details</h2>
                  <p className="text-xs text-gray-500">ID: #{viewTicket.id}</p>
                </div>
              </div>
              <button
                onClick={() => setViewTicket(null)}
                className="p-1 hover:bg-gray-100 rounded transition"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Ticket SL</p>
                  <p className="font-medium text-gray-800">{viewTicket.ticket_sl || "-"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Month</p>
                  <p className="font-medium text-gray-800">{viewTicket.month || "-"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">System Name</p>
                  <p className="font-medium text-gray-800">{viewTicket.systemName || "-"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="font-medium text-gray-800">{viewTicket.department || "-"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Branch</p>
                  <p className="font-medium text-gray-800">{viewTicket.branch || "-"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Affected User</p>
                  <p className="font-medium text-gray-800">{viewTicket.affectedUser || "-"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">PC Name</p>
                  <p className="font-medium text-gray-800">{viewTicket.pcName || "-"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Risk Level</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${riskConfig[viewTicket.riskLevel]?.color || "bg-gray-100"}`}>
                    {riskConfig[viewTicket.riskLevel]?.label || viewTicket.riskLevel}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Status</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[viewTicket.status]?.color || "bg-gray-100"}`}>
                    {statusConfig[viewTicket.status]?.label || viewTicket.status}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Reported By</p>
                  <p className="font-medium text-gray-800">{viewTicket.reportedByName || "-"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Reported By Email</p>
                  <p className="font-medium text-gray-800">{viewTicket.reported_by_email || "-"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Assigned To</p>
                  <p className="font-medium text-gray-800">
                    {viewTicket.assignedToName && viewTicket.assignedToName.includes('@')
                      ? getUserName(viewTicket.assignedToName)
                      : (viewTicket.assignedToName || "Unassigned")}
                  </p>
                </div>
                {/* <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Assigned To Email</p>
                  <p className="font-medium text-gray-800">{viewTicket.assignedToEmail || "-"}</p>
                </div> */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Report Date</p>
                  <p className="font-medium text-gray-800">{viewTicket.date || "-"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Created At</p>
                  <p className="font-medium text-gray-800">{viewTicket.createdAt ? new Date(viewTicket.createdAt).toLocaleString() : "-"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Updated At</p>
                  <p className="font-medium text-gray-800">{viewTicket.updated_at ? new Date(viewTicket.updated_at).toLocaleString() : "-"}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Down Time</p>
                  {viewTicket.downTime ? (
                    (() => {
                      const { text, bgColor, textColor } = getRelativeTime(viewTicket.downTime);
                      return (
                        <p className={`inline-block px-2 py-1 rounded-full text-sm font-medium mt-1 ${bgColor} ${textColor}`}>
                          {text}
                        </p>
                      );
                    })()
                  ) : (
                    <p className="font-medium text-gray-800 mt-1">-</p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Up Time</p>
                  <p className="font-medium text-gray-800">{viewTicket.upTime || "-"}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-xs text-gray-500 mb-2">Problem Details</p>
                <p className="text-gray-800 whitespace-pre-wrap">{viewTicket.problemDetails || "-"}</p>
              </div>

              {viewTicket.rootCause && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-xs text-gray-500 mb-2">Root Cause</p>
                  <p className="text-gray-800 whitespace-pre-wrap">{viewTicket.rootCause}</p>
                </div>
              )}

              {viewTicket.resolution && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-xs text-gray-500 mb-2">Resolution</p>
                  <p className="text-gray-800 whitespace-pre-wrap">{viewTicket.resolution}</p>
                </div>
              )}

              {viewTicket.remarks && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-2">Remarks</p>
                  <p className="text-gray-800 whitespace-pre-wrap">{viewTicket.remarks}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end p-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => setViewTicket(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL - Added Status field */}
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
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editTicket.status || "open"}
                    onChange={(e) => updateField("status", e.target.value)}
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div> */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Down Time</label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editTicket.downTime || ""}
                      onChange={(e) => updateField("downTime", e.target.value)}
                      placeholder="Select or click clock"
                    />
                    {/* <button
                      onClick={() => setClock("downTime")}
                      className="px-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm"
                    >
                      Clock
                    </button> */}
                  </div>
                </div>
                {/* <div>
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
                </div> */}
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

            <div className="flex justify-end gap-2 p-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={saveTicket}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:shadow-lg transition text-sm font-medium"
              >
                Save Changes
              </button>
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