import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import EnquiryModal from './components/EnquiryModal';
import ScrollToTop from './components/ScrollToTop';
import { CONTACT_CONFIG } from './config/contactConfig';

// Customer Pages
import HomePage from './pages/HomePage';
import PuppiesPage from './pages/PuppiesPage';
import PuppyDetailsPage from './pages/PuppyDetailsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

// Admin Context & Layouts
import { AdminAuthProvider, AdminProtectedRoute } from './context/AdminAuthContext';
import AdminLayout from './layouts/AdminLayout';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminPuppiesPage from './pages/admin/AdminPuppiesPage';
import AdminEnquiriesPage from './pages/admin/AdminEnquiriesPage';
import AdminOffersPage from './pages/admin/AdminOffersPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

/**
 * Customer Public Website Shell (Unchanged Design & Functionality)
 */
function CustomerWebsite() {
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [selectedPuppyForModal, setSelectedPuppyForModal] = useState(null);

  const handleOpenEnquiry = (puppy = null) => {
    setSelectedPuppyForModal(puppy);
    setEnquiryModalOpen(true);
  };

  const handleCloseEnquiry = () => {
    setEnquiryModalOpen(false);
    setSelectedPuppyForModal(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-slate-800 font-sans selection:bg-amber-200 selection:text-amber-900">
      {/* Navigation Bar */}
      <Navbar onOpenEnquiry={handleOpenEnquiry} />

      {/* Main Content Area */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage onOpenEnquiry={handleOpenEnquiry} />} />
          <Route path="/puppies" element={<PuppiesPage onOpenEnquiry={handleOpenEnquiry} />} />
          <Route path="/puppies/:id" element={<PuppyDetailsPage onOpenEnquiry={handleOpenEnquiry} />} />
          <Route path="/about" element={<AboutPage onOpenEnquiry={handleOpenEnquiry} />} />
          <Route path="/contact" element={<ContactPage />} />
          {/* Fallback route */}
          <Route path="*" element={<HomePage onOpenEnquiry={handleOpenEnquiry} />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer onOpenEnquiry={handleOpenEnquiry} />

      {/* Global Floating WhatsApp Quick Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <a
          href={CONTACT_CONFIG.getWhatsappLink('Hello B.tech Puppybala! I am interested in inquiring about a puppy.')}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group border-2 border-white"
          title={`Chat directly on WhatsApp (${CONTACT_CONFIG.whatsappDisplay})`}
        >
          <MessageCircle className="w-6 h-6 fill-white text-emerald-600" />
          <span className="hidden sm:inline font-bold text-xs tracking-wide">
            Chat on WhatsApp
          </span>
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-white"></span>
          </span>
        </a>
      </div>

      {/* Global Enquiry Modal */}
      <EnquiryModal
        isOpen={enquiryModalOpen}
        onClose={handleCloseEnquiry}
        selectedPuppy={selectedPuppyForModal}
      />
    </div>
  );
}

export default function App() {
  return (
    <AdminAuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Standalone Admin Login (No customer layout) */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="puppies" element={<AdminPuppiesPage />} />
            <Route path="enquiries" element={<AdminEnquiriesPage />} />
            <Route path="offers" element={<AdminOffersPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Public Customer Website (Catch-all for customer pages) */}
          <Route path="/*" element={<CustomerWebsite />} />
        </Routes>
      </Router>
    </AdminAuthProvider>
  );
}
