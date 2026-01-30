import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './i18n/config';

// Components (always loaded)
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import CookieBanner from './components/common/CookieBanner';
import WhatsAppButton from './components/common/WhatsAppButton';
import BackToTopButton from './components/common/BackToTopButton';
import ErrorBoundary from './components/common/ErrorBoundary';
import PageLoader from './components/common/PageLoader';
import Analytics from './components/common/Analytics';
import ScrollToTop from './components/common/ScrollToTop';

// Public Pages (lazy loaded)
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const ProducersPage = lazy(() => import('./pages/ProducersPage'));
const ProducerDetailPage = lazy(() => import('./pages/ProducerDetailPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const ProducerCalculator = lazy(() => import('./pages/ProducerCalculator'));
const JoinAsProducerPage = lazy(() => import('./pages/JoinAsProducerPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const ArticlePage = lazy(() => import('./pages/ArticlePage'));

// Producer Pages (lazy loaded)
const ProducerSetup = lazy(() => import('./pages/producer/ProducerSetup'));
const ProducerDashboard = lazy(() => import('./pages/producer/ProducerDashboard'));
const ProducerProducts = lazy(() => import('./pages/producer/ProducerProducts'));
const ProducerProductForm = lazy(() => import('./pages/producer/ProducerProductForm'));
const ProducerOrders = lazy(() => import('./pages/producer/ProducerOrders'));
const ProducerReports = lazy(() => import('./pages/producer/ProducerReports'));
const ProducerShipping = lazy(() => import('./pages/producer/ProducerShipping'));
const ProducerProfile = lazy(() => import('./pages/producer/ProducerProfile'));

// Admin Pages (lazy loaded)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminProducers = lazy(() => import('./pages/admin/AdminProducers'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminContact = lazy(() => import('./pages/admin/AdminContact'));
const AdminLeads = lazy(() => import('./pages/admin/AdminLeads'));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'));
const AdminBlog = lazy(() => import('./pages/admin/AdminBlog'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
        <Analytics />
        <AuthProvider>
          <CartProvider>
            <LanguageProvider>
              <div className="app">
                <a href="#main-content" className="skip-link">Saltar al contenido principal</a>
                <Navbar />
                <main id="main-content" className="main-content" role="main">
                <Suspense fallback={<PageLoader />}>
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
                  <Route path="/producer/profile" element={<ProducerProfile />} />
                  
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
                  <Route path="/admin/products" element={<AdminProducts />} />
                  
                  {/* 404 - Must be last */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
                </Suspense>
              </main>
              <Footer />
              <CookieBanner />
              <WhatsAppButton />
              <BackToTopButton />
              <ToastContainer position="bottom-right" autoClose={3000} />
            </div>
            </LanguageProvider>
          </CartProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
