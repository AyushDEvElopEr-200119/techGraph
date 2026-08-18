import { Router } from "express";
import { listJobs } from "../controllers/jobController";

const router = Router();

router.get("/", listJobs);

export default router;