import React, { Suspense, useEffect } from 'react';
import './App.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

// ── Eagerly loaded (needed on every page or critical path) ──
import Layout from './components/Layout';
import SectionTwelve from './components/SectionTwelve';
import EyeCursor from './components/EyeCursor';

// ── Lazy-loaded route-level pages ──
const About = React.lazy(() => import('./pages/About'));
const Community = React.lazy(() => import('./pages/Community'));
const Buy = React.lazy(() => import('./pages/Buy'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Auth = React.lazy(() => import('./pages/Auth'));
const OrderHistory = React.lazy(() => import('./pages/OrderHistory'));

// ── Lazy-loaded admin pages (only loaded when admin visits) ──
const AdminLayout = React.lazy(() => import('./admin/AdminLayout'));
const Overview = React.lazy(() => import('./admin/Overview'));
const UserManagement = React.lazy(() => import('./admin/UserManagement'));
const OrderManagement = React.lazy(() => import('./admin/OrderManagement'));
const ProductManagement = React.lazy(() => import('./admin/ProductManagement'));
const StorageCleanup = React.lazy(() => import('./admin/StorageCleanup'));
const InstagramFeedManagement = React.lazy(() => import('./admin/InstagramFeedManagement'));

// ── Lazy-loaded homepage sections (below-the-fold) ──
import SectionOne from './components/SectionOne';
import SectionTwo from './components/SectionTwo';
import SectionThree from './components/SectionThree';
const SectionFour = React.lazy(() => import('./components/SectionFour'));
const SectionFive = React.lazy(() => import('./components/SectionFive'));
const SectionSeven = React.lazy(() => import('./components/SectionSeven'));
const SectionEight = React.lazy(() => import('./components/SectionEight'));
const SectionNine = React.lazy(() => import('./components/SectionNine'));
const SectionTen = React.lazy(() => import('./components/SectionTen'));
const SectionEleven = React.lazy(() => import('./components/SectionEleven'));
// SectionTwelve & EyeCursor are static imports (above) because
// Layout.jsx already statically imports them for sub-pages.

// ── Loading spinner fallback ──
function LoadingFallback() {
  return (
    <div className="loading-fallback">
      <div className="loading-spinner" />
    </div>
  );
}

// ── Inline section fallback (invisible, no layout shift) ──
function SectionFallback() {
  return <div style={{ minHeight: '100vh' }} />;
}

function Home() {
  return (
    <div className="app-container">
      <EyeCursor />
      <SectionOne />
      <SectionTwo />
      <SectionThree />
      <Suspense fallback={<SectionFallback />}>
        <SectionFour />
        <SectionFive />
        {/* <SectionSix /> */}
        <SectionSeven />
        <SectionEight />
        <SectionNine />
        <SectionTen />
        <SectionEleven />
        <SectionTwelve />
      </Suspense>
    </div>
  );
}

function App() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route element={<Layout />}>
                <Route path="/about" element={<About />} />
                <Route path="/community" element={<Community />} />
                <Route path="/buy" element={<Buy />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-history" element={<OrderHistory />} />
                <Route path="/contact" element={<Contact />} />
              </Route>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Overview />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="orders" element={<OrderManagement />} />
                <Route path="products" element={<ProductManagement />} />
                <Route path="storage" element={<StorageCleanup />} />
                <Route path="instagram-feed" element={<InstagramFeedManagement />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
