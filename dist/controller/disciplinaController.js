"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCursoDisciplina = exports.createDisciplina = exports.getDisciplinaByCurso = exports.getDisciplinaById = exports.getDisciplina = void 0;
const db_1 = __importDefault(require("../config/db"));
const getDisciplina = async (req, res, next) => {
    try {
        const [rows] = await db_1.default.query("SELECT * FROM Disciplinas");
        res.status(200).json(rows);
    }
    catch (error) {
        next(error);
    }
};
exports.getDisciplina = getDisciplina;
const getDisciplinaById = async (req, res, next) => {
    try {
        const idDisciplina = req.params.idDisciplina;
        const [rows] = await db_1.default.query("SELECT * FROM Disciplinas WHERE idDisciplina = ?", [idDisciplina]);
        res.status(200).json(rows);
    }
    catch (error) {
        next(error);
    }
};
exports.getDisciplinaById = getDisciplinaById;
const getDisciplinaByCurso = async (req, res, next) => {
    try {
        const idCurso = req.params.idCurso;
        const [rows] = await db_1.default.query("SELECT * FROM vw_disciplina_curso WHERE idCurso = ?", [idCurso]);
        res.status(200).json(rows);
    }
    catch (error) {
        next(error);
    }
};
exports.getDisciplinaByCurso = getDisciplinaByCurso;
const createDisciplina = async (req, res, next) => {
    try {
        const { codigoDisciplina, nomeDisciplina, cargaHoraria, modalidade, tipoSala, semestreDisciplina, idCurso, } = req.body;
        // Validação dos campos obrigatórios
        if (!codigoDisciplina ||
            !nomeDisciplina ||
            !cargaHoraria ||
            !modalidade ||
            !tipoSala ||
            !semestreDisciplina ||
            !idCurso) {
            res.status(400).json({
                message: "Todos os campos são obrigatórios",
            });
            return;
        }
        // Validação da modalidade
        const modalidadesValidas = ["Presencial", "Online", "Hibrido"];
        if (!modalidadesValidas.includes(modalidade)) {
            res.status(400).json({
                message: "Modalidade inválida",
                modalidadesValidas: modalidadesValidas,
            });
            return;
        }
        // Validação do tipo de sala
        const tiposSalasValidos = ["Laboratório", "Sala", "Sincrona"];
        if (!tiposSalasValidos.includes(tipoSala)) {
            res.status(400).json({
                message: "Tipo de sala inválido",
                tiposSalasValidos: tiposSalasValidos,
            });
            return;
        }
        // Validação da carga horária
        if (typeof cargaHoraria !== "number" || cargaHoraria <= 0) {
            res.status(400).json({
                message: "A carga horária deve ser um número positivo",
            });
            return;
        }
        // Validação do semestre
        if (typeof semestreDisciplina !== "number" || semestreDisciplina <= 0) {
            res.status(400).json({
                message: "O semestre deve ser um número positivo",
            });
            return;
        }
        // Verificar se o curso existe
        const [cursoRows] = await db_1.default.query("SELECT idCurso FROM Cursos WHERE idCurso = ?", [idCurso]);
        if (Array.isArray(cursoRows) && cursoRows.length === 0) {
            res.status(404).json({
                message: "Curso não encontrado",
            });
            return;
        }
        // Inserir a disciplina
        const [result] = await db_1.default.query(`INSERT INTO Disciplinas 
			(codigoDisciplina, nomeDisciplina, cargaHoraria, modalidade, tipoSala, semestreDisciplina) 
			VALUES (?, ?, ?, ?, ?, ?)`, [
            codigoDisciplina,
            nomeDisciplina,
            cargaHoraria,
            modalidade,
            tipoSala,
            semestreDisciplina,
        ]);
        const idDisciplina = result.insertId;
        // Vincular a disciplina ao curso na tabela curso_disciplina
        await db_1.default.query(`INSERT INTO curso_disciplina (idCurso, idDisciplina) VALUES (?, ?)`, [idCurso, idDisciplina]);
        res.status(201).json({
            message: "Disciplina criada e vinculada ao curso com sucesso",
            data: {
                idDisciplina,
                codigoDisciplina,
                nomeDisciplina,
                cargaHoraria,
                modalidade,
                tipoSala,
                semestreDisciplina,
                idCurso,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createDisciplina = createDisciplina;
const createCursoDisciplina = async (req, res, next) => {
    try {
        const { idDisciplina, idCurso } = req.body;
        // Validação dos campos obrigatórios
        if (!idDisciplina || !idCurso) {
            res.status(400).json({
                message: "Os campos idDisciplina e idCurso são obrigatórios",
            });
            return;
        }
        // Verificar se o curso existe
        const [cursoRows] = await db_1.default.query("SELECT idCurso FROM Cursos WHERE idCurso = ?", [idCurso]);
        if (Array.isArray(cursoRows) && cursoRows.length === 0) {
            res.status(404).json({
                message: "Curso não encontrado",
            });
            return;
        }
        // Verificar se a disciplina existe
        const [disciplinaRows] = await db_1.default.query("SELECT idDisciplina FROM Disciplinas WHERE idDisciplina = ?", [idDisciplina]);
        if (Array.isArray(disciplinaRows) && disciplinaRows.length === 0) {
            res.status(404).json({
                message: "Disciplina não encontrada",
            });
            return;
        }
        // Verificar se a relação já existe
        const [existingRows] = await db_1.default.query("SELECT * FROM curso_disciplina WHERE idCurso = ? AND idDisciplina = ?", [idCurso, idDisciplina]);
        if (Array.isArray(existingRows) && existingRows.length > 0) {
            res.status(409).json({
                message: "Esta disciplina já está vinculada a este curso",
            });
            return;
        }
        res.status(201).json({
            message: "Disciplina vinculada ao curso com sucesso",
            data: {
                idCurso,
                idDisciplina,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createCursoDisciplina = createCursoDisciplina;
