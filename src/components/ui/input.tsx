'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-lg border-[1.5px] border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-base transition-all duration-150 ease-out',
          'placeholder:text-[var(--muted-foreground)]',
          'hover:border-[var(--muted-foreground)]',
          'focus:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--muted)]',
          error && 'border-[var(--error)]',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
