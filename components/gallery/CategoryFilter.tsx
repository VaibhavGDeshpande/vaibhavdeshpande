'use client';

// 1. Import the specific Category type from your data file
import { Category } from '@/lib/data';

// 2. Define a union type that includes "All"
export type FilterCategory = Category | 'All';

interface CategoryFilterProps {
  activeCategory: FilterCategory;
  onCategoryChange: (category: FilterCategory) => void;
}

// 3. Update the list to match your exact folder names from data.ts
const categories: { value: FilterCategory; label: string }[] = [
  { value: 'All', label: 'All' },
  { value: 'animals', label: 'Animals' },
  { value: 'bike', label: 'Bike' },
  { value: 'Fort', label: 'Fort' },
  { value: 'Moon', label: 'Moon' },
  { value: 'Pune Grand Tour', label: 'Pune Grand Tour' },
  { value: 'Sky', label: 'Sky' },
  { value: 'Space', label: 'Space' },
  { value: 'Sun', label: 'Sun' },
];

export default function CategoryFilter({ activeCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-x-8 gap-y-4 justify-center mb-16">
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onCategoryChange(category.value)}
          className={`
            relative py-2 text-[10px] md:text-xs tracking-[0.2em] uppercase transition-colors duration-500
            ${
              activeCategory === category.value
                ? 'text-white'
                : 'text-neutral-500 hover:text-neutral-300'
            }
          `}
        >
          {category.label}
          
          {/* Animated underline for active state */}
          <span 
            className={`absolute left-0 bottom-0 h-1px bg-white transition-all duration-500 ease-out
              ${activeCategory === category.value ? 'w-full opacity-100' : 'w-0 opacity-0'}
            `} 
          />
        </button>
      ))}
    </div>
  );
}