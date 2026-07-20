import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { FiArrowRight, FiAward, FiClock, FiTruck } from 'react-icons/fi';
import { productsApi, categoriesApi } from '@/api/catalog';
import { ProductCard } from '@/features/products/ProductCard';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h2 className="font-display text-3xl font-bold text-cream-100 sm:text-4xl">{title}</h2>
        {subtitle && <p className="mt-2 text-cream-200/60">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function ProductGrid({ queryKey, fetcher }: { queryKey: string; fetcher: () => Promise<unknown> }) {
  const { data, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: fetcher as () => Promise<import('@/types/catalog').ProductListItem[]>,
  });

  if (isLoading) return <PageSpinner />;
  if (!data || data.length === 0) return <p className="text-center text-cream-200/50">Nothing here yet.</p>;

  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
      {data.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

const whyChooseUs = [
  { icon: FiAward, title: 'Premium Ingredients', desc: 'Only the finest, freshest ingredients in every bake.' },
  { icon: FiClock, title: 'Baked Fresh Daily', desc: 'Everything is made in-house, every single day.' },
  { icon: FiTruck, title: 'Fast Delivery', desc: 'Same-day delivery across the city, on time, every time.' },
];

export function HomePage() {
  const { data: categories } = useQuery({
    queryKey: ['categories', 'home'],
    queryFn: () => categoriesApi.getAll(),
  });

  return (
    <div>
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-gradient-to-b from-ink-950 via-brown-900 to-ink-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(212,175,55,0.12),transparent_60%)]" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 mx-auto max-w-3xl px-4 text-center"
        >
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-gold-500">
            Delight in every bite
          </p>
          <h1 className="font-display text-5xl font-bold leading-tight text-cream-100 sm:text-6xl lg:text-7xl">
            Exit <span className="text-gradient-gold">Caff</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-cream-200/70">
            Handcrafted cakes, artisan pastries and freshly brewed coffee — a luxury bakery experience at
            TMJ Complex, Azhagiyamandapam.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/menu">
              <Button size="lg">
                Explore Menu <FiArrowRight />
              </Button>
            </Link>
            <Link to="/custom-cakes">
              <Button size="lg" variant="outline">
                Order Custom Cake
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <Section title="Today's Special" subtitle="Fresh picks, hand-selected daily by our chefs">
        <ProductGrid queryKey="todays-special" fetcher={productsApi.getTodaysSpecial} />
      </Section>

      <Section title="Best Sellers" subtitle="Loved by our customers, again and again">
        <ProductGrid queryKey="best-sellers" fetcher={productsApi.getBestSellers} />
      </Section>

      {categories && categories.length > 0 && (
        <Section title="Shop by Category">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.slice(0, 12).map((cat) => (
              <Link
                key={cat.id}
                to={`/menu?category=${cat.id}`}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-ink-900/40 p-5 text-center transition-colors hover:border-gold-500/40"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-500/10 text-gold-400 group-hover:bg-gold-500/20">
                  {cat.name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-cream-200/80 group-hover:text-gold-400">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </Section>
      )}

      <Section title="New Arrivals" subtitle="Fresh off the oven this week">
        <ProductGrid queryKey="new-arrivals" fetcher={productsApi.getNewArrivals} />
      </Section>

      <section className="border-y border-white/10 bg-ink-900/40">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          {whyChooseUs.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-500/10 text-gold-400">
                <Icon size={22} />
              </div>
              <h3 className="font-display mt-4 text-lg font-semibold text-cream-100">{title}</h3>
              <p className="mt-2 text-sm text-cream-200/60">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-bold text-cream-100">Join Our Newsletter</h2>
        <p className="mt-2 text-cream-200/60">
          Get updates on new arrivals, special offers and exclusive discounts.
        </p>
        <form
          className="mx-auto mt-6 flex max-w-md gap-2"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            required
            placeholder="Enter your email"
            className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-cream-100 placeholder:text-cream-200/40 focus:border-gold-500/60 focus:outline-none"
          />
          <Button type="submit">Subscribe</Button>
        </form>
      </section>
    </div>
  );
}
