'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { Zap, Search, Moon, Sun, Bookmark, Settings, Bell, X } from 'lucide-react'

export function Navigation() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => setMounted(true), [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white hidden sm:block">
              UX Radar
            </span>
          </Link>

          {/* Search — desktop */}
          {!searchOpen && (
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search articles…"
                  className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-transparent
                    focus:border-indigo-300 dark:focus:border-indigo-700 rounded-xl outline-none
                    text-gray-900 dark:text-gray-100 placeholder:text-gray-400 transition-colors"
                />
              </div>
            </form>
          )}

          {/* Mobile search expanded */}
          {searchOpen && (
            <form onSubmit={handleSearch} className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search articles…"
                  className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-xl outline-none
                    text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                />
              </div>
              <button type="button" onClick={() => setSearchOpen(false)} className="btn-ghost p-2">
                <X className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Actions */}
          {!searchOpen && (
            <div className="flex items-center gap-1">
              {/* Mobile search toggle */}
              <button
                onClick={() => setSearchOpen(true)}
                className="md:hidden btn-ghost p-2"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Dark mode toggle */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="btn-ghost p-2"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </button>
              )}

              {/* Saved */}
              <Link
                href="/saved"
                className={`btn-ghost p-2 ${pathname === '/saved' ? 'text-indigo-600 dark:text-indigo-400' : ''}`}
                aria-label="Saved articles"
              >
                <Bookmark className="w-4 h-4" />
              </Link>

              {/* Notifications */}
              <Link
                href="/settings"
                className={`hidden sm:flex btn-ghost p-2 ${pathname === '/settings' ? 'text-indigo-600 dark:text-indigo-400' : ''}`}
                aria-label="Settings"
              >
                <Bell className="w-4 h-4" />
              </Link>

              {/* Admin */}
              <Link
                href="/admin/sources"
                className="hidden sm:flex btn-ghost p-2"
                aria-label="Admin"
              >
                <Settings className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
