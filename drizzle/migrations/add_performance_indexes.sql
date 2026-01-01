-- Add performance indexes for frequently queried columns
-- Migration created: 2026-01-01

-- Photos table indexes
CREATE INDEX IF NOT EXISTS idx_photos_is_visible ON photos(isVisible);
CREATE INDEX IF NOT EXISTS idx_photos_category ON photos(category);
CREATE INDEX IF NOT EXISTS idx_photos_sort_order ON photos(sortOrder);
CREATE INDEX IF NOT EXISTS idx_photos_featured ON photos(featured);

-- Photo collaborators composite index
CREATE INDEX IF NOT EXISTS idx_photo_collaborators_photo_id ON photo_collaborators(photoId);
CREATE INDEX IF NOT EXISTS idx_photo_collaborators_collaborator_id ON photo_collaborators(collaboratorId);

-- Photo package relations composite index
CREATE INDEX IF NOT EXISTS idx_photo_package_relations_photo_id ON photo_package_relations(photoId);
CREATE INDEX IF NOT EXISTS idx_photo_package_relations_package_id ON photo_package_relations(packageId);

-- Booking packages index
CREATE INDEX IF NOT EXISTS idx_booking_packages_is_active ON booking_packages(isActive);
CREATE INDEX IF NOT EXISTS idx_booking_packages_sort_order ON booking_packages(sortOrder);

-- Hero slides and quotes indexes
CREATE INDEX IF NOT EXISTS idx_hero_slides_is_active ON hero_slides(isActive);
CREATE INDEX IF NOT EXISTS idx_hero_quotes_is_active ON hero_quotes(isActive);
