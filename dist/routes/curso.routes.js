"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cursoController_1 = require("../controller/cursoController");
const router = express_1.default.Router();
//Rotas Perfil
router.get("/", cursoController_1.getCurso); // GET /curso
router.get("/:idCurso", cursoController_1.getCursoById); // GET /curso/idCurso
router.post("/", cursoController_1.createCurso); // POST /curso
exports.default = router;
