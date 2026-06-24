// App.jsx
import React from "react";
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from './context/AuthContext';
import { PermissionProvider } from './context/PermissionContext';

// Auth Pages
import Login from "./pages/Login";

// Unified Dashboard - Handles ALL users (Super Admin, Admin, IT User, Branch User)
import AdminDashboard from "./pages/Admin/AdminDashboard";

// Admin Specific Pages (kept as separate routes for better UX)
import CreateTicket from "./pages/user/CreateTicket";
import AdminReport from "./pages/user/Report";
import AdminUsers from "./pages/Admin/AdminUsers";

// User Pages (for non-admin users)
import UserCreateTicket from "./pages/user/CreateTicket";
import UserReport from "./pages/user/Report";
import MyTickets from "./pages/user/MyTickets";

// Shared Components
import Navbar from "./components/navbar/Navbar";
import ScrollToTop from "./components/ScrollToTop";
import IncidentProblemGuidelines from './pages/IncidentProblemGuidelines';
import NotificationsPage from './pages/Notifications';

function AppWrapper() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn, isAdmin, isSuperAdmin, logout, login } = useAuth();

  const handleLogin = (userData, token, sessionToken) => {
    login(userData, token, sessionToken);
    // All users go to the unified dashboard
    navigate("/dashboard");
  };

  const handleLogout = () => {
    logout(true);
  };

  // Determine if user has admin privileges (Admin or Super Admin)
  const hasAdminAccess = isAdmin || isSuperAdmin;

  // Redirect authenticated users away from login page
  React.useEffect(() => {
    const currentPath = location.pathname;

    if (isLoggedIn && (currentPath === "/" || currentPath === "/login")) {
      navigate("/dashboard");
      return;
    }

    // Protect routes - redirect to login if not authenticated
    const protectedRoutes = [
      "/dashboard", "/guidelines", "/notifications",
      "/create-ticket", "/my-tickets", "/report",
      "/admin", "/admin/create-ticket", "/admin/users", "/admin/report"
    ];

    if (protectedRoutes.some(route => currentPath.startsWith(route)) && !isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, location.pathname, navigate]);

  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const token = localStorage.getItem('cbcToken');
    const userData = localStorage.getItem('cbcUser');

    if (token && userData && !isLoggedIn) {
      setTimeout(() => setIsLoading(false), 100);
    } else {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoggedIn && <Navbar user={user} onLogout={handleLogout} />}
      <Toaster position="top-right" />
      <ScrollToTop />
      <main className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Routes>
          {/* Login route */}
          <Route path="/" element={
            !isLoggedIn ? <Login onLogin={handleLogin} /> : <RedirectToDashboard />
          } />

          {/* Unified Dashboard - All authenticated users go here */}
          {isLoggedIn && (
            <>
              <Route path="/dashboard" element={<AdminDashboard user={user} />} />
              <Route path="/notifications" element={<NotificationsPage user={user} />} />
              <Route path="/guidelines" element={<IncidentProblemGuidelines />} />
            </>
          )}

          {/* Admin-only routes - Full access pages */}
          {isLoggedIn && hasAdminAccess && (
            <>
              <Route path="/admin" element={<AdminDashboard user={user} />} />
              <Route path="/admin/create-ticket" element={<CreateTicket user={user} />} />
              <Route path="/admin/users" element={<AdminUsers user={user} />} />
              <Route path="/admin/report" element={<AdminReport user={user} />} />
            </>
          )}

          {/* User-only routes - Limited access pages */}
          {isLoggedIn && !hasAdminAccess && (
            <>
              <Route path="/create-ticket" element={<UserCreateTicket user={user} />} />
              <Route path="/my-tickets" element={<MyTickets user={user} />} />
              <Route path="/report" element={<UserReport user={user} />} />
            </>
          )}

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}

// Helper component for redirect
const RedirectToDashboard = () => {
  const navigate = useNavigate();
  React.useEffect(() => {
    navigate("/dashboard");
  }, [navigate]);
  return null;
};

const NotFound = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="text-9xl font-bold text-gray-300 mb-4">404</div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Page Not Found</h1>
      <p className="text-gray-600 mb-6">The page you're looking for doesn't exist or has been moved.</p>
    </div>
  </div>
);

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <PermissionProvider>

          <AppWrapper />
        </PermissionProvider>

      </AuthProvider>
    </Router>
  );
}

// App.jsx
// import React from "react";
// import { Toaster } from 'react-hot-toast';
// import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";

// // Auth Pages
// import Login from "./pages/Login";

// // Unified Dashboard - Handles ALL users (Super Admin, Admin, IT User, Branch User)
// import AdminDashboard from "./pages/Admin/AdminDashboard";

// // Admin Specific Pages (kept as separate routes for better UX)
// import CreateTicket from "./pages/Admin/CreateTicket";
// import AdminReport from "./pages/Admin/Report";
// import AdminUsers from "./pages/Admin/AdminUsers";

