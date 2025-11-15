"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const professorController_1 = require("../controller/professorController");
const router = express_1.default.Router();
//Rotas Professor
router.get("/", professorController_1.getProfessor); // GET /professor
router.get("/:idProfessor", professorController_1.getProfessorById); // GET /professor/idProfessor
router.get("/coordenador/:idCoordenador", professorController_1.getProfessorByCoordenador); // GET /professor/coordenador/idCoordenador
router.get("/curso/:idCurso", professorController_1.getProfessorByCurso); // GET /professor/curso/idCurso
router.post("/", professorController_1.createProfessor); // POST /professor
exports.default = router;
