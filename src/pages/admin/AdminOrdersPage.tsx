import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { ordersApi } from '@/api/orders';
import { PageSpinner } from '@/components/ui/Spinner';
import { OrderStatus, OrderStatusLabels, type OrderStatusValue } from '@/types/order';
import { getErrorMessage } from '@/utils/errors';

const statusFlow: OrderStatusValue[] = [
  OrderStatus.Pending,
  OrderStatus.Confirmed,
  OrderStatus.Preparing,
  OrderStatus.Baking,
  OrderStatus.Ready,
  OrderStatus.OutForDelivery,
  OrderStatus.Delivered,
  OrderStatus.Cancelled,
];

const terminalStatuses = new Set<OrderStatusValue>([OrderStatus.Delivered, OrderStatus.Cancelled]);

const PAGE_SIZE = 20;

export function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<OrderStatusValue | undefined>(undefined);
  const [page, setPage] = useState(1);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin', 'orders', statusFilter, page],
    queryFn: () => ordersApi.getAll({ pageNumber: page, pageSize: PAGE_SIZE, status: statusFilter }),
  });

  const totalPages = orders ? Math.max(1, Math.ceil(orders.totalCount / PAGE_SIZE)) : 1;

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatusValue }) => ordersApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Order status updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Could not update order status')),
  });

  if (isLoading) return <PageSpinner />;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-cream-100">Orders</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => {
            setStatusFilter(undefined);
            setPage(1);
          }}
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            statusFilter === undefined ? 'border-gold-500 bg-gold-500/15 text-gold-400' : 'border-white/10 text-cream-200/60'
          }`}
        >
          All
        </button>
        {statusFlow.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s);
              setPage(1);
            }}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              statusFilter === s ? 'border-gold-500 bg-gold-500/15 text-gold-400' : 'border-white/10 text-cream-200/60'
            }`}
          >
            {OrderStatusLabels[s]}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-ink-900/40">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-cream-200/50">
              <th className="p-4 font-medium">Order #</th>
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Total</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Update Status</th>
            </tr>
          </thead>
          <tbody>
            {orders?.items.map((order) => (
              <tr key={order.id} className="border-b border-white/5 text-cream-200/80">
                <td className="p-4">{order.orderNumber}</td>
                <td className="p-4">{order.customerName}</td>
                <td className="p-4">₹{order.totalAmount.toFixed(0)}</td>
                <td className="p-4">{OrderStatusLabels[order.status as OrderStatusValue]}</td>
                <td className="p-4">
                  {terminalStatuses.has(order.status as OrderStatusValue) ? (
                    <span className="text-xs text-cream-200/40">Final — cannot be changed</span>
                  ) : (
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateStatus.mutate({ id: order.id, status: Number(e.target.value) as OrderStatusValue })
                      }
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-cream-100 focus:border-gold-500/60 focus:outline-none"
                    >
                      {statusFlow.map((s) => (
                        <option key={s} value={s} className="bg-ink-900">
                          {OrderStatusLabels[s]}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
              </tr>
            ))}
            {orders?.items.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-cream-200/40">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {orders && orders.totalCount > 0 && (
        <div className="mt-4 flex items-center justify-between text-xs text-cream-200/50">
          <span>
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, orders.totalCount)} of{' '}
            {orders.totalCount} orders
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-cream-200/70 transition-colors hover:border-gold-500/40 hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <FiChevronLeft size={14} />
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              aria-label="Next page"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-cream-200/70 transition-colors hover:border-gold-500/40 hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <FiChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
