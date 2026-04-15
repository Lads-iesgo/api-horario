import { Request, Response, NextFunction } from "express";
import * as celulaService from "../services/celulaService";
import { isCursoInScope } from "../middleware/validateScope";

interface ConflictResult {
	status: number;
	body: object;
}

// Validação centralizada de conflitos — usada por create e update
// propagacaoGradeIds: grades onde a disciplina será propagada (exclui dos checks de "outro curso")
// excludeIds: IDs de células a ignorar (para update de registros já existentes)
const validateConflicts = async (
	idGrade: number,
	idDisciplina: number,
	idProfessor: number,
	idDiaSemana: number,
	semestre: number,
	novaCelula: { professor: string; disciplina: string; curso: string; diaSemana: string },
	propagacaoGradeIds: number[],
	excludeIds?: number[],
): Promise<ConflictResult | null> => {
	// 1. Disciplina já existe na mesma grade/semestre (independente do dia)
	const discGradeConflict = await celulaService.findConflictDisciplinaMesmaGrade(
		idDisciplina,
		idGrade,
		semestre,
		excludeIds,
	);

	if (discGradeConflict.length > 0) {
		const c = discGradeConflict[0];
		return {
			status: 409,
			body: {
				message: `A disciplina "${novaCelula.disciplina}" já está cadastrada no curso "${c.curso}", semestre ${c.semestreCelula}, dia ${c.dia_semana}`,
				tipo: "disciplina_mesma_grade",
				tentativa: {
					curso: novaCelula.curso,
					disciplina: novaCelula.disciplina,
					professor: novaCelula.professor,
					dia: novaCelula.diaSemana,
					semestre,
				},
				conflito: {
					curso: c.curso,
					disciplina: c.disciplina,
					professor: c.professor,
					dia: c.dia_semana,
					semestre: c.semestreCelula,
				},
			},
		};
	}

	// 2. Disciplina já alocada no mesmo dia — exclui grades de propagação (pois é esperado)
	const discDiaConflict = await celulaService.findConflictDisciplinaMesmoDia(
		idDisciplina,
		idDiaSemana,
		excludeIds,
		propagacaoGradeIds,
	);

	if (discDiaConflict.length > 0) {
		const c = discDiaConflict[0];
		return {
			status: 409,
			body: {
				message: `A disciplina "${novaCelula.disciplina}" já está cadastrada no curso "${c.curso}", dia ${c.dia_semana}, semestre ${c.semestreCelula}`,
				tipo: "disciplina_mesmo_dia",
				tentativa: {
					curso: novaCelula.curso,
					disciplina: novaCelula.disciplina,
					professor: novaCelula.professor,
					dia: novaCelula.diaSemana,
					semestre,
				},
				conflito: {
					curso: c.curso,
					disciplina: c.disciplina,
					professor: c.professor,
					dia: c.dia_semana,
					semestre: c.semestreCelula,
				},
			},
		};
	}

	// 3. Professor já alocado no mesmo dia (qualquer curso)
	const profDiaConflict = await celulaService.findConflictProfessorMesmoDia(
		idProfessor,
		idDiaSemana,
		excludeIds,
	);

	if (profDiaConflict.length > 0) {
		const c = profDiaConflict[0];
		return {
			status: 409,
			body: {
				message: `O professor "${novaCelula.professor}" já está alocado na disciplina "${c.disciplina}" do curso "${c.curso}" no dia ${c.dia_semana}`,
				tipo: "professor_mesmo_dia",
				tentativa: {
					curso: novaCelula.curso,
					disciplina: novaCelula.disciplina,
					professor: novaCelula.professor,
					dia: novaCelula.diaSemana,
					semestre,
				},
				conflito: {
					curso: c.curso,
					disciplina: c.disciplina,
					professor: c.professor,
					dia: c.dia_semana,
					semestre: c.semestreCelula,
				},
			},
		};
	}

	// 4. Professor já leciona mesma disciplina em outro curso — exclui grades de propagação
	const profDiscConflict = await celulaService.findConflictProfessorMesmaDisciplina(
		idProfessor,
		idDisciplina,
		idGrade,
		excludeIds,
		propagacaoGradeIds,
	);

	if (profDiscConflict.length > 0) {
		const c = profDiscConflict[0];
		return {
			status: 409,
			body: {
				message: `O professor "${novaCelula.professor}" já leciona a disciplina "${c.disciplina}" no curso "${c.curso}" (dia ${c.dia_semana})`,
				tipo: "professor_mesma_disciplina",
				tentativa: {
					curso: novaCelula.curso,
					disciplina: novaCelula.disciplina,
					professor: novaCelula.professor,
					dia: novaCelula.diaSemana,
					semestre,
				},
				conflito: {
					curso: c.curso,
					disciplina: c.disciplina,
					professor: c.professor,
					dia: c.dia_semana,
					semestre: c.semestreCelula,
				},
			},
		};
	}

	return null;
};

