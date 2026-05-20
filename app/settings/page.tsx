'use client'

import { useEffect, useState } from 'react'
import { Bell, BellOff, Moon, Sun, Monitor, Trash2, Check } from 'lucide-react'
import { useTheme } from 'next-themes'
import { getSessionId } from '@/lib/session'

const CATEGORIES = [
  { slug: 'ux-design', name: 'UX Design' },
  { slug: 'ui-design', name: 'UI Design' },
  { slug: 'product-design', name: 'Product Design' },
  { slug: 'design-systems', name: 'Design Systems' },
  { slug: 'ai', name: 'AI' },
  { slug: 'technology', name: 'Technology' },
  { slug: 'gadgets', name: 'Gadgets' },
  { slug: 'startups', name: 'Startups' },
  { slug: 'innovation', name: 'Innovation' },
  { slug: 'research', name: 'Research' },
]

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [notifEnabled, setNotifEnabled] = useState(false)
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [quietStart, setQuietStart] = useState('')
  const [quietEnd, setQuietEnd] = useState('')
  const [dailyDigest, setDailyDigest] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [clearing, setClearing] = useState<'read' | 'saved' | null>(null)
  const [cleared, setCleared] = useState<'read' | 'saved' | null>(null)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission)
    }
    // Load saved prefs
    const sessionId = getSessionId()
    fetch(`/api/notifications/preferences?sessionId=${sessionId}`)
      .then(r => r.json())
      .then(d => {
        if (d.preferences) {
          setSelectedCategories(d.preferences.categories || [])
          setQuietStart(d.preferences.quiet_hours_start ?? '')
          setQuietEnd(d.preferences.quiet_hours_end ?? '')
          setDailyDigest(d.preferences.daily_digest || false)
          setNotifEnabled(!!d.preferences.subscription)
        }
      })
      .catch(() => {})
  }, [])

  async function requestNotifications() {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      alert('Push notifications are not supported in this browser.')
      return
    }

    const permission = await Notification.requestPermission()
    setNotifPermission(permission)

    if (permission !== 'granted') return

    try {
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) {
        console.warn('VAPID public key not configured')
        setNotifEnabled(true)
        return
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as any,
      })

      const sessionId = getSessionId()
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub, sessionId }),
      })
      setNotifEnabled(true)
    } catch (err) {
      console.error('Push subscription failed:', err)
      setNotifEnabled(true)
    }
  }

  async function disableNotifications() {
    const sessionId = getSessionId()
    try {
      await fetch('/api/notifications/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
    } catch {
      // ignore
    }
    setNotifEnabled(false)
  }

  async function savePreferences() {
    setSaving(true)
    const sessionId = getSessionId()
    try {
      await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          categories: selectedCategories,
          quiet_hours_start: quietStart ? parseInt(quietStart) : null,
          quiet_hours_end: quietEnd ? parseInt(quietEnd) : null,
          daily_digest: dailyDigest,
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  async function clearHistory(type: 'read' | 'saved') {
    setClearing(type)
    const sessionId = getSessionId()
    try {
      await fetch(`/api/${type}?sessionId=${sessionId}&clearAll=true`, { method: 'DELETE' })
      setCleared(type)
      setTimeout(() => setCleared(null), 2000)
    } finally {
      setClearing(null)
    }
  }

  function toggleCategory(slug: string) {
    setSelectedCategories(prev =>
      prev.includes(slug) ? prev.filter(c => c !== slug) : [...prev, slug]
    )
  }

  if (!mounted) return null

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>

      {/* Theme */}
      <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-4">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Appearance</h2>
        <div className="flex gap-2">
          {[
            { value: 'light', icon: Sun, label: 'Light' },
            { value: 'dark', icon: Moon, label: 'Dark' },
            { value: 'system', icon: Monitor, label: 'System' },
          ].map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                theme === value
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-indigo-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Push Notifications</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {notifPermission === 'denied'
                ? 'Notifications are blocked. Enable them in your browser settings.'
                : 'Get notified when new articles are added.'}
            </p>
          </div>
          {notifEnabled ? (
            <button onClick={disableNotifications} className="btn-ghost flex items-center gap-2 text-sm text-red-500 hover:text-red-600">
              <BellOff className="w-4 h-4" />
              Disable
            </button>
          ) : (
            <button
              onClick={requestNotifications}
              disabled={notifPermission === 'denied'}
              className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Bell className="w-4 h-4" />
              Enable
            </button>
          )}
        </div>

        {notifEnabled && (
          <>
            {/* Category preferences */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notify for categories:</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.slug}
                    onClick={() => toggleCategory(cat.slug)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                      selectedCategories.includes(cat.slug) || selectedCategories.length === 0
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">Select none to receive all categories.</p>
            </div>

            {/* Quiet hours */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quiet hours (no notifications):</p>
              <div className="flex items-center gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">From</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={quietStart}
                    onChange={e => setQuietStart(e.target.value)}
                    placeholder="22"
                    className="w-20 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none"
                  />
                  <span className="text-xs text-gray-400 ml-1">:00</span>
                </div>
                <span className="text-gray-400">—</span>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">To</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={quietEnd}
                    onChange={e => setQuietEnd(e.target.value)}
                    placeholder="7"
                    className="w-20 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none"
                  />
                  <span className="text-xs text-gray-400 ml-1">:00</span>
                </div>
              </div>
            </div>

            {/* Daily digest */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Daily digest notification</p>
                <p className="text-xs text-gray-400">Receive a summary of today&apos;s top articles at 9am.</p>
              </div>
              <button
                onClick={() => setDailyDigest(!dailyDigest)}
                className={`w-11 h-6 rounded-full transition-colors ${dailyDigest ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${dailyDigest ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <button
              onClick={savePreferences}
              disabled={saving}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              {saved ? <Check className="w-4 h-4" /> : null}
              {saved ? 'Saved!' : saving ? 'Saving…' : 'Save preferences'}
            </button>
          </>
        )}
      </section>

      {/* Data */}
      <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Data &amp; Privacy</h2>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Clear read history</p>
              <p className="text-xs text-gray-400">Articles will be marked as unread again.</p>
            </div>
            <button
              onClick={() => clearHistory('read')}
              disabled={clearing === 'read'}
              className="btn-ghost flex items-center gap-2 text-sm text-red-500 hover:text-red-600"
            >
              {cleared === 'read' ? <Check className="w-4 h-4 text-green-500" /> : <Trash2 className="w-4 h-4" />}
              {cleared === 'read' ? 'Cleared' : clearing === 'read' ? 'Clearing…' : 'Clear'}
            </button>
          </div>
          <div className="h-px bg-gray-50 dark:bg-gray-800" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Clear saved articles</p>
              <p className="text-xs text-gray-400">Remove all bookmarked articles.</p>
            </div>
            <button
              onClick={() => clearHistory('saved')}
              disabled={clearing === 'saved'}
              className="btn-ghost flex items-center gap-2 text-sm text-red-500 hover:text-red-600"
            >
              {cleared === 'saved' ? <Check className="w-4 h-4 text-green-500" /> : <Trash2 className="w-4 h-4" />}
              {cleared === 'saved' ? 'Cleared' : clearing === 'saved' ? 'Clearing…' : 'Clear'}
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4">
          All data is stored locally per browser session. No account required.
        </p>
      </section>
    </div>
  )
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
