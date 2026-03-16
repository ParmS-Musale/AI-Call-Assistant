import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, icon: Icon, className = '', ...props }, ref) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
            <Icon size={18} />
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full rounded-xl border bg-white dark:bg-surface-800
            px-4 py-2.5 text-sm text-surface-900 dark:text-surface-100
            placeholder-surface-400 dark:placeholder-surface-500
            transition-all duration-200
            focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500
            ${Icon ? 'pl-10' : ''}
            ${error
              ? 'border-red-400 dark:border-red-500'
              : 'border-surface-300 dark:border-surface-600 hover:border-surface-400 dark:hover:border-surface-500'
            }
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
