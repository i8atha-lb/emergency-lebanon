-- ============================================
-- AUTO-DELETE posts when they reach 3 flags
-- ============================================
-- Run this in Supabase SQL Editor
-- ============================================

-- Update the increment_flags_count function to auto-delete at 3 flags
CREATE OR REPLACE FUNCTION increment_flags_count()
RETURNS TRIGGER AS $$
DECLARE
  new_flag_count INTEGER;
BEGIN
  -- Increment flags based on post type
  IF NEW.reported_post_type = 'shelter' THEN
    UPDATE shelters
    SET flags_count = flags_count + 1
    WHERE id = NEW.reported_post_id
    RETURNING flags_count INTO new_flag_count;

    -- Auto-delete if >= 3 flags
    IF new_flag_count >= 3 THEN
      DELETE FROM shelters WHERE id = NEW.reported_post_id;
      RAISE NOTICE 'Auto-deleted shelter post % with % flags', NEW.reported_post_id, new_flag_count;
    END IF;

  ELSIF NEW.reported_post_type = 'aid' THEN
    UPDATE aid_posts
    SET flags_count = flags_count + 1
    WHERE id = NEW.reported_post_id
    RETURNING flags_count INTO new_flag_count;

    -- Auto-delete if >= 3 flags
    IF new_flag_count >= 3 THEN
      DELETE FROM aid_posts WHERE id = NEW.reported_post_id;
      RAISE NOTICE 'Auto-deleted aid post % with % flags', NEW.reported_post_id, new_flag_count;
    END IF;

  ELSIF NEW.reported_post_type = 'shelter_request' THEN
    UPDATE shelter_requests
    SET flags_count = flags_count + 1
    WHERE id = NEW.reported_post_id
    RETURNING flags_count INTO new_flag_count;

    -- Auto-delete if >= 3 flags
    IF new_flag_count >= 3 THEN
      DELETE FROM shelter_requests WHERE id = NEW.reported_post_id;
      RAISE NOTICE 'Auto-deleted shelter request % with % flags', NEW.reported_post_id, new_flag_count;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS trigger_increment_flags ON reports;
CREATE TRIGGER trigger_increment_flags
  AFTER INSERT ON reports
  FOR EACH ROW
  EXECUTE FUNCTION increment_flags_count();

-- Test notification
DO $$
BEGIN
  RAISE NOTICE '✅ Auto-delete trigger updated!';
  RAISE NOTICE '📌 Posts will be automatically deleted when flags_count >= 3';
  RAISE NOTICE '⚠️  Deleted posts cannot be recovered';
END $$;

-- ============================================
-- HOW IT WORKS:
-- ============================================
-- 1. User reports a post (inserts into reports table)
-- 2. Trigger runs: increment_flags_count()
-- 3. flags_count increases on the post
-- 4. If flags_count >= 3, post is DELETED immediately
-- 5. No one can see the post anymore
-- ============================================
