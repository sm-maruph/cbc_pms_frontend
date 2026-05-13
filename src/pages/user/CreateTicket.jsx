import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock, Calendar, User, Server, AlertCircle, CheckCircle,
  Activity, Zap, FileText, Plus, X, ChevronDown, ChevronUp,
  Monitor, Database, Wifi,
  Printer, Mail, Shield, Globe, CreditCard, Smartphone,
  Download, Copy, Trash2, Edit, Filter, Search, Star, StarOff,
  Layers, ChevronLeft, ChevronRight, Menu, MapPin, Cpu
} from "lucide-react";

// Import API functions
import {
  createTicket,
  getSystems,
  getDepartments,
  getBranches,
  getTemplates,
  getUserFavorites,
  toggleFavorite,
  getAssignableUsers
} from "../../services/api";

// Icon mapping for templates (database stores icon name as string)
const iconMap = {
  "Shield": Shield,
  "Wifi": Wifi,
  "Printer": Printer,
  "Mail": Mail,
  "Database": Database,
  "Activity": Activity,
  "Monitor": Monitor,
  "Server": Server,
  "CreditCard": CreditCard,
  "Smartphone": Smartphone,
  "FileText": FileText
};

// PC Name prefix to branch mapping (business rule, not static data)
const pcBranchMapping = {
  "cbccor": "Corporate Branch",
  "cht": "Agrabad Branch",
  "mtj": "Motijheel Branch",
  "dha": "Dhanmondi Branch",
  "corcrr": "Gulshan Branch",
  "cbccard": "Gulshan Branch",
  "gul": "Gulshan Branch",
  "mrp": "Mirpur Branch",
  "nrj": "Narayanganj Branch",
  "snr": "Panthapath Branch",
  "syl": "Sylhet Branch",
  "utt": "Uttara Branch",
  "tjn": "Tejgaon Branch",
  "sod": "SME Old Dhaka",
  "ssn": "SME Shantinagar",
  "scc": "SME CDA Avenue",
  "sps": "SME Pragati Sharani",
  "stg": "SME Tongi",
  "sch": "SME Jubli",
  "ueb": "US Embassy Sub Branch",
  "cepz": "CEPZ Sub Branch",
  "depz": "DEPZ Sub Branch",
  "hob": "Head Office BD",
};

