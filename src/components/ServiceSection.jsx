import React from "react";
import { motion } from "framer-motion";

export default function ServiceSection({ title, description, images }) {
  return (
    <motion.section
      className="my-12 px-8"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      {/* Heading */}
      <h2 className="text-3xl font-bold text-center text-heading mb-4">{title}</h2>
      <p className="text-center text-gray-600 mb-8 text-body">{description}</p>

      {/* Photo Gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((img, index) => (
          <motion.div
            key={index}
            className="overflow-hidden rounded-lg shadow-lg relative"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5, type: "spring", stiffness: 300 }}
          >
            {img.loading ? (
              // Shimmer loader
              <div className="w-full h-[30vh] bg-secondary animate-pulse rounded-lg" />
            ) : (
              <img
                src={img.src}
                alt={img.alt || `Image ${index + 1}`}
                className="w-full h-[30vh] object-contain"
              />
            )}
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
