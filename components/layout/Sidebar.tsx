'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Users, Palette, Package, Layers, Cpu, Monitor, Smartphone,
  Rocket, Lightbulb, BookOpen, ChevronDown, ChevronUp, Globe
} from 'lucide-react'
import { useState } from 'react'
import type { Source } from '@/types'

const CATEGORIES = [
  { slug: 'ux-design', name: 'UX Design', icon: Users, color: 'text-indigo-600 dark:text-indigo-400' },
  { slug: 'ui-design', name: 'UI Design', icon: Palette, color: 'text-purple-600 dark:text-purple-400' },
  { slug: 'product-design', name: 'Product Design', icon: Package, color: 'text-pink-600 dark:text-pink-400' },
  { slug: 'design-systems', name: 'Design Systems', icon: Layers, color: 'text-teal-600 dark:text-teal-400' },
  { slug: 'ai', name: 'AI', icon: Cpu, color: 'text-amber-600 dark:text-amber-400' },
  { slug: 'technology', name: 'Technology', icon: Monitor, color: 'text-blue-600 dark:text-blue-400' },
  { slug: 'gadgets', name: 'Gadgets', icon: Smartphone, color: 'text-red-600 dark:text-red-400' },
  { slug: 'startups', name: 'Startups', icon: Rocket, color: 'text-green-600 dark:text-green-400' },
  { slug: 'innovation', name: 'Innovation', icon: Lightbulb, color: 'text-orange-600 dark:text-orange-400' },
  { slug: 'research', name: 'Research', icon: BookOpen, color: 'text-slate-600 dark:text-slate-400' },
]

interface SidebarProps {
  sources?: Source[]
}

export function Sidebar({ sources = [] }: SidebarProps) {
  const pathname = usePathname()
  const [sourcesExpanded, setSourcesExpanded] = useState(false)

  const activeCategory = pathname.startsWith('/category/') ? pathname.split('/category/')[1] : null
  const activeSource = pathname.startsWith('/source/') ? pathname.split('/source/')[1] : null

  const displayedSources = sourcesExpanded ? sources : sources.slice(0, 8)

  return (
    <aside className="hidden lg:flex flex-col gap-1 w-56 shrink-0">
      {/* Categories */}
      <div className="mb-2">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 mb-1">
          Categories
        </p>
        <nav className="flex flex-col gap-0.5">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon
            const isActive = activeCategory === cat.slug
            return (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : cat.color}`} />
                <span>{cat.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Sources */}
      {sources.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 mb-1 mt-2">
            Sources
          </p>
          <nav className="flex flex-col gap-0.5">
            {displayedSources.map(source => {
              const isActive = activeSource === source.id
              return (
                <Link
                  key={source.id}
                  href={`/source/${source.id}`}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <Globe className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                  <span className="truncate text-xs">{source.name}</span>
                </Link>
              )
            })}
            {sources.length > 8 && (
              <button
                onClick={() => setSourcesExpanded(!sourcesExpanded)}
                className="sidebar-link text-gray-400 dark:text-gray-500"
              >
                {sourcesExpanded ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" />
                    <span className="text-xs">Show less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" />
                    <span className="text-xs">+{sources.length - 8} more</span>
                  </>
                )}
              </button>
            )}
          </nav>
        </div>
      )}
    </aside>
  )
}
