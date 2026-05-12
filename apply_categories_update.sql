-- =====================================================
-- ɖyɔ̌ - Apply Categories Update
-- =====================================================
-- Run this in Supabase SQL Editor to update all categories
-- Execute the following SQL commands in order
-- =====================================================

-- Step 1: Delete existing categories
DELETE FROM categories;

-- Step 2: Insert new categories
INSERT INTO categories (name, name_fr, icon, color) VALUES
    ('annales-sujets', 'Annales et sujets d''examens', 'file-text', '#f59e0b'),
    ('manuels-scolaires', 'Manuels scolaires', 'graduation-cap', '#8b5cf6'),
    ('materiels-outils', 'Matériels et outils', 'package', '#3b82f6'),
    ('fournitures-scolaires', 'Fournitures scolaires', 'notebook-pen', '#10b981'),
    ('autres-documents', 'Autres Documents Académiques', 'book-open', '#ec4899');

-- Step 3: Update all pending_payment listings to active
UPDATE listings
SET status = 'active'
WHERE status = 'pending_payment';

-- Step 4: Verify the update
SELECT 'Categories updated successfully!' AS status;
SELECT COUNT(*) as total_categories FROM categories;
SELECT COUNT(*) as active_listings FROM listings WHERE status = 'active';
SELECT COUNT(*) as pending_listings FROM listings WHERE status = 'pending_payment';
