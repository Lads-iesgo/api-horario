import express from "express";
import { getSala, getSalaById, createSala } from "../controller/salaController";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = express.Router();

//Rotas Sala
router.get("/", authenticate, getSala); // GET /sala
router.get("/:idSala", authenticate, getSalaById); // GET /sala/idSala
router.post("/", authenticate, authorize("Admin", "Coordenador"), createSala); // POST /sala

export default router;
