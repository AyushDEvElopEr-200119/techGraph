import { Request, Response } from "express";
import {
  getDevelopers,
  getDeveloperById,
  getRecommendedJobs,
} from "../services/developerService";

export async function listDevelopers(
  _req: Request,
  res: Response
) {
  try {
    const developers = await getDevelopers();

    res.json({
      success: true,
      data: developers,
    });
  } catch (error) {
    console.error("Failed to fetch developers:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch developers",
    });
  }
}

export async function getDeveloper(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;

    const developer = await getDeveloperById(id);

    if (!developer) {
      return res.status(404).json({
        success: false,
        message: "Developer not found",
      });
    }

    res.json({
      success: true,
      data: developer,
    });
  } catch (error) {
    console.error("Failed to fetch developer:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch developer",
    });
  }
}

export async function recommendedJobs(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;

    const jobs = await getRecommendedJobs(id);

    res.json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error("Failed to fetch recommended jobs:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch recommended jobs",
    });
  }
}