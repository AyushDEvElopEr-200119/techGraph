import { Request, Response } from "express";
import { getTechnologies } from "../services/technologyService";

export async function listTechnologies(
  _req: Request,
  res: Response
) {
  try {
    const technologies = await getTechnologies();

    res.json({
      success: true,
      data: technologies,
    });
  } catch (error) {
    console.error("Failed to fetch technologies:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch technologies",
    });
  }
}