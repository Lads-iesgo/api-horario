import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt.config";
import { JWTPayload, UserPayload } from "../types/auth.types";

export const authenticate = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		// Busca o token do cookie
		const token = req.cookies?.authToken;

		if (!token) {
			return res.status(401).json({
				success: false,
				message: "Token de autenticação não fornecido",
			});
		}

		// Verifica e decodifica o token
		const decoded = jwt.verify(token, jwtConfig.secret) as JWTPayload;

		// Anexa as informações do usuário ao request
		req.user = {
			id: decoded.userId,
			email: decoded.email,
			name: decoded.name,
			role: decoded.role,
		};

		next();
	} catch (error) {
		if (error instanceof jwt.JsonWebTokenError) {
			return res.status(401).json({
				success: false,
				message: "Token inválido",
			});
		}

		if (error instanceof jwt.TokenExpiredError) {
			return res.status(401).json({
				success: false,
				message: "Token expirado",
			});
		}

		return res.status(500).json({
			success: false,
			message: "Erro ao verificar autenticação",
		});
	}
};
