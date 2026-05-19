import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import CommunityPage from './app/page';
import AdminCommunity from './app/admin/page';
import AdminLogin from './app/admin/login';
import ReviewsPage from './app/reviews/page';
import UserLogin from './app/login/page';
import './app/globals.css';

// Protected Route Component for Admin
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen bg-bg items-center justify-center font-display text-4xl">LOADING...</div>;
  }

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

// Protected Route Component for User (Optional, depending if discover needs login)
const UserRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen bg-bg items-center justify-center font-display text-4xl">LOADING...</div>;
  }

  // If not logged in, they can still view community page, but actions might require login.
  // For Rimoto, maybe some pages are strictly user.
  // We'll leave it open for now or redirect to login.
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CommunityPage />} />
      <Route path="/discover" element={<CommunityPage />} />
      <Route path="/reviews" element={<ReviewsPage />} />
      <Route path="/login" element={<UserLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminCommunity />
          </AdminRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
