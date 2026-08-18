import { Request, Response } from "express";
import { getProjects } from "../services/projectService";

export async function listProjects(
  _req: Request,
  res: Response
) {
  try {
    const projects = await getProjects();

    res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error("Failed to fetch projects:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
    });
  }
}