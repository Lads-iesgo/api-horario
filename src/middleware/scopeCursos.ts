import { Request, Response, NextFunction } from "express";

export const scopeCursos = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	if (!req.user) {
		res.status(401).json({ message: "Usuário não autenticado" });
		return;
	}

	// Admin tem visão global — sem filtro de curso
	if (req.user.nomePerfil === "Admin") {
		req.scopedCursos = null;
	} else {
		req.scopedCursos = req.user.cursos.map((c) => c.idCurso);
	}

	next();
};
