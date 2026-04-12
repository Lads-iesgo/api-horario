import { Request, Response, NextFunction } from "express";
import * as authService from "../services/authService";

export const login = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { email, senha } = req.body;

		if (!email || !senha) {
			res
				.status(400)
				.json({ message: "Os campos email e senha são obrigatórios" });
			return;
		}

		const result = await authService.login(email, senha);

		if (!result) {
			res.status(401).json({ message: "Email ou senha incorretos" });
			return;
		}

		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
};
