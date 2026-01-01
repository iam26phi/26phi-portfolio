import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineToggleProps {
  value: boolean;
  onSave: (newValue: boolean) => Promise<void>;
  onLabel?: string;
  offLabel?: string;
  className?: string;
}

export function InlineToggle({
  value,
  onSave,
  onLabel = '開啟',
  offLabel = '關閉',
  className,
}: InlineToggleProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      await onSave(!value);
    } catch (error) {
      console.error('Failed to toggle:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        'group flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-all',
        'focus:outline-none focus:ring-2 focus:ring-amber-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        value
          ? 'bg-green-600 hover:bg-green-700 text-white'
          : 'bg-neutral-700 hover:bg-neutral-600 text-neutral-300',
        className
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>處理中...</span>
        </>
      ) : (
        <span>{value ? onLabel : offLabel}</span>
      )}
    </button>
  );
}
