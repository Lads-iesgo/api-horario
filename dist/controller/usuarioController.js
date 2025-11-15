"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUsuario = exports.getUsuarioById = exports.getUsuario = void 0;
const db_1 = __importDefault(require("../config/db"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const getUsuario = async (req, res, next) => {
    try {
        const [rows] = await db_1.default.query("SELECT * FROM usuarios");
        res.status(200).json(rows);
    }
    catch (error) {
        next(error);
    }
};
exports.getUsuario = getUsuario;
const getUsuarioById = async (req, res, next) => {
    try {
        const idUsuario = req.params.idUsuario;
        const [rows] = await db_1.default.query("SELECT * FROM usuarios WHERE idUsuario = ?", [idUsuario]);
        res.status(200).json(rows);
    }
    catch (error) {
        next(error);
    }
};
exports.getUsuarioById = getUsuarioById;
const createUsuario = async (req, res, next) => {
    try {
        const { nomeUsuario, emailUsuario, senha, idPerfil, ativo } = req.body;
        if (!nomeUsuario || !emailUsuario || !senha || !idPerfil) {
            res.status(400).json({
                message: "nomeUsuario, emailUsuario, senha e idPerfil são obrigatórios",
            });
            return;
        }
        // Hash password before storing
        const hashedPassword = await bcryptjs_1.default.hash(senha, 10);
        const [result] = await db_1.default.query(`INSERT INTO usuarios 
        (nomeUsuario, emailUsuario, senha, idPerfil, ativo)
        VALUES (?, ?, ?, ?, 1)`, [nomeUsuario, emailUsuario, hashedPassword, idPerfil, ativo]);
        res.status(201).json({
            message: "Usuário criado com sucesso",
            data: {
                idUsuario: result.insertId,
                nomeUsuario,
                emailUsuario,
                idPerfil,
                ativo: ativo,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createUsuario = createUsuario;
