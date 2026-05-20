import { createClient } from '@supabase/supabase-js'

// Load env manually for script context
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

const SOURCES = [
  // UX Design
  { name: 'Nielsen Norman Group', url: 'https://www.nngroup.com', rss_url: 'https://www.nngroup.com/feed/rss/', category: 'ux-design', description: 'World leaders in UX research and design' },
  { name: 'Smashing Magazine', url: 'https://www.smashingmagazine.com', rss_url: 'https://www.smashingmagazine.com/feed/', category: 'ux-design', description: 'Professional web design & development' },
  { name: 'UX Collective', url: 'https://uxdesign.cc', rss_url: 'https://uxdesign.cc/feed', category: 'ux-design', description: 'Curated stories on UX, Visual & Product Design' },
  { name: 'UX Planet', url: 'https://uxplanet.org', rss_url: 'https://uxplanet.org/feed', category: 'ux-design', description: 'One-stop resource for everything UX' },
  { name: 'UX Magazine', url: 'https://uxmag.com', rss_url: 'https://uxmag.com/feed', category: 'ux-design', description: 'Defining and elevating the UX field' },
  { name: 'A List Apart', url: 'https://alistapart.com', rss_url: 'https://alistapart.com/main/feed/', category: 'ux-design', description: 'For people who make websites' },
  { name: 'Designmodo', url: 'https://designmodo.com', rss_url: 'https://designmodo.com/feed/', category: 'ui-design', description: 'Design news, tutorials and resources' },
  { name: 'Webdesigner Depot', url: 'https://www.webdesignerdepot.com', rss_url: 'https://www.webdesignerdepot.com/feed/', category: 'ui-design', description: 'Web design resources and inspiration' },
  { name: 'Interaction Design Foundation', url: 'https://www.interaction-design.org', rss_url: 'https://www.interaction-design.org/literature/topics/ux-design.rss', category: 'ux-design', description: 'The world\'s largest UX design community' },
  { name: 'UXPin Blog', url: 'https://www.uxpin.com/studio', rss_url: 'https://www.uxpin.com/studio/feed/', category: 'design-systems', description: 'Design tool and thought leadership' },
  // Technology / Gadgets
  { name: 'The Verge', url: 'https://www.theverge.com', rss_url: 'https://www.theverge.com/rss/index.xml', category: 'technology', description: 'Technology, science, art, and culture' },
  { name: 'TechCrunch', url: 'https://techcrunch.com', rss_url: 'https://techcrunch.com/feed/', category: 'startups', description: 'Startup and technology news' },
  { name: 'Wired', url: 'https://www.wired.com', rss_url: 'https://www.wired.com/feed/rss', category: 'technology', description: 'Where tomorrow is realized' },
  { name: 'Engadget', url: 'https://www.engadget.com', rss_url: 'https://www.engadget.com/rss.xml', category: 'gadgets', description: 'Technology and consumer electronics' },
  { name: 'Ars Technica', url: 'https://arstechnica.com', rss_url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'technology', description: 'In-depth tech reporting' },
  { name: 'Gizmodo', url: 'https://gizmodo.com', rss_url: 'https://gizmodo.com/rss', category: 'gadgets', description: 'We come from the future' },
  { name: 'CNET', url: 'https://www.cnet.com', rss_url: 'https://www.cnet.com/rss/news/', category: 'gadgets', description: 'Consumer technology news and reviews' },
  { name: 'Mashable Tech', url: 'https://mashable.com', rss_url: 'https://mashable.com/feeds/rss/all', category: 'technology', description: 'Digital culture and entertainment' },
  { name: "Tom's Guide", url: 'https://www.tomsguide.com', rss_url: 'https://www.tomsguide.com/feeds/all', category: 'gadgets', description: 'Tech product reviews and buying guides' },
  { name: 'Android Authority', url: 'https://www.androidauthority.com', rss_url: 'https://www.androidauthority.com/feed/', category: 'gadgets', description: 'Android news, reviews, and more' },
  { name: '9to5Mac', url: 'https://9to5mac.com', rss_url: 'https://9to5mac.com/feed/', category: 'gadgets', description: 'Apple news, reviews and how-tos' },
  { name: 'MacRumors', url: 'https://www.macrumors.com', rss_url: 'https://feeds.macrumors.com/MacRumors-All', category: 'gadgets', description: 'Apple Mac, iPhone, iPad rumors and news' },
  { name: 'The Next Web', url: 'https://thenextweb.com', rss_url: 'https://thenextweb.com/feed/', category: 'technology', description: 'International tech news & events' },
  { name: 'VentureBeat', url: 'https://venturebeat.com', rss_url: 'https://venturebeat.com/feed/', category: 'ai', description: 'Transformative tech coverage with a focus on AI' },
  { name: 'Fast Company Design', url: 'https://www.fastcompany.com', rss_url: 'https://www.fastcompany.com/rss', category: 'innovation', description: 'Business innovation and design' },
  { name: 'MIT Technology Review', url: 'https://www.technologyreview.com', rss_url: 'https://www.technologyreview.com/feed/', category: 'ai', description: 'Emerging technology from MIT' },
  { name: 'Product Hunt', url: 'https://www.producthunt.com', rss_url: 'https://www.producthunt.com/feed', category: 'product-design', description: 'The best new products, every day' },
  { name: 'Yanko Design', url: 'https://www.yankodesign.com', rss_url: 'https://www.yankodesign.com/feed/', category: 'product-design', description: 'Modern industrial design news' },
  { name: 'Design Milk', url: 'https://design-milk.com', rss_url: 'https://design-milk.com/feed/', category: 'product-design', description: 'Modern design for modern living' },
  { name: 'Dezeen', url: 'https://www.dezeen.com', rss_url: 'https://www.dezeen.com/feed/', category: 'product-design', description: 'Architecture and design magazine' },
]

async function seed() {
  console.log(`Seeding ${SOURCES.length} sources into Supabase...`)

  const { data, error } = await supabase
    .from('sources')
    .upsert(
      SOURCES.map(s => ({ ...s, is_active: true, fetch_status: 'pending' })),
      { onConflict: 'url' }
    )
    .select('id, name')

  if (error) {
    console.error('Seed error:', error.message)
    process.exit(1)
  }

  console.log(`Seeded ${data?.length ?? 0} sources successfully.`)
  console.log('\nNext steps:')
  console.log('  1. Run the cron endpoint to fetch articles: POST /api/cron')
  console.log('  2. Visit http://localhost:3000 to see the feed')
}

seed()
