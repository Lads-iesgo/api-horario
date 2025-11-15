"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const professorDisciplinaController_1 = require("../controller/professorDisciplinaController");
const router = express_1.default.Router();
//Rotas Perfil
router.get("/", professorDisciplinaController_1.getProfessorDisciplina); // GET /professorDisciplina
router.get("/:idDisciplina", professorDisciplinaController_1.getProfessorDisciplinaById); // GET /professorDisciplina/idDisciplina
router.post("/", professorDisciplinaController_1.createProfessorDisciplina); // POST /professorDisciplina
exports.default = router;
