import { useRef, useState, useEffect, type ReactNode } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export function Carousel({ children }: { children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function updateArrows() {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, []);

  function scrollByCard(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-carousel-item]');
    const distance = (card?.offsetWidth ?? 260) + 24;
    el.scrollBy({ left: direction * distance * 2, behavior: 'smooth' });
  }

  return (
    <div className="group/carousel relative">
      <div
        ref={trackRef}
        className="carousel-fade scrollbar-none flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2"
      >
        {children}
      </div>

      {canScrollLeft && (
        <button
          onClick={() => scrollByCard(-1)}
          aria-label="Scroll left"
          className="absolute -left-4 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-gold-500/30 bg-ink-950/90 p-2.5 text-gold-400 opacity-0 shadow-lg backdrop-blur transition-opacity duration-200 group-hover/carousel:opacity-100 hover:bg-gold-500/15 sm:flex"
        >
          <FiChevronLeft size={18} />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scrollByCard(1)}
          aria-label="Scroll right"
          className="absolute -right-4 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-gold-500/30 bg-ink-950/90 p-2.5 text-gold-400 opacity-0 shadow-lg backdrop-blur transition-opacity duration-200 group-hover/carousel:opacity-100 hover:bg-gold-500/15 sm:flex"
        >
          <FiChevronRight size={18} />
        </button>
      )}
    </div>
  );
}

export function CarouselItem({ children }: { children: ReactNode }) {
  return (
    <div
      data-carousel-item
      className="w-[220px] shrink-0 snap-start sm:w-[250px] lg:w-[270px]"
    >
      {children}
    </div>
  );
}
