import prisma from "../lib/prisma";

// ========================
// Leitura
// ========================

export const findAll = async (scopedCursos: number[] | null) => {
	return prisma.vw_celulas.findMany({
		where: scopedCursos ? { idCurso: { in: scopedCursos } } : undefined,
	});
};

export const findByProfessor = async (idProfessor: number) => {
	return prisma.vw_celulas.findMany({
		where: { idProfessor },
	});
};

export const findByCurso = async (idCurso: number) => {
	return prisma.vw_celulas.findMany({
		where: { idCurso },
	});
};

export const getNovaCelulaInfo = async (
	idProfessor: number,
	idDisciplina: number,
	idGrade: number,
	idDiaSemana: number,
) => {
	const [professorRow, disciplinaRow, gradeRow, diaSemanaRow] = await Promise.all([
		prisma.professor.findUnique({ where: { idProfessor }, select: { nomeProfessor: true } }),
		prisma.disciplina.findUnique({ where: { idDisciplina }, select: { nomeDisciplina: true } }),
		prisma.grade.findUnique({
			where: { idGrade },
			select: {
				anoLetivo: true,
				semestreLetivo: true,
				curso: { select: { nomeCurso: true, idCurso: true } },
			},
		}),
		prisma.dia_semana.findUnique({ where: { idDiaSemana }, select: { diaSemana: true } }),
	]);

	if (!professorRow || !disciplinaRow || !gradeRow || !diaSemanaRow) {
		return null;
	}

	return {
		professor: professorRow.nomeProfessor,
		disciplina: disciplinaRow.nomeDisciplina,
		curso: gradeRow.curso.nomeCurso,
		idCurso: gradeRow.curso.idCurso,
		anoLetivo: gradeRow.anoLetivo,
		semestreLetivo: gradeRow.semestreLetivo,
		diaSemana: diaSemanaRow.diaSemana,
	};
};

export const findAlocacaoById = async (idAlocacaoHorario: number) => {
	return prisma.alocacao_horario.findUnique({
		where: { idAlocacaoHorario },
		include: {
			grade: {
				select: { idCurso: true, anoLetivo: true, semestreLetivo: true },
			},
		},
	});
};

// ========================
// Propagação
// ========================

// Busca todas as grades de cursos que possuem a disciplina NO MESMO PERÍODO
// O período determina em qual semestreLetivo a disciplina cai (ímpar → 1, par → 2)
export const findGradesParaPropagacao = async (
	idDisciplina: number,
	anoLetivo: number,
	semestreLetivo: number,
	semestre?: number,
) => {
	const cursosComDisciplina = await prisma.curso_disciplina.findMany({
		where: {
			idDisciplina,
			// Se o semestre (período) foi informado, só pegar cursos que têm a disciplina nesse mesmo período
			...(semestre ? { periodo: semestre } : {}),
		},
		select: { idCurso: true },
	});

	const cursoIds = cursosComDisciplina.map((c) => c.idCurso);
	if (cursoIds.length === 0) return [];

	return prisma.grade.findMany({
		where: {
			idCurso: { in: cursoIds },
			anoLetivo,
			semestreLetivo,
		},
		select: { idGrade: true, idCurso: true },
	});
};

// Busca todas as alocações relacionadas (mesma disciplina + semestre + grades do mesmo período letivo)
// Aceita gradeIds pré-computados para evitar chamada duplicada a findGradesParaPropagacao
export const findAlocacoesRelacionadas = async (
	idDisciplina: number,
	semestre: number,
	anoLetivo: number,
	semestreLetivo: number,
	precomputedGradeIds?: number[],
) => {
	const gradeIds = precomputedGradeIds ??
		(await findGradesParaPropagacao(idDisciplina, anoLetivo, semestreLetivo, semestre)).map((g) => g.idGrade);

	return prisma.alocacao_horario.findMany({
		where: {
			idDisciplina,
			semestre,
			idGrade: { in: gradeIds },
		},
	});
};

// ========================
// Conflitos
// ========================

// Disciplina já existe na mesma grade/semestre (independente do dia)
export const findConflictDisciplinaMesmaGrade = async (
	idDisciplina: number,
	idGrade: number,
	semestre: number,
	excludeIds?: number[],
) => {
	const conflictSelect = {
		curso: true,
		disciplina: true,
		professor: true,
		dia_semana: true,
		semestreCelula: true,
	} as const;

	return prisma.vw_celulas.findMany({
		where: {
			idDisciplina,
			idGrade,
			semestreCelula: semestre,
			...(excludeIds?.length ? { idCelula: { notIn: excludeIds } } : {}),
		},
		select: conflictSelect,
	});
};

// Disciplina já alocada no mesmo dia, excluindo grades onde a propagação é esperada
export const findConflictDisciplinaMesmoDia = async (
	idDisciplina: number,
	idDiaSemana: number,
	excludeIds?: number[],
	excludeGradeIds?: number[],
) => {
	return prisma.vw_celulas.findMany({
		where: {
			idDisciplina,
			idDiaSemana,
			...(excludeIds?.length ? { idCelula: { notIn: excludeIds } } : {}),
			...(excludeGradeIds?.length ? { idGrade: { notIn: excludeGradeIds } } : {}),
		},
		select: {
			curso: true,
			disciplina: true,
			professor: true,
			dia_semana: true,
			semestreCelula: true,
		},
	});
};

// Professor já alocado no mesmo dia (qualquer curso)
export const findConflictProfessorMesmoDia = async (
	idProfessor: number,
	idDiaSemana: number,
	excludeIds?: number[],
) => {
	return prisma.vw_celulas.findMany({
		where: {
			idProfessor,
			idDiaSemana,
			...(excludeIds?.length ? { idCelula: { notIn: excludeIds } } : {}),
		},
		select: {
			curso: true,
			disciplina: true,
			professor: true,
			dia_semana: true,
			semestreCelula: true,
		},
	});
};

