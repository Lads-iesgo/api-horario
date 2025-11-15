"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGrade = exports.getGradeById = exports.getGrade = void 0;
const db_1 = __importDefault(require("../config/db"));
const getGrade = async (req, res, next) => {
    try {
        const [rows] = await db_1.default.query("SELECT * FROM Grade");
        res.status(200).json(rows);
    }
    catch (error) {
        next(error);
    }
};
exports.getGrade = getGrade;
const getGradeById = async (req, res, next) => {
    try {
        const idGrade = req.params.idGrade;
        const [rows] = await db_1.default.query("SELECT * FROM Grade WHERE idGrade = ?", [
            idGrade,
        ]);
        if (Array.isArray(rows) && rows.length === 0) {
            res.status(404).json({ message: "Nenhuma grade encontrada" });
            return;
        }
        res.status(200).json(rows);
    }
    catch (error) {
        next(error);
    }
};
exports.getGradeById = getGradeById;
const createGrade = async (req, res, next) => {
    try {
        const { idCurso, semestre_letivo } = req.body;
        if (!idCurso || !semestre_letivo) {
            res
                .status(400)
                .json({ message: "idCurso e semestre_letivo são obrigatórios" });
            return;
        }
        const [result] = await db_1.default.query(`INSERT INTO Grade 
        (idCurso, semestre_letivo, data_criacao) 
        VALUES (?, ?)`, [idCurso, semestre_letivo]);
        res.status(201).json({
            message: "Grade criada com sucesso",
            data: {
                idCurso,
                semestre_letivo,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createGrade = createGrade;
