import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiPackage, FiShoppingCart, FiUsers } from 'react-icons/fi';
import { ordersApi } from '@/api/orders';
import { productsApi } from '@/api/catalog';
import { customersApi } from '@/api/customers';
import { PageSpinner } from '@/components/ui/Spinner';
import { OrderStatus, OrderStatusLabels, type OrderStatusValue } from '@/types/order';

function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: typeof FiPackage }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-900/40 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500/10 text-gold-400">
          <Icon size={18} />
        </div>
        <div>
          <p className="text-2xl font-bold text-cream-100">{value}</p>
          <p className="text-xs text-cream-200/60">{label}</p>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboardPage() {
  const { data: allOrders, isLoading: loadingAll } = useQuery({
    queryKey: ['admin', 'orders', 'count-all'],
    queryFn: () => ordersApi.getAll({ pageNumber: 1, pageSize: 1 }),
  });
  const { data: pendingOrders } = useQuery({
    queryKey: ['admin', 'orders', 'count-pending'],
    queryFn: () => ordersApi.getAll({ pageNumber: 1, pageSize: 1, status: OrderStatus.Pending }),
  });
  const { data: cancelledOrders } = useQuery({
    queryKey: ['admin', 'orders', 'count-cancelled'],
    queryFn: () => ordersApi.getAll({ pageNumber: 1, pageSize: 1, status: OrderStatus.Cancelled }),
  });
  const { data: products } = useQuery({
    queryKey: ['admin', 'products', 'count'],
    queryFn: () => productsApi.getAll({ pageNumber: 1, pageSize: 1 }),
  });
  const { data: customers } = useQuery({
    queryKey: ['admin', 'customers', 'count'],
    queryFn: () => customersApi.getAll({ pageNumber: 1, pageSize: 1 }),
  });
  const { data: recentOrders, isLoading: loadingRecent } = useQuery({
    queryKey: ['admin', 'orders', 'recent'],
    queryFn: () => ordersApi.getAll({ pageNumber: 1, pageSize: 8 }),
  });

  if (loadingAll || loadingRecent) return <PageSpinner />;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-cream-100">Dashboard</h1>
      <p className="mt-1 text-sm text-cream-200/60">Overview of store activity</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Orders" value={allOrders?.totalCount ?? 0} icon={FiShoppingCart} />
        <StatCard label="Pending Orders" value={pendingOrders?.totalCount ?? 0} icon={FiShoppingCart} />
        <StatCard label="Cancelled Orders" value={cancelledOrders?.totalCount ?? 0} icon={FiShoppingCart} />
        <StatCard label="Products" value={products?.totalCount ?? 0} icon={FiPackage} />
        <StatCard label="Customers" value={customers?.totalCount ?? 0} icon={FiUsers} />
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-ink-900/40 p-6">
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
              {recentOrders?.items.map((order) => (
                <tr key={order.id} className="border-b border-white/5 text-cream-200/80">
                  <td className="py-2.5 pr-4">{order.orderNumber}</td>
                  <td className="py-2.5 pr-4">{order.customerName}</td>
                  <td className="py-2.5 pr-4">{OrderStatusLabels[order.status as OrderStatusValue]}</td>
                  <td className="py-2.5">₹{order.totalAmount.toFixed(0)}</td>
                </tr>
              ))}
              {recentOrders?.items.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-cream-200/40">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-4 text-xs text-cream-200/40">
        Revenue, sales charts and inventory widgets require the Reports/Analytics and Inventory modules,
        which aren't part of this build yet.
      </p>
    </div>
  );
}
