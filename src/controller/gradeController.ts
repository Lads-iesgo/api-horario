import { Request, Response, NextFunction } from "express";
import * as gradeService from "../services/gradeService";
import { isCursoInScope } from "../middleware/validateScope";

export const getGrade = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const rows = await gradeService.findAll(req.scopedCursos!);
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const getGradeById = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const idGrade = Number(req.params.idGrade);
		const row = await gradeService.findById(idGrade);

		if (!row) {
			res.status(404).json({ message: "Nenhuma grade encontrada" });
			return;
		}

		// Validar escopo: o curso da grade deve estar no escopo do usuário
		if (!isCursoInScope(req.scopedCursos, row.idCurso)) {
			res.status(403).json({
				message: "Você não tem permissão para acessar dados deste curso",
			});
			return;
		}

		res.status(200).json(row);
	} catch (error) {
		next(error);
	}
};

export const createGrade = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { idCurso, anoLetivo, semestreLetivo } = req.body;

		if (!idCurso || !anoLetivo || !semestreLetivo) {
			res.status(400).json({
				message: "Selecione o curso, ano letivo e semestre para criar a grade",
			});
			return;
		}

		// Validar escopo: só pode criar grade para cursos do seu escopo
		if (!isCursoInScope(req.scopedCursos, idCurso)) {
			res.status(403).json({
				message: "Você não tem permissão para criar grade para este curso",
			});
			return;
		}

		const grade = await gradeService.create({
			idCurso,
			anoLetivo,
			semestreLetivo,
		});

		res.status(201).json({
			message: "Grade criada com sucesso",
			data: grade,
		});
	} catch (error) {
		next(error);
	}
};
