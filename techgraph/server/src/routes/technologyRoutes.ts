import { Router } from "express";
import { listTechnologies } from "../controllers/technologyController";

const router = Router();

router.get("/", listTechnologies);

export default router;