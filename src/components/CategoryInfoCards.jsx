import React from "react";
import { motion } from "framer-motion";

export default function CategoryInfoCards() {
  const items = [
    {
      id: "products",
      title: "OUR PRODUCTS",
      lines: ["Denim & Knits", "Jersey & Woven", "Home Textiles", "Sportswear", "Outdoor Apparel"],
    },
    {
      id: "services",
      title: "OUR SERVICES",
      lines: [
        "Apparel Sourcing",
        "Quality Assurance",
        "Sustainability Consulting",
        "Tech Integration",
        "Market Insights",
      ],
    },
    {
      id: "strength",
      title: "OUR STRENGTH",
      lines: [
        "9+ Years Experience",
        "Integrated Supply Chain",
        "In‑House QC",
        "Global Flexibility",
        "Ethical Practices",
        "Innovation Focus"
      ],
    },
  ];

  return (
    <section className="w-full py-12 px-6 bg-accent">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto text-center mb-16">
        <h1 className="text-2xl md:text-2xl text-center text-heading mb-10">
          Company Overview
        </h1>
        <p className="mt-4 text-body dark:text-body text-lg font-sans max-w-2xl mx-auto">
          Discover what makes us stand out — our products, our services, and our
          strength in innovation, quality, and collaboration.
        </p>
      </div>

      {/* Cards */}
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.03 }}
            className="relative bg-none dark:bg-accent backdrop-blur-xl border border-white/20 dark:border-neutral rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
          >
            {/* Gradient Header Bar */}
            <div className="h-1.5 w-full bg-primary-gradient" />

            {/* Card Content */}
            <div className="p-8 flex flex-col h-full">
              <h3 className="font-heading text-xl mb-6 text-heading dark:text-heading text-center tracking-wide">
                {item.title}
              </h3>
              <ul className="text-left text-body dark:text-body space-y-3 font-sans flex-1">
                {item.lines.map((line, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary-gradient shadow-sm" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Subtle Glow Effect */}
            <div className="absolute inset-0 opacity-0 hover:opacity-20 transition-opacity duration-300 bg-gradient-to-br from-primary via-secondary to-purple-400 blur-3xl pointer-events-none" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
