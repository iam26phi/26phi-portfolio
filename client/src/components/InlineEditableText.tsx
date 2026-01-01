import { useState, useRef, useEffect } from 'react';
import { Loader2, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineEditableTextProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  placeholder?: string;
  className?: string;
  emptyText?: string;
}

export function InlineEditableText({
  value,
  onSave,
  placeholder = '點擊編輯',
  className,
  emptyText = '未設定',
}: InlineEditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    if (!isLoading) {
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save:', error);
      setEditValue(value); // Revert on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          placeholder={placeholder}
          disabled={isLoading}
          className={cn(
            'flex-1 px-2 py-1 text-sm border border-amber-500 rounded bg-black text-white',
            'focus:outline-none focus:ring-2 focus:ring-amber-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
          )}
        />
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-amber-500" />}
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'group flex items-center gap-2 px-2 py-1 text-sm text-left rounded',
        'hover:bg-neutral-800 transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-amber-500',
        className
      )}
      disabled={isLoading}
    >
      <span className={cn(
        'flex-1',
        !value && 'text-neutral-500 italic'
      )}>
        {value || emptyText}
      </span>
      <Pencil className="w-3 h-3 text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
