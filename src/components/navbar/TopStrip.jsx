// components/navbar/TopStrip.jsx
import { Link } from "react-router-dom";
import logo from "../images/cbc_logo.png";

export default function TopStrip({ user }) {
  const isAdmin = user?.role === "admin";

  return (
    <div className="bg-transparent">
      <div className="flex items-center justify-between">

        {/* LEFT SECTION - Bank Info */}
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-wide leading-tight">
            IT Support Portal
          </h1>
          <p className="text-sm md:text-base lg:text-lg text-blue-200/80">
            Commercial Bank of Ceylon
          </p>
        </div>

        {/* RIGHT SECTION - Big Logo */}
        <Link
          to={isAdmin ? "/admin" : "/dashboard"}
          className="block transition-transform duration-300 hover:scale-105"
        >
          <img
            src={logo}
            alt="CBC Logo"
            className="h-20 w-auto md:h-28 lg:h-32 bg-transparent object-contain"
          />
        </Link>
      </div>
    </div>
  );
}