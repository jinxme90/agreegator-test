const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'ux-design': ['ux', 'user experience', 'usability', 'user research', 'wireframe', 'prototype', 'persona', 'user testing', 'accessibility', 'a11y', 'heuristic'],
  'ui-design': ['ui', 'user interface', 'visual design', 'typography', 'color', 'layout', 'figma', 'sketch', 'animation', 'micro-interaction', 'component'],
  'product-design': ['product design', 'product manager', 'roadmap', 'sprint', 'agile', 'feature', 'mvp', 'iteration', 'product thinking'],
  'design-systems': ['design system', 'component library', 'pattern library', 'storybook', 'tokens', 'atomic design', 'style guide'],
  'ai': ['artificial intelligence', 'machine learning', 'ai', 'gpt', 'llm', 'neural network', 'deep learning', 'chatgpt', 'generative', 'claude', 'openai', 'midjourney'],
  'technology': ['software', 'developer', 'programming', 'javascript', 'react', 'code', 'framework', 'web development', 'api', 'open source'],
  'gadgets': ['gadget', 'device', 'hardware', 'smartphone', 'iphone', 'android', 'laptop', 'tablet', 'wearable', 'headphones', 'camera', 'robot'],
  'startups': ['startup', 'funding', 'venture', 'seed', 'series a', 'unicorn', 'founder', 'entrepreneur', 'ipo'],
  'innovation': ['innovation', 'future', 'emerging', 'breakthrough', 'disruption', 'trend', 'next-gen', 'cutting-edge'],
  'research': ['research', 'study', 'survey', 'report', 'analysis', 'statistics', 'data', 'findings', 'insights']
}

export function categorizeArticle(title: string, summary: string, sourceCategory: string): string {
  const text = `${title} ${summary}`.toLowerCase()

  let bestMatch = sourceCategory
  let bestScore = 0

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter(kw => text.includes(kw)).length
    if (score > bestScore) {
      bestScore = score
      bestMatch = category
    }
  }

  return bestMatch
}

export const CATEGORY_CONFIG: Record<string, { name: string; color: string; bgColor: string; textColor: string }> = {
  'ux-design': { name: 'UX Design', color: '#6366f1', bgColor: 'bg-indigo-100 dark:bg-indigo-900/30', textColor: 'text-indigo-700 dark:text-indigo-300' },
  'ui-design': { name: 'UI Design', color: '#8b5cf6', bgColor: 'bg-violet-100 dark:bg-violet-900/30', textColor: 'text-violet-700 dark:text-violet-300' },
  'product-design': { name: 'Product Design', color: '#ec4899', bgColor: 'bg-pink-100 dark:bg-pink-900/30', textColor: 'text-pink-700 dark:text-pink-300' },
  'design-systems': { name: 'Design Systems', color: '#14b8a6', bgColor: 'bg-teal-100 dark:bg-teal-900/30', textColor: 'text-teal-700 dark:text-teal-300' },
  'ai': { name: 'AI', color: '#f59e0b', bgColor: 'bg-amber-100 dark:bg-amber-900/30', textColor: 'text-amber-700 dark:text-amber-300' },
  'technology': { name: 'Technology', color: '#3b82f6', bgColor: 'bg-blue-100 dark:bg-blue-900/30', textColor: 'text-blue-700 dark:text-blue-300' },
  'gadgets': { name: 'Gadgets', color: '#ef4444', bgColor: 'bg-red-100 dark:bg-red-900/30', textColor: 'text-red-700 dark:text-red-300' },
  'startups': { name: 'Startups', color: '#22c55e', bgColor: 'bg-green-100 dark:bg-green-900/30', textColor: 'text-green-700 dark:text-green-300' },
  'innovation': { name: 'Innovation', color: '#f97316', bgColor: 'bg-orange-100 dark:bg-orange-900/30', textColor: 'text-orange-700 dark:text-orange-300' },
  'research': { name: 'Research', color: '#64748b', bgColor: 'bg-slate-100 dark:bg-slate-900/30', textColor: 'text-slate-700 dark:text-slate-300' },
}
