import { Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { useSessionIdentityGuard } from '@/hooks/useSessionIdentityGuard';
import { Header } from './Header';
import { Footer } from './Footer';
import { StaffAccountBanner } from './StaffAccountBanner';

export function Layout() {
  const user = useAppSelector((s) => s.auth.user);
  useSessionIdentityGuard(user?.userId);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <StaffAccountBanner />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
