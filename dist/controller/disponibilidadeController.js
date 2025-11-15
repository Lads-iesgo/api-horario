"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDisponibilidade = exports.getDisponibilidadeById = exports.getDisponibilidade = void 0;
const db_1 = __importDefault(require("../config/db"));
const getDisponibilidade = async (req, res, next) => {
    try {
        const [rows] = await db_1.default.query("SELECT * FROM vw_disponbibilidade_professor");
        res.status(200).json(rows);
    }
    catch (error) {
        next(error);
    }
};
exports.getDisponibilidade = getDisponibilidade;
const getDisponibilidadeById = async (req, res, next) => {
    try {
        const idProfessor = req.params.idProfessor;
        const [rows] = await db_1.default.query("SELECT * FROM vw_disponbibilidade_professor WHERE idProfessor = ?", [idProfessor]);
        if (Array.isArray(rows) && rows.length === 0) {
            res
                .status(404)
                .json({ message: "Nenhum professor com esse id encontrado" });
            return;
        }
        res.status(200).json(rows);
    }
    catch (error) {
        next(error);
    }
};
exports.getDisponibilidadeById = getDisponibilidadeById;
const createDisponibilidade = async (req, res, next) => {
    try {
        const { idProfessor, idDiaSemana } = req.body;
        if (!idProfessor || !idDiaSemana) {
            res
                .status(400)
                .json({ message: "idProfessor e idDiaSemana são obrigatórios" });
            return;
        }
        const [result] = await db_1.default.query(`INSERT INTO Professor_Disponibilidade 
        (idProfessor, idDiaSemana) 
        VALUES (?, ?)`, [idProfessor, idDiaSemana]);
        res.status(201).json({
            message: "Disponibilidade cadastrada com sucesso",
            data: {
                idProfessor,
                idDiaSemana,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createDisponibilidade = createDisponibilidade;
