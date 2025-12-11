import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  isLive: boolean;
  size?: 'sm' | 'default';
  showLabel?: boolean;
  className?: string;
}

export function StatusBadge({
  isLive,
  size = 'default',
  showLabel = true,
  className
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        isLive
          ? 'bg-green-500/20 text-green-400'
          : 'bg-orange-500/20 text-orange-400',
        className
      )}
    >
      <span
        className={cn(
          'rounded-full',
          size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2',
          isLive ? 'bg-green-400' : 'bg-orange-400'
        )}
      />
      {showLabel && (isLive ? 'Live' : 'Draft')}
    </span>
  );
}
