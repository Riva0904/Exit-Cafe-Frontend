import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  FiArrowRight,
  FiAward,
  FiClock,
  FiTruck,
  FiHeart,
  FiShield,
  FiUsers,
  FiPackage,
} from 'react-icons/fi';
import { productsApi, categoriesApi } from '@/api/catalog';
import { customersApi } from '@/api/customers';
import { ProductCard } from '@/features/products/ProductCard';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { CountUp } from '@/components/ui/CountUp';
import { Carousel, CarouselItem } from '@/components/ui/Carousel';
import { PagedGrid } from '@/components/ui/PagedGrid';

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
    <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-gold-500/[0.06] blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative mb-10 text-center"
      >
        <h2 className="font-display text-3xl font-bold text-cream-100 sm:text-4xl">{title}</h2>
        <span className="mx-auto mt-3 block h-px w-16 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />
        {subtitle && <p className="mt-3 text-cream-200/60">{subtitle}</p>}
      </motion.div>
      <div className="relative">{children}</div>
    </section>
  );
}

const PRODUCT_SLIDE_THRESHOLD = 8;

function CategoryTile({ category }: { category: import('@/types/catalog').Category }) {
  return (
    <Link
      to={`/menu?category=${category.id}`}
      className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-ink-900/40 p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/50 hover:shadow-gold-glow"
    >
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-gold-500/0 via-gold-500/0 to-gold-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:from-gold-500/5 group-hover:to-transparent" />
      {category.imageUrl ? (
        <div className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-transparent transition-all duration-300 group-hover:scale-110 group-hover:ring-gold-500/60">
          <img src={category.imageUrl} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
        </div>
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/10 text-gold-400 transition-all duration-300 group-hover:scale-110 group-hover:bg-gold-500/20">
          {category.name.charAt(0)}
        </div>
      )}
      <span className="relative text-sm font-medium text-cream-200/80 transition-colors duration-300 group-hover:text-gold-400">
        {category.name}
      </span>
    </Link>
  );
}

function ProductGrid({
  queryKey,
  fetcher,
  variant = 'auto',
}: {
  queryKey: string;
  fetcher: () => Promise<unknown>;
  variant?: 'auto' | 'grid' | 'carousel';
}) {
  const { data, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: fetcher as () => Promise<import('@/types/catalog').ProductListItem[]>,
  });

  if (isLoading) return <PageSpinner />;
  if (!data || data.length === 0) return <p className="text-center text-cream-200/50">Nothing here yet.</p>;

  const useCarousel = variant === 'carousel' || (variant === 'auto' && data.length >= PRODUCT_SLIDE_THRESHOLD);

  if (useCarousel) {
    return (
      <Carousel>
        {data.map((product) => (
          <CarouselItem key={product.id}>
            <ProductCard product={product} />
          </CarouselItem>
        ))}
      </Carousel>
    );
  }

  return <PagedGrid items={data} keyOf={(p) => p.id} renderItem={(p) => <ProductCard product={p} />} />;
}

const whyChooseUs = [
  { icon: FiAward, title: 'Premium Ingredients', desc: 'Only the finest, freshest ingredients in every bake.' },
  { icon: FiClock, title: 'Baked Fresh Daily', desc: 'Everything is made in-house, every single day.' },
  { icon: FiTruck, title: 'Fast Delivery', desc: 'Same-day delivery across the city, on time, every time.' },
  { icon: FiHeart, title: 'Made with Love', desc: 'Every recipe is crafted by hand, never mass-produced.' },
  { icon: FiShield, title: 'Hygienic Kitchen', desc: 'Spotless prep areas and strict food-safety standards.' },
  { icon: FiUsers, title: 'Loved by Locals', desc: 'A neighbourhood favourite, one order at a time.' },
];

