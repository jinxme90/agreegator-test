import Parser from 'rss-parser'

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'UX-Radar/1.0 RSS Reader' },
  customFields: {
    item: ['media:content', 'media:thumbnail', 'enclosure', ['media:content', 'mediaContent']]
  }
})

export async function fetchRSSFeed(rssUrl: string) {
  const feed = await parser.parseURL(rssUrl)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return feed.items.map((item: any) => ({
    title: item.title || '',
    url: item.link || item.guid || '',
    summary: stripHtml(item.contentSnippet || item.content || item.summary || '').slice(0, 500),
    author: item.creator || item.author || '',
    published_at: item.pubDate || item.isoDate || new Date().toISOString(),
    image_url: extractImage(item),
  }))
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractImage(item: any): string | null {
  if (item['media:content']?.$.url) return item['media:content'].$.url
  if (item['media:thumbnail']?.$.url) return item['media:thumbnail'].$.url
  if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) return item.enclosure.url
  if (item.mediaContent?.[0]?.$.url) return item.mediaContent[0].$.url
  // Try to extract from content
  const imgMatch = (item.content || '').match(/<img[^>]+src="([^"]+)"/)
  if (imgMatch) return imgMatch[1]
  return null
}

export function estimateReadingTime(text: string): number {
  const wordsPerMinute = 200
  const words = text.split(/\s+/).length
  return Math.max(1, Math.ceil(words / wordsPerMinute))
}
