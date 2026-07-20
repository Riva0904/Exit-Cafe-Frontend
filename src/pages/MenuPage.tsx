import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiSearch } from 'react-icons/fi';
import { productsApi, categoriesApi } from '@/api/catalog';
import { ProductCard } from '@/features/products/ProductCard';
import { PageSpinner } from '@/components/ui/Spinner';
import clsx from 'clsx';

const sortOptions = [
  { value: '', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Top Rated' },
];

export function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const categoryId = searchParams.get('category') ?? undefined;
  const sort = searchParams.get('sort') ?? '';
  const page = Number(searchParams.get('page') ?? '1');

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => categoriesApi.getAll() });

  const [sortBy, sortDescending] = sort
    ? [sort.split('-')[0] as 'price' | 'rating', sort.endsWith('desc')]
    : [undefined, undefined];

  const { data, isLoading } = useQuery({
    queryKey: ['products', { categoryId, search: searchParams.get('search'), sort, page }],
    queryFn: () =>
      productsApi.getAll({
        categoryId,
        searchTerm: searchParams.get('search') ?? undefined,
        sortBy,
        sortDescending,
        pageNumber: page,
        pageSize: 12,
        isAvailable: true,
      }),
  });

  function updateParam(key: string, value: string | undefined) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="font-display text-4xl font-bold text-cream-100">Our Menu</h1>
        <p className="mt-2 text-cream-200/60">Cakes, pastries, bread, cookies, desserts &amp; beverages</p>
      </div>

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <form
          className="relative max-w-sm flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            updateParam('search', search || undefined);
          }}
        >
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-cream-200/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search the menu..."
            className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-11 pr-4 text-sm text-cream-100 placeholder:text-cream-200/40 focus:border-gold-500/60 focus:outline-none"
          />
        </form>

        <select
          value={sort}
          onChange={(e) => updateParam('sort', e.target.value || undefined)}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-cream-100 focus:border-gold-500/60 focus:outline-none"
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value} className="bg-ink-900">
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-10 flex flex-wrap gap-2">
        <button
          onClick={() => updateParam('category', undefined)}
          className={clsx(
            'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
            !categoryId
              ? 'border-gold-500 bg-gold-500/15 text-gold-400'
              : 'border-white/10 text-cream-200/70 hover:border-gold-500/40',
          )}
        >
          All
        </button>
        {categories?.map((cat) => (
          <button
            key={cat.id}
            onClick={() => updateParam('category', cat.id)}
            className={clsx(
              'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
              categoryId === cat.id
                ? 'border-gold-500 bg-gold-500/15 text-gold-400'
                : 'border-white/10 text-cream-200/70 hover:border-gold-500/40',
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : !data || data.items.length === 0 ? (
        <p className="py-20 text-center text-cream-200/50">No products found.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {data.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="mt-10 flex justify-center gap-2">
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => updateParam('page', String(p))}
                  className={clsx(
                    'h-9 w-9 rounded-full text-sm font-medium transition-colors',
                    p === page ? 'bg-gold-500 text-ink-950' : 'text-cream-200/70 hover:bg-white/5',
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
