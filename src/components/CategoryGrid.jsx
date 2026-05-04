import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const CACHE_KEY = "all_services_cache";
const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour in milliseconds

export default function CategoryShowrooms() {
  const [allServices, setAllServices] = useState([]);
  const [imageIndexes, setImageIndexes] = useState({});
  const [loading, setLoading] = useState(true);

  const categoryNames = [
    "WOVEN SHOWROOM",
    "KNIT SHOWROOM",
    "SAMPLE SECTION",
    "MERCHANDISING",
  ];

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      const now = new Date().getTime();

      // Check if cache is expired
      if (now - parsed.timestamp < CACHE_EXPIRY) {
        console.log("Loaded services from cache:", parsed.data);
        setAllServices(parsed.data);

        const initialIndexes = {};
        categoryNames.forEach((cat) => (initialIndexes[cat] = 0));
        setImageIndexes(initialIndexes);
        setLoading(false);
        return;
      } else {
        // Remove expired cache
        localStorage.removeItem(CACHE_KEY);
      }
    }

    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      console.log("Fetching all services from API...");
      const res = await axios.get(`${API_BASE}/services`);
      console.log("Raw API response:", res.data);

      setAllServices(res.data);

      // Save with timestamp
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ data: res.data, timestamp: new Date().getTime() })
      );

      const initialIndexes = {};
      categoryNames.forEach((cat) => (initialIndexes[cat] = 0));
      setImageIndexes(initialIndexes);
    } catch (err) {
      console.error("Failed to fetch services:", err);
      setAllServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (allServices.length === 0) return;

    const timer = setInterval(() => {
      setImageIndexes((prev) => {
        const newIndexes = { ...prev };
        categoryNames.forEach((cat) => {
          const catImages = allServices
            .filter((s) => s.category?.toLowerCase() === cat.toLowerCase())
            .map((s) => s.image_url)
            .filter(Boolean);
          if (catImages.length > 0) {
            newIndexes[cat] = (newIndexes[cat] + 1) % catImages.length;
          }
        });
        return newIndexes;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [allServices]);

  if (loading || allServices.length === 0) return null;

  return (
    <section className="bg-accent py-12 px-4 md:px-8">
      <h1 className="text-2xl md:text-2xl text-center text-heading mb-10">
        OUR STRENGTH
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {categoryNames.map((catName) => {
          const catServices = allServices.filter(
            (s) => s.category?.toLowerCase() === catName.toLowerCase()
          );
          const images = catServices.map((s) => s.image_url).filter(Boolean);
          const currentIndex = imageIndexes[catName] || 0;

          if (images.length === 0) return null;

          return (
            <motion.div
              key={catName}
              className="relative rounded-2xl shadow-lg overflow-hidden bg-none border border-white/20 dark:border-neutral hover:shadow-2xl transition-transform duration-300"
              whileHover={{ scale: 1.03 }}
            >
              <div className="relative w-full h-56 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={images[currentIndex]}
                    src={images[currentIndex]}
                    alt={catName}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.6 }}
                    onError={(e) =>
                      console.error("Image failed to load:", e.currentTarget.src)
                    }
                  />
                </AnimatePresence>
              </div>

              <div className="absolute bottom-0 w-full bg-primary-gradient bg-opacity-40 py-3 text-center">
                <h2 className="text-lg font-semibold text-heading">{catName}</h2>
              </div>

              <div className="absolute bottom-2 right-3 flex gap-1">
                {images.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full ${
                      currentIndex === idx ? "bg-white" : "bg-gray-400"
                    }`}
                  ></div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
