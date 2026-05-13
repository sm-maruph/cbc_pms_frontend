import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  UserPlus, Edit, Trash2, Search, Filter, X, CheckCircle, AlertCircle,
  Clock, Server, User, FileText, Plus, Eye, Save, ChevronLeft, ChevronRight,
  Users, Ticket, Database, MapPin, Layout, Settings, Shield, Star, TrendingUp
} from "lucide-react";

import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Import API functions
import {
  getTickets, updateTicket, deleteTicket,
  getUsers, createUser, updateUser, deleteUser,
  getDashboardStats,
  getSystems, createSystem, updateSystem, deleteSystem,
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getBranches, createBranch, updateBranch, deleteBranch,
  getTemplates, createTemplate, updateTemplate, deleteTemplate
} from "../../services/api";

export default function AdminDashboard({ user }) {
  // Current active tab
  const [activeTab, setActiveTab] = useState("tickets");

  // Data states
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [systems, setSystems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [stats, setStats] = useState({
    totalTickets: 0,
    totalUsers: 0,
    openTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    highRiskTickets: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notifications, setNotifications] = useState([]);

  // Search/filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRisk, setFilterRisk] = useState("all");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // user, ticket, system, department, branch, template
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const [chartTimeRange, setChartTimeRange] = useState('daily'); // daily, weekly, monthly, quarterly, yearly

  const token = localStorage.getItem("cbcToken");

  // Notification helper
  const notify = (msg, type = "success") => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
  };

  // Load all data
  const loadData = async () => {
    setLoading(true);
    try {
      const [ticketsData, usersData, statsData, systemsData, departmentsData, branchesData, templatesData] = await Promise.all([
        getTickets(token),
        getUsers(token),
        getDashboardStats(token),
        getSystems(),
        getDepartments(),
        getBranches(),
        getTemplates()
      ]);
      setTickets(ticketsData);
      setUsers(usersData);
      setStats(statsData);
      setSystems(systemsData);
      setDepartments(departmentsData);
      setBranches(branchesData);
      setTemplates(templatesData);
    } catch (err) {
      setError(err.message);
      notify("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadData();
    else notify("Not authenticated", "error");
  }, []);


  // Helper to filter tickets based on selected time range
  const filterTicketsByDateRange = (tickets, range) => {
    const now = new Date();
    let startDate;
    switch (range) {
      case 'daily':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'monthly':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'quarterly':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case 'yearly':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setHours(0, 0, 0, 0));
    }
    return tickets.filter(ticket => new Date(ticket.date) >= startDate);
  };


  const filteredTicketsForCharts = useMemo(() => {
    return filterTicketsByDateRange(tickets, chartTimeRange);
  }, [tickets, chartTimeRange]);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch =
        ticket.system_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.problem_details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.reportedByName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.affected_user?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || ticket.status === filterStatus;
      const matchesRisk = filterRisk === "all" || ticket.risk_label === filterRisk;
      return matchesSearch && matchesStatus && matchesRisk;
    });
  }, [tickets, searchTerm, filterStatus, filterRisk]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(u =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  // Filtered systems
  const filteredSystems = useMemo(() => {
    return systems.filter(s =>
      s.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [systems, searchTerm]);

  // Filtered departments
  const filteredDepartments = useMemo(() => {
    return departments.filter(d =>
      d.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [departments, searchTerm]);

  // Filtered branches
  const filteredBranches = useMemo(() => {
    return branches.filter(b =>
      b.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [branches, searchTerm]);

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(t =>
      t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [templates, searchTerm]);

  // User CRUD
  const handleSaveUser = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = {
      email: formData.get("email"),
      name: formData.get("name"),
      role: formData.get("role"),
      department: formData.get("department"),
      branch: formData.get("branch"),
    };
    if (!editingItem && formData.get("password")) {
      userData.password = formData.get("password");
    }
    try {
      if (editingItem) {
        await updateUser(editingItem.id, userData, token);
        notify("User updated successfully");
      } else {
        await createUser(userData, token);
        notify("User created successfully");
      }
      setShowModal(false);
      setEditingItem(null);
      loadData();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await deleteUser(id, token);
      notify("User deleted successfully");
      setDeleteConfirm(null);
      loadData();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  // System CRUD
  const handleSaveSystem = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get("name");
    try {
      if (editingItem) {
        await updateSystem(editingItem.id, { name }, token);
        notify("System updated successfully");
      } else {
        await createSystem(name, token);
        notify("System created successfully");
      }
      setShowModal(false);
      setEditingItem(null);
      loadData();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const handleDeleteSystem = async (id) => {
    try {
      await deleteSystem(id, token);
      notify("System deleted successfully");
      setDeleteConfirm(null);
      loadData();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  // Department CRUD
  const handleSaveDepartment = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get("name");
    try {
      if (editingItem) {
        await updateDepartment(editingItem.id, { name }, token);
        notify("Department updated successfully");
      } else {
        await createDepartment(name, token);
        notify("Department created successfully");
      }
      setShowModal(false);
      setEditingItem(null);
      loadData();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const handleDeleteDepartment = async (id) => {
    try {
      await deleteDepartment(id, token);
      notify("Department deleted successfully");
      setDeleteConfirm(null);
      loadData();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  // Branch CRUD
  const handleSaveBranch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get("name");
    try {
      if (editingItem) {
        await updateBranch(editingItem.id, { name }, token);
        notify("Branch updated successfully");
      } else {
        await createBranch(name, token);
        notify("Branch created successfully");
      }
      setShowModal(false);
      setEditingItem(null);
      loadData();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const handleDeleteBranch = async (id) => {
    try {
      await deleteBranch(id, token);
      notify("Branch deleted successfully");
      setDeleteConfirm(null);
      loadData();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  // Computed statistics from tickets (instead of backend)
  const computedStats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'open').length;
    const inProgress = tickets.filter(t => t.status === 'in-progress').length;
    const resolved = tickets.filter(t => t.status === 'resolved').length;
    const highRisk = tickets.filter(t => t.risk_label === 'HIGH').length;
    return { totalTickets: total, openTickets: open, inProgressTickets: inProgress, resolvedTickets: resolved, highRiskTickets: highRisk };
  }, [tickets]);


  const statusChartData = useMemo(() => {
  const open = filteredTicketsForCharts.filter(t => t.status === 'open').length;
  const inProgress = filteredTicketsForCharts.filter(t => t.status === 'in-progress').length;
  const resolved = filteredTicketsForCharts.filter(t => t.status === 'resolved').length;
  return [
    { name: 'Open', value: open, color: '#ef4444' },
    { name: 'In Progress', value: inProgress, color: '#eab308' },
    { name: 'Resolved', value: resolved, color: '#22c55e' },
  ];
  // No .filter() – all three categories always appear
}, [filteredTicketsForCharts]);

  const riskChartData = useMemo(() => {
    // Exclude resolved tickets
    const unresolved = tickets.filter(t => t.status !== 'resolved');
    const low = unresolved.filter(t => t.risk_label === 'LOW').length;
    const medium = unresolved.filter(t => t.risk_label === 'MEDIUM').length;
    const high = unresolved.filter(t => t.risk_label === 'HIGH').length;
    return [
      { name: 'Low Risk', value: low, color: '#3b82f6' },
      { name: 'Medium Risk', value: medium, color: '#f97316' },
      { name: 'High Risk', value: high, color: '#ef4444' },
    ].filter(item => item.value > 0);
  }, [tickets]);   // runs whenever tickets change

  // Template CRUD
  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const templateData = {
      id: editingItem ? editingItem.id : formData.get("id"),
      name: formData.get("name"),
      category: formData.get("category"),
      icon_name: formData.get("icon_name"),
      gradient_color: formData.get("gradient_color"),
      bg_color: formData.get("bg_color"),
      text_color: formData.get("text_color"),
      system_name: formData.get("system_name"),
      department: formData.get("department"),
      problem_details: formData.get("problem_details"),
      risk_label: formData.get("risk_label"),
      affected_user: formData.get("affected_user"),
    };
    try {
      if (editingItem) {
        await updateTemplate(editingItem.id, templateData, token);
        notify("Template updated successfully");
      } else {
        await createTemplate(templateData, token);
        notify("Template created successfully");
      }
      setShowModal(false);
      setEditingItem(null);
      loadData();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const handleDeleteTemplate = async (id) => {
    try {
      await deleteTemplate(id, token);
      notify("Template deleted successfully");
      setDeleteConfirm(null);
      loadData();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  // Ticket CRUD
  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updates = {
      status: formData.get("status"),
      assigned_to_email: formData.get("assigned_to_email") || null,
      remarks_by_admin: formData.get("remarks_by_admin"),
    };
    if (formData.get("root_cause")) updates.root_cause = formData.get("root_cause");
    if (formData.get("resolution")) updates.resolution = formData.get("resolution");
    if (formData.get("risk_label")) updates.risk_label = formData.get("risk_label");

    try {
      await updateTicket(editingItem.id, updates, token);
      notify("Ticket updated successfully");
      setShowModal(false);
      setEditingItem(null);
      loadData();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const handleDeleteTicket = async (id) => {
    try {
      await deleteTicket(id, token);
      notify("Ticket deleted successfully");
      setDeleteConfirm(null);
      loadData();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const getRiskBadge = (risk) => {
    const colors = {
      HIGH: "bg-red-100 text-red-800 border-red-300",
      MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-300",
      LOW: "bg-green-100 text-green-800 border-green-300"
    };
    return colors[risk] || colors.LOW;
  };

  const getStatusBadge = (status) => {
    const colors = {
      open: "bg-blue-100 text-blue-800 border-blue-300",
      "in-progress": "bg-orange-100 text-orange-800 border-orange-300",
      resolved: "bg-green-100 text-green-800 border-green-300"
    };
    return colors[status] || colors.open;
  };

  const tabs = [
    { id: "tickets", label: "Tickets", icon: Ticket, color: "bg-blue-500" },
    { id: "users", label: "Users", icon: Users, color: "bg-green-500" },
    { id: "systems", label: "Systems", icon: Database, color: "bg-purple-500" },
    { id: "departments", label: "Departments", icon: Layout, color: "bg-orange-500" },
    { id: "branches", label: "Branches", icon: MapPin, color: "bg-teal-500" },
    { id: "templates", label: "Templates", icon: FileText, color: "bg-pink-500" },
  ];

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setShowModal(true);
  };

  const renderModalContent = () => {
    switch (modalType) {
      case "user":
        return (
          <form onSubmit={handleSaveUser} className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input type="text" name="name" defaultValue={editingItem?.name} required className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" name="email" defaultValue={editingItem?.email} required className="w-full border rounded-lg px-3 py-2" />
            </div>
            {!editingItem && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input type="password" name="password" required className="w-full border rounded-lg px-3 py-2" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select name="role" defaultValue={editingItem?.role || "user"} className="w-full border rounded-lg px-3 py-2">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input type="text" name="department" defaultValue={editingItem?.department} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
              <input type="text" name="branch" defaultValue={editingItem?.branch} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                {editingItem ? "Update" : "Create"} User
              </button>
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          </form>
        );

      case "system":
        return (
          <form onSubmit={handleSaveSystem} className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">System Name *</label>
              <input type="text" name="name" defaultValue={editingItem?.name} required className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                {editingItem ? "Update" : "Create"} System
              </button>
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          </form>
        );

      case "department":
        return (
          <form onSubmit={handleSaveDepartment} className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department Name *</label>
              <input type="text" name="name" defaultValue={editingItem?.name} required className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                {editingItem ? "Update" : "Create"} Department
              </button>
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          </form>
        );

      case "branch":
        return (
          <form onSubmit={handleSaveBranch} className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name *</label>
              <input type="text" name="name" defaultValue={editingItem?.name} required className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                {editingItem ? "Update" : "Create"} Branch
              </button>
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          </form>
        );

      case "template":
        return (
          <form onSubmit={handleSaveTemplate} className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {!editingItem && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template ID *</label>
                <input type="text" name="id" placeholder="e.g., template-13" required className="w-full border rounded-lg px-3 py-2" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template Name *</label>
              <input type="text" name="name" defaultValue={editingItem?.name} required className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <input type="text" name="category" defaultValue={editingItem?.category} required className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon Name</label>
              <select name="icon_name" defaultValue={editingItem?.icon_name || "Shield"} className="w-full border rounded-lg px-3 py-2">
                <option value="Shield">Shield</option>
                <option value="Wifi">Wifi</option>
                <option value="Printer">Printer</option>
                <option value="Mail">Mail</option>
                <option value="Database">Database</option>
                <option value="Activity">Activity</option>
                <option value="Monitor">Monitor</option>
                <option value="Server">Server</option>
                <option value="CreditCard">CreditCard</option>
                <option value="Smartphone">Smartphone</option>
                <option value="FileText">FileText</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">System Name</label>
              <input type="text" name="system_name" defaultValue={editingItem?.system_name} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input type="text" name="department" defaultValue={editingItem?.department} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Problem Details</label>
              <textarea name="problem_details" rows="3" defaultValue={editingItem?.problem_details} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Risk Label</label>
              <select name="risk_label" defaultValue={editingItem?.risk_label || "MEDIUM"} className="w-full border rounded-lg px-3 py-2">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Affected User</label>
              <input type="text" name="affected_user" defaultValue={editingItem?.affected_user} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                {editingItem ? "Update" : "Create"} Template
              </button>
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          </form>
        );

      case "ticket":
        return (
          <form onSubmit={handleUpdateTicket} className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" defaultValue={editingItem?.status} className="w-full border rounded-lg px-3 py-2">
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
              <select name="risk_label" defaultValue={editingItem?.risk_label} className="w-full border rounded-lg px-3 py-2">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign To (Email)</label>
              <input type="email" name="assigned_to_email" defaultValue={editingItem?.assigned_to_email || ""} className="w-full border rounded-lg px-3 py-2" placeholder="Leave empty for unassigned" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Root Cause</label>
              <textarea name="root_cause" rows="2" defaultValue={editingItem?.root_cause || ""} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resolution / Remarks</label>
              <textarea name="resolution" rows="2" defaultValue={editingItem?.resolution || ""} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supervisor Remarks</label>
              <textarea name="remarks_by_admin" rows="2" defaultValue={editingItem?.remarks_by_admin || ""} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                Update Ticket
              </button>
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  const renderTable = () => {
    switch (activeTab) {
      case "tickets":
        return (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Reported By</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">System</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Problem</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Risk</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">#{ticket.ticket_sl}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(ticket.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{ticket.reportedByName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{ticket.system_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate">{ticket.problem_details}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getRiskBadge(ticket.risk_label)}`}>
                        {ticket.risk_label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusBadge(ticket.status)}`}>
                        {ticket.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openModal("ticket", ticket)} className="p-1 text-blue-600 hover:bg-blue-50 rounded transition" title="Edit Ticket">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => { setDeleteConfirm(ticket.id); setDeleteType("ticket"); }} className="p-1 text-red-600 hover:bg-red-50 rounded transition" title="Delete Ticket">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "users":
        return (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Branch</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{u.department || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{u.branch || "-"}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openModal("user", u)} className="p-1 text-blue-600 hover:bg-blue-50 rounded transition">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => { setDeleteConfirm(u.id); setDeleteType("user"); }} className="p-1 text-red-600 hover:bg-red-50 rounded transition">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "systems":
        return (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">System Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSystems.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-500">{s.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openModal("system", s)} className="p-1 text-blue-600 hover:bg-blue-50 rounded transition">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => { setDeleteConfirm(s.id); setDeleteType("system"); }} className="p-1 text-red-600 hover:bg-red-50 rounded transition">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "departments":
        return (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Department Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDepartments.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-500">{d.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{d.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openModal("department", d)} className="p-1 text-blue-600 hover:bg-blue-50 rounded transition">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => { setDeleteConfirm(d.id); setDeleteType("department"); }} className="p-1 text-red-600 hover:bg-red-50 rounded transition">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "branches":
        return (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Branch Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBranches.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-500">{b.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{b.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openModal("branch", b)} className="p-1 text-blue-600 hover:bg-blue-50 rounded transition">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => { setDeleteConfirm(b.id); setDeleteType("branch"); }} className="p-1 text-red-600 hover:bg-red-50 rounded transition">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "templates":
        return (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">System</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Risk</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTemplates.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No templates found
                    </td>
                  </tr>
                ) : (
                  filteredTemplates.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-500">{t.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{t.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{t.system_name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getRiskBadge(t.risk_label)}`}>
                          {t.risk_label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => openModal("template", t)} className="p-1 text-blue-600 hover:bg-blue-50 rounded transition" title="Edit Template">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => { setDeleteConfirm(t.id); setDeleteType("template"); }} className="p-1 text-red-600 hover:bg-red-50 rounded transition" title="Delete Template">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      {/* Notifications */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {notifications.map((n) => (
          <div key={n.id} className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${n.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}>
            {n.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-medium">{n.msg}</span>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, <span className="font-semibold">{user?.name}</span></p>
        </div>

        {/* Stats Grid */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
            <p className="text-gray-600 text-sm font-semibold mb-1">Total Tickets</p>
            <p className="text-4xl font-bold text-gray-900">{stats.totalTickets}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <p className="text-gray-600 text-sm font-semibold mb-1">Open Tickets</p>
            <p className="text-4xl font-bold text-gray-900">{stats.openTickets}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <p className="text-gray-600 text-sm font-semibold mb-1">In Progress</p>
            <p className="text-4xl font-bold text-gray-900">{stats.inProgressTickets}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
            <p className="text-gray-600 text-sm font-semibold mb-1">Resolved</p>
            <p className="text-4xl font-bold text-gray-900">{stats.resolvedTickets}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600">
            <p className="text-gray-600 text-sm font-semibold mb-1">High Risk</p>
            <p className="text-4xl font-bold text-gray-900">{stats.highRiskTickets}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
            <p className="text-gray-600 text-sm font-semibold mb-1">Registered Users</p>
            <p className="text-4xl font-bold text-gray-900">{users.length}</p>
          </div>
        </div> */}

        {/* Time Range Filter for Charts */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setChartTimeRange('daily')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition ${chartTimeRange === 'daily' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Today
          </button>
          <button
            onClick={() => setChartTimeRange('weekly')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition ${chartTimeRange === 'weekly' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            This Week
          </button>
          <button
            onClick={() => setChartTimeRange('monthly')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition ${chartTimeRange === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            This Month
          </button>
          <button
            onClick={() => setChartTimeRange('quarterly')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition ${chartTimeRange === 'quarterly' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            This Quarter
          </button>
          <button
            onClick={() => setChartTimeRange('yearly')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition ${chartTimeRange === 'yearly' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            This Year
          </button>
        </div>
        {/* Pie Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Status Distribution */}
          <div className="bg-white rounded-lg shadow p-4">
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

          {/* Risk Distribution */}
          <div className="bg-white rounded-lg shadow p-4">
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
            <p className="text-xs text-gray-500 mt-2 text-center">
              Excludes resolved tickets
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition ${activeTab === tab.id
                    ? "bg-white text-blue-600 border-t border-l border-r border-gray-200 font-semibold"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                    }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Add New Button */}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex-1">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={() => openModal(activeTab.slice(0, -1))}
            className="ml-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-2 px-4 rounded-lg shadow transition transform hover:scale-105 flex items-center gap-2"
          >
            <Plus size={18} />
            Add New {activeTab.slice(0, -1)}
          </button>
        </div>

        {/* Additional filters for tickets */}
        {activeTab === "tickets" && (
          <div className="mb-4 flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Risk Levels</option>
              <option value="HIGH">High Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
            </select>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {renderTable()}
          {filteredTickets.length === 0 && filteredUsers.length === 0 && filteredSystems.length === 0 &&
            filteredDepartments.length === 0 && filteredBranches.length === 0 && filteredTemplates.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <FileText size={32} className="mx-auto mb-2 opacity-50" />
                <p>No {activeTab} found</p>
              </div>
            )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
              <h3 className="text-xl font-semibold">
                {editingItem ? "Edit" : "Add New"} {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
              </h3>
              <button onClick={() => { setShowModal(false); setEditingItem(null); }} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            {renderModalContent()}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this {deleteType}? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (deleteType === "user") handleDeleteUser(deleteConfirm);
                    else if (deleteType === "ticket") handleDeleteTicket(deleteConfirm);
                    else if (deleteType === "system") handleDeleteSystem(deleteConfirm);
                    else if (deleteType === "department") handleDeleteDepartment(deleteConfirm);
                    else if (deleteType === "branch") handleDeleteBranch(deleteConfirm);
                    else if (deleteType === "template") handleDeleteTemplate(deleteConfirm);
                  }}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
                <button
                  onClick={() => { setDeleteConfirm(null); setDeleteType(null); }}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}