export function Spinner({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <div className={`animate-spin rounded-full border-2 border-gold-500/30 border-t-gold-500 ${className}`} />
  );
}

export function PageSpinner() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner />
    </div>
  );
}
