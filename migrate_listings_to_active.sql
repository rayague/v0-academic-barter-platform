-- =====================================================
-- ɖyɔ̌ - Migrate Pending Payment Listings to Active
-- =====================================================
-- Run this in Supabase SQL Editor to convert all pending_payment listings to active
-- =====================================================

-- Update all pending_payment listings to active
UPDATE listings
SET status = 'active'
WHERE status = 'pending_payment';

-- Verify the migration
SELECT 
  COUNT(*) as total_updated,
  (SELECT COUNT(*) FROM listings WHERE status = 'active') as active_count,
  (SELECT COUNT(*) FROM listings WHERE status = 'pending_payment') as pending_count
FROM listings
WHERE status = 'active';

-- Show summary
SELECT 'Migration complete! All pending_payment listings are now active.' AS status;
