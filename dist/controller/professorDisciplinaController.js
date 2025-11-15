"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProfessorDisciplina = exports.getProfessorDisciplinaById = exports.getProfessorDisciplina = void 0;
const db_1 = __importDefault(require("../config/db"));
const getProfessorDisciplina = async (req, res, next) => {
    try {
        const [rows] = await db_1.default.query("SELECT * FROM vw_disciplina_professor");
        res.status(200).json(rows);
    }
    catch (error) {
        next(error);
    }
};
exports.getProfessorDisciplina = getProfessorDisciplina;
const getProfessorDisciplinaById = async (req, res, next) => {
    try {
        const idDisciplina = req.params.idDisciplina;
        const [rows] = await db_1.default.query("SELECT * FROM vw_disciplina_professor WHERE idDisciplina = ?", [idDisciplina]);
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
exports.getProfessorDisciplinaById = getProfessorDisciplinaById;
const createProfessorDisciplina = async (req, res, next) => {
    try {
        const { idProfessor, idDisciplina } = req.body;
        if (!idProfessor || !idDisciplina) {
            res
                .status(400)
                .json({ message: "idProfessor e idDisciplina são obrigatórios" });
            return;
        }
        const [result] = await db_1.default.query(`INSERT INTO Disciplina_Professor 
        (idProfessor, idDisciplina) 
        VALUES (?, ?)`, [idProfessor, idDisciplina]);
        res.status(201).json({
            message: "Disponibilidade cadastrada com sucesso",
            data: {
                idProfessor,
                idDisciplina,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createProfessorDisciplina = createProfessorDisciplina;
