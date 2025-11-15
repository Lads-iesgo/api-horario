"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const disponibilidadeController_1 = require("../controller/disponibilidadeController");
const router = express_1.default.Router();
//Rotas Perfil
router.get("/", disponibilidadeController_1.getDisponibilidade); // GET /disponibilidade
router.get("/:idProfessor", disponibilidadeController_1.getDisponibilidadeById); // GET /disponibilidade/idProfessor
router.post("/", disponibilidadeController_1.createDisponibilidade); // POST /disponibilidade
exports.default = router;
