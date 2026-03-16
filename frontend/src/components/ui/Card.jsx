export default function Card({ className = '', glass = false, hover = false, children, ...props }) {
  return (
    <div
      className={`
        rounded-2xl p-6 transition-all duration-300
        ${glass
          ? 'glass'
          : 'bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700'
        }
        ${hover ? 'hover:shadow-xl hover:shadow-brand-500/5 hover:-translate-y-0.5' : 'shadow-sm'}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
