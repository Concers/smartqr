import { Route, Routes } from 'react-router-dom';

import AdminDashboard from './pages/AdminDashboard';
import LandingPage from './pages/LandingPage';
import QRGenerateSelectPage from './pages/QRGenerateSelect';
import QRGenerateTypePage from './pages/QRGenerateType';
import QRListPage from './pages/QRList';
import AnalyticsPage from './pages/Analytics';
import AdminPricingPage from './pages/AdminPricing';
import SettingsPage from './pages/Settings';
import PricingPage from './pages/Pricing';
import AdminCustomDomainsPage from './pages/AdminCustomDomains';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import RateLimitPage from './pages/RateLimitPage';
import ShortCodeRedirectPage from './pages/ShortCodeRedirect';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/custom-domains" element={<AdminCustomDomainsPage />} />
      
      {/* Admin pages - With AdminLayout (no additional wrapper needed) */}
      <Route path="/qr/generate" element={<QRGenerateSelectPage />} />
      <Route path="/qr/generate/:type" element={<QRGenerateTypePage />} />
      <Route path="/qr/list" element={<QRListPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/pricing" element={<AdminPricingPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      
      {/* Auth pages - Full page without Layout */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/rate-limit" element={<RateLimitPage />} />
      
      {/* Short code fallback: if user opens http://localhost:3001/<shortCode> */}
      <Route path="/:shortCode" element={<ShortCodeRedirectPage />} />
    </Routes>
  );
}
