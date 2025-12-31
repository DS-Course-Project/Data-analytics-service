import { uuid } from "drizzle-orm/pg-core";
import { pgTable, text, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["ADMIN", "USER"]);
export const ticketStatusEnum = pgEnum("ticket_status", ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]);
export const ticketPriorityEnum = pgEnum("ticket_priority", ["LOW", "MEDIUM", "HIGH"]);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  role: text("role").default("user"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const ticket = pgTable("ticket", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  comment: text("comment").default(""),
  status: ticketStatusEnum("status").notNull().default("OPEN"),
  priority: ticketPriorityEnum("priority").notNull().default("MEDIUM"),
  userId: text("userId").notNull(),
  assignedTo: text("assignedTo"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const notification = pgTable("notification", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("userId").notNull(),
  message: text("message").notNull(),
  eventType: text("eventType").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const ticketSnapshot = pgTable("ticket_snapshot", {
  id: uuid("id").primaryKey().defaultRandom(),
  status: ticketStatusEnum("status").notNull(),
  priority: ticketPriorityEnum("priority").notNull(),
  createdAt: timestamp("createdAt").notNull(),
});

export type Ticket = typeof ticket.$inferSelect;
