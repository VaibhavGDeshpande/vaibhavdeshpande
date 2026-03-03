'use client';

import type { Category } from '@/lib/data';

export type FilterCategory = Category | 'All';

interface CategoryFilterProps {
  activeCategory: FilterCategory;
  onCategoryChange: (category: FilterCategory) => void;
}

const categories: { value: FilterCategory; label: string }[] = [
  { value: 'All', label: 'All' },
  { value: 'Animals', label: 'Animals' },
  { value: 'Bike', label: 'Bike' },
  { value: 'Nature', label: 'Nature' },
  { value: 'Moon', label: 'Moon' },
  { value: 'Pune Grand Tour', label: 'Pune Grand Tour' },
  { value: 'Sky', label: 'Sky' },
  { value: 'Space', label: 'Space' },
  { value: 'Sun', label: 'Sun' },
];

export default function CategoryFilter({ activeCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="w-full overflow-x-auto pb-1">
      <div className="flex w-max items-center gap-2 sm:mx-auto sm:w-full sm:flex-wrap sm:justify-center sm:gap-3">
        {categories.map((category) => {
          const active = activeCategory === category.value;

          return (
            <button
              key={category.value}
              onClick={() => onCategoryChange(category.value)}
              className={`rounded-full px-4 py-2 text-[10px] uppercase tracking-[0.24em] transition sm:text-xs ${
                active
                  ? 'bg-white/15 text-stone-100 ring-1 ring-white/30'
                  : 'bg-white/5 text-stone-400 ring-1 ring-white/10 hover:bg-white/10 hover:text-stone-100'
              }`}
            >
              {category.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
