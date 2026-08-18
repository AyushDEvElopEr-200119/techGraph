import { Router } from "express";
import { listProjects } from "../controllers/projectController";

const router = Router();

router.get("/", listProjects);

export default router;