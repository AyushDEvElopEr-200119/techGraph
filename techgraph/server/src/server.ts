import "dotenv/config";
import express from "express";
import cors from "cors";
import driver from "./config/database";
import developerRoutes from "./routes/developerRoutes";
import jobRoutes from "./routes/jobRoutes";
import projectRoutes from "./routes/projectRoutes";
import technologyRoutes from "./routes/technologyRoutes";
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/developers", developerRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/technologies", technologyRoutes);

app.get("/", (_req, res) => {
  res.json({
    message: "TechGraph API is running",
  });
});

app.get("/api/health", async (_req, res) => {
  try {
    const session = driver.session();

    await session.run("RETURN 1 AS result");

    await session.close();

    res.json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error("Database connection failed:", error);

    res.status(503).json({
      status: "error",
      database: "unavailable",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`TechGraph API running on http://localhost:${PORT}`);
});