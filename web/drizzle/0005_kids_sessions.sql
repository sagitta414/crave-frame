ALTER TABLE parent_controls ADD COLUMN recovery_hash text;
ALTER TABLE parent_controls ADD COLUMN helper_level text NOT NULL DEFAULT 'Little helper';
ALTER TABLE parent_controls ADD COLUMN session text;