export default function CreateTicket({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchTemplate, setSearchTemplate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [detectedBranch, setDetectedBranch] = useState(null);

  // State for dynamic data from database
  const [systemOptions, setSystemOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [templatesList, setTemplatesList] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // State for assignable users from API
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Initialize downtime with current date and time
  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const [formData, setFormData] = useState({
    affectedUser: "",
    assignedToEmail: "",
    assignedToName: "",
    systemName: "",
    problemDetails: "",
    department: "",
    branch: "",
    riskLabel: "LOW",
    pcName: "",
    date: new Date().toISOString().split("T")[0],
    downTime: getCurrentDateTime(),
  });

  // Fetch all static data from database
  useEffect(() => {
    const fetchStaticData = async () => {
      setDataLoading(true);
      try {
        const [systems, departments, branches, templates] = await Promise.all([
          getSystems(),
          getDepartments(),
          getBranches(),
          getTemplates()
        ]);

        setSystemOptions(systems);
        setDepartmentOptions(departments);
        setBranchOptions(branches);
        setTemplatesList(templates);

        // Fetch user favorites if logged in
        const token = localStorage.getItem("cbcToken");
        if (token) {
          try {
            const userFavorites = await getUserFavorites(token);
            setFavorites(userFavorites);
          } catch (err) {
            console.error("Error fetching favorites:", err);
          }
        }
      } catch (err) {
        console.error("Error fetching static data:", err);
        setError("Failed to load form data. Please refresh the page.");
      } finally {
        setDataLoading(false);
      }
    };

    fetchStaticData();
  }, []);



  // Fetch assignable users for dropdown
  useEffect(() => {
    const fetchAssignableUsers = async () => {
      const token = localStorage.getItem("cbcToken");
      if (!token) return;

      setUsersLoading(true);
      try {
        const users = await getAssignableUsers(token);
        // Remove duplicates and ensure we have id and name
        const uniqueUsers = users.filter((user, index, self) =>
          index === self.findIndex((u) => u.id === user.id)
        );
        setAssignableUsers(uniqueUsers);
      } catch (err) {
        console.error("Error fetching assignable users:", err);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchAssignableUsers();
  }, []);

  // Transform templates from database to frontend format
  const quickTemplates = useMemo(() => {
    return templatesList.map(template => ({
      id: template.id,
      name: template.name,
      icon: iconMap[template.icon_name] || Shield,
      color: template.gradient_color,
      bgColor: template.bg_color,
      textColor: template.text_color,
      category: template.category,
      data: {
        systemName: template.system_name,
        department: template.department,
        problemDetails: template.problem_details,
        riskLabel: template.risk_label,
        affectedUser: template.affected_user || "",
      }
    }));
  }, [templatesList]);

  // Get available users from localStorage - UPDATED to use ID
  // const availableUsers = useMemo(() => {
  //   const stored = localStorage.getItem("cbcUsers");
  //   const usersMap = new Map();

  //   if (stored) {
  //     JSON.parse(stored).forEach((u) => {
  //       // Make sure user has an id and name
  //       if (u.id && u.name) {
  //         // Use id as key to prevent duplicates
  //         if (!usersMap.has(u.id)) {
  //           usersMap.set(u.id, { id: u.id, name: u.name });
  //         }
  //       }
  //     });
  //   }
  //   console.log(JSON.parse(localStorage.getItem("cbcUsers")));

  //   // Sort users alphabetically by name
  //   return Array.from(usersMap.values()).sort((a, b) =>
  //     a.name.localeCompare(b.name)
  //   );
  // }, []);
  // Function to detect branch from PC name
  const detectBranchFromPC = (pcName) => {
    if (!pcName || pcName.trim() === "") {
      setDetectedBranch(null);
      return;
    }

    const cleanPCName = pcName.trim().toLowerCase();

    for (const [prefix, branch] of Object.entries(pcBranchMapping)) {
      if (cleanPCName.includes(prefix.toLowerCase())) {
        setDetectedBranch(branch);
        setFormData(prev => ({ ...prev, branch: branch }));
        return;
      }
    }

    setDetectedBranch("Head Office BD");
    setFormData(prev => ({ ...prev, branch: "Head Office BD" }));
  };

  const riskLevels = ["LOW", "MEDIUM", "HIGH"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "pcName") {
      detectBranchFromPC(value);
    }
  };

  const handleApplyTemplate = (template) => {
    setSelectedTemplate(template);
    setFormData((prev) => ({
      ...prev,
      systemName: template.data.systemName,
      department: template.data.department,
      problemDetails: template.data.problemDetails,
      riskLabel: template.data.riskLabel,
      affectedUser: template.data.affectedUser || prev.affectedUser,
    }));
    setMobileSidebarOpen(false);
    if (window.innerWidth < 1024) {
      document.getElementById("ticket-form")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const setCurrentTimeAsDownTime = () => {
    setFormData(prev => ({ ...prev, downTime: getCurrentDateTime() }));
  };

  const handleToggleFavorite = async (templateId) => {
    const token = localStorage.getItem("cbcToken");
    if (!token) return;

    try {
      const result = await toggleFavorite(templateId, token);
      if (result.isFavorite) {
        setFavorites(prev => [...prev, templateId]);
      } else {
        setFavorites(prev => prev.filter(id => id !== templateId));
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  const filteredTemplates = useMemo(() => {
    return quickTemplates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTemplate.toLowerCase()) ||
        template.category.toLowerCase().includes(searchTemplate.toLowerCase()) ||
        template.data.systemName.toLowerCase().includes(searchTemplate.toLowerCase());
      const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [quickTemplates, searchTemplate, selectedCategory]);

  const favoriteTemplates = quickTemplates.filter(t => favorites.includes(t.id));
  const otherTemplates = filteredTemplates.filter(t => !favorites.includes(t.id));

  const categories = useMemo(() => {
    return [...new Set(quickTemplates.map(t => t.category))];
  }, [quickTemplates]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.systemName.trim()) {
      setError("System Name is required");
      setLoading(false);
      return;
    }
    if (!formData.problemDetails.trim()) {
      setError("Problem Details are required");
      setLoading(false);
      return;
    }
    if (!formData.department) {
      setError("Department is required");
      setLoading(false);
      return;
    }
    if (!formData.branch) {
      setError("Branch is required");
      setLoading(false);
      return;
    }
    if (!formData.affectedUser.trim()) {
      setError("Affected User is required");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("cbcToken");
    if (!token) {
      setError("You are not logged in. Please log in again.");
      setLoading(false);
      return;
    }

    // Get the assigned user's name from assignableUsers
    let assignedToName = "Unassigned";
    let assignedToEmail = null;


    if (formData.assignedToEmail && formData.assignedToEmail !== "") {
      assignedToEmail = formData.assignedToEmail;
      const selectedUser = assignableUsers.find(u => u.email === formData.assignedToEmail);
      assignedToName = selectedUser ? selectedUser.name : formData.assignedToEmail.split('@')[0];
    }


    // No need to find user - assignedToEmail already contains the email
    const ticketData = {
      date: formData.date,
      systemName: formData.systemName,
      problemDetails: formData.problemDetails,
      department: formData.department,
      branch: formData.branch,
      riskLabel: formData.riskLabel,
      affectedUser: formData.affectedUser,
      assignedToEmail: assignedToEmail,
      assignedToName: assignedToName,  // ✅ ADD THIS
      pcName: formData.pcName || "",
      downTime: formData.downTime,
    };
    console.log("Sending ticket data:", ticketData);

    try {
      await createTicket(ticketData, token);
      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      console.error("Ticket creation error:", err);
      setError(err.message || "An error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-2">
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Create Ticket
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <Layers size={20} />
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Layers size={20} className="text-blue-600" />
                  Templates
                </h2>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <TemplateSidebar
                searchTemplate={searchTemplate}
                setSearchTemplate={setSearchTemplate}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                favoriteTemplates={favoriteTemplates}
                otherTemplates={otherTemplates}
                categories={categories}
                favorites={favorites}
                onApplyTemplate={handleApplyTemplate}
                onToggleFavorite={handleToggleFavorite}
              />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Layout */}
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div className={`hidden lg:block bg-white/80 backdrop-blur-sm border-r border-gray-200 shadow-xl transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-1/6 min-w-[280px]'}`}>
          {sidebarCollapsed ? (
            <div className="h-full flex flex-col items-center pt-6">
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="p-2 hover:bg-blue-50 rounded-lg transition mb-4"
                title="Expand Templates"
              >
                <ChevronRight size={20} className="text-gray-600" />
              </button>
              <div className="flex flex-col items-center gap-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <Layers size={20} className="text-white" />
                </div>
                <span className="text-xs text-gray-500 writing-vertical">Templates</span>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                      <Layers size={16} className="text-white" />
                    </div>
                    Templates
                  </h2>
                  <button
                    onClick={() => setSidebarCollapsed(true)}
                    className="p-1 hover:bg-white/50 rounded-lg transition"
                    title="Collapse Templates"
                  >
                    <ChevronLeft size={18} className="text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <TemplateSidebar
                  searchTemplate={searchTemplate}
                  setSearchTemplate={setSearchTemplate}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  favoriteTemplates={favoriteTemplates}
                  otherTemplates={otherTemplates}
                  categories={categories}
                  favorites={favorites}
                  onApplyTemplate={handleApplyTemplate}
                  onToggleFavorite={handleToggleFavorite}
                />
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-4 lg:p-8">
            {/* Desktop Header */}
            <div className="hidden lg:flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Create Incident Ticket
                </h1>
                <p className="text-gray-500 mt-1 flex items-center gap-2">
                  <Zap size={16} className="text-yellow-500" />
                  Fill in the details below to report a new IT incident
                </p>
              </div>
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-white/50 rounded-xl transition border border-gray-200"
              >
                <X size={18} />
                Back to Dashboard
              </button>
            </div>

            {/* Ticket Form */}
            <div id="ticket-form" className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
              {success && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 text-green-700 rounded-lg animate-pulse">
                  <p className="font-semibold flex items-center gap-2">
                    <CheckCircle size={18} />
                    Ticket created successfully!
                  </p>
                  <p className="text-sm">Redirecting to dashboard...</p>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 text-red-700 rounded-lg">
                  <p className="font-semibold flex items-center gap-2">
                    <AlertCircle size={18} />
                    {error}
                  </p>
                </div>
              )}

              {selectedTemplate && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 text-blue-700 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap size={18} className="text-yellow-500" />
                    <p className="text-sm font-medium">Template Applied: {selectedTemplate.name}</p>
                  </div>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Row 1: Affected User & PC Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <User size={16} className="text-blue-500" />
                      Affected User <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="affectedUser"
                      value={formData.affectedUser}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white transition-all"
                      placeholder="Employee name, ID or role"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Cpu size={16} className="text-indigo-500" />
                      Affected PC Name
                    </label>
                    <input
                      type="text"
                      name="pcName"
                      value={formData.pcName}
                      onChange={handleChange}
                      placeholder="e.g., CBCMRP01 or CORLAPTOP01"
                      className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white transition-all"
                    />
                    {detectedBranch && (
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <MapPin size={12} />
                        Auto-detected: {detectedBranch}
                      </p>
                    )}
                  </div>
                </div>

                {/* Row 2: System Name & Department */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Server size={16} className="text-purple-500" />
                      System Name <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="systemName"
                      value={formData.systemName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none bg-white transition-all"
                      required
                    >
                      <option value="">Select a system</option>
                      {systemOptions.map((system) => (
                        <option key={system.id} value={system.name}>{system.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Database size={16} className="text-cyan-500" />
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none bg-white transition-all"
                      required
                    >
                      <option value="">Select a department</option>
                      {departmentOptions.map((dept) => (
                        <option key={dept.id} value={dept.name}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 3: Branch & Assigned To - UPDATED Assigned To dropdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <MapPin size={16} className="text-green-500" />
                      Branch <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none bg-white transition-all"
                      required
                    >
                      <option value="">Select a branch</option>
                      {branchOptions.map((branch) => (
                        <option key={branch.id} value={branch.name}>{branch.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <User size={16} className="text-violet-500" />
                      Assigned To
                    </label>
                    <select
                      name="assignedToEmail"  // ✅ Changed to assignedToEmail
                      value={formData.assignedToEmail}  // ✅ Changed to assignedToEmail
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none bg-white transition-all"
                      disabled={usersLoading}
                    >
                      <option value="">Unassigned</option>
                      {assignableUsers.map((user) => (
                        <option key={user.id} value={user.email}>  
                          {user.name}
                        </option>
                      ))}
                    </select>
                    {usersLoading && (
                      <p className="text-xs text-gray-400">Loading users...</p>
                    )}
                  </div>
                </div>

                {/* Row 4: Report Date, Risk Level & Down Time */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Calendar size={16} className="text-pink-500" />
                      Report Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none bg-white transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <AlertCircle size={16} className="text-orange-500" />
                      Risk Level <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-3">
                      {riskLevels.map((risk) => (
                        <label key={risk} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="radio"
                            name="riskLabel"
                            value={risk}
                            checked={formData.riskLabel === risk}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className={`px-3 py-1 rounded-full text-xs font-medium transition-all group-hover:scale-105 ${risk === "HIGH" ? "bg-gradient-to-r from-red-100 to-red-200 text-red-700 border border-red-300" :
                            risk === "MEDIUM" ? "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700 border border-yellow-300" :
                              "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border border-blue-300"
                            }`}>
                            {risk}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Clock size={16} className="text-blue-500" />
                      Down Time <span className="text-gray-400 text-xs font-normal">(When issue started)</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="downTime"
                        value={formData.downTime}
                        onChange={handleChange}
                        placeholder="DD/MM/YYYY, HH:MM:SS AM/PM"
                        className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white transition-all text-sm"
                      />
                      <button
                        type="button"
                        onClick={setCurrentTimeAsDownTime}
                        className="px-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition flex items-center gap-1 text-sm font-medium shadow-md hover:shadow-lg whitespace-nowrap"
                      >
                        <Clock size={16} />
                        Now
                      </button>
                    </div>
                  </div>
                </div>

                {/* Problem Details */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FileText size={16} className="text-teal-500" />
                    Problem Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="problemDetails"
                    value={formData.problemDetails}
                    onChange={handleChange}
                    rows="5"
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none resize-none bg-white transition-all"
                    placeholder="Describe the problem in detail. Include error messages, steps to reproduce, and business impact."
                    required
                  ></textarea>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-semibold py-2 rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {loading ? "Creating Ticket..." : "Create Ticket"}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-xl transition-all border border-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .writing-vertical {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
      `}</style>
    </div>
  );
}

// Template Sidebar Component
function TemplateSidebar({
  searchTemplate, setSearchTemplate, selectedCategory, setSelectedCategory,
  favoriteTemplates, otherTemplates, categories, favorites, onApplyTemplate, onToggleFavorite
}) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
        <input
          type="text"
          placeholder="Search templates..."
          value={searchTemplate}
          onChange={(e) => setSearchTemplate(e.target.value)}
          className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* Category Filter */}
      <div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Favorite Templates */}
      {favoriteTemplates.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Star size={12} className="text-yellow-500 fill-yellow-500" />
            Favorites
          </h3>
          <div className="space-y-1.5">
            {favoriteTemplates.map((template) => (
              <TemplateCardCompact
                key={template.id}
                template={template}
                isFavorite={true}
                onSelect={() => onApplyTemplate(template)}
                onToggleFavorite={() => onToggleFavorite(template.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Templates */}
      {otherTemplates.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            All Templates
          </h3>
          <div className="space-y-1.5">
            {otherTemplates.map((template) => (
              <TemplateCardCompact
                key={template.id}
                template={template}
                isFavorite={favorites.includes(template.id)}
                onSelect={() => onApplyTemplate(template)}
                onToggleFavorite={() => onToggleFavorite(template.id)}
              />
            ))}
          </div>
        </div>
      )}

      {favoriteTemplates.length === 0 && otherTemplates.length === 0 && (
        <div className="text-center py-6 text-gray-400">
          <FileText size={24} className="mx-auto mb-2" />
          <p className="text-xs">No templates found</p>
        </div>
      )}
    </div>
  );
}

// Compact Template Card for Sidebar
function TemplateCardCompact({ template, isFavorite, onSelect, onToggleFavorite }) {
  const Icon = template.icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full group rounded-lg border border-gray-200 p-3 text-left hover:border-blue-400 hover:shadow-md transition-all duration-200 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50"
    >
      <div className="flex items-start gap-2">
        <div className={`h-8 w-8 rounded-lg bg-gradient-to-r ${template.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <Icon size={14} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <p className="font-medium text-gray-900 text-xs truncate">{template.name}</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className="text-gray-400 hover:text-yellow-500 transition flex-shrink-0"
            >
              {isFavorite ? <Star size={12} fill="currentColor" className="text-yellow-500" /> : <Star size={12} />}
            </button>
          </div>
          <p className="text-xs text-gray-400 truncate mt-0.5">{template.data.systemName}</p>
          <span className={`inline-block mt-1 text-xs px-1.5 py-0.5 rounded-full ${template.bgColor} ${template.textColor} border`}>
            {template.data.riskLabel}
          </span>
        </div>
      </div>
    </button>
  );
}