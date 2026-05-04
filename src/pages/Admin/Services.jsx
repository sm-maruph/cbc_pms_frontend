import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function Services() {
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const categories = ["Knit Showroom", "Woven Showroom", "Sample Section", "Merchandising"];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await axios.get(`${API_BASE}/services`);
      setServices(res.data);
    } catch (err) {
      setError("Failed to load services");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !title || (!image && !editingId)) {
      setError("Category, title, and image are required");
      return;
    }

    const formData = new FormData();
    formData.append("category", category);
    formData.append("title", title);
    if (image) formData.append("image", image);

    setLoading(true);
    setError("");

    try {
      if (editingId) {
        await axios.put(`${API_BASE}/services/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post(`${API_BASE}/services`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setCategory("");
      setTitle("");
      setImage(null);
      setImagePreview(null);
      setEditingId(null);
      fetchServices();
    } catch {
      setError(editingId ? "Failed to update service" : "Failed to add service");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    setCategory(service.category);
    setTitle(service.title);
    setImagePreview(service.image_url);
    setImage(null);
    setEditingId(service.id);
    setIsOpen(true);
  };

  const handleDelete = async (id, image_url) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;

    setDeletingId(id);
    setError("");

    try {
      await axios.delete(`${API_BASE}/services/${id}`, { data: { image_url } });
      fetchServices();
    } catch {
      setError("Failed to delete service");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
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
        {isOpen ? "▲ Hide Strength Manager" : "▼ Click Here To Manage Strengths"}
      </button>

      {isOpen && (
        <div className="border rounded shadow-lg p-4 mt-4 bg-none space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border p-2 w-full"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Strength Title (e.g., ks1, ws2)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border p-2 w-full"
            />

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="border p-2 w-full"
            />

            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-2 max-h-24 object-contain border rounded"
              />
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              {loading ? (editingId ? "Updating..." : "Uploading...") : editingId ? "Update Service" : "Add Service"}
            </button>
          </form>

          {error && <p className="text-red-600 mt-2">{error}</p>}

          <div className="space-y-6 mt-4">
            {categories.map((cat) => (
              <div key={cat}>
                <h3 className="text-xl font-semibold mb-2">{cat}</h3>
                <div className="flex space-x-4 overflow-x-auto py-2">
                  {services
                    .filter((s) => s.category === cat)
                    .map(({ id, title, image_url }) => (
                      <div key={id} className="relative border rounded p-2 flex-shrink-0 w-48 flex flex-col items-center">
                        <img
                          src={image_url}
                          alt={title}
                          className="max-h-24 w-full object-contain mb-2 rounded"
                        />
                        <h3 className="text-sm font-semibold text-center truncate w-full mb-1">{title}</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit({ id, category: cat, title, image_url })}
                            className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(id, image_url)}
                            disabled={deletingId === id}
                            className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-xs"
                          >
                            {deletingId === id ? "..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
