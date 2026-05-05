import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock, Calendar, User, Server, AlertCircle, CheckCircle,
  Activity, Zap, FileText, Plus, X, ChevronDown, ChevronUp,
  Play, Square, Timer, Watch, Monitor, Database, Wifi,
  Printer, Mail, Shield, Globe, CreditCard, Smartphone, TrendingUp,
  Download, Copy, Trash2, Edit, Filter, Search, Star, StarOff
} from "lucide-react";

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

// Templates extracted from the Excel data (actual issues from the log)
const quickTemplates = [
  {
    id: "template-1",
    name: "ICBS Access Denied",
    icon: Shield,
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    category: "Access Issue",
    data: {
      systemName: "ICBS",
      department: "Treasury Back Office",
      problemDetails: "Access denied issue. User unable to login to ICBS system. Error message indicates session device limit reached or authentication failure.",
      riskLabel: "HIGH",
      affectedUser: "TBO officials",
    }
  },
  {
    id: "template-2",
    name: "Branch Network Down",
    icon: Wifi,
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    category: "Network Issue",
    data: {
      systemName: "Branch Network",
      department: "Operations",
      problemDetails: "Complete branch network outage. Users cannot connect to internal banking applications. Branch operations fully halted.",
      riskLabel: "HIGH",
      affectedUser: "Full Branch Users",
    }
  },
  {
    id: "template-3",
    name: "T4S Printing Error",
    icon: Printer,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    category: "Printing Issue",
    data: {
      systemName: "T4S NEXUS",
      department: "Customer Service",
      problemDetails: "Unable to print from T4S system. Voucher prints were not coming out. CCB Error showing in the system.",
      riskLabel: "MEDIUM",
      affectedUser: "Cash Counter Users",
    }
  },
  {
    id: "template-4",
    name: "Email Login Failure",
    icon: Mail,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    category: "Login Issue",
    data: {
      systemName: "Corporate Email",
      department: "IT",
      problemDetails: "Unable to login to email. 2-factor authentication not working or password sync issue. Cannot access critical communications.",
      riskLabel: "HIGH",
      affectedUser: "All Dept Users",
    }
  },
  {
    id: "template-5",
    name: "BACH & BEFTN File Issue",
    icon: Database,
    color: "from-cyan-500 to-cyan-600",
    bgColor: "bg-cyan-50",
    textColor: "text-cyan-700",
    category: "Clearing Issue",
    data: {
      systemName: "BACH & BEFTN",
      department: "Central Clearing",
      problemDetails: "Outward file NACK issue / ACK not received. Files not getting acknowledged by the system.",
      riskLabel: "MEDIUM",
      affectedUser: "Clearing Department",
    }
  },
  {
    id: "template-6",
    name: "Profile Lock / AD Lock",
    icon: Activity,
    color: "from-yellow-500 to-yellow-600",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-700",
    category: "AD Issue",
    data: {
      systemName: "Active Directory",
      department: "Customer Service",
      problemDetails: "User profile getting locked frequently. Unable to login to PC due to AD lock issue. Password needs reset.",
      riskLabel: "MEDIUM",
      affectedUser: "Branch Users",
    }
  },
  {
    id: "template-7",
    name: "ICBS Session Device Limit",
    icon: Monitor,
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-700",
    category: "Session Issue",
    data: {
      systemName: "ICBS Session",
      department: "Customer Service",
      problemDetails: "Reached session device limit. User cannot login to AS400 due to multiple active sessions.",
      riskLabel: "MEDIUM",
      affectedUser: "Branch User",
    }
  },
  {
    id: "template-8",
    name: "Share Folder Access",
    icon: Server,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    category: "Access Issue",
    data: {
      systemName: "Share Folder",
      department: "Customer Service",
      problemDetails: "Unable to access share folder / network drive. Permission issue or security patch causing access denied.",
      riskLabel: "LOW",
      affectedUser: "Branch Staff",
    }
  },
  {
    id: "template-9",
    name: "AMlock Login Issue",
    icon: Shield,
    color: "from-pink-500 to-pink-600",
    bgColor: "bg-pink-50",
    textColor: "text-pink-700",
    category: "Login Issue",
    data: {
      systemName: "AMlock Profile Setup",
      department: "Trade Finance",
      problemDetails: "Unable to login to AMLOCK due to compatibility issue. Functions not showing after login.",
      riskLabel: "LOW",
      affectedUser: "Finance Users",
    }
  },
  {
    id: "template-10",
    name: "Excel File Corruption",
    icon: FileText,
    color: "from-emerald-500 to-emerald-600",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    category: "Application Issue",
    data: {
      systemName: "Microsoft Office",
      department: "Finance & Accounts",
      problemDetails: "Unable to open Excel files from D drive. File corrupted or security patch causing access issue.",
      riskLabel: "MEDIUM",
      affectedUser: "Accounts Department",
    }
  },
  {
    id: "template-11",
    name: "ATM Out of Service",
    icon: CreditCard,
    color: "from-rose-500 to-rose-600",
    bgColor: "bg-rose-50",
    textColor: "text-rose-700",
    category: "ATM Issue",
    data: {
      systemName: "ATM",
      department: "ATM Operations",
      problemDetails: "ATM showing blank screen / card reader error / cash dispenser error. Customers unable to withdraw cash.",
      riskLabel: "HIGH",
      affectedUser: "ATM Customers",
    }
  },
  {
    id: "template-12",
    name: "Scanner Not Working",
    icon: Smartphone,
    color: "from-teal-500 to-teal-600",
    bgColor: "bg-teal-50",
    textColor: "text-teal-700",
    category: "Hardware Issue",
    data: {
      systemName: "Scanner",
      department: "Customer Service",
      problemDetails: "Unable to scan cheques due to connectivity issue. Scanner not detected by the system.",
      riskLabel: "MEDIUM",
      affectedUser: "Clearing Staff",
    }
  }
];

