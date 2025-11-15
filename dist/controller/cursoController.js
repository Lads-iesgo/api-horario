"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCurso = exports.getCursoById = exports.getCurso = void 0;
const db_1 = __importDefault(require("../config/db"));
const getCurso = async (req, res, next) => {
    try {
        const [rows] = await db_1.default.query("SELECT * FROM Cursos");
        res.status(200).json(rows);
    }
    catch (error) {
        next(error);
    }
};
exports.getCurso = getCurso;
const getCursoById = async (req, res, next) => {
    try {
        const idCurso = req.params.idCurso;
        const [rows] = await db_1.default.query("SELECT * FROM Cursos WHERE idCurso = ?", [
            idCurso,
        ]);
        res.status(200).json(rows);
    }
    catch (error) {
        next(error);
    }
};
exports.getCursoById = getCursoById;
const createCurso = async (req, res, next) => {
    try {
        const { nomeCurso, descricaoCurso, duracaoSemestres } = req.body;
        // Validação dos campos obrigatórios
        if (!nomeCurso || !duracaoSemestres) {
            res.status(400).json({
                message: "Os campos nomeCurso e duracaoSemestres são obrigatórios",
            });
            return;
        }
        // Validação do tipo de duracaoSemestres
        if (isNaN(duracaoSemestres) || duracaoSemestres <= 0) {
            res.status(400).json({
                message: "O campo duracaoSemestres deve ser um número positivo",
            });
            return;
        }
        // Inserir o curso no banco de dados
        const [result] = await db_1.default.query(`INSERT INTO Cursos (nomeCurso, descricaoCurso, duracaoSemestres) VALUES (?, ?, ?)`, [nomeCurso, descricaoCurso || null, duracaoSemestres]);
        res.status(201).json({
            message: "Curso criado com sucesso",
            data: {
                idCurso: result.insertId,
                nomeCurso,
                descricaoCurso: descricaoCurso || null,
                duracaoSemestres,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createCurso = createCurso;
