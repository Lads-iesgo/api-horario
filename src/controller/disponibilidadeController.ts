import { Request, Response, NextFunction } from "express";
import * as disponibilidadeService from "../services/disponibilidadeService";

export const getDisponibilidade = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const rows = await disponibilidadeService.findAll();
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const getDisponibilidadeById = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const idProfessor = Number(req.params.idProfessor);
		const rows = await disponibilidadeService.findByProfessor(idProfessor);

		if (rows.length === 0) {
			res
				.status(404)
				.json({ message: "Nenhuma disponibilidade cadastrada para este professor" });
			return;
		}

		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const createDisponibilidade = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { idProfessor, idDiaSemana } = req.body;
		if (!idProfessor || !idDiaSemana) {
			res
				.status(400)
				.json({ message: "Selecione o professor e o dia da semana" });
			return;
		}

		await disponibilidadeService.create({ idProfessor, idDiaSemana });

		res.status(201).json({
			message: "Disponibilidade cadastrada com sucesso",
			data: {
				idProfessor,
				idDiaSemana,
			},
		});
	} catch (error) {
		next(error);
	}
};
