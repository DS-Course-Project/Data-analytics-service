import { Router } from "express";
import { analyticsController } from "../controllers/analytics.controller";
import { exportService } from "../services/export.service";
import { requireRole } from "../middleware/rbac";

const router = Router();

// Dashboard Summary Data
router.get("/overview", requireRole("ADMIN"), analyticsController.getOverview);
router.get("/stats/overview", requireRole("ADMIN"), analyticsController.getStatsOverview);
router.get("/distribution", requireRole("ADMIN"), analyticsController.getDistribution);
router.get("/trends", requireRole("ADMIN"), analyticsController.getTrends);

// Agent & User Metrics
router.get("/agent-performance", requireRole("ADMIN"), analyticsController.getAgentPerformance);
router.get("/user-activity", requireRole("ADMIN"), analyticsController.getUserActivity);

// SLA Metrics
router.get("/sla", requireRole("ADMIN"), analyticsController.getSLAMetrics);

// Data Export
router.get("/export/csv", requireRole("ADMIN"), async (req, res) => {
  try {
    const csv = await exportService.generateCSV();
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=tickets_report.csv");
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: "Failed to export CSV" });
  }
});

router.get("/export/pdf", requireRole("ADMIN"), async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=tickets_report.pdf");
    await exportService.generatePDF(res);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to export PDF" });
    }
  }
});

export const analyticsRoutes: Router = router;
