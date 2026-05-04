import React, { useEffect, useState } from "react";
import ServiceSection from "../../components/ServiceSection";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const CACHE_KEY = "knit_services";
const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour in milliseconds

export default function Knit() {
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
    fetchKnitServices();
  }, []);

  const fetchKnitServices = async () => {
    try {
      const res = await axios.get(`${API_BASE}/services`);
      const knitImages = res.data
        .filter((s) => s.category === "Knit Showroom")
        .map((s) => ({ src: s.image_url, alt: s.title }));

      setImages(knitImages);

      // Save to localStorage with timestamp
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ data: knitImages, timestamp: new Date().getTime() })
      );
    } catch (err) {
      console.error("Failed to fetch Knit services:", err);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  // Shimmer placeholders while loading
  const loaderImages = Array.from({ length: 4 }, (_, i) => ({
    src: "",
    alt: `loading-${i}`,
    loading: true,
  }));

  return (
    <div className="max-w-screen mx-auto py-5 bg-accent">
      <ServiceSection
        title="KNIT SHOWROOM"
        description="OUR KNITWEAR AND SWEATER SHOWROOMS SHOWCASE TREND‑DRIVEN, SEASON‑ORIENTED COLLECTIONS DESIGNED TO INSPIRE BUYERS AND ACCELERATE FAST‑FASHION OPPORTUNITIES."
        images={loading ? loaderImages : images}
      />
    </div>
  );
}