export const getCelula = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const rows = await celulaService.findAll(req.scopedCursos!);
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const getCelulaByProfessor = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const idProfessor = Number(req.params.idProfessor);
		const rows = await celulaService.findByProfessor(idProfessor);
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const getCelulaCurso = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const idCurso = Number(req.params.idCurso);

		if (!isCursoInScope(req.scopedCursos, idCurso)) {
			res.status(403).json({
				message: "Você não tem permissão para acessar dados deste curso",
			});
			return;
		}

		const rows = await celulaService.findByCurso(idCurso);

		if (rows.length === 0) {
			res
				.status(404)
				.json({ message: "Nenhuma célula encontrada para este curso" });
			return;
		}

		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const createCelula = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { idGrade, idDisciplina, idProfessor, idDiaSemana, semestre } =
			req.body;

		if (
			!idGrade ||
			!idDisciplina ||
			!idProfessor ||
			!idDiaSemana ||
			!semestre
		) {
			res.status(400).json({ message: "Preencha todos os campos para cadastrar a aula (grade, disciplina, professor, dia e semestre)" });
			return;
		}

		const novaCelula = await celulaService.getNovaCelulaInfo(
			idProfessor,
			idDisciplina,
			idGrade,
			idDiaSemana,
		);

		if (!novaCelula) {
			res.status(404).json({
				message: "Um dos dados selecionados (professor, disciplina, grade ou dia da semana) não foi encontrado no sistema",
			});
			return;
		}

		if (!isCursoInScope(req.scopedCursos, novaCelula.idCurso)) {
			res.status(403).json({
				message: "Você não tem permissão para criar célula para este curso",
			});
			return;
		}

		// Buscar grades de propagação (cursos que compartilham a disciplina no mesmo período)
		const gradesAlvo = await celulaService.findGradesParaPropagacao(
			idDisciplina,
			novaCelula.anoLetivo,
			novaCelula.semestreLetivo,
			semestre,
		);
		const propagacaoGradeIds = gradesAlvo.map((g) => g.idGrade);

		const conflict = await validateConflicts(
			idGrade,
			idDisciplina,
			idProfessor,
			idDiaSemana,
			semestre,
			novaCelula,
			propagacaoGradeIds,
		);

		if (conflict) {
			res.status(conflict.status).json(conflict.body);
			return;
		}

		const resultado = await celulaService.createComPropagacao(
			idGrade,
			idDisciplina,
			idProfessor,
			idDiaSemana,
			semestre,
			gradesAlvo,
		);

		res.status(201).json({
			message:
				resultado.totalGrades > 1
					? `Célula criada com sucesso e propagada para ${resultado.totalGrades} grade(s)`
					: "Célula criada com sucesso",
			data: {
				idGrade,
				idDisciplina,
				idProfessor,
				idDiaSemana,
				semestre,
				propagacao: {
					totalGrades: resultado.totalGrades,
					celulasCriadas: resultado.criadas.length,
				},
			},
		});
	} catch (error) {
		next(error);
	}
};

