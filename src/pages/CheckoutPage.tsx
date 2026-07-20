import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { clearCart } from '@/features/cart/cartSlice';
import { ordersApi } from '@/api/orders';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { OrderType, PaymentMethod } from '@/types/order';

const checkoutSchema = z.object({
  guestFirstName: z.string().min(1, 'First name is required'),
  guestLastName: z.string().min(1, 'Last name is required'),
  guestEmail: z.string().email('Enter a valid email'),
  guestPhone: z.string().min(8, 'Enter a valid phone number'),
  orderType: z.enum(['delivery', 'pickup']),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  paymentMethod: z.enum(['cod', 'card', 'upi']),
  notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const paymentMethodMap: Record<CheckoutForm['paymentMethod'], number> = {
  cod: PaymentMethod.CashOnDelivery,
  card: PaymentMethod.Card,
  upi: PaymentMethod.UPI,
};

export function CheckoutPage() {
  const items = useAppSelector((s) => s.cart.items);
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

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
      guestFirstName: user?.firstName ?? '',
      guestLastName: user?.lastName ?? '',
      guestEmail: user?.email ?? '',
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
        guestFirstName: values.guestFirstName,
        guestLastName: values.guestLastName,
        guestEmail: values.guestEmail,
        guestPhone: values.guestPhone,
        orderType: values.orderType === 'delivery' ? OrderType.Delivery : OrderType.Pickup,
        paymentMethod: paymentMethodMap[values.paymentMethod],
        notes: values.notes,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      }),
    onSuccess: (order) => {
      dispatch(clearCart());
      toast.success('Order placed successfully!');
      navigate(`/orders/${order.id}/confirmation`);
    },
    onError: () => toast.error('Could not place order. Please try again.'),
  });

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
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="First name" {...register('guestFirstName')} error={errors.guestFirstName?.message} />
              <Input label="Last name" {...register('guestLastName')} error={errors.guestLastName?.message} />
              <Input label="Email" type="email" {...register('guestEmail')} error={errors.guestEmail?.message} />
              <Input label="Phone" {...register('guestPhone')} error={errors.guestPhone?.message} />
            </div>
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
                <Input label="Address" className="sm:col-span-2" {...register('addressLine1')} />
                <Input label="City" {...register('city')} />
                <Input label="State" {...register('state')} />
                <Input label="Postal code" {...register('postalCode')} />
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
