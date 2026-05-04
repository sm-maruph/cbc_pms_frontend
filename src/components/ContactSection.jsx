import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ContactSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState(""); // success or error message

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    const formData = new FormData(e.target);

    try {
      const response = await fetch("https://formspree.io/f/xanlravp", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
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
    <section className="relative w-full h-[65VH] flex items-center justify-center overflow-hidden">
      {/* 🌄 Background Image */}
      <img
        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1950&q=80"
        alt="Contact Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* 🖤 Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* ✉️ Get in Touch Button */}
      <motion.button
        onClick={() => setIsModalOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative z-10 px-8 py-3 bg-white/90 text-gray-900 font-semibold rounded-md shadow-lg backdrop-blur-sm hover:bg-white transition-all"
      >
        Get in Touch
      </motion.button>

      {/* 💬 Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-11/12 max-w-md relative"
            >
              {/* ❌ Close Button */}
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setStatus("");
                }}
                className="absolute top-4 right-4 text-gray-600 hover:text-heading dark:text-heading dark:hover:text-heading text-2xl font-bold"
              >
                ✕
              </button>

              {/* 🧭 Heading */}
              <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
                Contact Us
              </h2>

              {/* 📝 Form */}
              {status === "success" ? (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-600 text-center font-semibold"
                >
                  ✅ Thank you! Your message has been sent successfully.
                </motion.p>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    required
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-bg-secondary outline-none dark:bg-gray-800 dark:text-white"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    required
                     className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-bg-secondary outline-none dark:bg-gray-800 dark:text-white"
                  />
                  <input
                    type="text"
                    name="subject"
                    id="subject"
                    required
                     className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-bg-secondary outline-none dark:bg-gray-800 dark:text-white"
                    placeholder="Subject"
                  />
                  <textarea
                    name="message"
                    placeholder="Your Message"
                    rows={4}
                    required
                     className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-bg-secondary outline-none dark:bg-gray-800 dark:text-white"
                  ></textarea>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.03 }}
                    className="bg-secondary text-heading py-2 rounded-md font-semibold hover:bg-blue-700 transition-all"
                  >
                    {status === "loading" ? "Sending..." : "Send Message"}
                  </motion.button>
                </form>
              )}

              {status === "error" && (
                <p className="text-red-500 text-center mt-4">
                  ❌ Something went wrong. Please try again later.
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
