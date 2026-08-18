import { Request, Response } from "express";
import { getJobs } from "../services/jobService";

export async function listJobs(
  _req: Request,
  res: Response
) {
  try {
    const jobs = await getJobs();

    res.json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error("Failed to fetch jobs:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch jobs",
    });
  }
}