'use client'

import { useEffect, useState, useCallback } from 'react'
import { format } from 'date-fns'
import {
  Plus, RefreshCw, Trash2, Edit2, Check, X, Globe,
  CheckCircle, AlertCircle, Clock, ToggleLeft, ToggleRight
} from 'lucide-react'
import { CategoryBadge } from '@/components/ui/CategoryBadge'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import type { Source } from '@/types'

const CATEGORIES = ['ux-design', 'ui-design', 'product-design', 'design-systems', 'ai', 'technology', 'gadgets', 'startups', 'innovation', 'research']

const EMPTY_FORM = { name: '', url: '', rss_url: '', category: 'technology', description: '' }

export default function AdminSourcesPage() {
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshingAll, setRefreshingAll] = useState(false)
  const [refreshingId, setRefreshingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState(EMPTY_FORM)

  const fetchSources = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/sources')
      if (!res.ok) throw new Error('Failed to load sources')
      const data = await res.json()
      setSources(data.sources || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sources')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSources() }, [fetchSources])

  async function handleRefreshAll() {
    setRefreshingAll(true)
    try {
      await fetch('/api/cron', { method: 'POST' })
      await fetchSources()
    } finally {
      setRefreshingAll(false)
    }
  }

  async function handleRefreshOne(id: string) {
    setRefreshingId(id)
    try {
      await fetch(`/api/sources/${id}/refresh`, { method: 'POST' })
      await fetchSources()
    } finally {
      setRefreshingId(null)
    }
  }

  async function handleToggle(source: Source) {
    try {
      await fetch(`/api/sources/${source.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !source.is_active }),
      })
      setSources(prev => prev.map(s => s.id === source.id ? { ...s, is_active: !s.is_active } : s))
    } catch {
      // ignore
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this source? All its articles will also be removed.')) return
    try {
      await fetch(`/api/sources/${id}`, { method: 'DELETE' })
      setSources(prev => prev.filter(s => s.id !== id))
    } catch {
      // ignore
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to add source')
      setForm(EMPTY_FORM)
      setShowAddForm(false)
      await fetchSources()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingId) return
    setSubmitting(true)
    try {
      await fetch(`/api/sources/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      setEditingId(null)
      await fetchSources()
    } finally {
      setSubmitting(false)
    }
  }

  function startEdit(source: Source) {
    setEditingId(source.id)
    setEditForm({ name: source.name, url: source.url, rss_url: source.rss_url, category: source.category, description: source.description || '' })
  }

  const activeSources = sources.filter(s => s.is_active)
  const lastUpdated = sources.reduce((latest, s) => {
    if (!s.last_fetched_at) return latest
    return !latest || s.last_fetched_at > latest ? s.last_fetched_at : latest
  }, '' as string)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Source Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage RSS feeds · {activeSources.length}/{sources.length} active
            {lastUpdated && ` · Last updated ${format(new Date(lastUpdated), 'MMM d, h:mma')}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-ghost flex items-center gap-2 text-sm border border-gray-200 dark:border-gray-700"
          >
            <Plus className="w-4 h-4" />
            Add source
          </button>
          <button
            onClick={handleRefreshAll}
            disabled={refreshingAll}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${refreshingAll ? 'animate-spin' : ''}`} />
            {refreshingAll ? 'Refreshing…' : 'Refresh all'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total sources', value: sources.length },
          { label: 'Active', value: activeSources.length },
          { label: 'Success', value: sources.filter(s => s.fetch_status === 'success').length },
          { label: 'Errors', value: sources.filter(s => s.fetch_status === 'error').length },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-white dark:bg-gray-900 rounded-2xl border border-indigo-100 dark:border-indigo-900 p-5 mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Add new source</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Source name" value={form.name} onChange={v => setForm(p => ({...p, name: v}))} required placeholder="The Verge" />
            <FormField label="Website URL" value={form.url} onChange={v => setForm(p => ({...p, url: v}))} required placeholder="https://theverge.com" />
            <FormField label="RSS feed URL" value={form.rss_url} onChange={v => setForm(p => ({...p, rss_url: v}))} required placeholder="https://theverge.com/rss/index.xml" />
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(p => ({...p, category: e.target.value}))}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <FormField label="Description (optional)" value={form.description} onChange={v => setForm(p => ({...p, description: v}))} placeholder="Technology and culture" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" disabled={submitting} className="btn-primary text-sm">
              {submitting ? 'Adding…' : 'Add source'}
            </button>
            <button type="button" onClick={() => setShowAddForm(false)} className="btn-ghost text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Sources list */}
      {loading ? (
        <LoadingState count={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchSources} />
      ) : (
        <div className="flex flex-col gap-2">
          {sources.map(source => (
            <div key={source.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
              {editingId === source.id ? (
                <form onSubmit={handleEdit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <FormField label="Name" value={editForm.name} onChange={v => setEditForm(p => ({...p, name: v}))} required />
                    <FormField label="URL" value={editForm.url} onChange={v => setEditForm(p => ({...p, url: v}))} required />
                    <FormField label="RSS URL" value={editForm.rss_url} onChange={v => setEditForm(p => ({...p, rss_url: v}))} required />
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Category</label>
                      <select
                        value={editForm.category}
                        onChange={e => setEditForm(p => ({...p, category: e.target.value}))}
                        className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none"
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={submitting} className="btn-primary text-sm flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />{submitting ? 'Saving…' : 'Save'}
                    </button>
                    <button type="button" onClick={() => setEditingId(null)} className="btn-ghost text-sm flex items-center gap-1.5">
                      <X className="w-3.5 h-3.5" />Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center gap-3">
                  {/* Status dot */}
                  <div className="shrink-0">
                    {source.fetch_status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : source.fetch_status === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-medium text-sm ${source.is_active ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                        {source.name}
                      </span>
                      <CategoryBadge category={source.category} className="text-[10px] px-1.5 py-0" />
                      {!source.is_active && (
                        <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded-full uppercase tracking-wide">Disabled</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-xs text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                        <Globe className="w-3 h-3" />
                        {source.url.replace('https://', '')}
                      </a>
                      {source.last_fetched_at && (
                        <span className="text-xs text-gray-300 dark:text-gray-600">
                          · {format(new Date(source.last_fetched_at), 'MMM d, h:mma')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleRefreshOne(source.id)}
                      disabled={refreshingId === source.id}
                      className="btn-ghost p-1.5"
                      title="Refresh this source"
                    >
                      <RefreshCw className={`w-4 h-4 ${refreshingId === source.id ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={() => startEdit(source)} className="btn-ghost p-1.5" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggle(source)}
                      className="btn-ghost p-1.5"
                      title={source.is_active ? 'Disable' : 'Enable'}
                    >
                      {source.is_active
                        ? <ToggleRight className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        : <ToggleLeft className="w-5 h-5 text-gray-400" />
                      }
                    </button>
                    <button onClick={() => handleDelete(source.id)} className="btn-ghost p-1.5 text-red-400 hover:text-red-600" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FormField({ label, value, onChange, required, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700
          rounded-xl outline-none focus:border-indigo-300 dark:focus:border-indigo-700 transition-colors"
      />
    </div>
  )
}
