import { Router } from "express";
import { getUniversitiesController } from "../controllers/university.controller";

const universityRoutes = Router();

universityRoutes.get("/", getUniversitiesController);

export default universityRoutes;
