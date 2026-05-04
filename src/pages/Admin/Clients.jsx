import React, { useState, useEffect } from "react";
import axios from "axios";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

function Clients() {
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null); // New state for edit mode
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await axios.get(`${API_BASE}/clients`);
      setClients(res.data);
    } catch (err) {
      setError("Failed to load clients");
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setLogo(file);
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    } else {
      setLogoPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !website) {
      setError("Name and website are required");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("website", website);
    if (logo) formData.append("logo", logo);

    setLoading(true);
    setError("");

    try {
      if (editingId) {
        // Update client
        await axios.put(`${API_BASE}/clients/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // Add new client
        if (!logo) {
          setError("Logo is required for new client");
          setLoading(false);
          return;
        }
        await axios.post(`${API_BASE}/clients`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // Reset form
      setName("");
      setWebsite("");
      setLogo(null);
      setLogoPreview(null);
      setEditingId(null);
      fetchClients();
    } catch {
      setError(editingId ? "Failed to update client" : "Failed to upload client");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (client) => {
    setEditingId(client.id);
    setName(client.name);
    setWebsite(client.website);
    setLogoPreview(client.logo_url);
    setIsOpen(true);
  };

  const handleDelete = async (id, logo_url) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;

    setDeletingId(id);
    setError("");

    try {
      await axios.delete(`${API_BASE}/clients/${id}`, { data: { logo_url } });
      fetchClients();
    } catch {
      setError("Failed to delete client");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className=" w-full
    text-center
    font-semibold
    rounded
    bg-neutral
    text-heading
    py-2
    px-4
    mb-4
    text-base       /* mobile default font size */
    sm:text-lg      /* small screens */
    md:text-2xl     /* medium and above */
    hover:bg-mm-primary-dark
    active:scale-95
    transition-all
    duration-300
    ease-in-out
    shadow-md
    hover:shadow-lg"
      >
        {isOpen ? "▲ Hide Clients Manager" : "▼ Click Here To Manage Clients"}
        <span className="ml-2">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="border rounded shadow-lg p-4 mt-4 bg-none space-y-4">
          {/* Client Upload / Edit Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Client Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 w-full"
            />
            <input
              type="text"
              placeholder="Website URL"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="border p-2 w-full"
            />
            <p>**Please upload the client's logo (preferably square or 1:1 ratio)**</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="border p-2 w-full"
            />
            {logoPreview && (
              <img
                src={logoPreview}
                alt="Logo Preview"
                className="mt-2 max-h-24 object-contain border rounded"
              />
            )}
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              {loading ? (editingId ? "Updating..." : "Uploading...") : editingId ? "Update Client" : "Add Client"}
            </button>
          </form>

          {/* Client List */}
          <div className="flex space-x-4 overflow-x-auto py-2">
            {clients.map(({ id, name, logo_url, website }) => (
              <div
                key={id}
                className="relative border rounded p-2 flex-shrink-0 w-48 flex flex-col items-center"
              >
                <img
                  src={logo_url}
                  alt={name}
                  className="max-h-24 w-full object-contain mb-2 rounded"
                />
                <h3 className="text-sm font-semibold text-center truncate w-full mb-1">
                  {name}
                </h3>
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 underline mb-2"
                >
                  Visit Website
                </a>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit({ id, name, website, logo_url })}
                    className="bg-yellow-500 text-white rounded px-2 py-1 text-xs hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(id, logo_url)}
                    disabled={deletingId === id}
                    className="bg-red-600 text-white rounded px-2 py-1 text-xs hover:bg-red-700"
                  >
                    {deletingId === id ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
}

export default Clients;
