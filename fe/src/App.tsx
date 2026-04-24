import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './layouts/Header';
import Footer from './layouts/Footer';
import Home from './pages/Home';
import Campaigns from './pages/Campaigns';
import CreateCampaign from './pages/CreateCampaign';
import CampaignDetail from './pages/CampaignDetail';
import Activity from './pages/Activity';
import CreatorDashboard from './pages/CreatorDashboard';
import Resources from './pages/Resources';
import Contact from './pages/Contact';
import SupplierDashboard from './pages/SupplierDashboard';
import VerifierDashboard from './pages/VerifierDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';
import CookiePolicy from './pages/legal/CookiePolicy';
import { NotificationProvider } from './context/NotificationContext';

import Sidebar from './layouts/Sidebar';
import ScrollToTop from './components/common/ScrollToTop';
import BlockchainBackground from './components/common/BlockchainBackground';

function App() {
  return (
    <NotificationProvider>
      <BlockchainBackground />
      <Router>
        <ScrollToTop />
        <Header />
        <div className="relative z-10 flex bg-transparent min-h-screen font-sans text-slate-200">
          <Sidebar />
          <main className="flex-1 p-0">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/campaigns/create" element={<CreateCampaign />} />
              <Route path="/campaign/:slug" element={<CampaignDetail />} />
              <Route path="/dashboard/activity" element={<Activity />} />
              <Route path="/dashboard/creator" element={<CreatorDashboard />} />
              <Route path="/supplier" element={<SupplierDashboard />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/verifier" element={<VerifierDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/cookies" element={<CookiePolicy />} />
            </Routes>
            <Footer />
          </main>
        </div>
      </Router>
    </NotificationProvider>
  );
}

export default App;
