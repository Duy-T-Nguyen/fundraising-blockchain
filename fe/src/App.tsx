import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './layouts/Header';
import Footer from './layouts/Footer';
import Home from './pages/Home';
import Campaigns from './pages/Campaigns';
import CreateCampaign from './pages/CreateCampaign';
import CampaignDetail from './pages/CampaignDetail';
import Activity from './pages/Activity';
import './index.css';

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
          </Routes>
          <Footer />
        </main>
      </div>
    </Router>
  );
}

export default App;
