import { Request, Response, NextFunction } from "express";
import * as professorDisciplinaService from "../services/professorDisciplinaService";

export const getProfessorDisciplina = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const rows = await professorDisciplinaService.findAll();
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const getProfessorDisciplinaById = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const idDisciplina = Number(req.params.idDisciplina);
		const rows = await professorDisciplinaService.findByDisciplina(idDisciplina);

		if (rows.length === 0) {
			res
				.status(404)
				.json({ message: "Nenhum professor vinculado a esta disciplina" });
			return;
		}

		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const getProfessorDisciplinaByProfessor = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const idProfessor = Number(req.params.idProfessor);
		const rows = await professorDisciplinaService.findByProfessor(idProfessor);

		if (rows.length === 0) {
			res
				.status(404)
				.json({ message: "Nenhuma disciplina vinculada a este professor" });
			return;
		}

		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const createProfessorDisciplina = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { idProfessor, idDisciplina } = req.body;
		if (!idProfessor || !idDisciplina) {
			res
				.status(400)
				.json({ message: "Selecione o professor e a disciplina" });
			return;
		}

		await professorDisciplinaService.create({ idProfessor, idDisciplina });

		res.status(201).json({
			message: "Professor vinculado à disciplina com sucesso",
			data: {
				idProfessor,
				idDisciplina,
			},
		});
	} catch (error) {
		next(error);
	}
};
