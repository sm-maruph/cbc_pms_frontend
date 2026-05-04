import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const CACHE_KEY = "hero_banners";
const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour in milliseconds

export default function HeroBanner({
  interval = 2000, // ms
  showArrows = true,
  showIndicators = true,
  headerHeight = "",
  className = "",
}) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
  const fetchBanners = async () => {
    try {
      const res = await axios.get(`${API_BASE}/banners`);

      const banners = res.data.map((b, i) => ({
        src: b.image_url,
        alt: b.title || `Banner ${i + 1}`,
      }));

      // Save new data to cache
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data: banners,
          timestamp: new Date().getTime(),
        })
      );

      setImages(banners);
    } catch (err) {
      console.error("Failed to fetch banners:", err);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  // Remove cache completely so latest banners load
  localStorage.removeItem(CACHE_KEY);

  fetchBanners();
}, []);


  const fetchBanners = async () => {
    try {
      const res = await axios.get(`${API_BASE}/banners`);
       console.log("API Response:", res.data); // <== LOG THIS
      const banners = res.data.map((b, i) => ({
        src: b.image_url,
        alt: b.alt || `Banner ${i + 1}`,
      }));
      setImages(banners);
          console.log("Processed Banners:", banners); // <== LOG THIS


      // Save to localStorage with timestamp
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ data: banners, timestamp: new Date().getTime() })
      );
    } catch (err) {
      console.error("Failed to fetch banners:", err);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paused || images.length === 0) return;
    timeoutRef.current = setTimeout(() => {
      setIndex((i) => (i + 1) % images.length);
    }, interval);
    return () => clearTimeout(timeoutRef.current);
  }, [index, paused, images.length, interval]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const goTo = (i) => setIndex(((i % images.length) + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  return (
    <section
      className={`${headerHeight} ${className} w-full relative overflow-hidden select-none`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Hero banner"
    >
      <div className="relative h-64 sm:h-80 md:h-[85vh] lg:h-[65vh]">
        {loading ? (
          <div className="absolute inset-0 animate-pulse bg-secondary rounded"></div>
        ) : (
          images.map((img, i) => {
            const active = i === index;
            return (
              <figure
                key={i}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out transform ${
                  active ? "opacity-100 z-20" : "opacity-0 z-10 pointer-events-none"
                }`}
                aria-hidden={!active}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className={`w-full h-full object-contain transform transition-transform duration-[12000ms] ease-linear ${
                    active ? "scale-105" : "scale-100"
                  }`}
                  onError={(e) => {
                    e.currentTarget.src =
                      "data:image/svg+xml;utf8," +
                      encodeURIComponent(
                        `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'><rect width='100%' height='100%' fill='#f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#9ca3af' font-family='Arial' font-size='20'>Image unavailable</text></svg>`
                      );
                  }}
                />
              </figure>
            );
          })
        )}
      </div>

      {/* arrows */}
      {!loading && showArrows && (
        <>
          <button onClick={prev} aria-label="Previous slide" className="absolute left-3 top-1/2 -translate-y-1/2 z-30 bg-white/40 dark:bg-black/40 hover:bg-white dark:hover:bg-black text-gray-800 dark:text-white rounded-full p-3 shadow-lg focus:outline-none">
            ‹
          </button>

          <button onClick={next} aria-label="Next slide" className="absolute right-3 top-1/2 -translate-y-1/2 z-30 bg-white/40 dark:bg-black/40 hover:bg-white dark:hover:bg-black text-gray-800 dark:text-white rounded-full p-3 shadow-lg focus:outline-none">
            ›
          </button>
        </>
      )}

      {/* indicators */}
      {!loading && showIndicators && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-6 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 transition-all duration-300 rounded-full ${
                i === index ? "w-10 bg-white dark:bg-gray-200 shadow" : "w-2 bg-white/60 dark:bg-black/40"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
