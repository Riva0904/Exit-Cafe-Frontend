import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import { categoriesApi, productsApi } from '@/api/catalog';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import type { Product } from '@/types/catalog';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  categoryId: z.string().min(1, 'Category is required'),
  price: z.coerce.number().positive('Must be greater than 0'),
  discountPrice: z.coerce.number().optional(),
  stockQuantity: z.coerce.number().min(0),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  imageUrls: z.string().optional(),
  isAvailable: z.boolean(),
  isFeatured: z.boolean(),
  isBestSeller: z.boolean(),
  isNewArrival: z.boolean(),
  isTodaysSpecial: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

export function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: categories } = useQuery({ queryKey: ['admin', 'categories'], queryFn: () => categoriesApi.getAll(true) });
  const { data: products, isLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => productsApi.getAll({ pageNumber: 1, pageSize: 50, sortBy: 'name' }),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      name: '', sku: '', categoryId: '', price: 0, stockQuantity: 0,
      isAvailable: true, isFeatured: false, isBestSeller: false, isNewArrival: false, isTodaysSpecial: false,
    },
  });

  function openCreate() {
    setEditing(null);
    reset({
      name: '', sku: '', categoryId: categories?.[0]?.id ?? '', price: 0, stockQuantity: 0,
      isAvailable: true, isFeatured: false, isBestSeller: false, isNewArrival: false, isTodaysSpecial: false,
    });
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
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
    mutationFn: (values: FormValues) => {
      const imageUrls = values.imageUrls?.split(',').map((s) => s.trim()).filter(Boolean) ?? [];
      const { imageUrls: _omit, ...rest } = values;
      return editing
        ? productsApi.update(editing.id, rest)
        : productsApi.create({ ...rest, ingredients: undefined, nutritionInfo: undefined, imageUrls });
    },
    onSuccess: () => {
      toast.success(editing ? 'Product updated' : 'Product created');
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      setModalOpen(false);
    },
    onError: () => toast.error('Something went wrong'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => {
      toast.success('Product deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });

  if (isLoading) return <PageSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-cream-100">Products</h1>
        <Button size="sm" onClick={openCreate}>
          <FiPlus /> New Product
        </Button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-ink-900/40">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-cream-200/50">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Stock</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products?.items.map((product) => (
              <tr key={product.id} className="border-b border-white/5 text-cream-200/80">
                <td className="p-4">{product.name}</td>
                <td className="p-4">{product.categoryName}</td>
                <td className="p-4">₹{(product.discountPrice ?? product.price).toFixed(0)}</td>
                <td className="p-4">-</td>
                <td className="p-4">{product.isAvailable ? 'Available' : 'Unavailable'}</td>
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
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'New Product'}>
        <form onSubmit={handleSubmit((v) => save.mutate(v))} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name" {...register('name')} error={errors.name?.message} />
            <Input label="SKU" {...register('sku')} error={errors.sku?.message} disabled={Boolean(editing)} />
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
          {!editing && <Input label="Image URLs (comma-separated)" {...register('imageUrls')} />}

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
