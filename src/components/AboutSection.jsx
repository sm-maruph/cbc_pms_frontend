import React from "react";
import { motion } from "framer-motion";

export default function AboutSection() {
  return (
    <section className="min-h-[45vh] pt-2 bg-accent py-12 px-6 overflow-x-hidden">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-6 mt-6 overflow-x-hidden">
        {/* Image Section */}
        <motion.div
          initial={{ x: -100, opacity: 0 }} // reduced offset
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true }}
          className="shadow-2xl rounded-xl overflow-hidden w-full md:w-1/2"
        >
          <img
            src="https://www.fzfashionworld.com/wp-content/uploads/2024/07/WhatsApp-Image-2023-03-18-at-9.14.32-PM-1-1024x682.jpeg"
            alt="About"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Text Section */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true }}
          className="bg-none backdrop-blur-xl border border-white/20 dark:border-neutral shadow-lg rounded-b-xl p-6 md:w-1/2 relative overflow-hidden"
        >
          {/* Gradient Header Bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-primary-gradient" />

          <h2 className="text-2xl font-heading text-heading mb-4 mt-4 relative z-10">
            Grupo Sourcing Ltd
          </h2>
          <p className="text-sm leading-relaxed font-sans text-heading relative z-10">
            “Grupo Sourcing Ltd, founded in 2016, is a leading Bangladeshi
            apparel sourcing company with over 9 years of industry
            expertise. Renowned for quality, reliability, and innovation, we
            serve global fashion brands across denim, knitwear, woven,
            sportswear, and home textiles.
            <br />
            <br />
            Committed to sustainability, transparency, and ethical practices,
            Grupo Sourcing ensures every product meets international standards
            through a vertically integrated supply chain and dedicated quality
            team.
            <br />
            <br />
            Our vision is to be the most trusted sourcing partner
            worldwide—blending craftsmanship, innovation, and sustainability to
            strengthen Bangladesh’s global apparel presence.”
          </p>
        </motion.div>
      </div>
    </section>
  );
}
