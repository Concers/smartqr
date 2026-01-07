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

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/qr/generate" element={<QRGeneratorPage />} />
        <Route path="/qr/list" element={<QRListPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/rate-limit" element={<RateLimitPage />} />
      </Routes>
    </Layout>
  );
}
