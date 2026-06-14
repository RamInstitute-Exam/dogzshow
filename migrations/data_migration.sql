-- DATA MIGRATION SCRIPT (POSTGRESQL TO MYSQL)
-- NOTE: As the previous PostgreSQL database was local and unpopulated (Error: P1001), 
-- there is no existing production data to migrate. 
-- All tables in the Aiven MySQL database will start clean.

-- To manually insert test data, you can uncomment and use the following:
-- INSERT INTO `User` (`id`, `email`, `password`, `isActive`, `createdAt`, `updatedAt`) VALUES 
-- (UUID(), 'admin@juzdog.com', '$2b$10$hashedpassword', 1, NOW(), NOW());
