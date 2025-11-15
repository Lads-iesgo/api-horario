"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const celulaController_1 = require("../controller/celulaController");
const router = express_1.default.Router();
//Rotas Perfil
router.get("/", celulaController_1.getCelula); // GET /celula
router.get("/:idCurso", celulaController_1.getCelulaCurso); // GET /celula/idCurso
router.post("/", celulaController_1.createCelula); // POST /celula
router.delete("/:idCelula", celulaController_1.deleteCelula); // DELETE /celula/idCelula
exports.default = router;
