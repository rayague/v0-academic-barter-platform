-- =====================================================
-- ɖyɔ̌ - Academic Barter Platform - Update Categories
-- =====================================================
-- Run this in Supabase SQL Editor to update categories
-- =====================================================

-- Delete existing categories (listings will have NULL category_id)
DELETE FROM categories;

-- Insert new categories as requested
INSERT INTO categories (id, name, name_fr, icon, color) VALUES
    (uuid_generate_v4(), 'annales-sujets', 'Annales et sujets d''examens', 'file-text', '#f59e0b'),
    (uuid_generate_v4(), 'manuels-scolaires', 'Manuels scolaires', 'graduation-cap', '#8b5cf6'),
    (uuid_generate_v4(), 'materiels-outils', 'Matériels et outils', 'package', '#3b82f6'),
    (uuid_generate_v4(), 'fournitures-scolaires', 'Fournitures scolaires', 'notebook-pen', '#10b981'),
    (uuid_generate_v4(), 'autres-documents', 'Autres Documents Académiques', 'book-open', '#ec4899')
ON CONFLICT (name) DO UPDATE SET
    name_fr = EXCLUDED.name_fr,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
SELECT 'Categories updated successfully!' AS status;
