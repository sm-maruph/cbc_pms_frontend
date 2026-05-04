import React, { useState, useEffect } from "react";
import axios from "axios";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

function Banners() {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [isOpen, setIsOpen] = useState(false); // New state to toggle modal

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await axios.get(`${API_BASE}/banners`);
      setBanners(res.data);
    } catch (err) {
      setError("Failed to load banners");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !image) {
      setError("Title and image are required");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("image", image);

    setLoading(true);
    setError("");

    try {
      await axios.post(`${API_BASE}/banners`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTitle("");
      setImage(null);
      setImagePreview(null);
      fetchBanners();
    } catch {
      setError("Failed to upload banner");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, image_url) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;

    setDeletingId(id);
    setError("");

    try {
      await axios.delete(`${API_BASE}/banners/${id}`, {
        data: { image_url },
      });
      fetchBanners();
    } catch {
      setError("Failed to delete banner");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 relative">
      {/* Button instead of heading */}
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
  {isOpen ? "▲ Hide Banners Manager" : "▼ Click Here To Manage Banners"}
  <span className="ml-2">{isOpen ? "▲" : "▼"}</span>
</button>


      {/* Dropdown Modal */}
      {isOpen && (
        <div className="border rounded shadow-lg p-4 mt-4 bg-none space-y-4">
          {/* Banner Upload Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Banner Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border p-2 w-full"
            />
            <p>**Please make sure adding an image with ratio of 16:9 **</p>
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
              {loading ? "Uploading..." : "Add Banner"}
            </button>
          </form>

          {/* Banner List */}
          <div className="flex space-x-4 overflow-x-auto py-2">
            {banners.map(({ id, title, image_url }) => (
              <div
                key={id}
                className="relative border rounded p-2 flex-shrink-0 w-48 flex flex-col items-center"
              >
                <img
                  src={image_url}
                  alt={title}
                  className="max-h-24 w-full object-contain mb-2 rounded"
                />
                <h3 className="text-sm font-semibold text-center truncate w-full mb-1">
                  {title}
                </h3>
                <button
                  onClick={() => handleDelete(id, image_url)}
                  disabled={deletingId === id}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 transition"
                  title="Delete Banner"
                  type="button"
                >
                  {deletingId === id ? "..." : "×"}
                </button>
              </div>
            ))}
          </div>

          {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
}

export default Banners;
