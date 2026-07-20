import { type InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-cream-200/80">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-cream-100 placeholder:text-cream-200/30',
            'focus:border-gold-500/60 focus:outline-none focus:ring-1 focus:ring-gold-500/40',
            error && 'border-red-500/60 focus:border-red-500 focus:ring-red-500/40',
            className,
          )}
          {...props}
        />
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    );
  },
);
Input.displayName = 'Input';
