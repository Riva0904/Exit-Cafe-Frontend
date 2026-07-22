import { useState, type ReactNode } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';

const PAGE_SIZE = 8;

export function PagedGrid<T>({
  items,
  renderItem,
  keyOf,
  gridClassName,
}: {
  items: T[];
  renderItem: (item: T) => ReactNode;
  keyOf: (item: T) => string;
  gridClassName?: string;
}) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(items.length / PAGE_SIZE);
  const visible = items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div>
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={clsx('flex flex-wrap justify-center gap-6', gridClassName)}
          >
            {visible.map((item) => (
              <div
                key={keyOf(item)}
                className="w-[calc(50%-0.75rem)] shrink-0 grow-0 sm:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1.125rem)]"
              >
                {renderItem(item)}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nothing to page through with 0-1 pages — arrows/dots would be dead controls. */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            aria-label="Previous"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-500/30 bg-ink-900/60 text-gold-400 transition-colors hover:bg-gold-500/15 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-ink-900/60"
          >
            <FiChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: Math.max(totalPages, 1) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                aria-label={`Page ${i + 1}`}
                className={clsx(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === page ? 'w-5 bg-gold-500' : 'w-1.5 bg-white/15 hover:bg-white/30',
                )}
              />
            ))}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            aria-label="Next"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-500/30 bg-ink-900/60 text-gold-400 transition-colors hover:bg-gold-500/15 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-ink-900/60"
          >
            <FiChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
