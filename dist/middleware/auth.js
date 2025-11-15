"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireOwnershipOrRole = exports.requireRole = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const types_1 = require("../interface/types");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";
// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            res.status(401).json({ message: "Token não fornecido" });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(403).json({ message: "Token inválido ou expirado" });
        return;
    }
};
exports.authenticateToken = authenticateToken;
// Middleware to check if user has required role(s)
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ message: "Usuário não autenticado" });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                message: "Você não tem permissão para acessar este recurso",
            });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
// Middleware to check if user can access their own data or is admin/coordenador
const requireOwnershipOrRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ message: "Usuário não autenticado" });
            return;
        }
        const resourceUserId = parseInt(req.params.idUsuario || req.params.idProfessor || "0");
        // Admin has access to everything
        if (req.user.role === types_1.UserRole.ADMIN) {
            next();
            return;
        }
        // Check if user has one of the allowed roles
        if (allowedRoles.includes(req.user.role)) {
            next();
            return;
        }
        // Check if user is accessing their own data
        if (resourceUserId && resourceUserId === req.user.idUsuario) {
            next();
            return;
        }
        res.status(403).json({
            message: "Você não tem permissão para acessar este recurso",
        });
        return;
    };
};
exports.requireOwnershipOrRole = requireOwnershipOrRole;
