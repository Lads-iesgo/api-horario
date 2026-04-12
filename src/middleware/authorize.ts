import { Request, Response, NextFunction } from "express";

export const authorize = (...perfisPermitidos: string[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.user) {
			res.status(401).json({ message: "Você precisa estar logado para acessar esta funcionalidade" });
			return;
		}

		const perfilLower = req.user.nomePerfil.toLowerCase();
		if (!perfisPermitidos.some((p) => p.toLowerCase() === perfilLower)) {
			res.status(403).json({
				message: "Acesso negado. Você não tem permissão para esta ação",
			});
			return;
		}

		next();
	};
};
