import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import WhatIfSimulator from './pages/WhatIfSimulator';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
          <span className="text-xs text-slate-400">Authenticating session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/student-dashboard" replace />;
  }

  return children;
};

// Main Layout Wrapper
const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-teal-500 selection:text-white">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Route */}
          <Route
            path="/login"
            element={
              <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
                <Navbar />
                <Login />
              </div>
            }
          />

          {/* Protected Application Routes */}
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <StudentDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/what-if"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <WhatIfSimulator />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/faculty-dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <FacultyDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Root Redirect */}
          <Route path="/" element={<Navigate to="/student-dashboard" replace />} />

          {/* Catch-all Wildcard Route */}
          <Route path="*" element={<Navigate to="/student-dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
