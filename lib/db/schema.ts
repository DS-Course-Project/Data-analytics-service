import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const ticketStatusEnum = pgEnum("ticket_status", ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]);
export const ticketPriorityEnum = pgEnum("ticket_priority", ["LOW", "MEDIUM", "HIGH"]);

export const ticket = pgTable("ticket", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    status: ticketStatusEnum("status").notNull().default("OPEN"),
    priority: ticketPriorityEnum("priority").notNull().default("MEDIUM"),
    userId: text("userId").notNull(), // Kept as a string identifier for now, even without auth table constraint
    assignedTo: text("assignedTo"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const comment = pgTable("comment", {
    id: text("id").primaryKey(),
    content: text("content").notNull(),
    ticketId: text("ticketId")
        .notNull()
        .references(() => ticket.id, { onDelete: "cascade" }),
    userId: text("userId").notNull(), // Author of the comment
    createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const notification = pgTable("notification", {
    id: text("id").primaryKey(),
    userId: text("userId").notNull(),
    message: text("message").notNull(),
    eventType: text("eventType").notNull(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const ticketSnapshot = pgTable("ticket_snapshot", {
    id: text("id").primaryKey(),
    status: ticketStatusEnum("status").notNull(),
    priority: ticketPriorityEnum("priority").notNull(),
    createdAt: timestamp("createdAt").notNull(),
});
