import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiSearch } from 'react-icons/fi';
import { customersApi } from '@/api/customers';
import { PageSpinner } from '@/components/ui/Spinner';

export function AdminCustomersPage() {
  const [search, setSearch] = useState('');

  const { data: customers, isLoading } = useQuery({
    queryKey: ['admin', 'customers', search],
    queryFn: () => customersApi.getAll({ pageNumber: 1, pageSize: 50, searchTerm: search || undefined }),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-cream-100">Customers</h1>

      <div className="relative mt-4 max-w-sm">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-cream-200/40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
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
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Orders</th>
                <th className="p-4 font-medium">Total Spent</th>
                <th className="p-4 font-medium">Type</th>
              </tr>
            </thead>
            <tbody>
              {customers?.items.map((c) => (
                <tr key={c.id} className="border-b border-white/5 text-cream-200/80">
                  <td className="p-4">{c.firstName} {c.lastName}</td>
                  <td className="p-4">{c.email}</td>
                  <td className="p-4">{c.totalOrders}</td>
                  <td className="p-4">₹{c.totalSpent.toFixed(0)}</td>
                  <td className="p-4">{c.isGuest ? 'Guest' : 'Registered'}</td>
                </tr>
              ))}
              {customers?.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-cream-200/40">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
