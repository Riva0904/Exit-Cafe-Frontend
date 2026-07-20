import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPackage, FiShoppingCart, FiTrendingUp, FiUsers, FiXCircle } from 'react-icons/fi';
import { ordersApi } from '@/api/orders';
import { productsApi } from '@/api/catalog';
import { customersApi } from '@/api/customers';
import { PageSpinner } from '@/components/ui/Spinner';
import { CountUp } from '@/components/ui/CountUp';
import { OrderStatus, OrderStatusLabels, type OrderStatusValue } from '@/types/order';

const statOrder: OrderStatusValue[] = [0, 1, 2, 3, 4, 5, 6, 7];

const statusToneMap: Record<OrderStatusValue, string> = {
  0: 'from-amber-400 to-amber-600',
  1: 'from-sky-400 to-sky-600',
  2: 'from-indigo-400 to-indigo-600',
  3: 'from-orange-400 to-orange-600',
  4: 'from-teal-400 to-teal-600',
  5: 'from-cyan-400 to-cyan-600',
  6: 'from-emerald-400 to-emerald-600',
  7: 'from-red-400 to-red-600',
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' as const },
  }),
};

function StatCard({
  label,
  value,
  prefix,
  icon: Icon,
  index,
  glow,
}: {
  label: string;
  value: number;
  prefix?: string;
  icon: typeof FiPackage;
  index: number;
  glow: string;
}) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="show"
      variants={cardVariants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-ink-900/50 p-6"
    >
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${glow} opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-40`}
      />
      <div className="relative flex items-center gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${glow} text-ink-950 shadow-lg`}
        >
          <Icon size={18} />
        </div>
        <div>
          <p className="font-display text-2xl font-bold text-cream-100">
            <CountUp value={value} prefix={prefix} />
          </p>
          <p className="text-xs text-cream-200/60">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function AdminDashboardPage() {
  const { data: allOrders, isLoading: loadingAll } = useQuery({
    queryKey: ['admin', 'orders', 'all-for-dashboard'],
    queryFn: () => ordersApi.getAll({ pageNumber: 1, pageSize: 100 }),
  });
  const { data: products } = useQuery({
    queryKey: ['admin', 'products', 'all-for-dashboard'],
    queryFn: () => productsApi.getAll({ pageNumber: 1, pageSize: 100 }),
  });
  const { data: customers } = useQuery({
    queryKey: ['admin', 'customers', 'count'],
    queryFn: () => customersApi.getAll({ pageNumber: 1, pageSize: 1 }),
  });

  const stats = useMemo(() => {
    const orders = allOrders?.items ?? [];
    const statusCounts = statOrder.reduce(
      (acc, s) => ({ ...acc, [s]: orders.filter((o) => o.status === s).length }),
      {} as Record<OrderStatusValue, number>,
    );
    const revenue = orders
      .filter((o) => o.status !== OrderStatus.Cancelled)
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const productTotals = new Map<string, number>();
    for (const order of orders) {
      for (const item of order.items) {
        productTotals.set(item.productName, (productTotals.get(item.productName) ?? 0) + item.quantity);
      }
    }
    const topProducts = [...productTotals.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const maxStatusCount = Math.max(1, ...Object.values(statusCounts));

    return { statusCounts, revenue, topProducts, maxStatusCount, totalOrders: orders.length };
  }, [allOrders]);

  if (loadingAll) return <PageSpinner />;

  return (
    <div>
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-bold text-cream-100">Dashboard</h1>
        <p className="text-sm text-cream-200/60">Real-time overview of Exit Caff's storefront &amp; kitchen</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Revenue" value={stats.revenue} prefix="₹" icon={FiTrendingUp} index={0} glow="from-gold-400 to-gold-600" />
        <StatCard label="Total Orders" value={stats.totalOrders} icon={FiShoppingCart} index={1} glow="from-sky-400 to-sky-600" />
        <StatCard label="Pending Orders" value={stats.statusCounts[OrderStatus.Pending]} icon={FiShoppingCart} index={2} glow="from-amber-400 to-amber-600" />
        <StatCard label="Cancelled" value={stats.statusCounts[OrderStatus.Cancelled]} icon={FiXCircle} index={3} glow="from-red-400 to-red-600" />
        <StatCard label="Products" value={products?.totalCount ?? 0} icon={FiPackage} index={4} glow="from-emerald-400 to-emerald-600" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="rounded-2xl border border-white/10 bg-ink-900/50 p-6 lg:col-span-2"
        >
          <h2 className="font-display mb-5 text-lg font-semibold text-cream-100">Order Pipeline</h2>
          <div className="space-y-3">
            {statOrder.map((s, idx) => {
              const count = stats.statusCounts[s];
              const pct = Math.round((count / stats.maxStatusCount) * 100);
              return (
                <div key={s} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-xs text-cream-200/60">{OrderStatusLabels[s]}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.4 + idx * 0.05, duration: 0.6, ease: 'easeOut' }}
                      className={`h-full rounded-full bg-gradient-to-r ${statusToneMap[s]}`}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right text-xs font-medium text-cream-100">{count}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="rounded-2xl border border-white/10 bg-ink-900/50 p-6"
        >
          <h2 className="font-display mb-5 text-lg font-semibold text-cream-100">Top Sellers</h2>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-cream-200/40">No sales data yet.</p>
          ) : (
            <ul className="space-y-4">
              {stats.topProducts.map(([name, qty], idx) => {
                const pct = Math.round((qty / stats.topProducts[0][1]) * 100);
                return (
                  <li key={name}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="truncate text-cream-200/80">{name}</span>
                      <span className="text-gold-400">{qty} sold</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.5 + idx * 0.06, duration: 0.6, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-gold-300 to-gold-600"
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="mt-6 rounded-2xl border border-white/10 bg-ink-900/50 p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-cream-100">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-gold-400 hover:underline">
            View all
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-cream-200/50">
                <th className="pb-2 pr-4 font-medium">Order #</th>
                <th className="pb-2 pr-4 font-medium">Customer</th>
                <th className="pb-2 pr-4 font-medium">Status</th>
                <th className="pb-2 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {allOrders?.items.slice(0, 8).map((order) => (
                <tr key={order.id} className="border-b border-white/5 text-cream-200/80 transition-colors hover:bg-white/5">
                  <td className="py-2.5 pr-4">{order.orderNumber}</td>
                  <td className="py-2.5 pr-4">{order.customerName}</td>
                  <td className="py-2.5 pr-4">
                    <span
                      className={`inline-flex items-center rounded-full bg-gradient-to-r ${statusToneMap[order.status as OrderStatusValue]} px-2.5 py-0.5 text-xs font-medium text-ink-950`}
                    >
                      {OrderStatusLabels[order.status as OrderStatusValue]}
                    </span>
                  </td>
                  <td className="py-2.5">₹{order.totalAmount.toFixed(0)}</td>
                </tr>
              ))}
              {allOrders?.items.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-cream-200/40">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <p className="mt-6 flex items-center gap-1.5 text-xs text-cream-200/40">
        <FiUsers size={12} /> {customers?.totalCount ?? 0} customers on record. Full Reports/Analytics and
        Inventory modules aren't part of this build yet — figures above are computed from live order data.
      </p>
    </div>
  );
}
