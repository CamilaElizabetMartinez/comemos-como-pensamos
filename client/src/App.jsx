import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './i18n/config';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import CookieBanner from './components/common/CookieBanner';
import WhatsAppButton from './components/common/WhatsAppButton';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import FavoritesPage from './pages/FavoritesPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ProducersPage from './pages/ProducersPage';
import ProducerDetailPage from './pages/ProducerDetailPage';
import ContactPage from './pages/ContactPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import NotFoundPage from './pages/NotFoundPage';

// Producer Pages
import ProducerSetup from './pages/producer/ProducerSetup';
import ProducerDashboard from './pages/producer/ProducerDashboard';
import ProducerProducts from './pages/producer/ProducerProducts';
import ProducerProductForm from './pages/producer/ProducerProductForm';
import ProducerOrders from './pages/producer/ProducerOrders';
import ProducerReports from './pages/producer/ProducerReports';
import ProducerShipping from './pages/producer/ProducerShipping';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProducers from './pages/admin/AdminProducers';
import AdminOrders from './pages/admin/AdminOrders';
import AdminReports from './pages/admin/AdminReports';
import AdminContact from './pages/admin/AdminContact';
import AdminLeads from './pages/admin/AdminLeads';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminBlog from './pages/admin/AdminBlog';
import ProducerCalculator from './pages/ProducerCalculator';
import JoinAsProducerPage from './pages/JoinAsProducerPage';
import BlogPage from './pages/BlogPage';
import ArticlePage from './pages/ArticlePage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <LanguageProvider>
            <div className="app">
              <Navbar />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                  <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/orders/:id" element={<OrderDetailPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="/producers" element={<ProducersPage />} />
                  <Route path="/producers/:id" element={<ProducerDetailPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/calculadora-productor" element={<ProducerCalculator />} />
                  <Route path="/unete" element={<JoinAsProducerPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/blog/:slug" element={<ArticlePage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  
                  {/* Producer Panel */}
                  <Route path="/producer/setup" element={<ProducerSetup />} />
                  <Route path="/producer" element={<ProducerDashboard />} />
                  <Route path="/producer/products" element={<ProducerProducts />} />
                  <Route path="/producer/products/new" element={<ProducerProductForm />} />
                  <Route path="/producer/products/edit/:id" element={<ProducerProductForm />} />
                  <Route path="/producer/orders" element={<ProducerOrders />} />
                  <Route path="/producer/reports" element={<ProducerReports />} />
                  <Route path="/producer/shipping" element={<ProducerShipping />} />
                  
                  {/* Admin Panel */}
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/producers" element={<AdminProducers />} />
                  <Route path="/admin/orders" element={<AdminOrders />} />
                  <Route path="/admin/reports" element={<AdminReports />} />
                  <Route path="/admin/contact" element={<AdminContact />} />
                  <Route path="/admin/leads" element={<AdminLeads />} />
                  <Route path="/admin/coupons" element={<AdminCoupons />} />
                  <Route path="/admin/blog" element={<AdminBlog />} />
                  
                  {/* 404 - Must be last */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
              <CookieBanner />
              <WhatsAppButton />
              <ToastContainer position="bottom-right" autoClose={3000} />
            </div>
          </LanguageProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
