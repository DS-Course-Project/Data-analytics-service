CREATE TABLE "comment" (
	"id" text PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"ticketId" text NOT NULL,
	"userId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "session" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "verification" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "account" CASCADE;--> statement-breakpoint
DROP TABLE "session" CASCADE;--> statement-breakpoint
DROP TABLE "user" CASCADE;--> statement-breakpoint
DROP TABLE "verification" CASCADE;--> statement-breakpoint
ALTER TABLE "notification" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "notification" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ticket" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "ticket" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ticket_snapshot" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "ticket_snapshot" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_ticketId_ticket_id_fk" FOREIGN KEY ("ticketId") REFERENCES "public"."ticket"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket" DROP COLUMN "comment";--> statement-breakpoint
DROP TYPE "public"."role";