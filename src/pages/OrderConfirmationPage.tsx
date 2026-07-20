import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { ordersApi } from '@/api/orders';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { OrderStatus, OrderStatusLabels, type OrderStatusValue } from '@/types/order';

const activeSteps: OrderStatusValue[] = [
  OrderStatus.Pending,
  OrderStatus.Confirmed,
  OrderStatus.Preparing,
  OrderStatus.Baking,
  OrderStatus.Ready,
  OrderStatus.OutForDelivery,
  OrderStatus.Delivered,
];

const terminalStatuses = new Set<OrderStatusValue>([OrderStatus.Delivered, OrderStatus.Cancelled]);

function StatusTimeline({ status }: { status: OrderStatusValue }) {
  if (status === OrderStatus.Cancelled) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-4 text-red-400">
        <FiXCircle /> This order has been cancelled.
      </div>
    );
  }

  const currentIndex = activeSteps.indexOf(status);

  return (
    <div className="flex items-center">
      {activeSteps.map((step, index) => {
        const reached = index <= currentIndex;
        return (
          <div key={step} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                initial={false}
                animate={{ scale: reached ? 1 : 0.85, opacity: reached ? 1 : 0.4 }}
                className={`flex h-3 w-3 shrink-0 rounded-full ${reached ? 'bg-gold-500' : 'bg-white/20'}`}
              />
              <span
                className={`text-center text-[10px] uppercase tracking-wide ${
                  reached ? 'text-gold-400' : 'text-cream-200/30'
                }`}
              >
                {OrderStatusLabels[step]}
              </span>
            </div>
            {index < activeSteps.length - 1 && (
              <div className="mx-1 h-px flex-1 -translate-y-3">
                <div className={`h-full transition-colors ${index < currentIndex ? 'bg-gold-500' : 'bg-white/10'}`} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getById(id!),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status !== undefined && terminalStatuses.has(status as OrderStatusValue) ? false : 10_000;
    },
  });

  if (isLoading) return <PageSpinner />;
  if (!order) return <p className="py-24 text-center text-cream-200/50">Order not found.</p>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <FiCheckCircle size={56} className="mx-auto text-gold-500" />
      <h1 className="font-display mt-6 text-3xl font-bold text-cream-100">Thank you for your order!</h1>
      <p className="mt-2 text-cream-200/60">
        Order <span className="font-medium text-gold-400">{order.orderNumber}</span> has been placed and is{' '}
        {OrderStatusLabels[order.status as OrderStatusValue].toLowerCase()}.
      </p>

      <div className="mt-8 rounded-2xl border border-white/10 bg-ink-900/40 p-6">
        <StatusTimeline status={order.status} />
      </div>
      <p className="mt-2 text-xs text-cream-200/40">
        This page updates automatically as the kitchen updates your order.
      </p>

      <div className="mt-6 rounded-2xl border border-white/10 bg-ink-900/40 p-6 text-left">
        <ul className="space-y-2 text-sm text-cream-200/70">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>{item.productName} × {item.quantity}</span>
              <span>₹{item.totalPrice.toFixed(0)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-white/10 pt-4 text-base font-semibold text-cream-100">
          <span>Total</span>
          <span>₹{order.totalAmount.toFixed(0)}</span>
        </div>
      </div>

      <Link to="/menu" className="mt-8 inline-block">
        <Button>Continue Shopping</Button>
      </Link>
    </div>
  );
}
