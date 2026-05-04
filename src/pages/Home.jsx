import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* HERO */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 dark:from-gray-900 dark:to-gray-800 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">
            Commercial Bank of Ceylon
          </h1>
          <h2 className="text-2xl font-semibold mb-2">
            IT Operations - User Problem Management (UPM)
          </h2>
          <p className="text-lg opacity-90 max-w-2xl">
            Centralized platform for reporting, tracking, and resolving IT incidents,
            service requests, and user issues across bank operations.
          </p>

          <div className="mt-6 flex gap-4">
            <a
              href="/admin/login"
              className="bg-white text-blue-800 px-5 py-2 rounded-lg font-medium"
            >
              Sign In
            </a>
            <a
              href="/incidents"
              className="border border-white px-5 py-2 rounded-lg"
            >
              View Incidents
            </a>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Open Incidents", value: 28 },
          { label: "In Progress", value: 14 },
          { label: "Resolved Today", value: 32 },
          { label: "Critical Issues", value: 5 },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow"
          >
            <h3 className="text-gray-500 dark:text-gray-300">
              {item.label}
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {item.value}
            </p>
          </div>
        ))}
      </section>

      {/* QUICK ACCESS */}
      <section className="max-w-6xl mx-auto px-6 py-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Quick Access
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            Raise Incident Ticket
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            Track Existing Issue
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            Service Requests
          </div>
        </div>
      </section>

      {/* SYSTEM STATUS */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          System Status
        </h2>
        <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 p-4 rounded-lg text-green-800 dark:text-green-300">
          All banking IT systems are operational and secure.
        </div>
      </section>

      {/* ANNOUNCEMENTS */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Announcements
        </h2>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-gray-700 dark:text-gray-300">
          Scheduled maintenance window: Sunday 11:00 PM - 2:00 AM (System upgrade & security patching).
        </div>
      </section>
    </div>
  );
}
