-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sources
CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL UNIQUE,
  rss_url VARCHAR(500) NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'technology',
  favicon VARCHAR(500),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  last_fetched_at TIMESTAMPTZ,
  fetch_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  color VARCHAR(50) DEFAULT '#6366f1',
  icon VARCHAR(50) DEFAULT 'Layers',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Articles
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  image_url TEXT,
  summary TEXT,
  author VARCHAR(255),
  published_at TIMESTAMPTZ DEFAULT NOW(),
  category VARCHAR(100) DEFAULT 'technology',
  reading_time INTEGER DEFAULT 3,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_source_id ON articles(source_id);

-- Saved articles
CREATE TABLE IF NOT EXISTS saved_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, session_id)
);

-- Read articles
CREATE TABLE IF NOT EXISTS read_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, session_id)
);

-- Notification subscriptions
CREATE TABLE IF NOT EXISTS notification_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) NOT NULL UNIQUE,
  subscription JSONB NOT NULL,
  categories TEXT[] DEFAULT '{}',
  sources UUID[] DEFAULT '{}',
  quiet_hours_start INTEGER,
  quiet_hours_end INTEGER,
  daily_digest BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, slug, color, icon) VALUES
  ('UX Design', 'ux-design', '#6366f1', 'Users'),
  ('UI Design', 'ui-design', '#8b5cf6', 'Palette'),
  ('Product Design', 'product-design', '#ec4899', 'Package'),
  ('Design Systems', 'design-systems', '#14b8a6', 'Layers'),
  ('AI', 'ai', '#f59e0b', 'Cpu'),
  ('Technology', 'technology', '#3b82f6', 'Monitor'),
  ('Gadgets', 'gadgets', '#ef4444', 'Smartphone'),
  ('Startups', 'startups', '#22c55e', 'Rocket'),
  ('Innovation', 'innovation', '#f97316', 'Lightbulb'),
  ('Research', 'research', '#64748b', 'BookOpen')
ON CONFLICT (slug) DO NOTHING;
