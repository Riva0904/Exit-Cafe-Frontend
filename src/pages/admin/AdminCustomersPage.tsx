import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiChevronLeft, FiChevronRight, FiEye, FiSearch } from 'react-icons/fi';
import { customersApi } from '@/api/customers';
import { ordersApi } from '@/api/orders';
import { PageSpinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { OrderStatus, OrderStatusLabels, type OrderStatusValue } from '@/types/order';

const PAGE_SIZE = 20;

export function AdminCustomersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: customers, isLoading } = useQuery({
    queryKey: ['admin', 'customers', search, page],
    queryFn: () => customersApi.getAll({ pageNumber: page, pageSize: PAGE_SIZE, searchTerm: search || undefined }),
  });

  const totalPages = customers ? Math.max(1, Math.ceil(customers.totalCount / PAGE_SIZE)) : 1;

  const { data: customer, isLoading: isLoadingCustomer } = useQuery({
    queryKey: ['admin', 'customers', selectedId],
    queryFn: () => customersApi.getById(selectedId!),
    enabled: Boolean(selectedId),
  });

  const { data: customerOrders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['admin', 'customers', selectedId, 'orders'],
    queryFn: () => ordersApi.getByCustomer(selectedId!),
    enabled: Boolean(selectedId),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-cream-100">Customers</h1>

      <div className="relative mt-4 max-w-sm">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-cream-200/40" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
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
                <th className="p-4 font-medium">Actions</th>
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
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedId(c.id)}
                      className="text-gold-400 hover:text-gold-300"
                      title="View details"
                    >
                      <FiEye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
              {customers?.items.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-cream-200/40">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {customers && customers.totalCount > 0 && (
        <div className="mt-4 flex items-center justify-between text-xs text-cream-200/50">
          <span>
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, customers.totalCount)} of{' '}
            {customers.totalCount} customers
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

      <Modal
        open={Boolean(selectedId)}
        onClose={() => setSelectedId(null)}
        title={customer ? `${customer.firstName} ${customer.lastName}` : 'Customer Details'}
      >
        {isLoadingCustomer || !customer ? (
          <PageSpinner />
        ) : (
          <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-cream-200/50">Email</p>
                <p className="text-cream-100">{customer.email}</p>
              </div>
              <div>
                <p className="text-xs text-cream-200/50">Phone</p>
                <p className="text-cream-100">{customer.phone ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-cream-200/50">Total Orders</p>
                <p className="text-cream-100">{customer.totalOrders}</p>
              </div>
              <div>
                <p className="text-xs text-cream-200/50">Total Spent</p>
                <p className="text-cream-100">₹{customer.totalSpent.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-xs text-cream-200/50">Type</p>
                <Badge tone={customer.isGuest ? 'neutral' : 'success'}>{customer.isGuest ? 'Guest' : 'Registered'}</Badge>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-cream-100">Addresses</h3>
              {customer.addresses.length === 0 ? (
                <p className="text-sm text-cream-200/40">No addresses on file.</p>
              ) : (
                <ul className="space-y-2">
                  {customer.addresses.map((a) => (
                    <li key={a.id} className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-cream-100">{a.label}</span>
                        {a.isDefault && <Badge tone="gold">Default</Badge>}
                      </div>
                      <p className="mt-1 text-cream-200/70">
                        {a.addressLine1}
                        {a.addressLine2 ? `, ${a.addressLine2}` : ''}, {a.city}, {a.state} {a.postalCode}, {a.country}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-cream-100">Order History</h3>
              {isLoadingOrders ? (
                <PageSpinner />
              ) : customerOrders?.length === 0 ? (
                <p className="text-sm text-cream-200/40">No orders yet.</p>
              ) : (
                <ul className="space-y-2">
                  {customerOrders?.map((o) => (
                    <li
                      key={o.id}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 text-sm"
                    >
                      <div>
                        <p className="font-medium text-cream-100">{o.orderNumber}</p>
                        <p className="text-xs text-cream-200/50">{new Date(o.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge tone={o.status === OrderStatus.Cancelled ? 'danger' : 'gold'}>
                          {OrderStatusLabels[o.status as OrderStatusValue]}
                        </Badge>
                        <span className="text-cream-100">₹{o.totalAmount.toFixed(0)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
