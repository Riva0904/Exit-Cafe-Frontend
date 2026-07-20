import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ordersApi } from '@/api/orders';
import { PageSpinner } from '@/components/ui/Spinner';
import { OrderStatus, OrderStatusLabels, type OrderStatusValue } from '@/types/order';

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

export function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<OrderStatusValue | undefined>(undefined);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin', 'orders', statusFilter],
    queryFn: () => ordersApi.getAll({ pageNumber: 1, pageSize: 50, status: statusFilter }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatusValue }) => ordersApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Order status updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
    onError: () => toast.error('Could not update order status'),
  });

  if (isLoading) return <PageSpinner />;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-cream-100">Orders</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter(undefined)}
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            statusFilter === undefined ? 'border-gold-500 bg-gold-500/15 text-gold-400' : 'border-white/10 text-cream-200/60'
          }`}
        >
          All
        </button>
        {statusFlow.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
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
    </div>
  );
}
