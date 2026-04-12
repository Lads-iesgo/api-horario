import express from "express";
import {
	getCelula,
	getCelulaCurso,
	createCelula,
	updateCelula,
	deleteCelula,
} from "../controller/celulaController";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = express.Router();

//Rotas Celula
router.get("/", authenticate, getCelula); // GET /celula
router.get("/:idCurso", authenticate, getCelulaCurso); // GET /celula/idCurso
router.post("/", authenticate, authorize("Admin", "Coordenador"), createCelula); // POST /celula
router.put("/:idCelula", authenticate, authorize("Admin", "Coordenador"), updateCelula); // PUT /celula/idCelula
router.delete("/:idCelula", authenticate, authorize("Admin", "Coordenador"), deleteCelula); // DELETE /celula/idCelula

export default router;
