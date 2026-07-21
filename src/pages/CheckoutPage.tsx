import { Link, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FiAlertTriangle, FiLock } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout } from '@/features/auth/authSlice';
import { clearCart } from '@/features/cart/cartSlice';
import { ordersApi } from '@/api/orders';
import { customersApi } from '@/api/customers';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { OrderType, PaymentMethod } from '@/types/order';
import { getErrorMessage } from '@/utils/errors';

const checkoutSchema = z
  .object({
    orderType: z.enum(['delivery', 'pickup']),
    addressLine1: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    paymentMethod: z.enum(['cod', 'card', 'upi']),
    notes: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.orderType !== 'delivery') return;
    if (!values.addressLine1?.trim())
      ctx.addIssue({ code: 'custom', path: ['addressLine1'], message: 'Address is required for delivery' });
    if (!values.city?.trim()) ctx.addIssue({ code: 'custom', path: ['city'], message: 'City is required' });
    if (!values.state?.trim()) ctx.addIssue({ code: 'custom', path: ['state'], message: 'State is required' });
    if (!values.postalCode?.trim())
      ctx.addIssue({ code: 'custom', path: ['postalCode'], message: 'Postal code is required' });
  });

type CheckoutForm = z.infer<typeof checkoutSchema>;

const paymentMethodMap: Record<CheckoutForm['paymentMethod'], number> = {
  cod: PaymentMethod.CashOnDelivery,
  card: PaymentMethod.Card,
  upi: PaymentMethod.UPI,
};

