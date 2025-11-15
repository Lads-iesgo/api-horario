import { Request, Response, NextFunction } from "express";
import { UserRole } from "../types/auth.types";

/**
 * Middleware para verificar se o usuário tem uma das roles permitidas
 */
export const requireRole = (allowedRoles: UserRole[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.user) {
			return res.status(401).json({
				success: false,
				message: "Usuário não autenticado",
			});
		}

		if (!allowedRoles.includes(req.user.role)) {
			return res.status(403).json({
				success: false,
				message: "Você não tem permissão para acessar este recurso",
			});
		}

		next();
	};
};

/**
 * Middleware para verificar se o usuário é Admin
 */
export const requireAdmin = () => {
	return requireRole([UserRole.ADMIN]);
};

/**
 * Middleware para verificar se o usuário é dono do recurso
 * Verifica se o ID do parâmetro da rota corresponde ao ID do usuário logado
 * Admins podem acessar qualquer recurso
 */
export const requireOwnership = (paramName: string = "id") => {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.user) {
			return res.status(401).json({
				success: false,
				message: "Usuário não autenticado",
			});
		}

		// Admin tem acesso a tudo
		if (req.user.role === UserRole.ADMIN) {
			return next();
		}

		const resourceId = req.params[paramName];

		// Verifica se o usuário é dono do recurso
		if (resourceId !== req.user.id) {
			return res.status(403).json({
				success: false,
				message:
					"Você não tem permissão para acessar ou modificar este recurso",
			});
		}

		next();
	};
};

/**
 * Middleware para verificar permissões de leitura
 * Professor: pode ler apenas seus próprios dados
 * Coordenador: pode ler apenas seus próprios dados
 * Admin: pode ler todos os dados
 */
export const requireReadPermission = (paramName: string = "id") => {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.user) {
			return res.status(401).json({
				success: false,
				message: "Usuário não autenticado",
			});
		}

		// Admin tem acesso a tudo
		if (req.user.role === UserRole.ADMIN) {
			return next();
		}

		const resourceId = req.params[paramName];

		// Professor e Coordenador só podem ler seus próprios dados
		if (
			req.user.role === UserRole.PROFESSOR ||
			req.user.role === UserRole.COORDENADOR
		) {
			if (resourceId && resourceId !== req.user.id) {
				return res.status(403).json({
					success: false,
					message: "Você só pode acessar seus próprios dados",
				});
			}
		}

		next();
	};
};

/**
 * Middleware para verificar permissões de escrita (criar, atualizar, deletar)
 * Professor: SEM permissão de escrita
 * Coordenador: pode escrever apenas seus próprios dados
 * Admin: pode escrever todos os dados
 */
export const requireWritePermission = (paramName: string = "id") => {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.user) {
			return res.status(401).json({
				success: false,
				message: "Usuário não autenticado",
			});
		}

		// Admin tem acesso a tudo
		if (req.user.role === UserRole.ADMIN) {
			return next();
		}

		// Professor NÃO pode fazer modificações
		if (req.user.role === UserRole.PROFESSOR) {
			return res.status(403).json({
				success: false,
				message: "Professores têm acesso apenas de leitura",
			});
		}

		// Coordenador pode modificar apenas seus próprios dados
		if (req.user.role === UserRole.COORDENADOR) {
			const resourceId = req.params[paramName];

			if (resourceId && resourceId !== req.user.id) {
				return res.status(403).json({
					success: false,
					message: "Você só pode modificar seus próprios dados",
				});
			}
		}

		next();
	};
};
