import React from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { About, Contact, Terms, Privacy } from './pages/InfoPages';
import PaymentStatus from './pages/PaymentStatus';
import Categories from './pages/Categories';
import { useEffect } from 'react';

// Wrapper to scroll to top on route change
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
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
      <CartProvider>
        <WishlistProvider>
          <ScrollToTop />
          <div className="min-h-screen bg-tronix-bg text-tronix-text font-sans selection:bg-tronix-primary selection:text-white flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/category/:category" element={<Shop />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/payment/success" element={<PaymentStatus />} />
                <Route path="/payment/failure" element={<PaymentStatus />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
              </Routes>
            </main>
            <Footer />
            <Toaster position="bottom-right" toastOptions={{
              style: {
                background: '#1a1a2e',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)'
              }
            }} />
          </div>
        </WishlistProvider>
      </CartProvider>
    </Router>
  );
}

export default App;
