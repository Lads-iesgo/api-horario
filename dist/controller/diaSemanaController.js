"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDiaSemanaById = exports.getDiaSemana = void 0;
const db_1 = __importDefault(require("../config/db"));
const getDiaSemana = async (req, res, next) => {
    try {
        const [rows] = await db_1.default.query("SELECT * FROM Dia_semana");
        res.status(200).json(rows);
    }
    catch (error) {
        next(error);
    }
};
exports.getDiaSemana = getDiaSemana;
const getDiaSemanaById = async (req, res, next) => {
    try {
        const idDiaSemana = req.params.idDiaSemana;
        const [rows] = await db_1.default.query("SELECT * FROM Dia_semana WHERE idDiaSemana = ?", [idDiaSemana]);
        if (Array.isArray(rows) && rows.length === 0) {
            res.status(404).json({ message: "Nenhum dia da semana encontrado" });
            return;
        }
        res.status(200).json(rows);
    }
    catch (error) {
        next(error);
    }
};
exports.getDiaSemanaById = getDiaSemanaById;
