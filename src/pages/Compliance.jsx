import React from "react";
import { motion } from "framer-motion";
import {
  Baby,
  Lock,
  Gavel,
  AlertTriangle,
  Scale,
  HeartHandshake,
  Clock,
  HandCoins,
  Users,
  Ban,
  Building2,
  ShieldCheck,
  Leaf,
} from "lucide-react";

export default function Compliance() {
  const points = [
    {
      title: "Child Labor",
      icon: Baby,
      text: "Use of child labor will not be tolerated. We will not work with business partners employing workers under 15 years of age or below the mandatory school age in the respective country.",
    },
    {
      title: "Forced Labor",
      icon: Lock,
      text: "We will not engage with any factory or organization that uses forced or bonded labor.",
    },
    {
      title: "Disciplinary Practices",
      icon: Gavel,
      text: "Factories must establish disciplinary procedures that comply with local laws. We prohibit any form of abuse, coercion, or corporal punishment.",
    },
    {
      title: "Abusement & Harassment",
      icon: AlertTriangle,
      text: "Harassment or abasement of any kind is strictly prohibited according to buyer codes of conduct, our business ethics, and local laws.",
    },
    {
      title: "Legal Requirements",
      icon: Scale,
      text: "All business partners must comply with applicable local laws governing their operations.",
    },
    {
      title: "Ethical Standards",
      icon: HeartHandshake,
      text: "We collaborate with organizations whose ethical principles align with ours, ensuring integrity and respect.",
    },
    {
      title: "Working Hours",
      icon: Clock,
      text: "We prefer partners adhering to a 60-hour workweek limit. Overtime must comply with local laws, and employees must receive one day off per week.",
    },
    {
      title: "Wages & Benefits",
      icon: HandCoins,
      text: "Workers should be compensated as per prevailing law and receive all legally entitled benefits.",
    },
    {
      title: "Freedom of Association",
      icon: Users,
      text: "We respect workers’ rights to join associations and participate in collective bargaining without discrimination or punishment.",
    },
    {
      title: "Discrimination",
      icon: Ban,
      text: "Employment decisions should be based on skills only. Discrimination based on caste, creed, race, or religion will not be tolerated.",
    },
    {
      title: "Unauthorized Subcontract",
      icon: Building2,
      text: "Unauthorized subcontracting is a zero-tolerance violation. No production may be subcontracted without prior approval.",
    },
    {
      title: "Building & Fire Safety",
      icon: ShieldCheck,
      text: "Business partners must ensure building and fire safety per local laws and buyer requirements.",
    },
    {
      title: "Health & Safety",
      icon: ShieldCheck,
      text: "We only engage with factories that maintain safe and healthy working environments for employees.",
    },
    {
      title: "Environment",
      icon: Leaf,
      text: "Partners must ensure eco-friendly processes and comply with environmental laws, striving to exceed minimum standards.",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const card = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="bg-primary min-h-screen py-16 px-6 md:px-16 font-sans text-body">
      {/* Animated Header Section */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl font-bold text-heading mb-3">Compliance & Ethics</h1>
        <p className="text-[16px] text-body/80 max-w-3xl mx-auto">
          Guided by integrity and respect for human rights, our compliance principles ensure fairness, 
          safety, and sustainability across every partnership.
        </p>
      </motion.div>

      {/* Image Grid with Motion */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={container}
      >
        {[
          "https://kafjvkvzsdkofnzevohc.supabase.co/storage/v1/object/public/gsl/services/ss/ss2.webp",
          "https://apparelresources.com/wp-content/uploads/2022/07/Green-Factory-Award.jpg",
        ].map((src, i) => (
          <motion.img
            key={i}
            src={src}
            alt={`Compliance visual ${i + 1}`}
            className="w-full h-64 object-cover rounded-2xl shadow-lg hover:scale-105 transition-transform duration-700"
            variants={card}
          />
        ))}
      </motion.div>

      {/* Intro Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-secondary p-6 md:p-8 rounded-2xl shadow-xl mb-14 text-[15px] text-heading leading-relaxed text-justify border border-primary/20"
      >
        <p>
          Our compliance code draws from the United Nations’ values, the Declaration of Human Rights, 
          ILO core conventions, and national labor laws. We only partner with factories that uphold the 
          highest ethical, legal, and humanitarian standards.
        </p>
      </motion.div>

      {/* Compliance Points */}
      <motion.div
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        {points.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={index}
              variants={card}
              className="bg-accent/90 p-6 rounded-2xl shadow-md border border-primary/20 flex flex-col gap-4 
                         hover:shadow-xl hover:-translate-y-2 hover:border-primary/40 
                         transition-all duration-500 ease-out backdrop-blur-sm"
            >
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="bg-inverse p-3 rounded-full flex items-center justify-center shadow-inner">
                  <Icon className="text-primary w-7 h-7" />
                </div>
                <h3 className="font-semibold text-lg text-heading">{item.title}</h3>
              </motion.div>
              <p className="text-[15px] text-body leading-relaxed">{item.text}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
