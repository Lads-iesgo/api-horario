"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.logout = exports.login = void 0;
const db_1 = __importDefault(require("../config/db"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const types_1 = require("../interface/types");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";
// Map idPerfil to role names
const getRole = (idPerfil) => {
    switch (idPerfil) {
        case 1:
            return types_1.UserRole.PROFESSOR;
        case 2:
            return types_1.UserRole.COORDENADOR;
        case 3:
            return types_1.UserRole.ADMIN;
        default:
            return types_1.UserRole.PROFESSOR; // Default to professor
    }
};
const login = async (req, res, next) => {
    try {
        const { emailUsuario, senha } = req.body;
        // Validate required fields
        if (!emailUsuario || !senha) {
            res.status(400).json({
                message: "Email e senha são obrigatórios",
            });
            return;
        }
        // Find user by email
        const [rows] = await db_1.default.query("SELECT * FROM usuarios WHERE emailUsuario = ? AND ativo = 1", [emailUsuario]);
        if (!Array.isArray(rows) || rows.length === 0) {
            res.status(401).json({
                message: "Email ou senha inválidos",
            });
            return;
        }
        const user = rows[0];
        // Verify password
        const isPasswordValid = await bcryptjs_1.default.compare(senha, user.senha);
        if (!isPasswordValid) {
            res.status(401).json({
                message: "Email ou senha inválidos",
            });
            return;
        }
        // Get user role
        const role = getRole(user.idPerfil);
        // Create JWT payload
        const payload = {
            idUsuario: user.idUsuario,
            emailUsuario: user.emailUsuario,
            nomeUsuario: user.nomeUsuario,
            role: role,
            idPerfil: user.idPerfil,
        };
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
            expiresIn: "24h",
        });
        // Set cookie with token
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        });
        // Return user info and role (without password)
        res.status(200).json({
            message: "Login realizado com sucesso",
            user: {
                idUsuario: user.idUsuario,
                nomeUsuario: user.nomeUsuario,
                emailUsuario: user.emailUsuario,
                role: role,
                idPerfil: user.idPerfil,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const logout = async (req, res, next) => {
    try {
        res.clearCookie("token");
        res.status(200).json({
            message: "Logout realizado com sucesso",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
const me = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Não autenticado" });
            return;
        }
        res.status(200).json({
            user: req.user,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.me = me;
