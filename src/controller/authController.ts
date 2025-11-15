import pool from "../config/db";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRole, Usuario } from "../interface/types";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

// Map idPerfil to role names
const getRole = (idPerfil: number): UserRole => {
	switch (idPerfil) {
		case 1:
			return UserRole.PROFESSOR;
		case 2:
			return UserRole.COORDENADOR;
		case 3:
			return UserRole.ADMIN;
		default:
			return UserRole.PROFESSOR; // Default to professor
	}
};

export const login = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
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
		const [rows]: any = await pool.query(
			"SELECT * FROM usuarios WHERE emailUsuario = ? AND ativo = 1",
			[emailUsuario],
		);

		if (!Array.isArray(rows) || rows.length === 0) {
			res.status(401).json({
				message: "Email ou senha inválidos",
			});
			return;
		}

		const user = rows[0] as Usuario;

		// Verify password
		const isPasswordValid = await bcrypt.compare(senha, user.senha);

		if (!isPasswordValid) {
			res.status(401).json({
				message: "Email ou senha inválidos",
			});
			return;
		}

		// Get user role
		const role = getRole(user.idPerfil);

		// Create JWT payload
		const payload: any = {
			idUsuario: user.idUsuario,
			emailUsuario: user.emailUsuario,
			nomeUsuario: user.nomeUsuario,
			role: role,
			idPerfil: user.idPerfil,
		};

		// Generate JWT token
		const token = jwt.sign(payload, JWT_SECRET, {
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
	} catch (error) {
		next(error);
	}
};

export const logout = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		res.clearCookie("token");
		res.status(200).json({
			message: "Logout realizado com sucesso",
		});
	} catch (error) {
		next(error);
	}
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (!req.user) {
			res.status(401).json({ message: "Não autenticado" });
			return;
		}

		res.status(200).json({
			user: req.user,
		});
	} catch (error) {
		next(error);
	}
};
