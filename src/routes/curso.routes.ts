import express from "express";
import {
	getCurso,
	getCursoById,
	createCurso,
} from "../controller/cursoController";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = express.Router();

//Rotas Curso
router.get("/", authenticate, getCurso); // GET /curso
router.get("/:idCurso", authenticate, getCursoById); // GET /curso/idCurso
router.post("/", authenticate, authorize("Admin"), createCurso); // POST /curso

export default router;
