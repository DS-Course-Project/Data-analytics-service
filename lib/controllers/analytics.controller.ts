import { Request, Response } from "express";
import { db } from "../db";
import { ticket } from "../db/schema";
import { eq, sql, and, gte, lte, count, avg } from "drizzle-orm";

export const analyticsController = {
  getOverview: async (req: Request, res: Response) => {
    try {
      const stats = await db
        .select({
          status: ticket.status,
          count: count(),
        })
        .from(ticket)
        .groupBy(ticket.status);

      const total = await db.select({ count: count() }).from(ticket);

      const result = {
        total: total[0].count,
        open: stats.find((s) => s.status === "OPEN")?.count || 0,
        in_progress: stats.find((s) => s.status === "IN_PROGRESS")?.count || 0,
        resolved: stats.find((s) => s.status === "RESOLVED")?.count || 0,
        closed: stats.find((s) => s.status === "CLOSED")?.count || 0,
      };

      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to get overview stats" });
    }
  },

  getDistribution: async (req: Request, res: Response) => {
    try {
      const byStatus = await db
        .select({
          status: ticket.status,
          count: count(),
        })
        .from(ticket)
        .groupBy(ticket.status);

      const byPriority = await db
        .select({
          priority: ticket.priority,
          count: count(),
        })
        .from(ticket)
        .groupBy(ticket.priority);

      res.json({ byStatus, byPriority });
    } catch (error) {
      res.status(500).json({ error: "Failed to get distribution stats" });
    }
  },

  getTrends: async (req: Request, res: Response) => {
    try {
      const timeframe = (req.query.timeframe as string) || "daily";
      let interval = "day";
      if (timeframe === "weekly") interval = "week";
      if (timeframe === "monthly") interval = "month";

      // Drizzle/PG group by date truncated
      const trends = await db.execute(sql`
                SELECT date_trunc(${interval}, "createdAt") as date, count(*) as count
                FROM ticket
                GROUP BY date
                ORDER BY date ASC
            `);

      res.json(trends.rows);
    } catch (error) {
      res.status(500).json({ error: "Failed to get trends" });
    }
  },

  getAgentPerformance: async (req: Request, res: Response) => {
    try {
      const performance = await db
        .select({
          agentId: ticket.assignedTo,
          totalAssigned: count(),
          resolved: sql<number>`count(*) filter (where status = 'RESOLVED')`,
        })
        .from(ticket)
        .where(sql`${ticket.assignedTo} IS NOT NULL`)
        .groupBy(ticket.assignedTo);

      res.json(performance);
    } catch (error) {
      res.status(500).json({ error: "Failed to get agent performance" });
    }
  },

  getUserActivity: async (req: Request, res: Response) => {
    try {
      const activity = await db
        .select({
          userId: ticket.userId,
          ticketsCreated: count(),
        })
        .from(ticket)
        .groupBy(ticket.userId);

      res.json(activity);
    } catch (error) {
      res.status(500).json({ error: "Failed to get user activity" });
    }
  },

  getSLAMetrics: async (req: Request, res: Response) => {
    try {
      // Calculate avg time between createdAt and updatedAt for RESOLVED/CLOSED tickets
      const sla = await db
        .select({
          averageResolutionTimeHours: sql<number>`extract(epoch from avg("updatedAt" - "createdAt")) / 3600`,
        })
        .from(ticket)
        .where(sql`status IN ('RESOLVED', 'CLOSED')`);

      res.json(sla[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to get SLA metrics" });
    }
  },
};
