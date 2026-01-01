import { useState } from 'react';
import { Loader2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface InlineEditableSelectProps {
  value: string;
  options: Option[];
  onSave: (newValue: string) => Promise<void>;
  className?: string;
  emptyText?: string;
}

export function InlineEditableSelect({
  value,
  options,
  onSave,
  className,
  emptyText = '未設定',
}: InlineEditableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentOption = options.find(opt => opt.value === value);
  const displayText = currentOption?.label || emptyText;

  const handleSelect = async (newValue: string) => {
    if (newValue === value) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      await onSave(newValue);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => !isLoading && setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        disabled={isLoading}
        className={cn(
          'group flex items-center justify-between gap-2 px-2 py-1 text-sm rounded',
          'hover:bg-neutral-800 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-amber-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
      >
        <span className={cn(
          'flex-1 text-left',
          !currentOption && 'text-neutral-500 italic'
        )}>
          {displayText}
        </span>
        {isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
        ) : (
          <ChevronDown className={cn(
            'w-3 h-3 text-neutral-500 transition-transform',
            isOpen && 'rotate-180'
          )} />
        )}
      </button>

      {isOpen && !isLoading && (
        <div className="absolute z-50 mt-1 w-full bg-neutral-900 border border-neutral-700 rounded shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={cn(
                'w-full px-3 py-2 text-sm text-left hover:bg-neutral-800 transition-colors',
                option.value === value && 'bg-neutral-800 text-amber-500'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
