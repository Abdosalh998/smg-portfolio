import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/public/LandingPage';
import Login from './pages/auth/Login';
import DashboardHome from './pages/dashboard/DashboardHome';
import NotFound from './pages/errors/NotFound';
import AboutPage from './pages/dashboard/AboutPage';
import WhyChooseUsPage from './pages/dashboard/WhyChooseUsPage';
import ServicesPage from './pages/dashboard/ServicesPage';
import ApplicationsPage from './pages/dashboard/ApplicationsPage';
import ProductsPage from './pages/dashboard/ProductsPage';
import GalleryPage from './pages/dashboard/GalleryPage';
import ContactPage from './pages/dashboard/ContactPage';
import InboxPage from './pages/dashboard/InboxPage';
import SettingsPage from './pages/dashboard/SettingsPage';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* ─── Public Landing Page ────────────────────────────────── */}
        <Route path="/" element={<LandingPage />} />

        {/* ─── Auth ────────────────────────────────────────────── */}
        <Route path="/admin/login" element={<Login />} />

        {/* ─── Protected Dashboard ─────────────────────────────── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index           element={<DashboardHome />}    />
          <Route path="about"         element={<AboutPage />}         />
          <Route path="why-choose-us" element={<WhyChooseUsPage />}   />
          <Route path="services"      element={<ServicesPage />}      />
          <Route path="applications"  element={<ApplicationsPage />}  />
          <Route path="products"      element={<ProductsPage />}      />
          <Route path="gallery"       element={<GalleryPage />}       />
          <Route path="contact"       element={<ContactPage />}       />
          <Route path="inbox"         element={<InboxPage />}         />
          <Route path="settings"      element={<SettingsPage />}      />
        </Route>

        {/* ─── 404 ─────────────────────────────────────────────── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
