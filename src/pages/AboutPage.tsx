import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { FiArrowRight, FiFeather, FiHeart, FiPackage, FiStar, FiSun, FiUsers } from 'react-icons/fi';
import { productsApi } from '@/api/catalog';
import { customersApi } from '@/api/customers';
import { Button } from '@/components/ui/Button';
import { CountUp } from '@/components/ui/CountUp';

const values = [
  { icon: FiFeather, title: 'Handcrafted', desc: 'Every cake, pastry and loaf is shaped and finished by hand — no shortcuts, no mass production.' },
  { icon: FiSun, title: 'Baked Fresh', desc: 'Nothing sits in a freezer waiting for an order. It goes into the oven only once you\'re on the way.' },
  { icon: FiHeart, title: 'Made with Care', desc: 'From the first sketch of a custom cake to the last garnish, every detail is considered.' },
  { icon: FiStar, title: 'Community First', desc: 'A neighbourhood café at heart — we know our regulars by name and their order by memory.' },
];

const milestones = [
  { year: '2019', text: 'Exit Caff opens its doors at TMJ Complex, Azhagiyamandapam, with a handful of recipes and a lot of ambition.' },
  { year: '2021', text: 'The menu grows well beyond cakes — shawarma, broasted chicken and a proper coffee bar join the lineup.' },
  { year: '2023', text: 'Pizza, club sandwiches and a full beverage bar round out the café menu.' },
  { year: '2026', text: 'Online ordering opens up so the whole city can order ahead, not just walk-ins.' },
];

export function AboutPage() {
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
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-brown-900/60 via-ink-950 to-ink-950 py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.12),transparent_60%)]" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-500">Our Story</p>
          <h1 className="font-display mt-2 text-4xl font-bold text-cream-100 sm:text-5xl">
            Delight in every bite
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-cream-200/70">
            Exit Caff started as a simple idea: a neighbourhood bakery that treats every order — from a
            single cupcake to a three-tier wedding cake — with the same care as our very first customer got.
          </p>
        </motion.div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ icon: Icon, title, desc }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="rounded-2xl border border-white/10 bg-ink-900/40 p-6 text-center"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/10 text-gold-400">
                <Icon size={20} />
              </div>
              <h3 className="font-display mt-4 text-base font-semibold text-cream-100">{title}</h3>
              <p className="mt-2 text-sm text-cream-200/60">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-ink-900/40 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-center text-3xl font-bold text-cream-100">Our Journey</h2>
          <div className="mt-10 space-y-8 border-l border-gold-500/20 pl-8">
            {milestones.map(({ year, text }, index) => (
              <motion.div
                key={year}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.45, delay: index * 0.1 }}
                className="relative"
              >
                <span className="absolute -left-[41px] flex h-4 w-4 items-center justify-center rounded-full bg-gold-500" />
                <p className="font-display text-lg font-semibold text-gold-400">{year}</p>
                <p className="mt-1 text-sm text-cream-200/70">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8">
          {stats.map(({ icon: Icon, value, label }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="text-center"
            >
              <Icon className="mx-auto mb-2 text-gold-500" size={20} />
              <p className="font-display text-3xl font-bold text-gradient-gold sm:text-4xl">
                <CountUp value={value} suffix="+" startOnView />
              </p>
              <p className="mt-1 text-xs uppercase tracking-wider text-cream-200/50">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 bg-gradient-to-b from-ink-950 to-brown-900/40 py-16 text-center">
        <h2 className="font-display text-3xl font-bold text-cream-100">Come say hello</h2>
        <p className="mx-auto mt-2 max-w-md text-cream-200/60">
          Browse the menu, or just stop by — we're always baking something new.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link to="/menu">
            <Button size="lg">
              Explore Menu <FiArrowRight />
            </Button>
          </Link>
          <Link to="/contact">
            <Button size="lg" variant="outline">
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
