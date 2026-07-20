import { Link } from 'react-router-dom';
import { FiShoppingBag, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAppDispatch } from '@/app/hooks';
import { addToCart } from '@/features/cart/cartSlice';
import type { ProductListItem } from '@/types/catalog';

export function ProductCard({ product }: { product: ProductListItem }) {
  const dispatch = useAppDispatch();
  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="group overflow-hidden rounded-2xl border border-white/10 bg-ink-900/40"
    >
      <Link to={`/menu/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-ink-800">
          {product.primaryImageUrl ? (
            <img
              src={product.primaryImageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-cream-200/20">No image</div>
          )}

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.isBestSeller && <Badge tone="gold">Best Seller</Badge>}
            {product.isNewArrival && <Badge tone="success">New</Badge>}
          </div>
        </div>

        <div className="p-4">
          <p className="text-xs uppercase tracking-widest text-gold-500/70">{product.categoryName}</p>
          <h3 className="font-display mt-1 text-lg font-semibold text-cream-100 group-hover:text-gold-400">
            {product.name}
          </h3>

          <div className="mt-2 flex items-center gap-1 text-xs text-cream-200/60">
            <FiStar className="text-gold-500" size={12} />
            {product.averageRating.toFixed(1)} ({product.reviewCount})
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-lg font-semibold text-gold-400">
              ₹{(product.discountPrice ?? product.price).toFixed(0)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-cream-200/40 line-through">₹{product.price.toFixed(0)}</span>
            )}
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <Button
          size="sm"
          className="w-full"
          disabled={!product.isAvailable}
          onClick={() => {
            dispatch(addToCart({ product }));
            toast.success(`${product.name} added to cart`);
          }}
        >
          <FiShoppingBag size={14} />
          {product.isAvailable ? 'Add to Cart' : 'Sold Out'}
        </Button>
      </div>
    </motion.div>
  );
}
