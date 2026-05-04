import React from "react";
import { motion } from "framer-motion";

export default function StrengthSection() {
  const chartData = [
    { year: "FY 21-22", value: 15.0 },
    { year: "FY 22-23", value: 15.5 },
    { year: "FY 23-24", value: 16.6 },
    { year: "FY 24-25", value: 16.0 },
  ];

  const fadeIn = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  const yAxisValues = [20, 18, 16, 14, 12];

  return (
    <section className="bg-accent py-16 px-6 md:px-16 overflow-hidden">
      <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
        {/* ===== Left Side: Chart Section ===== */}
        <motion.div
          className="space-y-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {/* Title */}
          <motion.h2
            className="text-4xl font-extrabold text-heading"
            variants={fadeIn}
          >
            <span className="text-secondary">OUR</span> STRENGTH
          </motion.h2>

          {/* Tagline */}
          <motion.p
            className="bg-secondary text-heading font-semibold px-4 py-2 inline-block text-sm uppercase rounded-sm"
            variants={fadeIn}
          >
            Our revenues to $15M+ over past 5 years
          </motion.p>

          {/* Y-Axis heading */}
          <motion.p
            className="text-secondary font-medium text-sm"
            variants={fadeIn}
          >
            All Figures in USD Million
          </motion.p>

          {/* ===== Chart Container ===== */}
          <div className="relative h-80 w-full mt-8 px-8">
            {/* Y-axis numbering */}
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-gray-400 text-xs font-semibold">
              {yAxisValues.map((val) => (
                <span key={val}>{val}</span>
              ))}
            </div>

            {/* Horizontal grid lines */}
            <div className="absolute left-8 right-0 top-0 bottom-6 flex flex-col justify-between">
              {yAxisValues.map((_, i) => (
                <div
                  key={i}
                  className="w-full h-px bg-gray-700/40"
                ></div>
              ))}
            </div>

            {/* X-axis & bars */}
            <div className="absolute left-10 right-0 bottom-12 top-0 flex justify-between items-end">
              {chartData.map((item, i) => (
                <motion.div
                  key={item.year}
                  className="relative w-14 md:w-16 bg-secondary rounded-t-md overflow-hidden"
                  initial={{ height: 0 }}
                  whileInView={{ height: `${item.value * 10}px` }}
                  transition={{ duration: 1, delay: i * 0.2 }}
                >
                  <div className="absolute top-0 left-0 w-full h-1/4 bg-neutral" />
                  <div className="absolute -top-8 w-full text-center font-bold text-sm">
                    {item.value.toFixed(2)}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* X-axis line */}
            <div className="absolute bottom-12 left-10 right-0 h-0.5 bg-gray-500" />

            {/* X-axis labels */}
            <div className="absolute bottom-0 left-10 right-0 flex justify-between text-gray-300 text-xs font-semibold">
              {chartData.map((item) => (
                <span
                  key={item.year}
                  className="w-14 md:w-16 text-center"
                >
                  {item.year}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ===== Right Side: Sustainable Growth ===== */}
        <motion.div
          className="relative flex flex-col items-center justify-center text-center"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {/* Header Bar */}
          <motion.h3
            className="bg-secondary text-heading text-xl font-bold px-8 py-2 rounded-sm uppercase mb-10"
            variants={fadeIn}
          >
            Sustainable Growth
          </motion.h3>

          {/* Central Circle Image */}
          <motion.div
            className="relative w-56 h-56 md:w-64 md:h-64 rounded-full border-[6px] border-secondary shadow-xl overflow-hidden flex items-center justify-center"
            variants={fadeIn}
          >
            <img
              src="https://kafjvkvzsdkofnzevohc.supabase.co/storage/v1/object/public/gsl/others/o2.jpg"
              alt="Sustainability"
              className="w-full h-full object-cover"
            />

            {/* Surrounding Texts */}
            <motion.span
              className="absolute -top-10 left-1/2 -translate-x-1/2 text-red-400 font-semibold text-sm whitespace-nowrap"
              variants={fadeIn}
            >
              Supplier Consolidation
            </motion.span>

            <motion.span
              className="absolute top-1/4 -left-44 text-red-400 font-semibold text-sm w-36 text-right"
              variants={fadeIn}
            >
              Design Excellence
            </motion.span>

            <motion.span
              className="absolute bottom-1/4 -left-44 text-red-400 font-semibold text-sm w-36 text-right"
              variants={fadeIn}
            >
              Sustainability
            </motion.span>

            <motion.span
              className="absolute bottom-1/4 -right-44 text-red-400 font-semibold text-sm w-36 text-left"
              variants={fadeIn}
            >
              Strong Ethics & Compliance
            </motion.span>

            <motion.span
              className="absolute top-1/4 -right-44 text-red-400 font-semibold text-sm w-36 text-left"
              variants={fadeIn}
            >
              Global Footprint
            </motion.span>

            <motion.span
              className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-red-400 font-semibold text-sm whitespace-nowrap"
              variants={fadeIn}
            >
              Financial Stability
            </motion.span>
          </motion.div>

          {/* Bottom Tagline */}
          <motion.p
            className="text-heading font-extrabold mt-14 text-lg md:text-xl italic"
            variants={fadeIn}
          >
            Global. Collaborative. Ethical!
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
