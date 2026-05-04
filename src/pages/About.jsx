import React from "react";
import { motion } from "framer-motion";
import PartnersSection from "../components/others/PartnersSection";
import StrengthSection from "../components/others/StrengthSection";
export default function About() {
  return (
    <div className="font-sans text-body bg-accent dark:bg-[#000B58] overflow-x-hidden overflow-y-visible relative">
      {/* 🟦 Banner Section */}
      <section className="relative h-[50vh] flex items-center justify-center bg-primary-gradient text-center text-white overflow-visible">
        <img
          src="https://kafjvkvzsdkofnzevohc.supabase.co/storage/v1/object/public/gsl/others/about_banner.png"
          alt="About Banner"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-black/50"></div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 text-3xl md:text-5xl font-heading font-bold drop-shadow-lg"
        >
          WHO ARE WE?
        </motion.h1>
      </section>
      {/* 🟩 Company Profile Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="bg-accent text-heading py-12"
      >
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-2xl md:text-3xl font-heading font-bold text-heading text-center mb-10">
            COMPANY PROFILE
          </h3>

          <div className="grid gap-8 md:grid-cols-2 text-sm md:text-base text-body">
            <div className="space-y-3 backdrop-blur-xl border border-white/20 dark:border-neutral rounded-2xl shadow-xl overflow-hidden p-6 ">
              <p>
                <strong>NAME OF THE COMPANY:</strong> Grupo Sourcing Ltd.
              </p>
              <p>
                <strong>YEAR OF ESTABLISHMENT:</strong> 2016
              </p>
              <p>
                <strong>ADDRESS:</strong> House 256, Road: 03 (East Side) DOHS
                Baridhara, Dhaka-1206, Bangladesh.
              </p>
            </div>
            <div className="space-y-3 backdrop-blur-xl border border-white/20 dark:border-neutral rounded-2xl shadow-xl overflow-hidden p-6 ">
              <p>
                <strong>CONTACT PERSON:</strong> Zamal U. Ahmed (CEO)
              </p>
              <p>
                <strong>Phone:</strong> BD: +88 01711556131
              </p>
              <p className="text-heading">
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:zamal@gruposourcing.com"
                  className=" underline text-heading"
                >
                  zamal@gruposourcing.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </motion.section>
      {/* Container with Gradient Header */}
      <div className="max-w-screen mx-auto px-6 py-12 flex justify-center bg-accent">
        <motion.div
          initial={{ x: 200, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true }}
          className="relative bg-accent backdrop-blur-xl border border-white/20 dark:border-neutral shadow-lg rounded-xl p-6 md:w-3/4 overflow-hidden"
        >
          {/* Gradient Header Bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-primary-gradient" />

          {/* Text Content */}
          <h2 className="text-2xl font-heading text-heading mb-4 mt-4 relative z-10">
            WHO ARE WE?
          </h2>
          <p className="text-sm leading-relaxed font-sans text-heading relative z-10">
            Grupo Sourcing is a distinguished Bangladeshi enterprise founded in
            2016, specializing in the dynamic world of garment fashion. Our
            diverse portfolio spans denim, heavy knits, jersey, woven fabrics,
            home textiles, sportswear, and outdoor apparel. With over 9 years
            of in-depth expertise in the garment industry and profound insights
            into both Bangladeshi and global markets, we are uniquely positioned
            to deliver unmatched value and innovation to our partners.
            <br />
            <br />
            Our business ethos centers on cultivating enduring partnerships with
            meticulously chosen factories and brands, fostering a vision of
            sustainable and progressive growth. We pride ourselves on being a
            contemporary buying and sourcing powerhouse, adeptly customizing our
            solutions to meet the unique demands of our clients. Our approach
            embodies a fresh, seamless, and forward-thinking way of
            collaboration that redefines efficiency and excellence in the
            industry.
          </p>
        </motion.div>
      </div>
      {/* 🟦 Vision & Mission */}
      <section className="bg-accent text-heading py-12">
        <div className="max-w-6xl mx-auto px-6 grid gap-8 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-primary-gradient p-6 rounded-2xl shadow-lg"
          >
            <h3 className="text-2xl font-heading font-bold mb-3 text-body">
              Our Vision
            </h3>
            <p>
              Our vision is to become the most trusted partner for international
              brands through innovation, transparency, and ethical practices.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-primary-gradient p-6 rounded-2xl shadow-lg"
          >
            <h3 className="text-2xl font-heading font-bold mb-3 text-heading">
              Our Mission
            </h3>
            <p>
              Our mission is to redefine efficiency, sustainability, and
              excellence in the global apparel sourcing industry.
            </p>
          </motion.div>
        </div>
      </section>
      {/* OUR VALUES SECTION WITH DIAMOND COLLAGE */}
      <div className="max-w-screen-xl mx-auto px-8 md:px-20 py-16 flex flex-col md:flex-row items-center gap-10 bg-accent">
        {/* 🖼️ Diamond Photo Collage */}
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative flex items-center justify-center md:w-1/2"
        >
          <div className="relative w-72 h-72 md:w-96 md:h-96 mx-auto rotate-45">
            {/* Each image counter-rotated for upright look */}
            <img
              src="https://kafjvkvzsdkofnzevohc.supabase.co/storage/v1/object/public/gsl/others/o1.webp"
              alt="Quality Control"
              className="absolute top-0 left-1/2 transform -translate-x-1/2 -rotate-45 w-40 h-40 object-cover rounded-lg shadow-lg"
            />
            <img
              src="https://kafjvkvzsdkofnzevohc.supabase.co/storage/v1/object/public/gsl/services/m/m3.webp"
              alt="Teamwork"
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -rotate-45 w-40 h-40 object-cover rounded-lg shadow-lg"
            />
            <img
              src="https://kafjvkvzsdkofnzevohc.supabase.co/storage/v1/object/public/gsl/services/m/m2.webp"
              alt="Sustainability"
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -rotate-45 w-40 h-40 object-cover rounded-lg shadow-lg"
            />
            <img
              src="https://kafjvkvzsdkofnzevohc.supabase.co/storage/v1/object/public/gsl/services/ks/ks2.webp"
              alt="Innovation"
              className="absolute right-0 top-1/2 transform -translate-y-1/2 -rotate-45 w-40 h-40 object-cover rounded-lg shadow-lg"
            />
          </div>
        </motion.div>

        {/* 📝 Text Section */}
        <motion.div
          initial={{ x: 60, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true }}
          className="relative bg-none backdrop-blur-xl border border-white/20 dark:border-neutral shadow-lg rounded-b-xl p-6 md:w-1/2"
        >
          {/* Gradient Header Bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-black to-red-800 rounded-t-xl" />

          <h2 className="text-2xl font-heading text-heading mb-4 mt-4">
            Our Values
          </h2>
          <p className="text-sm leading-relaxed font-sans text-heading">
            At Grupo Sourcing, quality is not just a priority—it is the
            cornerstone of our operations. Through meticulous routines and
            proven processes, we consistently deliver products that meet and
            exceed the highest expectations.
            <br />
            <br />
            Our partners operate within a vertically integrated supply chain,
            ensuring full control over every step of production to maintain
            unparalleled quality standards. Complementing this, our dedicated
            in-house quality control team works closely with factories on a
            daily basis.
            <br />
            <br />
            With Grupo Sourcing, you can count on safety, reliability, and
            complete satisfaction.
          </p>
        </motion.div>
      </div>

      {/* 🌱 SUSTAINABILITY SECTION (aligned + responsive) */}
      <div className="max-w-screen-xl mx-auto px-6 md:px-20 py-16 bg-accent">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-10">
          {/* LEFT — Vertical Title (rotated on md+, horizontal on small) */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex-shrink-0 w-full md:w-1/12 flex justify-start md:justify-center"
          >
            {/* show rotated text on md+, normal stacked on mobile */}
            <h2 className="hidden md:block text-2xl md:text-3xl font-bold tracking-widest text-heading -rotate-90 transform origin-center whitespace-nowrap">
              SUSTAINABILITY
            </h2>
          </motion.div>

          {/* CENTER — image + three-circle collage */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="md:w-4/12 w-full flex flex-col items-center"
          >
            <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center">
              {/* Environment circle (left) */}
              <div
                className="absolute rounded-full overflow-hidden shadow-lg"
                style={{
                  width: 160,
                  height: 160,
                  background: "rgba(34,197,94,0.75)", // green-ish (you can swap to image)
                  top: "60%",
                  left: "60%",
                  transform: "translate(-105%, -50%) rotate(0deg)",
                }}
                aria-hidden
              />

              {/* Economic circle (top-right) */}
              <div
                className="absolute rounded-full overflow-hidden shadow-lg"
                style={{
                  width: 160,
                  height: 160,
                  background: "rgba(249,115,22,0.75)", // orange-ish
                  top: "50%",
                  left: "50%",
                  transform: "translate(-60%, -80%) rotate(0deg)",
                }}
                aria-hidden
              />

              {/* Social circle (bottom-right) */}
              <div
                className="absolute rounded-full overflow-hidden shadow-lg"
                style={{
                  width: 160,
                  height: 160,
                  background: "rgba(14,165,233,0.75)", // blue-ish
                  top: "50%",
                  left: "50%",
                  transform: "translate(-30%, -10%) rotate(0deg)",
                }}
                aria-hidden
              />
            </div>
          </motion.div>

          {/* RIGHT — four text blocks (grid adjusts to single column on small screens) */}
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            viewport={{ once: true }}
            className="md:w-7/12 w-full grid grid-cols-1 md:grid-cols-2 gap-6 text-sm md:text-base leading-relaxed text-heading"
          >
            <div className="border-l-2 border-gray-300 dark:border-gray-600 pl-4">
              <p>
                <strong>At Grupo Sourcing, sustainability</strong> is more than
                an initiative; it is an intrinsic value embedded in our vision
                and operations. We are deeply committed to fostering sustainable
                practices that prioritize both social and environmental
                responsibility.
              </p>
            </div>

            <div className="border-l-2 border-gray-300 dark:border-gray-600 pl-4">
              <p>
                All our partners adhere to stringent compliance standards,
                ensuring they meet the highest benchmarks in social and
                environmental sustainability. We collaborate with third-party
                organizations for certification and traceability.
              </p>
            </div>

            <div className="border-l-2 border-gray-300 dark:border-gray-600 pl-4">
              <p>
                Our dedicated in-house Corporate Social Responsibility (CSR)
                team conducts regular follow-ups and maintenance to uphold these
                standards, ensuring our practices remain proactive and
                impactful.
              </p>
            </div>

            <div className="border-l-2 border-gray-300 dark:border-gray-600 pl-4">
              <p>
                Transparency is paramount at Grupo Sourcing; we offer full
                visibility into our value chain so partners and clients can be
                assured of ethical and sustainable practices at every stage.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <StrengthSection />
      {/* <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-screen mx-auto px-6 py-12 flex flex-col items-center text-auto bg-accent"
      >
        <h3 className="text-2xl font-heading font-bold text-heading mb-6">
          Area of Work
        </h3>
        <ul className="list-disc space-y-2">
          <li>
            Acting as buying agents/local representatives to execute orders on
            behalf of customers.
          </li>
          <li>
            Sourcing cost-effective and quality apparel items from compliant
            factories.
          </li>
          <li>
            Managing production follow-up, inspections, and shipment assurance.
          </li>
          <li>Ensuring timely delivery with professional quality auditing.</li>
        </ul>
      </motion.section> */}
      {/* 🟩 Services Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="bg-accent py-12"
      >
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-2xl font-heading font-bold text-heading text-center mb-6">
            Our Services
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "WOVEN SHOWROOM",
                text: "“WE OPERATE MODERN SHOWROOMS EQUIPPED WITH THE LATEST TREND‑ORIENTED DESIGNS AND STATE‑OF‑THE‑ART FIXTURES, ENSURING AN INNOVATIVE AND CUSTOMER‑FRIENDLY SHOPPING EXPERIENCE.”",
              },
              {
                title: "KNIT SHOWROOM",
                text: "“OUR KNITWEAR AND SWEATER SHOWROOMS SHOWCASE TREND‑DRIVEN, SEASON‑ORIENTED COLLECTIONS DESIGNED TO INSPIRE BUYERS AND ACCELERATE FAST‑FASHION OPPORTUNITIES.”",
              },
              {
                title: "SAMPLE SECTION",
                text: "“WE OPERATE A DEDICATED WOVEN SAMPLE SECTION ENSURES FAST TURNAROUND AND RELIABLE SUPPORT, HELPING CLIENTS BRING IDEAS TO LIFE WITH SPEED AND PRECISION.”",
              },
              {
                title: "MERCHANDISING",
                text: "“OUR MERCHANDISING TEAM WORKS HAND‑IN‑HAND WITH CLIENTS TO ENSURE ON‑TIME DELIVERY AND PREMIUM QUALITY AT EVERY STAGE.”",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <h4 className="font-semibold text-lg mb-2 text-headimg">
                  {item.title}:
                </h4>
                <p className="text-body">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
      <PartnersSection />
    </div>
  );
}
