"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProfessor = exports.getProfessorByCurso = exports.getProfessorByCoordenador = exports.getProfessorById = exports.getProfessor = void 0;
const db_1 = __importDefault(require("../config/db"));
const getProfessor = async (req, res, next) => {
    try {
        const [rows] = await db_1.default.query("SELECT * FROM Professores");
        res.status(200).json(rows);
    }
    catch (error) {
        next(error);
    }
};
exports.getProfessor = getProfessor;
const getProfessorById = async (req, res, next) => {
    try {
        const idProfessor = req.params.idProfessor;
        const [rows] = await db_1.default.query("SELECT * FROM Professores WHERE idProfessor = ?", [idProfessor]);
        res.status(200).json(rows);
    }
    catch (error) {
        next(error);
    }
};
exports.getProfessorById = getProfessorById;
const getProfessorByCoordenador = async (req, res, next) => {
    try {
        const coordenador_idProfessor = req.params.coordenador_idProfessor;
        const [rows] = await db_1.default.query("SELECT * FROM vw_professor_coordenador WHERE coordenador_idProfessor = ?", [coordenador_idProfessor]);
        res.status(200).json(rows);
    }
    catch (error) {
        next(error);
    }
};
exports.getProfessorByCoordenador = getProfessorByCoordenador;
const getProfessorByCurso = async (req, res, next) => {
    try {
        const idCurso = req.params.idCurso;
        const [rows] = await db_1.default.query("SELECT * FROM vw_professor_curso WHERE idCurso = ?", [idCurso]);
        res.status(200).json(rows);
    }
    catch (error) {
        next(error);
    }
};
exports.getProfessorByCurso = getProfessorByCurso;
const createProfessor = async (req, res, next) => {
    try {
        const { nomeProfessor, email, titulacao, curriculo_lattes, coordenador_idProfessor, } = req.body;
        // Validação dos campos obrigatórios
        if (!nomeProfessor || !email || !titulacao) {
            res.status(400).json({
                message: "Os campos nomeProfessor, email e titulacao são obrigatórios",
            });
            return;
        }
        // Validação do formato do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({
                message: "Formato de email inválido",
            });
            return;
        }
        // Validação da titulação
        const titulacoesValidas = [
            "Graduado",
            "Especialista",
            "Mestre",
            "Doutor",
            "Pos Doutor",
        ];
        if (!titulacoesValidas.includes(titulacao)) {
            res.status(400).json({
                message: "Titulação inválida",
                titulacoesValidas: titulacoesValidas,
            });
            return;
        }
        // Verificar se o email já está cadastrado
        const [emailExists] = await db_1.default.query("SELECT idProfessor FROM Professores WHERE email = ?", [email]);
        if (Array.isArray(emailExists) && emailExists.length > 0) {
            res.status(409).json({
                message: "Este email já está cadastrado",
            });
            return;
        }
        // Se coordenador_idProfessor foi fornecido, validar se existe
        if (coordenador_idProfessor) {
            const [coordenadorRows] = await db_1.default.query("SELECT idProfessor FROM Professores WHERE idProfessor = ?", [coordenador_idProfessor]);
            if (!Array.isArray(coordenadorRows) || coordenadorRows.length === 0) {
                res.status(404).json({
                    message: "Professor coordenador não encontrado",
                });
                return;
            }
        }
        // Inserir o professor
        const [result] = await db_1.default.query(`INSERT INTO Professores 
            (nomeProfessor, email, titulacao, curriculo_lattes, coordenador_idProfessor) 
            VALUES (?, ?, ?, ?, ?)`, [
            nomeProfessor,
            email,
            titulacao,
            curriculo_lattes || null,
            coordenador_idProfessor || null,
        ]);
        const idProfessor = result.insertId;
        res.status(201).json({
            message: "Professor criado com sucesso",
            data: {
                idProfessor,
                nomeProfessor,
                email,
                titulacao,
                curriculo_lattes: curriculo_lattes || null,
                coordenador_idProfessor: coordenador_idProfessor || null,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createProfessor = createProfessor;
