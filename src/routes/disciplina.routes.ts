import express from "express";
import {
	getDisciplina,
	getDisciplinaById,
	getDisciplinaByCurso,
	createDisciplina,
	createCursoDisciplina,
} from "../controller/disciplinaController";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = express.Router();

//Rotas Disciplina
router.get("/", authenticate, getDisciplina); // GET /disciplina
router.get("/:idDisciplina", authenticate, getDisciplinaById); // GET /disciplina/idDisciplina
router.get("/curso/:idCurso", authenticate, getDisciplinaByCurso); // GET /disciplina/curso/idCurso
router.post("/", authenticate, authorize("Admin", "Coordenador"), createDisciplina); // POST /disciplina
router.post("/curso", authenticate, authorize("Admin", "Coordenador"), createCursoDisciplina); // POST /disciplina/curso

export default router;
