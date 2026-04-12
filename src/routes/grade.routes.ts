import express from "express";
import {
	getGrade,
	getGradeById,
	createGrade,
} from "../controller/gradeController";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = express.Router();

//Rotas Grade
router.get("/", authenticate, getGrade); // GET /grade
router.get("/:idGrade", authenticate, getGradeById); // GET /grade/idGrade
router.post("/", authenticate, authorize("Admin", "Coordenador"), createGrade); // POST /grade

export default router;
