import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../components/Home';
import QASection from '../components/QASection';
import ExperienceSharing from '../components/ExperienceSharing';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminQA from '../components/admin/AdminQA';
import AdminExperiences from '../components/admin/AdminExperiences';
import UserReportsList from '../components/admin/UserReportsList';
import CybercrimeWebsite from '../components/admin/CybercrimeWebsite';
import UserDashboard from '../components/dashboard/UserDashboard';
import Auth from '../components/Auth';
import { useAuth } from '../context/AuthContext';

const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { user } = useAuth();
  return user ? element : <Navigate to="/login" replace />;
};

const AdminRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { user } = useAuth();
  return user?.isAdmin ? element : <Navigate to="/" replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/dashboard" element={<PrivateRoute element={<UserDashboard />} />} />
      <Route path="/qa" element={<PrivateRoute element={<QASection />} />} />
      <Route path="/experiences" element={<PrivateRoute element={<ExperienceSharing />} />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute element={<AdminDashboard />} />} />
      <Route path="/admin/qa" element={<AdminRoute element={<AdminQA />} />} />
      <Route path="/admin/experiences" element={<AdminRoute element={<AdminExperiences />} />} />
      <Route path="/admin/reports" element={<AdminRoute element={<UserReportsList />} />} />
      <Route path="/admin/cybercrime" element={<AdminRoute element={<CybercrimeWebsite />} />} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;