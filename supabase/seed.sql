-- If adding slugs to an existing database, run the migration first:
--   ALTER TABLE doctors ADD COLUMN slug text unique;
-- then backfill: UPDATE doctors SET slug = lower(regexp_replace(name, '[^a-z0-9]+', '-', 'gi'));
-- then set NOT NULL: ALTER TABLE doctors ALTER COLUMN slug SET NOT NULL;

insert into doctors (name, specialty, slug) values
  ('Dr. Jane Smith',   'Dermatologist',        'dr-jane-smith'),
  ('Dr. Marcus Tan',   'General Practitioner', 'dr-marcus-tan'),
  ('Dr. Aisha Rahman', 'Psychiatrist',          'dr-aisha-rahman');

