import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiClock, FiMinus, FiPlus, FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { removeFromCart, updateQuantity } from '@/features/cart/cartSlice';
import { ordersApi } from '@/api/orders';
import { Button } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import { OrderStatusLabels, type OrderStatusValue } from '@/types/order';

function CartTab() {
  const items = useAppSelector((s) => s.cart.items);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const subTotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center">
        <FiShoppingBag size={48} className="text-cream-200/20" />
        <h2 className="font-display mt-6 text-xl font-bold text-cream-100">Your cart is empty</h2>
        <p className="mt-2 text-cream-200/60">Looks like you haven't added anything yet.</p>
        <Link to="/menu" className="mt-6">
          <Button>Browse Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center gap-4 rounded-xl border border-white/10 bg-ink-900/40 p-4"
          >
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-ink-800">
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <Link to={`/menu/${item.slug}`} className="font-medium text-cream-100 hover:text-gold-400">
                {item.name}
              </Link>
              <p className="mt-1 text-sm text-gold-400">₹{item.unitPrice.toFixed(0)}</p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-white/10 px-2 py-1">
              <button
                onClick={() =>
                  dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity - 1 }))
                }
              >
                <FiMinus size={12} />
              </button>
              <span className="w-5 text-center text-sm">{item.quantity}</span>
              <button
                onClick={() =>
                  dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }))
                }
              >
                <FiPlus size={12} />
              </button>
            </div>

            <span className="w-20 text-right font-medium text-cream-100">
              ₹{(item.unitPrice * item.quantity).toFixed(0)}
            </span>

            <button
              onClick={() => dispatch(removeFromCart(item.productId))}
              className="text-cream-200/40 hover:text-red-400"
              aria-label="Remove item"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="h-fit rounded-2xl border border-white/10 bg-ink-900/40 p-6">
        <h2 className="font-display text-lg font-semibold text-cream-100">Order Summary</h2>
        <div className="mt-4 flex justify-between text-sm text-cream-200/70">
          <span>Subtotal</span>
          <span>₹{subTotal.toFixed(0)}</span>
        </div>
        <p className="mt-1 text-xs text-cream-200/40">Tax and delivery calculated at checkout.</p>
        <Button className="mt-6 w-full" onClick={() => navigate('/checkout')}>
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
}

function HistoryTab() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', 'my'],
    queryFn: ordersApi.getMyOrders,
    enabled: isAuthenticated,
    refetchInterval: 15_000,
  });

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center">
        <FiClock size={48} className="text-cream-200/20" />
        <h2 className="font-display mt-6 text-xl font-bold text-cream-100">Sign in to see your orders</h2>
        <p className="mt-2 text-cream-200/60">
          Order history is tied to your account. Sign in to view past orders.
        </p>
        <Link to="/login" className="mt-6">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) return <PageSpinner />;

  if (!orders || orders.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center">
        <FiClock size={48} className="text-cream-200/20" />
        <h2 className="font-display mt-6 text-xl font-bold text-cream-100">No orders yet</h2>
        <p className="mt-2 text-cream-200/60">Your placed orders will show up here.</p>
        <Link to="/menu" className="mt-6">
          <Button>Browse Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="rounded-xl border border-white/10 bg-ink-900/40 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-medium text-cream-100">{order.orderNumber}</p>
              <p className="text-xs text-cream-200/50">
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
            <span className="rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-xs font-medium text-gold-400">
              {OrderStatusLabels[order.status as OrderStatusValue]}
            </span>
          </div>

          <ul className="mt-4 space-y-1 border-t border-white/10 pt-3 text-sm text-cream-200/70">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>
                  {item.productName} × {item.quantity}
                </span>
                <span>₹{item.totalPrice.toFixed(0)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-sm font-semibold text-cream-100">
            <span>Total</span>
            <span>₹{order.totalAmount.toFixed(0)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CartPage() {
  const [tab, setTab] = useState<'cart' | 'history'>('cart');

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-2">
        <button
          onClick={() => setTab('cart')}
          className={clsx(
            'rounded-full border px-5 py-2 text-sm font-medium transition-colors',
            tab === 'cart'
              ? 'border-gold-500 bg-gold-500/15 text-gold-400'
              : 'border-white/10 text-cream-200/70 hover:border-gold-500/40',
          )}
        >
          Cart
        </button>
        <button
          onClick={() => setTab('history')}
          className={clsx(
            'rounded-full border px-5 py-2 text-sm font-medium transition-colors',
            tab === 'history'
              ? 'border-gold-500 bg-gold-500/15 text-gold-400'
              : 'border-white/10 text-cream-200/70 hover:border-gold-500/40',
          )}
        >
          Order History
        </button>
      </div>

      {tab === 'cart' ? <CartTab /> : <HistoryTab />}
    </div>
  );
}
