import { Request, Response, NextFunction } from "express";
import * as cursoService from "../services/cursoService";

export const getCurso = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const rows = await cursoService.findAll();
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const getCursoById = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const idCurso = Number(req.params.idCurso);
		const row = await cursoService.findById(idCurso);
		res.status(200).json(row);
	} catch (error) {
		next(error);
	}
};

export const createCurso = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { codigoCurso, nomeCurso, descricaoCurso, duracaoSemestres } = req.body;

		// Validação dos campos obrigatórios
		if (!nomeCurso || !duracaoSemestres) {
			res.status(400).json({
				message: "Os campos nomeCurso e duracaoSemestres são obrigatórios",
			});
			return;
		}

		// Validação do tipo de duracaoSemestres
		if (isNaN(duracaoSemestres) || duracaoSemestres <= 0) {
			res.status(400).json({
				message: "O campo duracaoSemestres deve ser um número positivo",
			});
			return;
		}

		const curso = await cursoService.create({
			codigoCurso,
			nomeCurso,
			descricaoCurso: descricaoCurso || null,
			duracaoSemestres,
		});

		res.status(201).json({
			message: "Curso criado com sucesso",
			data: curso,
		});
	} catch (error) {
		next(error);
	}
};
