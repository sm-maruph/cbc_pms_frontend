import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function PartnersSection() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const res = await axios.get(`${API_BASE}/clients`);
      // Expecting data to be array of { name, image_url }
      setPartners(res.data.map((p) => ({ name: p.name, logo_url: p.logo_url })));
    } catch (err) {
      console.error("Failed to fetch partners:", err);
      setPartners([]); // fallback empty
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-accent py-16">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-2xl text-center text-heading mb-10">
          OUR PARTNERS
        </h2>
      </div>

      {loading ? (
        // Facebook-like shimmer grid
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-6xl mx-auto px-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-2xl bg-secondary animate-pulse"
            ></div>
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-6xl mx-auto px-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.8, staggerChildren: 0.1 },
            },
          }}
        >
          {partners.map((partner, index) => (
            <motion.div
              key={index}
              className="flex justify-center items-center bg-white/5 backdrop-blur-md rounded-2xl p-6 hover:scale-105 transition-all duration-300"
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1 },
              }}
            >
              <img
                src={partner.logo_url}
                alt={partner.name}
                className="max-h-14 object-contain grayscale-0 hover:transition duration-300"
                onError={(e) => {
                  e.currentTarget.src =
                    "data:image/svg+xml;utf8," +
                    encodeURIComponent(
                      `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='80'><rect width='100%' height='100%' fill='#f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#9ca3af' font-family='Arial' font-size='12'>Image unavailable</text></svg>`
                    );
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
