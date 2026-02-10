import { Route, Routes } from 'react-router-dom';

import AdminDashboard from './pages/AdminDashboard';
import LandingPage from './pages/LandingPage';
import QRGenerateSelectPage from './pages/QRGenerateSelect';
import QRGenerateTypePage from './pages/QRGenerateType';
import QRGenerateBusinessCardPage from './pages/QRGenerateBusinessCard';
import BusinessCardPreview from './pages/BusinessCardPreview';
import QRListPage from './pages/QRList';
import AnalyticsPage from './pages/Analytics';
import AdminPricingPage from './pages/AdminPricing';
import SettingsPage from './pages/Settings';
import PricingPage from './pages/Pricing';
import AdminCustomDomainsPage from './pages/AdminCustomDomains';
import AdminSubdomainRequestsPage from './pages/AdminSubdomainRequests';
import SubdomainRequestPage from './pages/SubdomainRequest';
import SubUserManagement from './pages/SubUserManagement';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import RateLimitPage from './pages/RateLimitPage';
import ShortCodeRedirectPage from './pages/ShortCodeRedirect';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/custom-domains" element={<AdminCustomDomainsPage />} />
      <Route path="/admin/subdomain-requests" element={<AdminSubdomainRequestsPage />} />
      <Route path="/sub-users" element={<SubUserManagement />} />
      
      {/* Admin pages - With AdminLayout (no additional wrapper needed) */}
      <Route path="/qr/generate" element={
        <ProtectedRoute requiredPermission="qr_create" allowNormalUsers={true}>
          <QRGenerateSelectPage />
        </ProtectedRoute>
      } />
      <Route path="/qr/generate/:type" element={
        <ProtectedRoute requiredPermission="qr_create" allowNormalUsers={true}>
          <QRGenerateTypePage />
        </ProtectedRoute>
      } />
      <Route path="/qr/generate/business-card" element={
        <ProtectedRoute requiredPermission="qr_create" allowNormalUsers={true}>
          <QRGenerateBusinessCardPage />
        </ProtectedRoute>
      } />
      <Route path="/business-card-preview" element={<BusinessCardPreview />} />
      <Route path="/qr/list" element={
        <ProtectedRoute requiredPermission="qr_view" allowNormalUsers={true}>
          <QRListPage />
        </ProtectedRoute>
      } />
      <Route path="/analytics" element={
        <ProtectedRoute requiredPermission="analytics_view" allowNormalUsers={true}>
          <AnalyticsPage />
        </ProtectedRoute>
      } />
      <Route path="/analytics/:qrId" element={
        <ProtectedRoute requiredPermission="analytics_view" allowNormalUsers={true}>
          <AnalyticsPage />
        </ProtectedRoute>
      } />
      <Route path="/pricing" element={<AdminPricingPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/subdomain" element={
        <ProtectedRoute adminOnly>
          <SubdomainRequestPage />
        </ProtectedRoute>
      } />
      
      {/* Auth pages - Full page without Layout */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/rate-limit" element={<RateLimitPage />} />
      
      {/* Short code fallback: if user opens http://localhost:3001/<shortCode> */}
      <Route path="/:shortCode" element={<ShortCodeRedirectPage />} />
    </Routes>
  );
}
