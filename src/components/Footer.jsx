import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white text-center py-4 mt-auto">
      <p className="text-sm">
        © {new Date().getFullYear()} Commercial Bank of Ceylon – IT Support Portal
      </p>
    </footer>
  );
}