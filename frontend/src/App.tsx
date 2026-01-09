import { Route, Routes } from 'react-router-dom';

import { Layout } from './components/Layout/Layout';

import Dashboard from './pages/Dashboard';
import QRGeneratorPage from './pages/QRGenerator';
import QRListPage from './pages/QRList';
import AnalyticsPage from './pages/Analytics';
import SettingsPage from './pages/Settings';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import RateLimitPage from './pages/RateLimitPage';
import ShortCodeRedirectPage from './pages/ShortCodeRedirect';

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Routes>
      {/* Dashboard - Full viewport width without Layout */}
      <Route path="/" element={<Dashboard />} />
      
      {/* Other pages - With Layout */}
      <Route path="/qr/generate" element={<LayoutWrapper><QRGeneratorPage /></LayoutWrapper>} />
      <Route path="/qr/list" element={<LayoutWrapper><QRListPage /></LayoutWrapper>} />
      <Route path="/analytics" element={<LayoutWrapper><AnalyticsPage /></LayoutWrapper>} />
      <Route path="/settings" element={<LayoutWrapper><SettingsPage /></LayoutWrapper>} />
      {/* Auth pages - Full page without Layout */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/rate-limit" element={<LayoutWrapper><RateLimitPage /></LayoutWrapper>} />

      {/* Short code fallback: if user opens http://localhost:3001/<shortCode> */}
      <Route path="/:shortCode" element={<ShortCodeRedirectPage />} />
    </Routes>
  );
}
