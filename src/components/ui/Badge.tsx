import clsx from 'clsx';

const tones = {
  gold: 'bg-gold-500/15 text-gold-400 border-gold-500/30',
  neutral: 'bg-white/5 text-cream-200 border-white/10',
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  danger: 'bg-red-500/15 text-red-400 border-red-500/30',
} as const;

export function Badge({
  children,
  tone = 'gold',
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
