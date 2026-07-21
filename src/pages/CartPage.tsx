import { Link, useNavigate } from 'react-router-dom';
import { FiMinus, FiPlus, FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { removeFromCart, updateQuantity } from '@/features/cart/cartSlice';
import { Button } from '@/components/ui/Button';

export function CartPage() {
  const items = useAppSelector((s) => s.cart.items);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const subTotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
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
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display mb-8 text-3xl font-bold text-cream-100">Cart</h1>

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
    </div>
  );
}
