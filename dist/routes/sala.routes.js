"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const salaController_1 = require("../controller/salaController");
const router = express_1.default.Router();
//Rotas Sala
router.get("/", salaController_1.getSala); // GET /sala
router.get("/:idSala", salaController_1.getSalaById); // GET /sala/idSala
router.post("/", salaController_1.createSala); // POST /sala
exports.default = router;