// Get unique categories for filter
const categories = [...new Set(quickTemplates.map(t => t.category))];

export default function CreateTicket({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [searchTemplate, setSearchTemplate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("favoriteTemplates");
    return saved ? JSON.parse(saved) : ["template-1", "template-4", "template-6"];
  });

  // Downtime tracking
  const [downTimeActive, setDownTimeActive] = useState(false);
  const [downTimeStart, setDownTimeStart] = useState(null);
  const [downTimeElapsed, setDownTimeElapsed] = useState(0);
  const [downTimeManual, setDownTimeManual] = useState("");
  const [upTimeManual, setUpTimeManual] = useState("");

  const [formData, setFormData] = useState({
    reportedBy: user.email,
    assignedTo: "",
    systemName: "",
    problemDetails: "",
    department: "",
    branch: "",
    riskLabel: "MEDIUM",
    affectedUser: "",
    date: new Date().toISOString().split("T")[0],
    downTime: "",
    upTime: "",
  });

  const [systemOptions, setSystemOptions] = useState(() => {
    const stored = localStorage.getItem("cbcSystems");
    const defaultSystems = ["ICBS", "T4S NEXUS", "BACH & BEFTN", "Email Server", "Core Banking", "ERP System", "Network", "ATM", "AMlock", "Active Directory", "Share Folder", "FX Portal", "LOS", "SWIFT", "EXIMBILL"];
    return stored ? JSON.parse(stored) : defaultSystems;
  });

  const [departmentOptions, setDepartmentOptions] = useState(() => {
    const stored = localStorage.getItem("cbcDepartments");
    const defaultDepts = ["IT", "Finance & Accounts", "Operations", "HR", "Compliance", "Customer Service", "Trade Finance", "Treasury Back Office", "Treasury Front Office", "Central Clearing", "Corporate Banking", "Digital Banking", "ICC", "IRMD", "Credit Admin", "Branch Operations"];
    return stored ? JSON.parse(stored) : defaultDepts;
  });

  const [branchOptions, setBranchOptions] = useState(() => {
    const stored = localStorage.getItem("cbcBranches");
    const defaultBranches = ["Head Office BD", "Chittagong Branch", "Sylhet Branch", "Dhaka Branch", "Gulshan Branch", "Uttara Branch", "Motijheel Branch", "Mirpur Branch", "Panthapath Branch", "Tejgaon Branch", "Narayanganj Branch", "Tongi Branch", "Corporate Branch"];
    return stored ? JSON.parse(stored) : defaultBranches;
  });

  const [customSystemName, setCustomSystemName] = useState("");
  const [customDepartment, setCustomDepartment] = useState("");
  const [customBranch, setCustomBranch] = useState("");

  // Timer interval
  useEffect(() => {
    let interval;
    if (downTimeActive) {
      interval = setInterval(() => {
        setDownTimeElapsed(Math.floor((Date.now() - downTimeStart) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [downTimeActive, downTimeStart]);

  const formatElapsedTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startDownTime = () => {
    setDownTimeActive(true);
    setDownTimeStart(Date.now());
    setDownTimeElapsed(0);
  };

  const stopDownTime = () => {
    if (downTimeActive && downTimeStart) {
      const endTime = Date.now();
      const elapsedSeconds = Math.floor((endTime - downTimeStart) / 1000);
      const formattedTime = formatElapsedTime(elapsedSeconds);
      setFormData(prev => ({ ...prev, downTime: formattedTime }));
      setDownTimeManual(formattedTime);
    }
    setDownTimeActive(false);
    setDownTimeStart(null);
  };

  const resetDownTime = () => {
    setDownTimeActive(false);
    setDownTimeStart(null);
    setDownTimeElapsed(0);
    setDownTimeManual("");
    setFormData(prev => ({ ...prev, downTime: "" }));
  };

  const availableUsers = useMemo(() => {
    const stored = localStorage.getItem("cbcUsers");
    const usersMap = new Map();

    if (stored) {
      JSON.parse(stored).forEach((u) => {
        if (u.email) {
          usersMap.set(u.email, { email: u.email, name: u.name });
        }
      });
    }

    defaultUsers.forEach((u) => usersMap.set(u.email, u));
    if (user?.email) {
      usersMap.set(user.email, { email: user.email, name: user.name });
    }

    return Array.from(usersMap.values());
  }, [user]);

  const riskLevels = ["LOW", "MEDIUM", "HIGH"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addOption = (storageKey, value, options, setOptions, stateSetter) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (!options.includes(trimmed)) {
      const updated = [...options, trimmed];
      setOptions(updated);
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }
    if (stateSetter) stateSetter(trimmed);
  };

  const handleAddSystem = () => {
    addOption("cbcSystems", customSystemName, systemOptions, setSystemOptions, (value) => {
      setFormData((prev) => ({ ...prev, systemName: value }));
      setCustomSystemName("");
    });
  };

  const handleAddDepartment = () => {
    addOption("cbcDepartments", customDepartment, departmentOptions, setDepartmentOptions, (value) => {
      setFormData((prev) => ({ ...prev, department: value }));
      setCustomDepartment("");
    });
  };

  const handleAddBranch = () => {
    addOption("cbcBranches", customBranch, branchOptions, setBranchOptions, (value) => {
      setFormData((prev) => ({ ...prev, branch: value }));
      setCustomBranch("");
    });
  };

  const toggleFavorite = (templateId) => {
    setFavorites(prev => {
      const newFavs = prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId];
      localStorage.setItem("favoriteTemplates", JSON.stringify(newFavs));
      return newFavs;
    });
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
    // Scroll to form
    document.getElementById("ticket-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const setCurrentTimeAsDownTime = () => {
    const now = new Date();
    const formatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setFormData(prev => ({ ...prev, downTime: formatted }));
    setDownTimeManual(formatted);
  };

  const setCurrentTimeAsUpTime = () => {
    const now = new Date();
    const formatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setFormData(prev => ({ ...prev, upTime: formatted }));
    setUpTimeManual(formatted);
  };

  const filteredTemplates = useMemo(() => {
    return quickTemplates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTemplate.toLowerCase()) ||
                           template.category.toLowerCase().includes(searchTemplate.toLowerCase()) ||
                           template.data.systemName.toLowerCase().includes(searchTemplate.toLowerCase());
      const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTemplate, selectedCategory]);

  const favoriteTemplates = quickTemplates.filter(t => favorites.includes(t.id));
  const otherTemplates = filteredTemplates.filter(t => !favorites.includes(t.id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
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

      const reporter = availableUsers.find((u) => u.email === formData.reportedBy) || {
        email: user.email,
        name: user.name,
      };
      const assignee = availableUsers.find((u) => u.email === formData.assignedTo) || null;

      const newTicket = {
        id: Math.random().toString(36).substr(2, 9),
        sl: Math.floor(Math.random() * 9000) + 1000,
        date: formData.date,
        month: new Date(formData.date).toLocaleString("default", { month: "long" }),
        reportedBy: reporter.email,
        reportedByName: reporter.name,
        assignedToEmail: assignee?.email || "",
        assignedToName: assignee?.name || "",
        systemName: formData.systemName,
        problemDetails: formData.problemDetails,
        department: formData.department,
        branch: formData.branch,
        riskLabel: formData.riskLabel,
        affectedUser: formData.affectedUser || user.name,
        resolution: "",
        downTime: formData.downTime,
        upTime: formData.upTime,
        remarks: "",
        remarksByAdmin: "",
        specialInstruction: "",
        status: "open",
        createdAt: new Date().toISOString(),
      };

      const existingTickets = localStorage.getItem("cbcTickets");
      const tickets = existingTickets ? JSON.parse(existingTickets) : [];
      tickets.push(newTicket);
      localStorage.setItem("cbcTickets", JSON.stringify(tickets));

      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Create Incident Ticket
              </h1>
              <p className="text-gray-500 mt-2">
                Fill in the details below to report a new IT incident
              </p>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition"
            >
              <X size={18} />
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Quick Templates Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Zap size={20} className="text-yellow-500" />
                Quick Ticket Templates
              </h2>
              <p className="text-sm text-gray-500 mt-1">Select a template to auto-fill common incident details</p>
            </div>
            <button
              onClick={() => setShowAllTemplates(!showAllTemplates)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              {showAllTemplates ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {showAllTemplates ? "Show Less" : "View All Templates"}
            </button>
          </div>

          {/* Search and Filter */}
          {showAllTemplates && (
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTemplate}
                  onChange={(e) => setSearchTemplate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}

          {/* Favorite Templates */}
          {favoriteTemplates.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                Favorite Templates
              </h3>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {favoriteTemplates.slice(0, showAllTemplates ? favoriteTemplates.length : 3).map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isFavorite={true}
                    onSelect={() => handleApplyTemplate(template)}
                    onToggleFavorite={() => toggleFavorite(template.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Other Templates */}
          {(showAllTemplates ? otherTemplates : otherTemplates.slice(0, 6)).length > 0 && (
            <div>
              {favoriteTemplates.length > 0 && showAllTemplates && (
                <h3 className="text-sm font-medium text-gray-600 mb-2">All Templates</h3>
              )}
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {(showAllTemplates ? otherTemplates : otherTemplates.slice(0, 6)).map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isFavorite={favorites.includes(template.id)}
                    onSelect={() => handleApplyTemplate(template)}
                    onToggleFavorite={() => toggleFavorite(template.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredTemplates.length === 0 && showAllTemplates && (
            <div className="text-center py-8 text-gray-400">
              <FileText size={32} className="mx-auto mb-2" />
              <p>No templates found matching your search</p>
            </div>
          )}
        </div>

        {/* Ticket Form */}
        <div id="ticket-form" className="bg-white rounded-2xl shadow-xl p-8">
          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg">
              <p className="font-semibold flex items-center gap-2">
                <CheckCircle size={18} />
                Ticket created successfully!
              </p>
              <p className="text-sm">Redirecting to dashboard...</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
              <p className="font-semibold flex items-center gap-2">
                <AlertCircle size={18} />
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: Reported By & Assigned To */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reported By <span className="text-red-500">*</span>
                </label>
                <select
                  name="reportedBy"
                  value={formData.reportedBy}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none bg-white"
                >
                  {availableUsers.map((u) => (
                    <option key={u.email} value={u.email}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Assigned To
                </label>
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none bg-white"
                >
                  <option value="">Unassigned</option>
                  {availableUsers.map((u) => (
                    <option key={u.email} value={u.email}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: System Name & Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  System Name <span className="text-red-500">*</span>
                </label>
                <select
                  name="systemName"
                  value={formData.systemName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none bg-white"
                  required
                >
                  <option value="">Select a system</option>
                  {systemOptions.map((system) => (
                    <option key={system} value={system}>{system}</option>
                  ))}
                </select>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={customSystemName}
                    onChange={(e) => setCustomSystemName(e.target.value)}
                    placeholder="Add new system"
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSystem}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                  >
                    Add
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Report Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none bg-white"
                  required
                />
              </div>
            </div>

            {/* Row 3: Department & Branch */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none bg-white"
                  required
                >
                  <option value="">Select a department</option>
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={customDepartment}
                    onChange={(e) => setCustomDepartment(e.target.value)}
                    placeholder="Add new department"
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddDepartment}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                  >
                    Add
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Branch <span className="text-red-500">*</span>
                </label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none bg-white"
                  required
                >
                  <option value="">Select a branch</option>
                  {branchOptions.map((branch) => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={customBranch}
                    onChange={(e) => setCustomBranch(e.target.value)}
                    placeholder="Add new branch"
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddBranch}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Row 4: Risk Level & Affected User */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Risk Level <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  {riskLevels.map((risk) => (
                    <label key={risk} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="riskLabel"
                        value={risk}
                        checked={formData.riskLabel === risk}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        risk === "HIGH" ? "bg-red-100 text-red-700" :
                        risk === "MEDIUM" ? "bg-yellow-100 text-yellow-700" :
                        "bg-green-100 text-green-700"
                      }`}>
                        {risk}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Affected User
                </label>
                <input
                  type="text"
                  name="affectedUser"
                  value={formData.affectedUser}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none bg-white"
                  placeholder="Employee name, ID or role"
                />
              </div>
            </div>

            {/* Row 5: Down Time with Stopwatch */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Down Time <span className="text-gray-400 text-xs font-normal">(When issue started)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="downTime"
                    value={formData.downTime}
                    onChange={handleChange}
                    placeholder="e.g., 09:30 AM or click Stopwatch"
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none bg-white"
                  />
                  <button
                    type="button"
                    onClick={setCurrentTimeAsDownTime}
                    className="px-4 bg-gray-100 rounded-xl hover:bg-gray-200 transition flex items-center gap-1 text-sm"
                  >
                    <Clock size={16} />
                    Now
                  </button>
                </div>

                {/* Stopwatch Section */}
                <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Timer size={16} className="text-blue-500" />
                      Downtime Stopwatch
                    </span>
                    <span className="text-2xl font-mono font-bold text-gray-800">
                      {formatElapsedTime(downTimeElapsed)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {!downTimeActive ? (
                      <button
                        type="button"
                        onClick={startDownTime}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                      >
                        <Play size={14} />
                        Start
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={stopDownTime}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                      >
                        <Square size={14} />
                        Stop & Apply
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={resetDownTime}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
                    >
                      Reset
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    * Click Start to track downtime. When stopped, time will be applied to Down Time field.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Up Time <span className="text-gray-400 text-xs font-normal">(When resolved)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="upTime"
                    value={formData.upTime}
                    onChange={handleChange}
                    placeholder="e.g., 11:45 AM"
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none bg-white"
                  />
                  <button
                    type="button"
                    onClick={setCurrentTimeAsUpTime}
                    className="px-4 bg-gray-100 rounded-xl hover:bg-gray-200 transition flex items-center gap-1 text-sm"
                  >
                    <Clock size={16} />
                    Now
                  </button>
                </div>
              </div>
            </div>

            {/* Problem Details */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Problem Details <span className="text-red-500">*</span>
              </label>
              <textarea
                name="problemDetails"
                value={formData.problemDetails}
                onChange={handleChange}
                rows="5"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none resize-none"
                placeholder="Describe the problem in detail. Include error messages, steps to reproduce, and business impact."
                required
              ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-xl transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Ticket..." : "Create Ticket"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

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
      `}</style>
    </div>
  );
}

// Template Card Component
function TemplateCard({ template, isFavorite, onSelect, onToggleFavorite }) {
  const Icon = template.icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      className="relative group rounded-xl border border-gray-200 p-4 text-left hover:border-blue-400 hover:shadow-md transition-all duration-200 bg-white"
    >
      <div className="flex items-start gap-3">
        <div className={`h-10 w-10 rounded-xl bg-gradient-to-r ${template.color} flex items-center justify-center shadow-sm`}>
          <Icon size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-900 text-sm">{template.name}</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className="text-gray-400 hover:text-yellow-500 transition"
            >
              {isFavorite ? <Star size={14} fill="currentColor" /> : <Star size={14} />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">{template.data.systemName} · {template.category}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            <span className={`text-xs px-1.5 py-0.5 rounded ${template.bgColor} ${template.textColor}`}>
              {template.data.riskLabel}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}