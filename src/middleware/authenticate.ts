import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export const authenticate = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		res.status(401).json({ message: "Sessão não encontrada. Faça login novamente" });
		return;
	}

	const token = authHeader.split(" ")[1];

	try {
		const decoded = jwt.verify(token, JWT_SECRET) as {
			idUsuario: number;
			nomePerfil: string;
			cursos: Array<{ idCurso: number; isCoordenador: boolean }>;
		};

		req.user = {
			idUsuario: decoded.idUsuario,
			nomePerfil: decoded.nomePerfil,
			cursos: decoded.cursos,
		};

		// Escopo de cursos: Admin tem visão global, demais filtram por seus cursos
		if (decoded.nomePerfil === "admin") {
			req.scopedCursos = null;
		} else {
			req.scopedCursos = decoded.cursos.map((c) => c.idCurso);
		}

		next();
	} catch (error) {
		res.status(401).json({ message: "Sua sessão expirou. Faça login novamente" });
		return;
	}
};
