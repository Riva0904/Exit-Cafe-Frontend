import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import { categoriesApi } from '@/api/catalog';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { ImagePicker } from '@/components/admin/ImagePicker';
import type { Category } from '@/types/catalog';
import { getErrorMessage } from '@/utils/errors';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  displayOrder: z.coerce.number().min(0),
});
type FormValues = z.infer<typeof schema>;

export function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Category | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => categoriesApi.getAll(true),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { name: '', description: '', displayOrder: 0 },
  });

  function openCreate() {
    setEditing(null);
    setImageUrls([]);
    reset({ name: '', description: '', displayOrder: 0 });
    setModalOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setImageUrls(category.imageUrl ? [category.imageUrl] : []);
    reset({
      name: category.name,
      description: category.description ?? '',
      displayOrder: category.displayOrder,
    });
    setModalOpen(true);
  }

  const save = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = { ...values, imageUrl: imageUrls[0] };
      return editing
        ? categoriesApi.update(editing.id, { ...payload, isActive: editing.isActive })
        : categoriesApi.create(payload);
    },
    onSuccess: () => {
      toast.success(editing ? 'Category updated' : 'Category created');
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      setModalOpen(false);
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Something went wrong')),
  });

  const remove = useMutation({
    mutationFn: (id: string) => categoriesApi.remove(id),
    onSuccess: () => {
      toast.success('Category deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Could not delete category')),
  });

  if (isLoading) return <PageSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-cream-100">Categories</h1>
        <Button size="sm" onClick={openCreate}>
          <FiPlus /> New Category
        </Button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-ink-900/40">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-cream-200/50">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Products</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories?.map((cat) => (
              <tr key={cat.id} className="border-b border-white/5 text-cream-200/80">
                <td className="p-4">{cat.name}</td>
                <td className="p-4">{cat.productCount}</td>
                <td className="p-4">{cat.isActive ? 'Active' : 'Inactive'}</td>
                <td className="p-4">
                  <div className="flex gap-3">
                    <button onClick={() => openEdit(cat)} className="text-gold-400 hover:text-gold-300">
                      <FiEdit2 size={15} />
                    </button>
                    <button
                      onClick={() => remove.mutate(cat.id)}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'New Category'}>
        <form onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4">
          <Input label="Name" {...register('name')} error={errors.name?.message} />
          <Input label="Description" {...register('description')} />
          <ImagePicker
            value={imageUrls}
            onChange={setImageUrls}
            subfolder="categories"
            multiple={false}
            shape="circle"
            label="Category Image"
          />
          <Input label="Display Order" type="number" {...register('displayOrder')} error={errors.displayOrder?.message} />
          <Button type="submit" className="w-full" isLoading={save.isPending}>
            Save
          </Button>
        </form>
      </Modal>
    </div>
  );
}