export const updateCelula = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const idCelula = Number(req.params.idCelula);

		if (!idCelula) {
			res.status(400).json({ message: "Não foi possível identificar a aula selecionada" });
			return;
		}

		const alocacaoAtual = await celulaService.findAlocacaoById(idCelula);
		if (!alocacaoAtual) {
			res.status(404).json({ message: "Aula não encontrada" });
			return;
		}

		if (!isCursoInScope(req.scopedCursos, alocacaoAtual.grade.idCurso)) {
			res.status(403).json({
				message: "Você não tem permissão para editar célula deste curso",
			});
			return;
		}

		// Campos atualizáveis
		const idProfessor = req.body.idProfessor ?? alocacaoAtual.idProfessor;
		const idDiaSemana = req.body.idDiaSemana ?? alocacaoAtual.idDiaSemana;
		const semestre = req.body.semestre ?? alocacaoAtual.semestre;
		const idDisciplina = req.body.idDisciplina ?? alocacaoAtual.idDisciplina;
		const idGrade = alocacaoAtual.idGrade;

		const disciplinaMudou = idDisciplina !== alocacaoAtual.idDisciplina;

		const novaCelula = await celulaService.getNovaCelulaInfo(
			idProfessor,
			idDisciplina,
			idGrade,
			idDiaSemana,
		);

		if (!novaCelula) {
			res.status(404).json({
				message: "Um dos dados selecionados (professor, disciplina, grade ou dia da semana) não foi encontrado no sistema",
			});
			return;
		}

		// Grades de propagação da NOVA disciplina (para validação de conflitos)
		const gradesAlvo = await celulaService.findGradesParaPropagacao(
			idDisciplina,
			alocacaoAtual.grade.anoLetivo,
			alocacaoAtual.grade.semestreLetivo,
			semestre,
		);
		const propagacaoGradeIds = gradesAlvo.map((g) => g.idGrade);

		// Buscar alocações relacionadas à disciplina ANTIGA para excluí-las da validação
		const oldGradesAlvo = disciplinaMudou
			? await celulaService.findGradesParaPropagacao(
					alocacaoAtual.idDisciplina,
					alocacaoAtual.grade.anoLetivo,
					alocacaoAtual.grade.semestreLetivo,
					alocacaoAtual.semestre,
				)
			: gradesAlvo;
		const oldPropagacaoGradeIds = oldGradesAlvo.map((g) => g.idGrade);

		const relacionadas = await celulaService.findAlocacoesRelacionadas(
			alocacaoAtual.idDisciplina,
			alocacaoAtual.semestre,
			alocacaoAtual.grade.anoLetivo,
			alocacaoAtual.grade.semestreLetivo,
			oldPropagacaoGradeIds,
		);
		const excludeIds = relacionadas.map((r) => r.idAlocacaoHorario);

		const conflict = await validateConflicts(
			idGrade,
			idDisciplina,
			idProfessor,
			idDiaSemana,
			semestre,
			novaCelula,
			propagacaoGradeIds,
			excludeIds,
		);

		if (conflict) {
			res.status(conflict.status).json(conflict.body);
			return;
		}

		if (disciplinaMudou) {
			// Disciplina mudou: remove propagação antiga e cria nova (transação atômica)
			const resultado = await celulaService.swapDisciplinaComPropagacao(
				alocacaoAtual.idDisciplina,
				alocacaoAtual.semestre,
				alocacaoAtual.grade.anoLetivo,
				alocacaoAtual.grade.semestreLetivo,
				{ idGrade, idDisciplina, idProfessor, idDiaSemana, semestre },
			);

			res.status(200).json({
				message: `Disciplina substituída com sucesso (${resultado.removidas} removida(s), ${resultado.criadas} criada(s))`,
				data: {
					idDisciplina,
					idProfessor,
					idDiaSemana,
					semestre,
					removidas: resultado.removidas,
					criadas: resultado.criadas,
				},
			});
		} else {
			// Só professor/dia/semestre mudaram: atualização simples com propagação
			const resultado = await celulaService.updateComPropagacao(
				idDisciplina,
				alocacaoAtual.semestre,
				alocacaoAtual.grade.anoLetivo,
				alocacaoAtual.grade.semestreLetivo,
				idGrade,
				{ idProfessor, idDiaSemana, semestre },
			);

			res.status(200).json({
				message: `Célula atualizada com sucesso (${resultado.count} registro(s) atualizados)`,
				data: {
					idDisciplina,
					idProfessor,
					idDiaSemana,
					semestre,
					registrosAtualizados: resultado.count,
				},
			});
		}
	} catch (error) {
		next(error);
	}
};

export const deleteCelula = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const idCelula = Number(req.params.idCelula);

		if (!idCelula) {
			res.status(400).json({
				message: "Não foi possível identificar a aula selecionada",
			});
			return;
		}

		const alocacao = await celulaService.findAlocacaoById(idCelula);
		if (!alocacao) {
			res.status(404).json({ message: "Aula não encontrada" });
			return;
		}

		if (!isCursoInScope(req.scopedCursos, alocacao.grade.idCurso)) {
			res.status(403).json({
				message: "Você não tem permissão para deletar célula deste curso",
			});
			return;
		}

		const resultado = await celulaService.removeComPropagacao(
			alocacao.idDisciplina,
			alocacao.semestre,
			alocacao.grade.anoLetivo,
			alocacao.grade.semestreLetivo,
			alocacao.idGrade,
		);

		res.status(200).json({
			message:
				resultado.count > 1
					? `Célula deletada com sucesso (${resultado.count} registro(s) removidos em grades compartilhadas)`
					: "Célula deletada com sucesso",
			data: {
				idCelula,
				registrosRemovidos: resultado.count,
			},
		});
	} catch (error) {
		next(error);
	}
};
