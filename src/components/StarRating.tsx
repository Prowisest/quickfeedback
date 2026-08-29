'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange?: (val: number) => void;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
}

const RATING_LABELS: Record<number, { title: string; emoji: string; color: string }> = {
  1: { title: 'Terrible', emoji: '😞', color: 'text-red-500' },
  2: { title: 'Needs Improvement', emoji: '😐', color: 'text-orange-500' },
  3: { title: 'Average', emoji: '🙂', color: 'text-yellow-500' },
  4: { title: 'Very Good', emoji: '😃', color: 'text-lime-500' },
  5: { title: 'Excellent!', emoji: '🤩', color: 'text-emerald-500' },
};

export default function StarRating({
  value,
  onChange,
  interactive = false,
  size = 'md',
  showLabel = false,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const activeValue = hoverValue !== null ? hoverValue : value;

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-8 w-8',
    xl: 'h-11 w-11 sm:h-12 sm:w-12',
  };

  const gapClasses = {
    sm: 'gap-1',
    md: 'gap-1.5',
    lg: 'gap-2',
    xl: 'gap-3 sm:gap-4',
  };

  return (
    <div className="flex flex-col items-center">
      <div className={cn('flex items-center', gapClasses[size])}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= activeValue;

          return (
            <button
              key={star}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange?.(star)}
              onMouseEnter={() => interactive && setHoverValue(star)}
              onMouseLeave={() => interactive && setHoverValue(null)}
              className={cn(
                'group relative transition-all duration-150',
                interactive
                  ? 'cursor-pointer hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-md p-0.5'
                  : 'cursor-default pointer-events-none'
              )}
              aria-label={`${star} Star${star > 1 ? 's' : ''}`}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  'transition-colors duration-150',
                  isFilled
                    ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                    : 'fill-neutral-200 text-neutral-300 dark:fill-neutral-800 dark:text-neutral-700'
                )}
              />
            </button>
          );
        })}
      </div>

      {showLabel && activeValue > 0 && (
        <div className="mt-2.5 flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150">
          <span className="text-xl">{RATING_LABELS[activeValue]?.emoji}</span>
          <span className={cn('text-sm font-semibold tracking-tight', RATING_LABELS[activeValue]?.color)}>
            {RATING_LABELS[activeValue]?.title}
          </span>
        </div>
      )}
    </div>
  );
}
