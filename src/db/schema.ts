import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('username').notNull().unique(),
  email: text('nickname').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});