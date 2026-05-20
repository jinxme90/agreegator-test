const CATEGORY_STYLES: Record<string, string> = {
  'ux-design': 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300',
  'ui-design': 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300',
  'product-design': 'bg-pink-50 dark:bg-pink-950 text-pink-700 dark:text-pink-300',
  'design-systems': 'bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300',
  'ai': 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
  'technology': 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
  'gadgets': 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300',
  'startups': 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300',
  'innovation': 'bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300',
  'research': 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
}

const CATEGORY_LABELS: Record<string, string> = {
  'ux-design': 'UX Design',
  'ui-design': 'UI Design',
  'product-design': 'Product Design',
  'design-systems': 'Design Systems',
  'ai': 'AI',
  'technology': 'Technology',
  'gadgets': 'Gadgets',
  'startups': 'Startups',
  'innovation': 'Innovation',
  'research': 'Research',
}

interface CategoryBadgeProps {
  category: string
  className?: string
}

export function CategoryBadge({ category, className = '' }: CategoryBadgeProps) {
  const style = CATEGORY_STYLES[category] ?? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
  const label = CATEGORY_LABELS[category] ?? category

  return (
    <span className={`category-badge ${style} ${className}`}>
      {label}
    </span>
  )
}
