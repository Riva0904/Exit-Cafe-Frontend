import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-3xl font-bold text-cream-100">{title}</h1>
      <p className="mt-3 max-w-md text-cream-200/60">
        This page is on our roadmap and will be available soon. In the meantime, explore our menu.
      </p>
      <Link to="/menu" className="mt-6">
        <Button variant="outline">Browse Menu</Button>
      </Link>
    </div>
  );
}
