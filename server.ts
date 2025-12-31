import express from "express";
import cors from "cors";
import { analyticsRoutes } from "./lib/routes/analytics.routes.js";
import { extractUser } from "./lib/middleware/rbac.js";

const app = express();
app.use(express.json()); // Support JSON bodies
const port = process.env.PORT || 3000;

app.use(cors());

// Middleware
app.use(extractUser);

// Routes
app.use("/analytics", analyticsRoutes);

// app.use(
//   cors({
//     origin: "http://your-frontend-domain.com",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception thrown:", err);
});