export function HomePage() {
  const { data: categories } = useQuery({
    queryKey: ['categories', 'home'],
    queryFn: () => categoriesApi.getAll(),
  });
  const { data: productCount } = useQuery({
    queryKey: ['stats', 'product-count'],
    queryFn: () => productsApi.getAll({ pageNumber: 1, pageSize: 1 }),
  });
  const { data: customerCount } = useQuery({
    queryKey: ['stats', 'customer-count'],
    queryFn: () => customersApi.getAll({ pageNumber: 1, pageSize: 1 }),
  });

  const stats = [
    { icon: FiPackage, value: productCount?.totalCount ?? 0, label: 'Menu Items' },
    { icon: FiUsers, value: customerCount?.totalCount ?? 0, label: 'Customers' },
  ];

  return (
    <div>
      <section className="relative flex min-h-[95vh] items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: "url('/hero-storefront.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/60 via-ink-950/50 to-ink-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(212,175,55,0.12),transparent_65%)]" />
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
            Exit{' '}
            <span className="glitch-text text-gradient-gold" data-text="Caff">
              Caff
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-cream-200/70">
            Handcrafted cakes, artisan pastries and freshly brewed coffee — a luxury bakery experience at
            TMJ Complex, Azhagiyamandapam.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/menu">
              <Button size="lg" className="glitch-btn">
                Explore Menu <FiArrowRight />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="glitch-btn">
                Contact Us
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <Section title="Today's Special" subtitle="Fresh picks, hand-selected daily by our chefs">
        <ProductGrid queryKey="todays-special" fetcher={productsApi.getTodaysSpecial} variant="carousel" />
      </Section>

      <Section title="Best Sellers" subtitle="Loved by our customers, again and again">
        <ProductGrid queryKey="best-sellers" fetcher={productsApi.getBestSellers} variant="carousel" />
      </Section>

      {categories && categories.length > 0 && (
        <Section title="Shop by Category">
          <PagedGrid items={categories} keyOf={(c) => c.id} renderItem={(c) => <CategoryTile category={c} />} />
        </Section>
      )}

      <Section title="New Arrivals" subtitle="Fresh off the oven this week">
        <ProductGrid queryKey="new-arrivals" fetcher={productsApi.getNewArrivals} variant="carousel" />
      </Section>

      <section className="relative overflow-hidden border-y border-white/10 bg-ink-900/40">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.06),transparent_70%)]" />
        <div className="relative mx-auto max-w-3xl px-4 pt-16 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-500">Why Choose Us</p>
          <h2 className="font-display mt-2 text-3xl font-bold text-cream-100 sm:text-4xl">
            Baked with care, served with pride
          </h2>
        </div>
        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          {whyChooseUs.map(({ icon: Icon, title, desc }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.55, delay: index * 0.15, ease: 'easeOut' }}
              whileHover={{ y: -6 }}
              className="group text-center"
            >
              <motion.div
                className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/10 text-gold-400"
                whileHover={{ scale: 1.12, rotate: 6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 12 }}
              >
                <span className="absolute inset-0 animate-ping rounded-full bg-gold-500/20 [animation-duration:2.5s] group-hover:bg-gold-500/30" />
                <span className="absolute inset-0 rounded-full ring-1 ring-gold-500/20 transition-all duration-300 group-hover:ring-4 group-hover:ring-gold-500/30" />
                <Icon size={24} className="relative transition-transform duration-300 group-hover:scale-110" />
              </motion.div>
              <h3 className="font-display mt-5 text-lg font-semibold text-cream-100 transition-colors duration-300 group-hover:text-gold-400">
                {title}
              </h3>
              <p className="mt-2 text-sm text-cream-200/60">{desc}</p>
              <motion.span
                className="mx-auto mt-4 block h-px w-0 bg-gradient-to-r from-transparent via-gold-500 to-transparent transition-all duration-500 group-hover:w-24"
              />
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-b from-ink-950 via-brown-900/40 to-ink-950 py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.1),transparent_60%)]" />
        <div className="relative mx-auto grid max-w-md grid-cols-2 gap-8 px-4 sm:px-6 lg:px-8">
          {stats.map(({ icon: Icon, value, label }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.45, delay: index * 0.1, ease: 'easeOut' }}
              className="flex flex-col items-center gap-2 text-center"
            >
              <Icon className="text-gold-500" size={22} />
              <p className="font-display text-3xl font-bold text-gradient-gold sm:text-4xl">
                <CountUp value={value} suffix="+" startOnView />
              </p>
              <p className="text-xs uppercase tracking-wider text-cream-200/50">{label}</p>
            </motion.div>
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
