import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './layouts/Header';
import Footer from './layouts/Footer';
import Home from './pages/Home';
import CampaignDetail from './pages/CampaignDetail';
import './index.css';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/campaign/:address" element={<CampaignDetail />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
