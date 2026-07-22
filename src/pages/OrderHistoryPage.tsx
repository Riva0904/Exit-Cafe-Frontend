import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FiAlertTriangle, FiClock, FiRefreshCw } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout } from '@/features/auth/authSlice';
import { addToCart } from '@/features/cart/cartSlice';
import { ordersApi } from '@/api/orders';
import { productsApi } from '@/api/catalog';
import { Button } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import { OrderStatus, OrderStatusLabels, type Order, type OrderStatusValue } from '@/types/order';
import { getErrorMessage } from '@/utils/errors';

const staffRoles = new Set(['SuperAdmin', 'Admin', 'Manager', 'Staff']);

const activeStatuses = new Set<OrderStatusValue>([
  OrderStatus.Pending,
  OrderStatus.Confirmed,
  OrderStatus.Preparing,
  OrderStatus.Baking,
  OrderStatus.Ready,
  OrderStatus.OutForDelivery,
]);

function OrderCard({ order, onReorder, reordering }: { order: Order; onReorder: (order: Order) => void; reordering: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-ink-900/40 p-5 transition-colors hover:border-gold-500/40">
      <Link to={`/orders/${order.id}/confirmation`} className="block">
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

        <p className="mt-3 text-right text-xs font-medium text-gold-400">Track order →</p>
      </Link>

      <button
        onClick={() => onReorder(order)}
        disabled={reordering}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-white/10 py-2 text-xs font-medium text-cream-200/70 transition-colors hover:border-gold-500/40 hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FiRefreshCw size={13} className={reordering ? 'animate-spin' : ''} /> Reorder
      </button>
    </div>
  );
}

export function OrderHistoryPage() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const user = useAppSelector((s) => s.auth.user);
  const isStaff = Boolean(user && staffRoles.has(user.role));
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    data: orders,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['orders', 'my'],
    queryFn: ordersApi.getMyOrders,
    enabled: isAuthenticated && !isStaff,
    refetchInterval: 15_000,
    retry: 1,
  });

  async function handleReorder(order: Order) {
    let addedCount = 0;
    for (const item of order.items) {
      try {
        const product = await productsApi.getById(item.productId);
        if (!product.isAvailable) {
          toast.error(`${product.name} is no longer available`);
          continue;
        }
        dispatch(
          addToCart({
            product: {
              id: product.id,
              name: product.name,
              slug: product.slug,
              primaryImageUrl: product.images[0]?.imageUrl,
              price: product.price,
              discountPrice: product.discountPrice,
            },
            quantity: item.quantity,
          }),
        );
        addedCount += 1;
      } catch {
        toast.error(`${item.productName} is no longer available`);
      }
    }

    if (addedCount > 0) {
      toast.success(`${addedCount} item${addedCount > 1 ? 's' : ''} added to cart`);
      navigate('/cart');
    } else {
      toast.error('None of these items are available anymore');
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
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

  if (isStaff) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
        <FiClock size={48} className="text-cream-200/20" />
        <h2 className="font-display mt-6 text-xl font-bold text-cream-100">No order history for staff accounts</h2>
        <p className="mt-2 text-cream-200/60">
          You're signed in as {user!.firstName} ({user!.role}). Staff accounts don't place customer orders, so
          there's nothing to show here — sign in with a customer account instead.
        </p>
        <button
          type="button"
          onClick={() => dispatch(logout())}
          className="mt-6 text-sm font-medium text-gold-400 hover:underline"
        >
          Sign out
        </button>
      </div>
    );
  }

  if (isLoading) return <PageSpinner />;

  const activeOrders = orders?.filter((o) => activeStatuses.has(o.status as OrderStatusValue)) ?? [];
  const pastOrders = orders?.filter((o) => !activeStatuses.has(o.status as OrderStatusValue)) ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display mb-8 text-3xl font-bold text-cream-100">Order History</h1>

      {isError ? (
        <div className="mx-auto flex max-w-xl items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <FiAlertTriangle className="mt-0.5 shrink-0 text-red-400" />
          <div>
            <p className="text-sm text-red-400">{getErrorMessage(error, "Couldn't load your order history.")}</p>
            <p className="mt-1 text-xs text-cream-200/50">
              This usually means your session is stale — often from signing in as a different account in another
              tab.
            </p>
            <button
              type="button"
              onClick={() => dispatch(logout())}
              className="mt-2 text-xs font-medium text-gold-400 hover:underline"
            >
              Sign out and sign in again
            </button>
          </div>
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center">
          <FiClock size={48} className="text-cream-200/20" />
          <h2 className="font-display mt-6 text-xl font-bold text-cream-100">No orders yet</h2>
          <p className="mt-2 text-cream-200/60">Your placed orders will show up here.</p>
          <Link to="/menu" className="mt-6">
            <Button>Browse Menu</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          <section>
            <h2 className="font-display mb-4 text-lg font-semibold text-cream-100">
              Current Orders {activeOrders.length > 0 && `(${activeOrders.length})`}
            </h2>
            {activeOrders.length === 0 ? (
              <p className="text-sm text-cream-200/40">Nothing in progress right now.</p>
            ) : (
              <div className="space-y-4">
                {activeOrders.map((order) => (
                  <OrderCard key={order.id} order={order} onReorder={handleReorder} reordering={false} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="font-display mb-4 text-lg font-semibold text-cream-100">
              Past Orders {pastOrders.length > 0 && `(${pastOrders.length})`}
            </h2>
            {pastOrders.length === 0 ? (
              <p className="text-sm text-cream-200/40">No completed or cancelled orders yet.</p>
            ) : (
              <div className="space-y-4">
                {pastOrders.map((order) => (
                  <OrderCard key={order.id} order={order} onReorder={handleReorder} reordering={false} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
