// Import Zod
import { z } from 'zod';
import { pgTable } from 'drizzle-orm/pg-core';

// Role enum types
export type UserRole = 'player' | 'developer' | 'staff';
export type AppState = 'draft' | 'pending' | 'published' | 'rejected' | 'hidden';

// Define tables using a simpler approach that avoids TypeScript errors
// This is a temporary solution to get around Drizzle ORM typing issues

// Table definitions - used just for queries
export const users = pgTable('users', {});
export const apps = pgTable('apps', {});
export const versions = pgTable('versions', {}); 
export const analytics = pgTable('analytics', {});
export const payments = pgTable('payments', {});

// Zod schemas for validation
export const insertUserSchema = z.object({
  id: z.string().uuid().optional(),
  logtoId: z.string(),
  email: z.string().nullable().optional(),
  role: z.enum(['player', 'developer', 'staff']).default('player'),
  createdAt: z.date().optional()
});

export const selectUserSchema = insertUserSchema.extend({
  id: z.string().uuid(),
  createdAt: z.date()
});

export const insertAppSchema = z.object({
  id: z.string().uuid().optional(),
  ownerId: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  heroUrl: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  priceCents: z.number().default(0),
  isPaid: z.boolean().default(false),
  state: z.enum(['draft', 'pending', 'published', 'rejected', 'hidden']).default('draft'),
  createdAt: z.date().optional()
});

export const selectAppSchema = insertAppSchema.extend({
  id: z.string().uuid(),
  createdAt: z.date()
});

export const insertVersionSchema = z.object({
  id: z.string().uuid().optional(),
  appId: z.string().uuid(),
  semver: z.string(),
  changelog: z.string().nullable().optional(),
  lighthouseScore: z.number().nullable().optional(),
  repoUrl: z.string().nullable().optional(),
  deployUrl: z.string().nullable().optional(),
  createdAt: z.date().optional()
});

export const selectVersionSchema = insertVersionSchema.extend({
  id: z.string().uuid(),
  createdAt: z.date()
});

export const insertAnalyticsSchema = z.object({
  id: z.number().optional(),
  appId: z.string().uuid(),
  userId: z.string().uuid(),
  event: z.string(),
  ts: z.date().optional(),
  metadata: z.record(z.string(), z.any()).optional()
});

export const selectAnalyticsSchema = insertAnalyticsSchema.extend({
  id: z.number(),
  ts: z.date()
});

export const insertPaymentSchema = z.object({
  id: z.string().uuid().optional(),
  appId: z.string().uuid(),
  stripeChargeId: z.string().nullable().optional(),
  amountCents: z.number(),
  feeCents: z.number(),
  ts: z.date().optional()
});

export const selectPaymentSchema = insertPaymentSchema.extend({
  id: z.string().uuid(),
  ts: z.date()
});

// Type definitions based on the schema
export type User = z.infer<typeof selectUserSchema>;
export type NewUser = z.infer<typeof insertUserSchema>;

export type App = z.infer<typeof selectAppSchema>;
export type NewApp = z.infer<typeof insertAppSchema>;

export type Version = z.infer<typeof selectVersionSchema>;
export type NewVersion = z.infer<typeof insertVersionSchema>;

export type AnalyticsEvent = z.infer<typeof selectAnalyticsSchema>;
export type NewAnalyticsEvent = z.infer<typeof insertAnalyticsSchema>;

export type Payment = z.infer<typeof selectPaymentSchema>;
export type NewPayment = z.infer<typeof insertPaymentSchema>;