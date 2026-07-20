import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiCheckCircle } from 'react-icons/fi';
import { ordersApi } from '@/api/orders';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { OrderStatusLabels, type OrderStatusValue } from '@/types/order';

export function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getById(id!),
    enabled: Boolean(id),
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

      <div className="mt-10 rounded-2xl border border-white/10 bg-ink-900/40 p-6 text-left">
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
