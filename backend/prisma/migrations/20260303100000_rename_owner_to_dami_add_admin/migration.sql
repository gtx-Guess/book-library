-- Rename the "owner" account to "Dami" and change role to "user".
-- Safe on both fresh DBs (renames the init-migration placeholder) and production
-- (renames the real account). All FKs use userId (cuid), not username — data stays intact.
UPDATE "User"
SET "username" = 'Dami', "role" = 'user'
WHERE "username" = 'owner' AND "role" = 'owner';
