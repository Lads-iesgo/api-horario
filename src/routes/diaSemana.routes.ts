import express from "express";
import {
	getDiaSemana,
	getDiaSemanaById,
} from "../controller/diaSemanaController";
import { authenticate } from "../middleware/authenticate";

const router = express.Router();

//Rotas Dia Semana
router.get("/", authenticate, getDiaSemana); // GET /diaSemana
router.get("/:idDiaSemana", authenticate, getDiaSemanaById); // GET /diaSemana/idDiaSemana

export default router;
