import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiCheck, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { ordersApi } from '@/api/orders';
import { reviewsApi } from '@/api/reviews';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { StarRatingInput } from '@/components/ui/StarRatingInput';
import { OrderStatus, OrderStatusLabels, type OrderStatusValue } from '@/types/order';
import type { OrderItem } from '@/types/order';
import { getErrorMessage } from '@/utils/errors';

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

function RateItemRow({ item, orderId }: { item: OrderItem; orderId: string }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  const submit = useMutation({
    mutationFn: () => reviewsApi.create({ productId: item.productId, orderId, rating, comment: comment || undefined }),
    onSuccess: () => {
      toast.success('Thanks for rating!');
      queryClient.invalidateQueries({ queryKey: ['order-reviews', orderId] });
      // Product query keys aren't unified across pages (raw strings on Home, ['product', slug] on
      // detail, ['products', filters] on Menu) — a rating changes the reviewed product's
      // avgRating/reviewCount, which every one of those can be showing. Refetch everything mounted
      // rather than trying to enumerate each key.
      queryClient.invalidateQueries();
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Could not submit rating')),
  });

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm font-medium text-cream-100">{item.productName}</p>
      <div className="mt-2 flex items-center gap-4">
        <StarRatingInput value={rating} onChange={setRating} />
        <Button size="sm" onClick={() => submit.mutate()} isLoading={submit.isPending} disabled={rating === 0}>
          Submit
        </Button>
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Say something about this item (optional)"
        rows={2}
        className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-cream-100 placeholder:text-cream-200/30 focus:border-gold-500/60 focus:outline-none"
      />
    </div>
  );
}

function RateOrderSection({ orderId, items }: { orderId: string; items: OrderItem[] }) {
  const { data: reviewedProductIds } = useQuery({
    queryKey: ['order-reviews', orderId],
    queryFn: () => reviewsApi.getOrderReviews(orderId),
  });

  const unrated = items.filter((item) => !reviewedProductIds?.includes(item.productId));
  const rated = items.filter((item) => reviewedProductIds?.includes(item.productId));

  if (!reviewedProductIds) return null;

  return (
    <div className="mt-6 rounded-2xl border border-gold-500/20 bg-gold-500/5 p-6 text-left">
      <h2 className="font-display text-lg font-semibold text-cream-100">Rate your order</h2>
      <p className="mt-1 text-xs text-cream-200/50">Let us know how each item was.</p>

      <div className="mt-4 space-y-3">
        {unrated.map((item) => (
          <RateItemRow key={item.id} item={item} orderId={orderId} />
        ))}
        {rated.map((item) => (
          <div key={item.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-cream-200/60">
            <FiCheck className="text-emerald-400" /> {item.productName} — rated, thank you!
          </div>
        ))}
      </div>
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

  const status = order.status as OrderStatusValue;
  const isTerminal = terminalStatuses.has(status);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
      {status === OrderStatus.Cancelled ? (
        <FiXCircle size={56} className="mx-auto text-red-400" />
      ) : (
        <FiCheckCircle size={56} className="mx-auto text-gold-500" />
      )}
      <h1 className="font-display mt-6 text-3xl font-bold text-cream-100">
        {status === OrderStatus.Cancelled
          ? 'Order Cancelled'
          : status === OrderStatus.Delivered
            ? 'Order Delivered'
            : 'Thank you for your order!'}
      </h1>
      <p className="mt-2 text-cream-200/60">
        Order <span className="font-medium text-gold-400">{order.orderNumber}</span> is{' '}
        {OrderStatusLabels[status].toLowerCase()}.
      </p>

      <div className="mt-8 rounded-2xl border border-white/10 bg-ink-900/40 p-6">
        <StatusTimeline status={status} />
      </div>
      {!isTerminal && (
        <p className="mt-2 text-xs text-cream-200/40">
          This page updates automatically as the kitchen updates your order.
        </p>
      )}

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

      {status === OrderStatus.Delivered && <RateOrderSection orderId={order.id} items={order.items} />}

      <Link to="/menu" className="mt-8 inline-block">
        <Button>Continue Shopping</Button>
      </Link>
    </div>
  );
}
