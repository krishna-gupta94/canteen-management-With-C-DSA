import React from 'react';
import { cn } from './Button';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    const generatedId = React.useId(); const inputId = props.id || generatedId; return (
      <div className="w-full">
        {label && <label htmlFor={inputId} className="block text-sm font-medium text-text-primary mb-1">{label}</label>}
        <input id={inputId}
          className={cn(
            "flex h-11 w-full rounded-ui border border-text-disabled/50 bg-transparent px-3 py-2 text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-error focus:ring-error",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-error">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
