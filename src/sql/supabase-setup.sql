-- ===========================================
-- Emergency Response Platform - Lebanon
-- Database Setup Script for Supabase
-- ===========================================

-- 1. Create Tables
-- ===========================================

-- Shelters table
CREATE TABLE IF NOT EXISTS shelters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  device_id TEXT NOT NULL,
  location_area TEXT NOT NULL,
  address_details TEXT,
  capacity INTEGER,
  contact_phone TEXT NOT NULL,
  contact_name TEXT,
  duration TEXT,
  notes TEXT
);

-- Aid posts table
CREATE TABLE IF NOT EXISTS aid_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  device_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('needed', 'available')),
  category TEXT,
  description TEXT NOT NULL,
  location TEXT,
  contact_phone TEXT NOT NULL,
  contact_name TEXT
);

-- Emergency contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  phone TEXT NOT NULL,
  area TEXT,
  notes TEXT
);

-- 2. Enable Row Level Security (RLS)
-- ===========================================

ALTER TABLE shelters ENABLE ROW LEVEL SECURITY;
ALTER TABLE aid_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies
-- ===========================================

-- Public read access for all tables
CREATE POLICY "Anyone can read shelters" ON shelters
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read aid posts" ON aid_posts
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read emergency contacts" ON emergency_contacts
  FOR SELECT USING (true);

-- Public insert for shelters and aid posts
CREATE POLICY "Anyone can insert shelters" ON shelters
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert aid posts" ON aid_posts
  FOR INSERT WITH CHECK (true);

-- Delete policies (own posts or admin)
CREATE POLICY "Anyone can delete shelters" ON shelters
  FOR DELETE USING (true);

CREATE POLICY "Anyone can delete aid posts" ON aid_posts
  FOR DELETE USING (true);

-- Admin-only policies for emergency contacts
CREATE POLICY "Only admins can insert emergency contacts" ON emergency_contacts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can update emergency contacts" ON emergency_contacts
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can delete emergency contacts" ON emergency_contacts
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- 4. Insert Default Emergency Contacts
-- ===========================================

INSERT INTO emergency_contacts (category, name_ar, phone, area, notes) VALUES
  ('الدفاع المدني', 'الدفاع المدني', '125', 'عام', 'للحرائق والحوادث'),
  ('الصليب الأحمر', 'الصليب الأحمر اللبناني', '140', 'عام', 'للطوارئ الطبية'),
  ('قوى الأمن', 'قوى الأمن الداخلي', '112', 'عام', 'للطوارئ الأمنية'),
  ('الطوارئ الطبية', 'الإسعاف', '140', 'عام', ''),
  ('مستشفى', 'مستشفى الجامعة الأميركية', '01-350000', 'بيروت', ''),
  ('مستشفى', 'مستشفى أوتيل ديو', '01-615300', 'بيروت', ''),
  ('مستشفى', 'المركز الطبي في الجامعة اللبنانية الأميركية', '01-200800', 'بيروت', ''),
  ('منظمة', 'الهلال الأحمر الفلسطيني', '01-853391', 'عام', ''),
  ('منظمة', 'جمعية الرسالة الصحية الإسلامية', '01-544000', 'عام', '')
ON CONFLICT DO NOTHING;

-- 5. Create Indexes for Performance
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_shelters_created_at ON shelters(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shelters_location ON shelters(location_area);
CREATE INDEX IF NOT EXISTS idx_aid_posts_created_at ON aid_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aid_posts_type ON aid_posts(type);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_category ON emergency_contacts(category);

-- ===========================================
-- Setup Complete!
-- ===========================================
-- Next steps:
-- 1. Create an admin user in Authentication > Users
-- 2. Copy your Project URL and anon key from Settings > API
-- 3. Add them to your .env file
-- ===========================================
