CREATE TABLE parent_controls (
 household text PRIMARY KEY NOT NULL,
 salt text NOT NULL,
 pin_hash text NOT NULL,
 enabled integer NOT NULL DEFAULT 0,
 approved text NOT NULL DEFAULT '[]',
 attempts integer NOT NULL DEFAULT 0,
 locked_until integer NOT NULL DEFAULT 0
);
