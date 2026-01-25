'use client';

import { Category } from '@/lib/data';

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

export default function CategoryFilter({
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-6 px-2 pb-4 md:justify-center md:flex-wrap md:gap-x-8 md:gap-y-4">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => onCategoryChange(category.value)}
            className={`
              relative whitespace-nowrap py-2 px-1
              text-xs sm:text-sm tracking-[0.2em] uppercase
              transition-colors duration-500
              ${
                activeCategory === category.value
                  ? 'text-white'
                  : 'text-neutral-500 hover:text-neutral-300'
              }
            `}
          >
            {category.label}

            <span
              className={`
                absolute left-0 bottom-0 h-[1px] bg-white
                transition-all duration-500 ease-out
                ${
                  activeCategory === category.value
                    ? 'w-full opacity-100'
                    : 'w-0 opacity-0'
                }
              `}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
