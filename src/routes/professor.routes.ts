import express from "express";
import {
	getProfessorById,
	getProfessor,
	getProfessorByCurso,
	getProfessorByCoordenador,
	createProfessor,
} from "../controller/professorController";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = express.Router();

//Rotas Professor
router.get("/", authenticate, getProfessor); // GET /professor
router.get("/:idProfessor", authenticate, getProfessorById); // GET /professor/idProfessor
router.get("/coordenador/:idCoordenador", authenticate, getProfessorByCoordenador); // GET /professor/coordenador/idCoordenador
router.get("/curso/:idCurso", authenticate, getProfessorByCurso); // GET /professor/curso/idCurso
router.post("/", authenticate, authorize("Admin", "Coordenador"), createProfessor); // POST /professor

export default router;
