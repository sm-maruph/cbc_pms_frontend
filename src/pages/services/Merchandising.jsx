import React, { useEffect, useState } from "react";
import ServiceSection from "../../components/ServiceSection";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const CACHE_KEY = "merchandising_services";
const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour

export default function Merchandising() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      const now = new Date().getTime();

      if (now - parsed.timestamp < CACHE_EXPIRY) {
        setImages(parsed.data);
        setLoading(false);
        return;
      } else {
        // Remove expired cache
        localStorage.removeItem(CACHE_KEY);
      }
    }
    fetchMerchandisingServices();
  }, []);

  const fetchMerchandisingServices = async () => {
    try {
      const res = await axios.get(`${API_BASE}/services`);
      const merchImages = res.data
        .filter((s) => s.category === "Merchandising")
        .map((s) => ({ src: s.image_url, alt: s.title }));

      setImages(merchImages);

      // Save to localStorage with timestamp
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ data: merchImages, timestamp: new Date().getTime() })
      );
    } catch (err) {
      console.error("Failed to fetch Merchandising services:", err);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const loaderImages = Array.from({ length: 4 }, (_, i) => ({
    src: "",
    alt: `loading-${i}`,
    loading: true,
  }));

  return (
    <div className="max-w-screen mx-auto py-5 bg-accent">
      <ServiceSection
        title="MERCHANDISING"
        description="OUR MERCHANDISING TEAM WORKS HAND‑IN‑HAND WITH CLIENTS TO ENSURE ON‑TIME DELIVERY AND PREMIUM QUALITY AT EVERY STAGE."
        images={loading ? loaderImages : images}
      />
    </div>
  );
}
