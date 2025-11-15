"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const gradeController_1 = require("../controller/gradeController");
const router = express_1.default.Router();
//Rotas Perfil
router.get("/", gradeController_1.getGrade); // GET /grade
router.get("/:idGrade", gradeController_1.getGradeById); // GET /grade/idGrade
router.post("/", gradeController_1.createGrade); // POST /grade
exports.default = router;
