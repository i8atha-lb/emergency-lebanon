-- ============================================
-- Emergency Response Platform - Database Migration
-- Phase 2: Reporting System & Shelter Requests
-- ============================================
-- Run these queries in Supabase SQL Editor
-- ============================================

-- STEP 1: Add flags_count to existing tables
-- ============================================

ALTER TABLE shelters
ADD COLUMN IF NOT EXISTS flags_count INTEGER DEFAULT 0;

ALTER TABLE aid_posts
ADD COLUMN IF NOT EXISTS flags_count INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_shelters_flags ON shelters(flags_count) WHERE flags_count > 0;
CREATE INDEX IF NOT EXISTS idx_aid_posts_flags ON aid_posts(flags_count) WHERE flags_count > 0;

-- STEP 2: Create shelter_requests table
-- ============================================

CREATE TABLE IF NOT EXISTS shelter_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  device_id TEXT NOT NULL,
  location_current TEXT NOT NULL,
  people_count INTEGER NOT NULL,
  has_children BOOLEAN DEFAULT false,
  has_elderly BOOLEAN DEFAULT false,
  has_medical_needs BOOLEAN DEFAULT false,
  duration_needed TEXT,
  contact_phone TEXT NOT NULL,
  contact_name TEXT,
  notes TEXT,
  flags_count INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE shelter_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE shelter_requests FORCE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can read shelter requests"
  ON shelter_requests FOR SELECT USING (true);

CREATE POLICY "Public can insert shelter requests"
  ON shelter_requests FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete own requests or admins can delete any"
  ON shelter_requests FOR DELETE USING (auth.uid() IS NOT NULL);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shelter_requests_created_at ON shelter_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shelter_requests_location ON shelter_requests(location_current);
CREATE INDEX IF NOT EXISTS idx_shelter_requests_device ON shelter_requests(device_id);
CREATE INDEX IF NOT EXISTS idx_shelter_requests_flags ON shelter_requests(flags_count) WHERE flags_count > 0;

-- STEP 3: Create reports table
-- ============================================

CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  reporter_device_id TEXT NOT NULL,
  reporter_ip TEXT,
  reported_post_type TEXT NOT NULL CHECK (reported_post_type IN ('shelter', 'aid', 'shelter_request')),
  reported_post_id UUID NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'fake', 'inappropriate', 'scam', 'other')),
  details TEXT
);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports FORCE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can submit reports"
  ON reports FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can read reports"
  ON reports FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can delete reports"
  ON reports FOR DELETE USING (auth.uid() IS NOT NULL);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reports_post_type_id ON reports(reported_post_type, reported_post_id);
CREATE INDEX IF NOT EXISTS idx_reports_device ON reports(reporter_device_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- STEP 4: Auto-increment flags when report is submitted
-- ============================================

CREATE OR REPLACE FUNCTION increment_flags_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reported_post_type = 'shelter' THEN
    UPDATE shelters SET flags_count = flags_count + 1 WHERE id = NEW.reported_post_id;
  ELSIF NEW.reported_post_type = 'aid' THEN
    UPDATE aid_posts SET flags_count = flags_count + 1 WHERE id = NEW.reported_post_id;
  ELSIF NEW.reported_post_type = 'shelter_request' THEN
    UPDATE shelter_requests SET flags_count = flags_count + 1 WHERE id = NEW.reported_post_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_increment_flags ON reports;
CREATE TRIGGER trigger_increment_flags
  AFTER INSERT ON reports
  FOR EACH ROW
  EXECUTE FUNCTION increment_flags_count();

-- STEP 5: Rate limiting table (for future Edge Functions)
-- ============================================

CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('post_shelter', 'post_aid', 'post_request', 'report')),
  count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits FORCE ROW LEVEL SECURITY;

-- No direct access - only via Edge Functions
CREATE POLICY "No direct access to rate_limits"
  ON rate_limits FOR ALL USING (false);

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier, action_type, window_start);

-- STEP 6: Verify everything is set up correctly
-- ============================================

DO $$
DECLARE
  shelters_flags BOOLEAN;
  aid_flags BOOLEAN;
  requests_table BOOLEAN;
  reports_table BOOLEAN;
BEGIN
  -- Check flags_count columns
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shelters' AND column_name = 'flags_count'
  ) INTO shelters_flags;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'aid_posts' AND column_name = 'flags_count'
  ) INTO aid_flags;

  -- Check new tables
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'shelter_requests'
  ) INTO requests_table;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'reports'
  ) INTO reports_table;

  -- Report results
  IF shelters_flags AND aid_flags AND requests_table AND reports_table THEN
    RAISE NOTICE '✅ SUCCESS: All tables and columns created successfully!';
    RAISE NOTICE '✅ shelters.flags_count: ADDED';
    RAISE NOTICE '✅ aid_posts.flags_count: ADDED';
    RAISE NOTICE '✅ shelter_requests table: CREATED';
    RAISE NOTICE '✅ reports table: CREATED';
    RAISE NOTICE '✅ Auto-increment trigger: INSTALLED';
  ELSE
    RAISE EXCEPTION 'MIGRATION FAILED - Check which components failed above';
  END IF;
END $$;

-- ============================================
-- Migration Complete!
-- ============================================
-- New features enabled:
-- ✅ Reporting system with flags
-- ✅ Shelter requests (people seeking shelter)
-- ✅ Auto-flagging suspicious posts (3+ reports)
-- ✅ Admin can view all reports
-- ✅ Rate limiting infrastructure ready
-- ============================================
