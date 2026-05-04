import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

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

const templateTickets = [
  {
    id: "template-1",
    name: "Network Outage at Branch",
    systemName: "Network",
    department: "Operations",
    branch: "Colombo Branch",
    problemDetails: "Branch network is down and users cannot connect to the internal banking applications.",
    riskLabel: "HIGH",
    assignedTo: "eazuddin@cbc.com",
  },
  {
    id: "template-2",
    name: "Email Access Failure",
    systemName: "Email Server",
    department: "IT",
    branch: "Head Office",
    problemDetails: "Users are unable to receive or send emails from the corporate email system.",
    riskLabel: "MEDIUM",
    assignedTo: "jahidul@cbc.com",
  },
  {
    id: "template-3",
    name: "ERP Login Issue",
    systemName: "ERP System",
    department: "Finance",
    branch: "Dhaka Branch",
    problemDetails: "Users receive an authentication error when logging into the ERP application.",
    riskLabel: "HIGH",
    assignedTo: "supriya@cbc.com",
  },
];

export default function CreateTicket({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
  });

  const [systemOptions, setSystemOptions] = useState(() => {
    const stored = localStorage.getItem("cbcSystems");
    return stored
      ? JSON.parse(stored)
      : ["Email Server", "Core Banking", "ERP System", "Network", "Reporting Portal"];
  });

  const [departmentOptions, setDepartmentOptions] = useState(() => {
    const stored = localStorage.getItem("cbcDepartments");
    return stored
      ? JSON.parse(stored)
      : ["IT", "Finance", "Operations", "HR", "Compliance", "Branch Operations", "Customer Service"];
  });

  const [branchOptions, setBranchOptions] = useState(() => {
    const stored = localStorage.getItem("cbcBranches");
    return stored
      ? JSON.parse(stored)
      : ["Head Office", "Colombo Branch", "Kandy Branch", "Chittagong Branch", "Sylhet Branch", "Dhaka Branch"];
  });

  const [customSystemName, setCustomSystemName] = useState("");
  const [customDepartment, setCustomDepartment] = useState("");
  const [customBranch, setCustomBranch] = useState("");

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

  const handleApplyTemplate = (template) => {
    setFormData((prev) => ({
      ...prev,
      systemName: template.systemName,
      department: template.department,
      branch: template.branch,
      problemDetails: template.problemDetails,
      riskLabel: template.riskLabel,
      assignedTo: template.assignedTo,
    }));
  };

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
        downTime: "",
        upTime: "",
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
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Incident Ticket</h1>
          <p className="text-gray-600">
            Fill in the details below to report a new IT incident and assign it to a registered user.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Ticket Templates</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {templateTickets.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => handleApplyTemplate(template)}
                className="rounded-xl border border-gray-200 p-4 text-left hover:border-blue-500 hover:bg-blue-50 transition"
              >
                <p className="font-semibold text-gray-900">{template.name}</p>
                <p className="text-sm text-gray-600 mt-2">{template.systemName} · {template.department}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {success && (
            <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-600 text-green-800 rounded-lg">
              <p className="font-semibold">✓ Ticket created successfully!</p>
              <p className="text-sm">Redirecting to dashboard...</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-600 text-red-800 rounded-lg">
              <p className="font-semibold">✗ {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reported By <span className="text-red-600">*</span>
                </label>
                <select
                  name="reportedBy"
                  value={formData.reportedBy}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-600 focus:outline-none bg-white text-gray-900 transition"
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
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-600 focus:outline-none bg-white text-gray-900 transition"
                >
                  <option value="">Unassigned</option>
                  {availableUsers.map((u) => (
                    <option key={u.email} value={u.email}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  System Name <span className="text-red-600">*</span>
                </label>
                <select
                  name="systemName"
                  value={formData.systemName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-600 focus:outline-none bg-white text-gray-900 transition"
                  required
                >
                  <option value="">Select or add a system</option>
                  {systemOptions.map((system) => (
                    <option key={system} value={system}>{system}</option>
                  ))}
                </select>
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={customSystemName}
                    onChange={(e) => setCustomSystemName(e.target.value)}
                    placeholder="Add new system name"
                    className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-600 focus:outline-none bg-white text-gray-900 transition"
                  />
                  <button
                    type="button"
                    onClick={handleAddSystem}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Report Date <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-600 focus:outline-none bg-white text-gray-900 transition"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Department <span className="text-red-600">*</span>
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-600 focus:outline-none bg-white text-gray-900 transition"
                  required
                >
                  <option value="">Select a department</option>
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={customDepartment}
                    onChange={(e) => setCustomDepartment(e.target.value)}
                    placeholder="Add new department"
                    className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-600 focus:outline-none bg-white text-gray-900 transition"
                  />
                  <button
                    type="button"
                    onClick={handleAddDepartment}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Branch <span className="text-red-600">*</span>
                </label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-600 focus:outline-none bg-white text-gray-900 transition"
                  required
                >
                  <option value="">Select a branch</option>
                  {branchOptions.map((branch) => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={customBranch}
                    onChange={(e) => setCustomBranch(e.target.value)}
                    placeholder="Add new branch"
                    className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-600 focus:outline-none bg-white text-gray-900 transition"
                  />
                  <button
                    type="button"
                    onClick={handleAddBranch}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Risk Level <span className="text-red-600">*</span>
                </label>
                <select
                  name="riskLabel"
                  value={formData.riskLabel}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-600 focus:outline-none bg-white text-gray-900 transition"
                  required
                >
                  {riskLevels.map((risk) => (
                    <option key={risk} value={risk}>{risk}</option>
                  ))}
                </select>
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
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-600 focus:outline-none bg-white text-gray-900 transition"
                  placeholder="Employee name or role"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Problem Details <span className="text-red-600">*</span>
              </label>
              <textarea
                name="problemDetails"
                value={formData.problemDetails}
                onChange={handleChange}
                rows="5"
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-600 focus:outline-none bg-white text-gray-900 transition resize-none"
                placeholder="Describe the problem in detail. Include any error messages, steps to reproduce, and impact."
                required
              ></textarea>
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Ticket..." : "Create Ticket"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
