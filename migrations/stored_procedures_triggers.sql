-- STORED PROCEDURES AND TRIGGERS SCRIPT
-- NOTE: The JuzDog application architecture utilizes Prisma ORM, which shifts
-- business logic (previously handled by PL/pgSQL stored procedures or triggers)
-- directly into the Node.js/Express service layer for better scalability and
-- database agnosticism.

-- As a result, no MySQL stored procedures or BEFORE/AFTER triggers are required.
-- All cascading deletes and relations are handled via Prisma's `onDelete: Cascade` engine.
