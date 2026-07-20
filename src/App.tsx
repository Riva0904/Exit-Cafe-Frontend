import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { HomePage } from '@/pages/HomePage';
import { MenuPage } from '@/pages/MenuPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { OrderConfirmationPage } from '@/pages/OrderConfirmationPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ComingSoonPage } from '@/pages/ComingSoonPage';
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminCategoriesPage } from '@/pages/admin/AdminCategoriesPage';
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage';
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage';
import { AdminCustomersPage } from '@/pages/admin/AdminCustomersPage';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="menu/:slug" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="orders/:id/confirmation" element={<OrderConfirmationPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="about" element={<ComingSoonPage title="About Us" />} />
        <Route path="our-story" element={<ComingSoonPage title="Our Story" />} />
        <Route path="custom-cakes" element={<ComingSoonPage title="Custom Cake Orders" />} />
        <Route path="catering" element={<ComingSoonPage title="Catering Services" />} />
        <Route path="gallery" element={<ComingSoonPage title="Gallery" />} />
        <Route path="blog" element={<ComingSoonPage title="Blog" />} />
        <Route path="faq" element={<ComingSoonPage title="FAQ" />} />
        <Route path="contact" element={<ComingSoonPage title="Contact Us" />} />
        <Route path="careers" element={<ComingSoonPage title="Careers" />} />
        <Route path="privacy-policy" element={<ComingSoonPage title="Privacy Policy" />} />
        <Route path="terms" element={<ComingSoonPage title="Terms & Conditions" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="admin/login" element={<AdminLoginPage />} />
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
      </Route>
    </Routes>
  );
}

export default App;
