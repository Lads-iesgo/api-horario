import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload, UserRole } from "../interface/types";

// Extend Express Request interface to include user
declare global {
	namespace Express {
		interface Request {
			user?: JwtPayload;
		}
	}
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

// Middleware to verify JWT token
export const authenticateToken = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	try {
		const token = req.cookies?.token;

		if (!token) {
			res.status(401).json({ message: "Token não fornecido" });
			return;
		}

		const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
		req.user = decoded;
		next();
	} catch (error) {
		res.status(403).json({ message: "Token inválido ou expirado" });
		return;
	}
};

// Middleware to check if user has required role(s)
export const requireRole = (...allowedRoles: UserRole[]) => {
	return (req: Request, res: Response, next: NextFunction): void => {
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

// Middleware to check if user can access their own data or is admin/coordenador
export const requireOwnershipOrRole = (
	...allowedRoles: UserRole[]
) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		if (!req.user) {
			res.status(401).json({ message: "Usuário não autenticado" });
			return;
		}

		const resourceUserId = parseInt(
			req.params.idUsuario || req.params.idProfessor || "0",
		);

		// Admin has access to everything
		if (req.user.role === UserRole.ADMIN) {
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
