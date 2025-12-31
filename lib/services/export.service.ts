import PDFDocument from "pdfkit";
import { stringify } from "csv-stringify/sync";
import { db } from "../db";
import { ticket } from "../db/schema";

export const exportService = {
  generateCSV: async () => {
    const data = await db.select().from(ticket);
    return stringify(data, { header: true });
  },

  generatePDF: async (res: any) => {
    const data = await db.select().from(ticket);
    const doc = new PDFDocument();

    doc.pipe(res);
    doc.fontSize(20).text("Ticket Analytics Report", { align: "center" });
    doc.moveDown();

    data.forEach((t, i) => {
      doc.fontSize(12).text(`${i + 1}. [${t.status}] ${t.title} (Priority: ${t.priority})`);
      doc.fontSize(10).text(`   Created: ${t.createdAt.toISOString()} | Assigned To: ${t.assignedTo || "Unassigned"}`);
      doc.moveDown(0.5);
    });

    doc.end();
  },
};