// Professor já leciona a mesma disciplina em outro curso, excluindo grades de propagação
export const findConflictProfessorMesmaDisciplina = async (
	idProfessor: number,
	idDisciplina: number,
	idGrade: number,
	excludeIds?: number[],
	excludeGradeIds?: number[],
) => {
	const allExcludeGrades = [idGrade, ...(excludeGradeIds || [])];

	return prisma.vw_celulas.findMany({
		where: {
			idProfessor,
			idDisciplina,
			idGrade: { notIn: allExcludeGrades },
			...(excludeIds?.length ? { idCelula: { notIn: excludeIds } } : {}),
		},
		select: {
			curso: true,
			disciplina: true,
			professor: true,
			dia_semana: true,
			semestreCelula: true,
		},
	});
};

// ========================
// Escrita com propagação
// ========================

export const createComPropagacao = async (
	idGrade: number,
	idDisciplina: number,
	idProfessor: number,
	idDiaSemana: number,
	semestre: number,
	gradesAlvo: { idGrade: number; idCurso: number }[],
) => {
	const gradeIds = gradesAlvo.map((g) => g.idGrade);
	if (!gradeIds.includes(idGrade)) {
		gradeIds.push(idGrade);
	}

	// Buscar todos os existentes de uma vez (em vez de N queries no loop)
	const existentes = await prisma.alocacao_horario.findMany({
		where: {
			idGrade: { in: gradeIds },
			idDisciplina,
			semestre,
		},
		select: { idGrade: true },
	});
	const gradeIdsExistentes = new Set(existentes.map((e) => e.idGrade));

	// Criar os faltantes em batch
	const novos = gradeIds.filter((id) => !gradeIdsExistentes.has(id));
	if (novos.length > 0) {
		await prisma.alocacao_horario.createMany({
			data: novos.map((gId) => ({ idGrade: gId, idDisciplina, idProfessor, idDiaSemana, semestre })),
		});
	}

	return { criadas: novos, totalGrades: gradeIds.length };
};

export const updateComPropagacao = async (
	idDisciplina: number,
	semestre: number,
	anoLetivo: number,
	semestreLetivo: number,
	idGrade: number,
	data: { idProfessor?: number; idDiaSemana?: number; semestre?: number },
) => {
	const gradesAlvo = await findGradesParaPropagacao(idDisciplina, anoLetivo, semestreLetivo, semestre);
	const gradeIds = gradesAlvo.map((g) => g.idGrade);
	if (!gradeIds.includes(idGrade)) {
		gradeIds.push(idGrade);
	}

	return prisma.alocacao_horario.updateMany({
		where: {
			idDisciplina,
			semestre,
			idGrade: { in: gradeIds },
		},
		data,
	});
};

export const removeComPropagacao = async (
	idDisciplina: number,
	semestre: number,
	anoLetivo: number,
	semestreLetivo: number,
	idGrade: number,
) => {
	const gradesAlvo = await findGradesParaPropagacao(idDisciplina, anoLetivo, semestreLetivo, semestre);
	const gradeIds = gradesAlvo.map((g) => g.idGrade);
	if (!gradeIds.includes(idGrade)) {
		gradeIds.push(idGrade);
	}

	return prisma.alocacao_horario.deleteMany({
		where: {
			idDisciplina,
			semestre,
			idGrade: { in: gradeIds },
		},
	});
};

export const swapDisciplinaComPropagacao = async (
	oldIdDisciplina: number,
	oldSemestre: number,
	anoLetivo: number,
	semestreLetivo: number,
	newData: {
		idGrade: number;
		idDisciplina: number;
		idProfessor: number;
		idDiaSemana: number;
		semestre: number;
	},
) => {
	// Buscar grades de propagação para a NOVA disciplina
	const newGradesAlvo = await findGradesParaPropagacao(
		newData.idDisciplina,
		anoLetivo,
		semestreLetivo,
		newData.semestre,
	);

	const newGradeIds = newGradesAlvo.map((g) => g.idGrade);
	if (!newGradeIds.includes(newData.idGrade)) {
		newGradeIds.push(newData.idGrade);
	}

	// Buscar grades de propagação para a disciplina ANTIGA
	const oldGradesAlvo = await findGradesParaPropagacao(
		oldIdDisciplina,
		anoLetivo,
		semestreLetivo,
		oldSemestre,
	);
	const oldGradeIds = oldGradesAlvo.map((g) => g.idGrade);
	if (!oldGradeIds.includes(newData.idGrade)) {
		oldGradeIds.push(newData.idGrade);
	}

	return prisma.$transaction(async (tx) => {
		// 1. Remove propagação antiga
		const removed = await tx.alocacao_horario.deleteMany({
			where: {
				idDisciplina: oldIdDisciplina,
				semestre: oldSemestre,
				idGrade: { in: oldGradeIds },
			},
		});

		// 2. Cria nova propagação
		await tx.alocacao_horario.createMany({
			data: newGradeIds.map((gId) => ({
				idGrade: gId,
				idDisciplina: newData.idDisciplina,
				idProfessor: newData.idProfessor,
				idDiaSemana: newData.idDiaSemana,
				semestre: newData.semestre,
			})),
		});

		return { removidas: removed.count, criadas: newGradeIds.length };
	});
};

export const remove = async (idAlocacaoHorario: number) => {
	return prisma.alocacao_horario.delete({
		where: { idAlocacaoHorario },
	});
};
