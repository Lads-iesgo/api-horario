"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const disciplinaController_1 = require("../controller/disciplinaController");
const router = express_1.default.Router();
//Rotas Perfil
router.get("/", disciplinaController_1.getDisciplina); // GET /disciplina
router.get("/:idDisciplina", disciplinaController_1.getDisciplinaById); // GET /disciplina/idDisciplina
router.get("/curso/:idCurso", disciplinaController_1.getDisciplinaByCurso); // GET /disciplina/curso/idCurso
router.post("/", disciplinaController_1.createDisciplina); // POST /disciplina
router.post("/curso", disciplinaController_1.createCursoDisciplina); // POST /disciplina/curso
exports.default = router;
