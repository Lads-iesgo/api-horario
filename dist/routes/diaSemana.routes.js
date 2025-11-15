"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const diaSemanaController_1 = require("../controller/diaSemanaController");
const router = express_1.default.Router();
//Rotas Perfil
router.get("/", diaSemanaController_1.getDiaSemana); // GET /diaSemana
router.get("/:idDiaSemana", diaSemanaController_1.getDiaSemanaById); // GET /diaSemana/idDiaSemana
exports.default = router;
