import express from "express";
import {
	getUsuario,
	getUsuarioById,
	createUsuario,
} from "../controller/usuarioController";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = express.Router();

//Rotas Usuario
router.get("/", authenticate, getUsuario); // GET /usuario
router.get("/:idUsuario", authenticate, getUsuarioById); // GET /usuario/idUsuario
router.post("/", authenticate, authorize("Admin"), createUsuario); // POST /usuario

export default router;
