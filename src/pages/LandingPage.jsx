import React from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* HERO */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 dark:from-gray-900 dark:to-gray-800 text-white px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Commercial Bank of Ceylon
          </h1>

          <h2 className="text-xl md:text-2xl font-semibold mb-6 opacity-90">
            IT Operations – User Problem Management System
          </h2>

          <p className="max-w-2xl text-lg opacity-90">
            A centralized platform to report, track, and resolve IT incidents,
            service requests, and operational issues across all banking channels
            with secure workflows and SLA-driven resolution.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/admin/login"
              className="bg-white text-blue-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Sign In
            </Link>

            <Link
              to="/incidents"
              className="border border-white px-6 py-2 rounded-lg font-medium hover:bg-white hover:text-blue-800 transition"
            >
              View Incidents
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-10">
          Core Capabilities
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
              Incident Management
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Track, prioritize, and resolve IT incidents with SLA-based workflow automation.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
              Service Requests
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Handle user requests efficiently with structured approval processes.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
              Asset & User Support
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Maintain IT assets and provide centralized user support operations.
            </p>
          </div>
        </div>
      </section>

      {/* SLA INFO */}
      <section className="bg-gray-100 dark:bg-gray-800 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            SLA Driven Operations
          </h2>

          <p className="text-gray-700 dark:text-gray-300 max-w-3xl">
            This system ensures all IT incidents are handled within defined SLA timelines,
            enabling faster resolution, better accountability, and improved service
            reliability across banking operations.
          </p>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="text-center py-16 px-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Ready to access IT support?
        </h2>

        <Link
          to="/admin/login"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Login to System
        </Link>
      </section>
    </div>
  );
}