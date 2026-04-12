import { Request, Response, NextFunction } from "express";
import * as diaSemanaService from "../services/diaSemanaService";

export const getDiaSemana = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const rows = await diaSemanaService.findAll();
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const getDiaSemanaById = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const idDiaSemana = Number(req.params.idDiaSemana);
		const row = await diaSemanaService.findById(idDiaSemana);

		if (!row) {
			res.status(404).json({ message: "Nenhum dia da semana encontrado" });
			return;
		}

		res.status(200).json(row);
	} catch (error) {
		next(error);
	}
};