export function CheckoutPage() {
  const items = useAppSelector((s) => s.cart.items);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    data: myCustomer,
    isLoading: isCustomerLoading,
    isError: isCustomerError,
    error: customerError,
  } = useQuery({
    queryKey: ['customers', 'me'],
    queryFn: customersApi.getMe,
    enabled: isAuthenticated,
    retry: 1,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      orderType: 'delivery',
      paymentMethod: 'cod',
    },
  });

  const orderType = watch('orderType');
  const subTotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const deliveryFee = orderType === 'delivery' ? 40 : 0;
  const tax = Math.round(subTotal * 0.05);
  const total = subTotal + deliveryFee + tax;

  const placeOrder = useMutation({
    mutationFn: (values: CheckoutForm) =>
      ordersApi.create({
        orderType: values.orderType === 'delivery' ? OrderType.Delivery : OrderType.Pickup,
        deliveryAddressLine1: values.orderType === 'delivery' ? values.addressLine1 : undefined,
        deliveryCity: values.orderType === 'delivery' ? values.city : undefined,
        deliveryState: values.orderType === 'delivery' ? values.state : undefined,
        deliveryPostalCode: values.orderType === 'delivery' ? values.postalCode : undefined,
        paymentMethod: paymentMethodMap[values.paymentMethod],
        notes: values.notes,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      }),
    onSuccess: (order) => {
      dispatch(clearCart());
      toast.success('Order placed successfully!');
      navigate(`/orders/${order.id}/confirmation`);
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Could not place order. Please try again.')),
  });

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
        <FiLock size={40} className="text-cream-200/20" />
        <h2 className="font-display mt-6 text-xl font-bold text-cream-100">Sign in to place an order</h2>
        <p className="mt-2 text-cream-200/60">
          Create an account or sign in so we can attach this order to you and keep you updated on it.
        </p>
        <div className="mt-6 flex gap-3">
          <Link to="/login">
            <Button>Sign In</Button>
          </Link>
          <Link to="/register">
            <Button variant="outline">Create Account</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return <p className="py-24 text-center text-cream-200/50">Your cart is empty.</p>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display mb-8 text-3xl font-bold text-cream-100">Checkout</h1>

      <form
        onSubmit={handleSubmit((values) => placeOrder.mutate(values))}
        className="grid gap-10 lg:grid-cols-3"
      >
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-white/10 bg-ink-900/40 p-6">
            <h2 className="font-display mb-4 text-lg font-semibold text-cream-100">Contact Details</h2>
            {isCustomerError ? (
              <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                <FiAlertTriangle className="mt-0.5 shrink-0 text-red-400" />
                <div>
                  <p className="text-sm text-red-400">{getErrorMessage(customerError, "Couldn't load your account details.")}</p>
                  <p className="mt-1 text-xs text-cream-200/50">
                    This usually means your session is stale — often from signing in as a different account in
                    another tab.
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
            ) : isCustomerLoading || !myCustomer ? (
              <p className="text-sm text-cream-200/40">Loading your account details…</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-cream-200/40">Name</p>
                  <p className="mt-0.5 text-sm text-cream-100">
                    {`${myCustomer.firstName} ${myCustomer.lastName}`.trim()}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-cream-200/40">Email</p>
                  <p className="mt-0.5 text-sm text-cream-100">{myCustomer.email}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-cream-200/40">Phone</p>
                  <p className="mt-0.5 text-sm text-cream-100">
                    {myCustomer.phone || <span className="text-cream-200/40">Not set</span>}
                  </p>
                </div>
              </div>
            )}
            <p className="mt-4 text-xs text-cream-200/40">
              We'll use your account details for this order. Order updates go to the email above.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-ink-900/40 p-6">
            <h2 className="font-display mb-4 text-lg font-semibold text-cream-100">Fulfilment</h2>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-cream-200/80">
                <input type="radio" value="delivery" {...register('orderType')} /> Delivery
              </label>
              <label className="flex items-center gap-2 text-sm text-cream-200/80">
                <input type="radio" value="pickup" {...register('orderType')} /> Pickup
              </label>
            </div>

            {orderType === 'delivery' && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Input label="Address" className="sm:col-span-2" {...register('addressLine1')} error={errors.addressLine1?.message} />
                <Input label="City" {...register('city')} error={errors.city?.message} />
                <Input label="State" {...register('state')} error={errors.state?.message} />
                <Input label="Postal code" {...register('postalCode')} error={errors.postalCode?.message} />
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-ink-900/40 p-6">
            <h2 className="font-display mb-4 text-lg font-semibold text-cream-100">Payment Method</h2>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm text-cream-200/80">
                <input type="radio" value="cod" {...register('paymentMethod')} /> Cash on Delivery
              </label>
              <label className="flex items-center gap-2 text-sm text-cream-200/80">
                <input type="radio" value="card" {...register('paymentMethod')} /> Card
              </label>
              <label className="flex items-center gap-2 text-sm text-cream-200/80">
                <input type="radio" value="upi" {...register('paymentMethod')} /> UPI
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-ink-900/40 p-6">
            <label htmlFor="notes" className="text-sm font-medium text-cream-200/80">
              Order Notes (optional)
            </label>
            <textarea
              id="notes"
              rows={3}
              {...register('notes')}
              className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-cream-100 placeholder:text-cream-200/30 focus:border-gold-500/60 focus:outline-none"
              placeholder="Any special instructions..."
            />
          </div>
        </div>

        <div className="h-fit rounded-2xl border border-white/10 bg-ink-900/40 p-6">
          <h2 className="font-display text-lg font-semibold text-cream-100">Order Summary</h2>
          <ul className="mt-4 space-y-2 text-sm text-cream-200/70">
            {items.map((item) => (
              <li key={item.productId} className="flex justify-between">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>₹{(item.unitPrice * item.quantity).toFixed(0)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1.5 border-t border-white/10 pt-4 text-sm text-cream-200/70">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{subTotal.toFixed(0)}</span></div>
            <div className="flex justify-between"><span>Delivery Fee</span><span>₹{deliveryFee.toFixed(0)}</span></div>
            <div className="flex justify-between"><span>Tax (5%)</span><span>₹{tax.toFixed(0)}</span></div>
            <div className="flex justify-between text-base font-semibold text-cream-100">
              <span>Total</span><span>₹{total.toFixed(0)}</span>
            </div>
          </div>
          <Button type="submit" className="mt-6 w-full" isLoading={placeOrder.isPending}>
            Place Order
          </Button>
        </div>
      </form>
    </div>
  );
}
