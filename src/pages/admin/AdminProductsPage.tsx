import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { FiAward, FiChevronLeft, FiChevronRight, FiEdit2, FiPlus, FiSearch, FiStar, FiTrash2, FiTrendingUp } from 'react-icons/fi';
import { categoriesApi, productsApi } from '@/api/catalog';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { ImagePicker } from '@/components/admin/ImagePicker';
import type { Product } from '@/types/catalog';
import { getErrorMessage } from '@/utils/errors';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  categoryId: z.string().min(1, 'Category is required'),
  price: z.coerce.number().positive('Must be greater than 0'),
  discountPrice: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    z.coerce.number().positive('Must be greater than 0 if set').optional(),
  ),
  stockQuantity: z.coerce.number().min(0),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  isAvailable: z.boolean(),
  isFeatured: z.boolean(),
  isBestSeller: z.boolean(),
  isNewArrival: z.boolean(),
  isTodaysSpecial: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

function generateSku(categoryName: string): string {
  const prefix = categoryName.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'PROD';
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${suffix}`;
}

export function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const pageSize = 20;

  const { data: categories } = useQuery({ queryKey: ['admin', 'categories'], queryFn: () => categoriesApi.getAll(true) });
  const { data: products, isLoading } = useQuery({
    queryKey: ['admin', 'products', page, search],
    queryFn: () => productsApi.getAll({ pageNumber: page, pageSize, sortBy: 'name', searchTerm: search || undefined }),
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      name: '', sku: '', categoryId: '', price: 0, stockQuantity: 0,
      isAvailable: true, isFeatured: false, isBestSeller: false, isNewArrival: false, isTodaysSpecial: false,
    },
  });

  const skuTouchedRef = useRef(false);
  const categoryId = watch('categoryId');

  useEffect(() => {
    if (editing || skuTouchedRef.current || !categoryId) return;
    const category = categories?.find((c) => c.id === categoryId);
    if (category) setValue('sku', generateSku(category.name));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, editing]);

  function openCreate() {
    setEditing(null);
    setImageUrls([]);
    skuTouchedRef.current = false;
    const firstCategory = categories?.[0];
    reset({
      name: '', sku: firstCategory ? generateSku(firstCategory.name) : '', categoryId: firstCategory?.id ?? '', price: 0, stockQuantity: 0,
      isAvailable: true, isFeatured: false, isBestSeller: false, isNewArrival: false, isTodaysSpecial: false,
    });
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    skuTouchedRef.current = true;
    setImageUrls(product.images.map((img) => img.imageUrl));
    reset({
      name: product.name,
      sku: product.sku,
      categoryId: product.categoryId,
      price: product.price,
      discountPrice: product.discountPrice,
      stockQuantity: product.stockQuantity,
      shortDescription: product.shortDescription ?? '',
      description: product.description ?? '',
      isAvailable: product.isAvailable,
      isFeatured: product.isFeatured,
      isBestSeller: product.isBestSeller,
      isNewArrival: product.isNewArrival,
      isTodaysSpecial: product.isTodaysSpecial,
    });
    setModalOpen(true);
  }

  const save = useMutation({
    mutationFn: async (values: FormValues) => {
      if (editing) {
        const result = await productsApi.update(editing.id, values);
        if (imageUrls.length > 0) await productsApi.updateImages(editing.id, imageUrls);
        return result;
      }
      return productsApi.create({ ...values, ingredients: undefined, nutritionInfo: undefined, imageUrls });
    },
    onSuccess: () => {
      toast.success(editing ? 'Product updated' : 'Product created');
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      setModalOpen(false);
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Something went wrong')),
  });

  const remove = useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => {
      toast.success('Product deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Could not delete product')),
  });

  const toggleFlag = useMutation({
    mutationFn: async ({ id, field }: { id: string; field: 'isBestSeller' | 'isTodaysSpecial' | 'isNewArrival' }) => {
      const full = await productsApi.getById(id);
      return productsApi.update(id, {
        name: full.name,
        shortDescription: full.shortDescription,
        description: full.description,
        price: full.price,
        discountPrice: full.discountPrice,
        ingredients: full.ingredients,
        nutritionInfo: full.nutritionInfo,
        isAvailable: full.isAvailable,
        isFeatured: full.isFeatured,
        isBestSeller: full.isBestSeller,
        isNewArrival: full.isNewArrival,
        isTodaysSpecial: full.isTodaysSpecial,
        stockQuantity: full.stockQuantity,
        categoryId: full.categoryId,
        [field]: !full[field],
      });
    },
    onSuccess: (_, { field }) => {
      const label = field === 'isBestSeller' ? 'Best Seller' : field === 'isTodaysSpecial' ? "Today's Special" : 'New Arrival';
      toast.success(`${label} status updated`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Could not update product')),
  });

  const totalPages = products ? Math.max(1, Math.ceil(products.totalCount / pageSize)) : 1;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-cream-100">Products</h1>
        <Button size="sm" onClick={openCreate}>
          <FiPlus /> New Product
        </Button>
      </div>

      <div className="relative mt-4 max-w-sm">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-cream-200/40" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search products..."
          className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-11 pr-4 text-sm text-cream-100 placeholder:text-cream-200/40 focus:border-gold-500/60 focus:outline-none"
        />
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : (
      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-ink-900/40">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-cream-200/50">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Stock</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Most Selling</th>
              <th className="p-4 font-medium">Today's Special</th>
              <th className="p-4 font-medium">New Arrival</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products?.items.map((product) => (
              <tr key={product.id} className="border-b border-white/5 text-cream-200/80">
                <td className="p-4">{product.name}</td>
                <td className="p-4">{product.categoryName}</td>
                <td className="p-4">₹{(product.discountPrice ?? product.price).toFixed(0)}</td>
                <td className="p-4">
                  <span className={product.stockQuantity <= 10 ? 'font-medium text-amber-400' : ''}>
                    {product.stockQuantity}
                  </span>
                </td>
                <td className="p-4">{product.isAvailable ? 'Available' : 'Unavailable'}</td>
                <td className="p-4">
                  <button
                    onClick={() => toggleFlag.mutate({ id: product.id, field: 'isBestSeller' })}
                    disabled={toggleFlag.isPending}
                    aria-label="Toggle Most Selling"
                    title="Toggle Most Selling"
                    className={product.isBestSeller ? 'text-gold-400' : 'text-cream-200/30 hover:text-gold-400'}
                  >
                    <FiStar size={16} fill={product.isBestSeller ? 'currentColor' : 'none'} />
                  </button>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => toggleFlag.mutate({ id: product.id, field: 'isTodaysSpecial' })}
                    disabled={toggleFlag.isPending}
                    aria-label="Toggle Today's Special"
                    title="Toggle Today's Special"
                    className={product.isTodaysSpecial ? 'text-gold-400' : 'text-cream-200/30 hover:text-gold-400'}
                  >
                    <FiAward size={16} fill={product.isTodaysSpecial ? 'currentColor' : 'none'} />
                  </button>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => toggleFlag.mutate({ id: product.id, field: 'isNewArrival' })}
                    disabled={toggleFlag.isPending}
                    aria-label="Toggle New Arrival"
                    title="Toggle New Arrival"
                    className={product.isNewArrival ? 'text-gold-400' : 'text-cream-200/30 hover:text-gold-400'}
                  >
                    <FiTrendingUp size={16} />
                  </button>
                </td>
                <td className="p-4">
                  <div className="flex gap-3">
                    <button
                      onClick={async () => openEdit(await productsApi.getById(product.id))}
                      className="text-gold-400 hover:text-gold-300"
                    >
                      <FiEdit2 size={15} />
                    </button>
                    <button
                      onClick={() => remove.mutate(product.id)}
                      className="text-cream-200/50 hover:text-red-400"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products?.items.length === 0 && (
              <tr>
                <td colSpan={9} className="py-8 text-center text-cream-200/40">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {products && products.totalCount > 0 && (
        <div className="mt-4 flex items-center justify-between text-xs text-cream-200/50">
          <span>
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, products.totalCount)} of{' '}
            {products.totalCount} products
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-cream-200/70 transition-colors hover:border-gold-500/40 hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <FiChevronLeft size={14} />
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              aria-label="Next page"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-cream-200/70 transition-colors hover:border-gold-500/40 hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <FiChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'New Product'}>
        <form onSubmit={handleSubmit((v) => save.mutate(v))} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name" {...register('name')} error={errors.name?.message} />
            <Input
              label="SKU"
              {...register('sku', { onChange: () => { skuTouchedRef.current = true; } })}
              error={errors.sku?.message}
              disabled={Boolean(editing)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-cream-200/80">Category</label>
            <select
              {...register('categoryId')}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-cream-100 focus:border-gold-500/60 focus:outline-none"
            >
              {categories?.map((c) => (
                <option key={c.id} value={c.id} className="bg-ink-900">
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="mt-1 text-xs text-red-400">{errors.categoryId.message}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input label="Price" type="number" step="0.01" {...register('price')} error={errors.price?.message} />
            <Input label="Discount Price" type="number" step="0.01" {...register('discountPrice')} />
            <Input label="Stock Qty" type="number" {...register('stockQuantity')} error={errors.stockQuantity?.message} />
          </div>

          <Input label="Short Description" {...register('shortDescription')} />
          <ImagePicker value={imageUrls} onChange={setImageUrls} subfolder="products" label="Product Images" />

          <div className="grid grid-cols-2 gap-2 text-sm text-cream-200/80">
            <label className="flex items-center gap-2"><input type="checkbox" {...register('isAvailable')} /> Available</label>
            <label className="flex items-center gap-2"><input type="checkbox" {...register('isFeatured')} /> Featured</label>
            <label className="flex items-center gap-2"><input type="checkbox" {...register('isBestSeller')} /> Best Seller</label>
            <label className="flex items-center gap-2"><input type="checkbox" {...register('isNewArrival')} /> New Arrival</label>
            <label className="flex items-center gap-2"><input type="checkbox" {...register('isTodaysSpecial')} /> Today's Special</label>
          </div>

          <Button type="submit" className="w-full" isLoading={save.isPending}>
            Save
          </Button>
        </form>
      </Modal>
    </div>
  );
}
