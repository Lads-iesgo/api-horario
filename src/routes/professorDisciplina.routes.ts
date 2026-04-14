import express from "express";
import {
	getProfessorDisciplina,
	getProfessorDisciplinaById,
	getProfessorDisciplinaByProfessor,
	createProfessorDisciplina,
} from "../controller/professorDisciplinaController";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = express.Router();

//Rotas Professor Disciplina
router.get("/", authenticate, getProfessorDisciplina); // GET /professorDisciplina
router.get("/professor/:idProfessor", authenticate, getProfessorDisciplinaByProfessor); // GET /professorDisciplina/professor/:idProfessor
router.get("/:idDisciplina", authenticate, getProfessorDisciplinaById); // GET /professorDisciplina/idDisciplina
router.post("/", authenticate, authorize("Admin", "Coordenador"), createProfessorDisciplina); // POST /professorDisciplina

export default router;
