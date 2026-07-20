import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <span className="font-display text-gradient-gold text-7xl font-bold">404</span>
      <h1 className="font-display mt-4 text-2xl font-bold text-cream-100">Page not found</h1>
      <p className="mt-2 text-cream-200/60">The page you're looking for doesn't exist.</p>
      <Link to="/" className="mt-6">
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
}
