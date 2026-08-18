import { Router } from "express";
import {
  listDevelopers,
  getDeveloper,
  recommendedJobs,
} from "../controllers/developerController";

const router = Router();

router.get("/", listDevelopers);
router.get("/:id/jobs", recommendedJobs);
router.get("/:id", getDeveloper);

export default router;