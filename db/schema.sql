-- Neon / PostgreSQL schema for smart-report-website-2

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_status') THEN
    CREATE TYPE report_status AS ENUM ('pending', 'in-progress', 'done');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS categories (
  id serial PRIMARY KEY,
  name text UNIQUE NOT NULL,
  icon text
);

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY,
  category_id integer REFERENCES categories(id) ON DELETE SET NULL,
  description text NOT NULL,
  location text,
  image_url text,
  status report_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  edit_token text UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS admins (
  id serial PRIMARY KEY,
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL
);

CREATE TABLE IF NOT EXISTS telegram_settings (
  id serial PRIMARY KEY,
  bot_token text,
  chat_id text,
  enabled boolean DEFAULT false
);

-- Seed default category values
INSERT INTO categories (name, icon)
  SELECT 'ไฟฟ้า', 'Lightbulb'
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'ไฟฟ้า');
INSERT INTO categories (name, icon)
  SELECT 'แอร์/เครื่องปรับอากาศ', 'Wind'
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'แอร์/เครื่องปรับอากาศ');
INSERT INTO categories (name, icon)
  SELECT 'ประปา/ห้องน้ำ', 'Droplets'
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'ประปา/ห้องน้ำ');
INSERT INTO categories (name, icon)
  SELECT 'อุปกรณ์ชำรุด', 'Wrench'
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'อุปกรณ์ชำรุด');
INSERT INTO categories (name, icon)
  SELECT 'ความสะอาด', 'Sparkles'
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'ความสะอาด');
INSERT INTO categories (name, icon)
  SELECT 'อินเทอร์เน็ต/คอมพิวเตอร์', 'Wifi'
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'อินเทอร์เน็ต/คอมพิวเตอร์');
INSERT INTO categories (name, icon)
  SELECT 'อื่นๆ', 'MoreHorizontal'
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'อื่นๆ');
