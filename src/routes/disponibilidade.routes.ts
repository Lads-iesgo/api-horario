import express from "express";
import {
	getDisponibilidade,
	getDisponibilidadeById,
	createDisponibilidade,
} from "../controller/disponibilidadeController";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = express.Router();

//Rotas Disponibilidade
router.get("/", authenticate, getDisponibilidade); // GET /disponibilidade
router.get("/:idProfessor", authenticate, getDisponibilidadeById); // GET /disponibilidade/idProfessor
router.post("/", authenticate, authorize("Admin", "Coordenador"), createDisponibilidade); // POST /disponibilidade

export default router;
