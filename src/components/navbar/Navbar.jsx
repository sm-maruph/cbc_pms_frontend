import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FaTicketAlt,
  FaPlusCircle,
  FaUsers,
  FaChartBar,
  FaUserCircle,
  FaEdit,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChevronDown,
} from "react-icons/fa";

import { MdDashboard } from "react-icons/md";

import logo from "../images/cbc_logo.png";
import NotificationBell from "../NotificationBell";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const menuRef = useRef(null);
  const burgerRef = useRef(null);
  const profileRef = useRef(null);

  const isAdmin = user?.role === "admin";

  const navLinks = isAdmin
    ? [
      {
        name: "Dashboard",
        path: "/admin",
        icon: <MdDashboard />,
      },
      {
        name: "Create Ticket",
        path: "/create-ticket",
        icon: <FaPlusCircle />,
      },
      {
        name: "Manage Users",
        path: "/admin/users",
        icon: <FaUsers />,
      },
      {
        name: "Reports",
        path: "/admin/report",
        icon: <FaChartBar />,
      },
    ]
    : [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: <MdDashboard />,
      },
      {
        name: "My Tickets",
        path: "/my-tickets",
        icon: <FaTicketAlt />,
      },
      {
        name: "Create Ticket",
        path: "/create-ticket",
        icon: <FaPlusCircle />,
      },
      {
        name: "Reports",
        path: "/report",
        icon: <FaChartBar />,
      },
    ];

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setProfileOpen(false);
      }
    };

    document.addEventListener("keydown", handleKey);

    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !burgerRef.current?.contains(e.target)
      ) {
        setOpen(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(e.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setOpen(false);
    setProfileOpen(false);

    onLogout();

    navigate("/");
  };

  const animationStyles = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes dropdown {
      from {
        opacity: 0;
        transform: translateY(-10px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes floatingLogo {
      0%,100% {
        transform: translateY(0px);
      }

      50% {
        transform: translateY(-5px);
      }
    }

    .animate-slideInRight {
      animation: slideInRight 0.35s ease forwards;
    }

    .animate-fadeIn {
      animation: fadeIn 0.25s ease forwards;
    }

    .animate-dropdown {
      animation: dropdown 0.22s ease forwards;
    }

    .animate-floatingLogo {
      animation: floatingLogo 4s ease-in-out infinite;
    }
  `;

  return (
    <>
      <style>{animationStyles}</style>

      <nav className="sticky top-0 z-50 w-full overflow-visible border-b border-white/10 backdrop-blur-xl bg-gradient-to-r from-slate-950 via-blue-950 to-slate-950 shadow-2xl">

        <div className="h-[72px] sm:h-[78px] lg:h-[84px] px-3 sm:px-5 lg:px-8 flex items-center">

          {/* LEFT SECTION */}
          <div className="flex items-center gap-3 min-w-0">

            {/* MOBILE MENU BUTTON */}
            <button
              ref={burgerRef}
              onClick={() => setOpen(!open)}
              className="
                lg:hidden
                w-10
                h-10
                rounded-xl
                bg-white/10
                hover:bg-white/20
                border
                border-white/10
                transition-all
                duration-300
                flex
                items-center
                justify-center
              "
            >
              {open ? (
                <FaTimes className="text-white text-sm" />
              ) : (
                <FaBars className="text-white text-sm" />
              )}
            </button>

            {/* TITLE */}
            <div className="hidden sm:flex flex-col leading-tight">
              <h1 className="text-white font-bold text-xl md:text-base tracking-wide">
                IT Support Portal
              </h1>

              <p className="text-[10px] md:text-xs text-blue-200/70">
                Commercial Bank of Ceylon
              </p>
            </div>
          </div>

          {/* CENTER DESKTOP MENU */}
          <div className="hidden lg:flex items-center gap-2 mx-auto">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="
                  group
                  relative
                  flex
                  items-center
                  gap-2
                  px-4
                  py-2
                  rounded-xl
                  text-sm
                  font-medium
                  text-slate-200
                  hover:text-white
                  hover:bg-white/10
                  transition-all
                  duration-300
                  overflow-hidden
                "
              >
                <span className="text-sm group-hover:scale-110 transition-transform duration-300">
                  {link.icon}
                </span>

                {link.name}

                <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </div>

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">

            {/* NOTIFICATION */}
            <div className="relative">
              <NotificationBell user={user} />
            </div>

            {/* PROFILE */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="
                  flex
                  items-center
                  gap-2
                  bg-white/10
                  hover:bg-white/15
                  border
                  border-white/10
                  rounded-2xl
                  px-2
                  sm:px-3
                  py-1.5
                  transition-all
                  duration-300
                "
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg">
                  <FaUserCircle className="text-white text-lg" />
                </div>

                <div className="hidden md:flex flex-col text-left leading-tight">
                  <span className="text-xs font-semibold text-white">
                    {user?.name?.split(" ")[0]}
                  </span>

                  <span className="text-[10px] uppercase tracking-wide text-blue-200">
                    {user?.role}
                  </span>
                </div>

                <FaChevronDown
                  className={`text-[10px] text-white transition-transform duration-300 ${profileOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {/* PROFILE DROPDOWN */}
              {profileOpen && (
                <div
                  className="
                    absolute
                    right-0
                    mt-3
                    w-72
                    rounded-2xl
                    border
                    border-white/10
                    bg-white
                    shadow-2xl
                    overflow-hidden
                    animate-dropdown
                  "
                >
                  <div className="p-5 bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
                    <div className="flex items-center gap-3">

                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <FaUserCircle className="text-white text-3xl" />
                      </div>

                      <div>
                        <h3 className="font-bold text-gray-800 text-sm">
                          {user?.name}
                        </h3>

                        <p className="text-xs text-gray-500">
                          {user?.email}
                        </p>

                        <span className="inline-block mt-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-semibold uppercase">
                          {user?.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">

                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="
                        flex
                        items-center
                        gap-3
                        px-4
                        py-3
                        rounded-xl
                        text-sm
                        text-gray-700
                        hover:bg-slate-100
                        transition-all
                        duration-200
                      "
                    >
                      <FaUserCircle />
                      View Profile
                    </Link>

                    <Link
                      to="/edit-profile"
                      onClick={() => setProfileOpen(false)}
                      className="
                        flex
                        items-center
                        gap-3
                        px-4
                        py-3
                        rounded-xl
                        text-sm
                        text-gray-700
                        hover:bg-slate-100
                        transition-all
                        duration-200
                      "
                    >
                      <FaEdit />
                      Edit Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="
                        w-full
                        flex
                        items-center
                        gap-3
                        px-4
                        py-3
                        rounded-xl
                        text-sm
                        text-red-600
                        hover:bg-red-50
                        transition-all
                        duration-200
                      "
                    >
                      <FaSignOutAlt />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* LOGO ALWAYS LAST RIGHT */}
            <Link
              to={isAdmin ? "/admin" : "/dashboard"}
              className="flex items-center justify-end flex-shrink-0 ml-1 sm:ml-3"
            >
              <img
                src={logo}
                alt="CBC Logo"
                className="
                  h-28
                  sm:h-32
                  md:h-36
                  lg:h-40
                  xl:h-44
                  w-auto
                  object-contain
                  -my-10
                  drop-shadow-[0_10px_30px_rgba(59,130,246,0.45)]
                  animate-floatingLogo
                  hover:scale-105
                  transition-all
                  duration-500
                "
              />
            </Link>
          </div>
        </div>

        {/* MOBILE MENU */}
        {open && (
          <>
            {/* OVERLAY */}
            <div
              className="
                fixed
                inset-0
                bg-black/60
                backdrop-blur-sm
                z-40
                animate-fadeIn
                lg:hidden
              "
              onClick={() => setOpen(false)}
            />

            {/* DRAWER */}
            <div
              ref={menuRef}
              className="
                fixed
                top-0
                left-0
                h-full
                w-[85%]
                max-w-[340px]
                bg-gradient-to-b
                from-slate-950
                via-blue-950
                to-slate-900
                z-50
                shadow-2xl
                animate-slideInRight
                lg:hidden
                border-r
                border-white/10
              "
            >
              <div className="p-5">

                {/* USER INFO */}
                <div className="flex items-center gap-3 pb-6 border-b border-white/10">

                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                    <FaUserCircle className="text-white text-3xl" />
                  </div>

                  <div>
                    <h2 className="text-white font-semibold text-sm">
                      {user?.name}
                    </h2>

                    <p className="text-blue-200 text-xs">
                      {user?.department}
                    </p>
                  </div>
                </div>

                {/* MOBILE LINKS */}
                <div className="mt-6 space-y-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setOpen(false)}
                      className="
                        flex
                        items-center
                        gap-3
                        px-4
                        py-3
                        rounded-2xl
                        text-slate-200
                        hover:bg-white/10
                        hover:text-white
                        transition-all
                        duration-300
                        text-sm
                        font-medium
                      "
                    >
                      <span className="text-base">
                        {link.icon}
                      </span>

                      {link.name}
                    </Link>
                  ))}
                </div>

                {/* MOBILE PROFILE */}
                <div className="mt-8 pt-6 border-t border-white/10 space-y-2">

                  <Link
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className="
                      flex
                      items-center
                      gap-3
                      px-4
                      py-3
                      rounded-2xl
                      text-slate-200
                      hover:bg-white/10
                      transition-all
                    "
                  >
                    <FaUserCircle />
                    View Profile
                  </Link>

                  <Link
                    to="/edit-profile"
                    onClick={() => setOpen(false)}
                    className="
                      flex
                      items-center
                      gap-3
                      px-4
                      py-3
                      rounded-2xl
                      text-slate-200
                      hover:bg-white/10
                      transition-all
                    "
                  >
                    <FaEdit />
                    Edit Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="
                      w-full
                      flex
                      items-center
                      gap-3
                      px-4
                      py-3
                      rounded-2xl
                      text-red-300
                      hover:bg-red-500/20
                      transition-all
                    "
                  >
                    <FaSignOutAlt />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </nav>
    </>
  );
}

// import { useState, useEffect, useRef } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import logo from "../images/cbc_logo.png";
// import NotificationBell from '../NotificationBell';

// export default function Navbar({ user, onLogout }) {
//   const navigate = useNavigate();
//   const [open, setOpen] = useState(false);
//   const menuRef = useRef(null);
//   const burgerRef = useRef(null);

//   const isAdmin = user?.role === "admin";

//   useEffect(() => {
//     function onKey(e) {
//       if (e.key === "Escape" && open) setOpen(false);
//     }
//     document.addEventListener("keydown", onKey);
//     return () => document.removeEventListener("keydown", onKey);
//   }, [open]);

//   useEffect(() => {
//     function onClick(e) {
//       if (
//         open &&
//         menuRef.current &&
//         !menuRef.current.contains(e.target) &&
//         !burgerRef.current?.contains(e.target)
//       ) {
//         setOpen(false);
//       }
//     }
//     document.addEventListener("mousedown", onClick);
//     return () => document.removeEventListener("mousedown", onClick);
//   }, [open]);

//   const handleLogout = () => {
//     setOpen(false);
//     onLogout();
//     navigate("/");
//   };

//   const navLinks = isAdmin
//     ? [
//       { name: "Dashboard", path: "/admin" },
//       { name: "Create New Tickets", path: "/create-ticket" },
//       { name: "Manage Users", path: "/admin/users" },
//       { name: "Report", path: "/admin/report" },
//     ]
//     : [
//       { name: "Dashboard", path: "/dashboard" },
//       { name: "My Tickets", path: "/my-tickets" },
//       { name: "Create Ticket", path: "/create-ticket" },
//       { name: "Report", path: "/report" },
//     ];

//   const animationStyles = `
//     @keyframes slideIn {
//       from { transform: translateX(100%); }
//       to { transform: translateX(0); }
//     }
//     @keyframes slideOut {
//       from { transform: translateX(0); }
//       to { transform: translateX(100%); }
//     }
//     @keyframes fadeIn {
//       from { opacity: 0; }
//       to { opacity: 1; }
//     }
//     @keyframes scaleIn {
//       from { transform: scale(0.95); opacity: 0; }
//       to { transform: scale(1); opacity: 1; }
//     }
//     .animate-slide-in { animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
//     .animate-slide-out { animation: slideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
//     .animate-fade-in { animation: fadeIn 0.2s ease-in-out forwards; }
//     .animate-scale-in { animation: scaleIn 0.2s ease-out forwards; }
//   `;

//   return (
//     <>
//       <style>{animationStyles}</style>
//       <nav className="flex items-center justify-between px-4 md:px-6 py-2 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 shadow-lg sticky top-0 z-50 w-full">
//         {/* LEFT: BRAND */}
//         <div className="flex items-center gap-3">
//           <img
//             src={logo}
//             alt="CBC Logo"
//             className="h-16 w-auto md:h-20 bg-transparent rounded-lg transition-transform duration-300 hover:scale-105"
//           />
//           <div className="hidden sm:block">
//             <Link
//               to={isAdmin ? "/admin" : "/dashboard"}
//               className="text-lg md:text-xl font-bold text-white hover:text-blue-200 transition-colors duration-200"
//             >
//               IT Support Portal
//             </Link>
//             <p className="text-[11px] text-blue-200/70">Commercial Bank of Ceylon</p>
//           </div>
//         </div>

//         {/* CENTER: DESKTOP NAV */}
//         <ul className="hidden md:flex items-center gap-1">
//           {navLinks.map((link) => (
//             <li key={link.name}>
//               <Link
//                 to={link.path}
//                 className="block px-3 py-1.5 text-sm font-medium text-gray-200 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/10"
//               >
//                 {link.name}
//               </Link>
//             </li>
//           ))}
//         </ul>

//         {/* RIGHT SECTION */}
//         <div className="flex items-center gap-2">
//           {/* USER INFO */}
//           <div className="hidden md:flex items-center gap-2 px-2 py-1 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200 cursor-pointer">
//             <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
//               <span className="font-bold text-white text-xs">
//                 {user?.name?.charAt(0).toUpperCase()}
//               </span>
//             </div>
//             <div className="flex flex-col">
//               <span className="text-xs font-semibold text-white leading-tight">
//                 {user?.name?.split(' ')[0]}
//               </span>
//               <span className="text-[10px] text-blue-200 leading-tight">
//                 {user?.role.toUpperCase()}
//               </span>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             <NotificationBell user={user} />
//             {/* Existing user menu/dropdown */}
//           </div>
//           {/* LOGOUT BUTTON */}
//           <button
//             onClick={handleLogout}
//             className="hidden md:flex items-center gap-1.5 bg-red-500/90 hover:bg-red-600 text-white text-sm font-medium py-1.5 px-3 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
//           >
//             <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//             </svg>
//             Logout
//           </button>

//           {/* MOBILE MENU BUTTON */}
//           <button
//             ref={burgerRef}
//             className="md:hidden flex flex-col gap-1.5 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200"
//             onClick={() => setOpen(!open)}
//           >
//             <span className={`w-5 h-0.5 bg-white rounded-full transition-all duration-200 ${open ? 'rotate-45 translate-y-2' : ''}`} />
//             <span className={`w-5 h-0.5 bg-white rounded-full transition-all duration-200 ${open ? 'opacity-0' : ''}`} />
//             <span className={`w-5 h-0.5 bg-white rounded-full transition-all duration-200 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
//           </button>
//         </div>

//         {/* MOBILE MENU SLIDEOUT */}
//         <div
//           ref={menuRef}
//           className={`fixed top-0 right-0 h-full w-4/5 max-w-sm bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 shadow-2xl md:hidden z-40 ${open ? "animate-slide-in" : "animate-slide-out"
//             }`}
//         >
//           <div className="p-5 pt-20">
//             <div className="mb-5 pb-5 border-b border-white/10">
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
//                   <span className="font-bold text-white text-lg">
//                     {user?.name?.charAt(0).toUpperCase()}
//                   </span>
//                 </div>
//                 <div>
//                   <p className="text-sm font-bold text-white">{user?.name}</p>
//                   <p className="text-[11px] text-blue-200">
//                     {user?.role.toUpperCase()} • {user?.department}
//                   </p>
//                 </div>
//               </div>
//               <button
//                 onClick={handleLogout}
//                 className="w-full flex items-center justify-center gap-2 bg-red-500/90 hover:bg-red-600 text-white text-sm font-medium py-2 rounded-lg transition-all duration-200"
//               >
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//                 </svg>
//                 Logout
//               </button>
//             </div>

//             <div className="space-y-1">
//               {navLinks.map((link) => (
//                 <Link
//                   key={link.name}
//                   to={link.path}
//                   onClick={() => setOpen(false)}
//                   className="block px-3 py-2.5 rounded-lg text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-200 text-sm font-medium"
//                 >
//                   {link.name}
//                 </Link>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* OVERLAY */}
//         {open && (
//           <div
//             className="fixed inset-0 bg-black/50 md:hidden z-30 animate-fade-in"
//             onClick={() => setOpen(false)}
//           />
//         )}
//       </nav>
//     </>
//   );
// }