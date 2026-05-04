import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faTwitter,
  faLinkedinIn,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { useState } from "react";

export default function Contact() {
   const [status, setStatus] = useState(""); // '', 'loading', 'success', 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    const formData = new FormData(e.target);

    try {
      const response = await fetch("https://formspree.io/f/xanlravp", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        setStatus("success");
        e.target.reset();
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <div className="font-sans text-body bg-primary">
      {/* 🟦 Banner Section */}
      <section className="relative h-[50vh] flex items-center justify-center bg-primary-gradient text-center text-white overflow-hidden">
        <img
          src="https://kafjvkvzsdkofnzevohc.supabase.co/storage/v1/object/public/gsl/others/contactus_banner.png"
          alt="Contact Banner"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-black/50"></div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 text-3xl md:text-5xl font-heading font-bold drop-shadow-lg"
        >
          CONTACT US
        </motion.h1>
      </section>

      {/* 🟩 Contact Info Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-12"
      >
        {/* Address & Contact */}
        <div className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-heading">
            Get In Touch
          </h2>

          <div>
            <h3 className="font-semibold text-lg mb-2">ADDRESS:</h3>
            <p className="text-heading">Grupo Sourcing Ltd.</p>
            <p className="text-heading">House 256, Road: 03 (East Side)</p>
            <p className="text-heading"> DOHS Baridhara,Dhaka-1206,</p>
            <p className="text-heading">BANGLADESH</p>
          </div>

          <div>
            <h3 className="font-semibold text-heading mb-2">CONTACT PERSON:</h3>
            <p className="text-heading">Zamal U Ahmed (CEO)</p>
            <p className="text-heading">Cell: +88 01711556131 (BD) </p>
            <p className="text-heading">
              Email:{" "}
              <a href="mailto:zamal@gruposourcing.com" className="text-heading">
                zamal@gruposourcing.com
              </a>
            </p>
          </div>

          {/* Social Icons using React Font Awesome */}
          <div className="flex gap-4 text-2xl">
            <a href="#" className="hover:text-primary transition">
              <FontAwesomeIcon icon={faFacebookF} />
            </a>
            <a href="#" className="hover:text-primary transition">
              <FontAwesomeIcon icon={faTwitter} />
            </a>
            <a href="#" className="hover:text-primary transition">
              <FontAwesomeIcon icon={faLinkedinIn} />
            </a>
            <a href="#" className="hover:text-primary transition">
              <FontAwesomeIcon icon={faYoutube} />
            </a>
          </div>
        </div>

        {/* Contact Form */}
       <motion.form
      onSubmit={handleSubmit}
      className="bg-secondary p-6 rounded-2xl shadow-lg space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-heading font-bold text-heading mb-4 bg-primary-gradient">
        Send us a message
      </h2>

      {/* Success Message */}
      {status === "success" && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-green-600 font-semibold text-center"
        >
          ✅ Thank you! Your message has been sent successfully.
        </motion.p>
      )}

      {/* Error Message */}
      {status === "error" && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 font-semibold text-center"
        >
          ❌ Something went wrong. Please try again.
        </motion.p>
      )}

      <div className="flex flex-col">
        <label htmlFor="name" className="mb-1 font-semibold">
          Your Name *
        </label>
        <input
          type="text"
          name="name"
          id="name"
          required
          className="p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Your Name"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="email" className="mb-1 font-semibold">
          Email *
        </label>
        <input
          type="email"
          name="email"
          id="email"
          required
          className="p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Email"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="subject" className="mb-1 font-semibold">
          Subject *
        </label>
        <input
          type="text"
          name="subject"
          id="subject"
          required
          className="p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Subject"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="message" className="mb-1 font-semibold">
          Message
        </label>
        <textarea
          name="message"
          id="message"
          rows="5"
          required
          className="p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Message"
        ></textarea>
      </div>

      <motion.button
        type="submit"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="bg-primary text-heading font-semibold px-6 py-3 rounded-md hover:bg-hover transition"
      >
        {status === "loading" ? "Sending..." : "Send Message"}
      </motion.button>
    </motion.form>
      </motion.section>
    </div>
  );
}