// // User Pages (for non-admin users)
// import UserCreateTicket from "./pages/user/CreateTicket";
// import UserReport from "./pages/user/Report";
// import MyTickets from "./pages/user/MyTickets";

// // Shared Components
// import Navbar from "./components/navbar/Navbar";
// import ScrollToTop from "./components/ScrollToTop";
// import IncidentProblemGuidelines from './pages/IncidentProblemGuidelines';
// import NotificationsPage from './pages/Notifications';

// function AppWrapper() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { user, isLoggedIn, isAdmin, isSuperAdmin, logout, login } = useAuth();

//   const handleLogin = (userData, token, sessionToken) => {
//     login(userData, token, sessionToken);
//     // All users go to the unified dashboard
//     navigate("/dashboard");
//   };

//   const handleLogout = () => {
//     logout(true);
//   };

//   // Determine if user has admin privileges (Admin or Super Admin)
//   const hasAdminAccess = isAdmin || isSuperAdmin;

//   // Redirect authenticated users away from login page
//   React.useEffect(() => {
//     const currentPath = location.pathname;

//     if (isLoggedIn && (currentPath === "/" || currentPath === "/login")) {
//       navigate("/dashboard");
//       return;
//     }

//     // Protect routes - redirect to login if not authenticated
//     const protectedRoutes = [
//       "/dashboard", "/guidelines", "/notifications",
//       "/create-ticket", "/my-tickets", "/report",
//       "/admin", "/admin/create-ticket", "/admin/users", "/admin/report"
//     ];

//     if (protectedRoutes.some(route => currentPath.startsWith(route)) && !isLoggedIn) {
//       navigate("/");
//     }
//   }, [isLoggedIn, location.pathname, navigate]);

//   const [isLoading, setIsLoading] = React.useState(true);

//   React.useEffect(() => {
//     const token = localStorage.getItem('cbcToken');
//     const userData = localStorage.getItem('cbcUser');

//     if (token && userData && !isLoggedIn) {
//       setTimeout(() => setIsLoading(false), 100);
//     } else {
//       setIsLoading(false);
//     }
//   }, [isLoggedIn]);

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//         <div className="text-center">
//           <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
//           <p className="text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       {isLoggedIn && <Navbar user={user} onLogout={handleLogout} />}
//       <Toaster position="top-right" />
//       <ScrollToTop />
//       <main className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//         <Routes>
//           {/* Login route */}
//           <Route path="/" element={
//             !isLoggedIn ? <Login onLogin={handleLogin} /> : <RedirectToDashboard />
//           } />

//           {/* Unified Dashboard - All authenticated users go here */}
//           {isLoggedIn && (
//             <>
//               <Route path="/dashboard" element={<AdminDashboard user={user} />} />
//               <Route path="/notifications" element={<NotificationsPage user={user} />} />
//               <Route path="/guidelines" element={<IncidentProblemGuidelines />} />
//             </>
//           )}

//           {/* Admin-only routes - Full access pages */}
//           {isLoggedIn && hasAdminAccess && (
//             <>
//               <Route path="/admin" element={<AdminDashboard user={user} />} />
//               <Route path="/admin/create-ticket" element={<CreateTicket user={user} />} />
//               <Route path="/admin/users" element={<AdminUsers user={user} />} />
//               <Route path="/admin/report" element={<AdminReport user={user} />} />
//             </>
//           )}

//           {/* User-only routes - Limited access pages */}
//           {isLoggedIn && !hasAdminAccess && (
//             <>
//               <Route path="/create-ticket" element={<UserCreateTicket user={user} />} />
//               <Route path="/my-tickets" element={<MyTickets user={user} />} />
//               <Route path="/report" element={<UserReport user={user} />} />
//             </>
//           )}

//           {/* 404 */}
//           <Route path="*" element={<NotFound />} />
//         </Routes>
//       </main>
//     </>
//   );
// }

// // Helper component for redirect
// const RedirectToDashboard = () => {
//   const navigate = useNavigate();
//   React.useEffect(() => {
//     navigate("/dashboard");
//   }, [navigate]);
//   return null;
// };

// const NotFound = () => (
//   <div className="flex items-center justify-center min-h-screen">
//     <div className="text-center">
//       <div className="text-9xl font-bold text-gray-300 mb-4">404</div>
//       <h1 className="text-3xl font-bold text-gray-800 mb-2">Page Not Found</h1>
//       <p className="text-gray-600 mb-6">The page you're looking for doesn't exist or has been moved.</p>
//     </div>
//   </div>
// );

// export default function App() {
//   return (
//     <Router>
//       <AuthProvider>
//         <AppWrapper />
//       </AuthProvider>
//     </Router>
//   );
// }