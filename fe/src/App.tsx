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

import Sidebar from './layouts/Sidebar';
function App() {
  return (
    <Router>
      <Header />
      <div className="flex bg-[#0f1115] min-h-screen font-sans text-slate-200">
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
          </Routes>
          <Footer />
        </main>
      </div>
    </Router>
  );
}

export default App;
