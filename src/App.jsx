import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard'; // We will create this
import { useEffect } from 'react';

// Wrapper to scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Placeholder pages to prevent crash
const Placeholder = ({ title }) => (
  <div className="min-h-screen pt-20 flex items-center justify-center text-white">
    <h1 className="text-3xl font-bold">{title} Page (Coming Soon)</h1>
  </div>
);

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-tronix-bg text-tronix-text font-sans selection:bg-tronix-primary selection:text-white flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Placeholder title="Shop" />} />
            <Route path="/categories" element={<Placeholder title="Categories" />} />
            <Route path="/cart" element={<Placeholder title="Cart" />} />
            <Route path="/wishlist" element={<Placeholder title="Wishlist" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
