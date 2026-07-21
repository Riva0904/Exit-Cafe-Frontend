import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiMinus, FiPlus, FiShoppingBag, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { productsApi } from '@/api/catalog';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/features/products/ProductCard';
import { useAppDispatch } from '@/app/hooks';
import { addToCart } from '@/features/cart/cartSlice';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const dispatch = useAppDispatch();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.getBySlug(slug!),
    enabled: Boolean(slug),
  });

  if (isLoading) return <PageSpinner />;
  if (!product) return <p className="py-24 text-center text-cream-200/50">Product not found.</p>;

  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;
  const image = product.images[activeImage]?.imageUrl;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl bg-ink-800">
            {image ? (
              <img src={image} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-cream-200/20">No image</div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(idx)}
                  className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${
                    idx === activeImage ? 'border-gold-500' : 'border-transparent'
                  }`}
                >
                  <img src={img.imageUrl} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-gold-500/70">{product.categoryName}</p>
          <h1 className="font-display mt-2 text-3xl font-bold text-cream-100 sm:text-4xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-1.5 text-sm text-cream-200/60">
            <FiStar className="text-gold-500" />
            {product.averageRating.toFixed(1)} ({product.reviewCount} reviews)
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-gold-400">
              ₹{(product.discountPrice ?? product.price).toFixed(0)}
            </span>
            {hasDiscount && (
              <span className="text-lg text-cream-200/40 line-through">₹{product.price.toFixed(0)}</span>
            )}
          </div>

          {product.shortDescription && (
            <p className="mt-4 text-cream-200/70">{product.shortDescription}</p>
          )}

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-full border border-white/10 px-3 py-2">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                <FiMinus size={14} />
              </button>
              <span className="w-6 text-center">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} aria-label="Increase quantity">
                <FiPlus size={14} />
              </button>
            </div>

            <Button
              disabled={!product.isAvailable}
              onClick={() => {
                dispatch(
                  addToCart({
                    product: {
                      id: product.id,
                      name: product.name,
                      slug: product.slug,
                      price: product.price,
                      discountPrice: product.discountPrice,
                      primaryImageUrl: image,
                    },
                    quantity,
                  }),
                );
                toast.success(`${product.name} added to cart`);
              }}
            >
              <FiShoppingBag /> {product.isAvailable ? 'Add to Cart' : 'Sold Out'}
            </Button>
          </div>

          <div className="mt-10 space-y-6 border-t border-white/10 pt-8">
            {product.description && (
              <div>
                <h3 className="font-display text-lg font-semibold text-cream-100">Description</h3>
                <p className="mt-2 text-sm text-cream-200/70">{product.description}</p>
              </div>
            )}
            {product.ingredients && (
              <div>
                <h3 className="font-display text-lg font-semibold text-cream-100">Ingredients</h3>
                <p className="mt-2 text-sm text-cream-200/70">{product.ingredients}</p>
              </div>
            )}
            {product.nutritionInfo && (
              <div>
                <h3 className="font-display text-lg font-semibold text-cream-100">Nutrition Information</h3>
                <p className="mt-2 text-sm text-cream-200/70">{product.nutritionInfo}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {product.relatedProducts.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display mb-8 text-2xl font-bold text-cream-100">You May Also Like</h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {product.relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
