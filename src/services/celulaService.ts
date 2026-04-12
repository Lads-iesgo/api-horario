import prisma from "../lib/prisma";

// ========================
// Leitura
// ========================

export const findAll = async (scopedCursos: number[] | null) => {
	return prisma.vw_celulas.findMany({
		where: scopedCursos ? { idCurso: { in: scopedCursos } } : undefined,
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

// Busca todas as grades (mesmo anoLetivo/semestreLetivo) de cursos que possuem a disciplina
export const findGradesParaPropagacao = async (
	idDisciplina: number,
	anoLetivo: number,
	semestreLetivo: number,
) => {
	const cursosComDisciplina = await prisma.curso_disciplina.findMany({
		where: { idDisciplina },
		select: { idCurso: true },
	});

	const cursoIds = cursosComDisciplina.map((c) => c.idCurso);

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
export const findAlocacoesRelacionadas = async (
	idDisciplina: number,
	semestre: number,
	anoLetivo: number,
	semestreLetivo: number,
) => {
	const gradesAlvo = await findGradesParaPropagacao(idDisciplina, anoLetivo, semestreLetivo);
	const gradeIds = gradesAlvo.map((g) => g.idGrade);

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
	return prisma.vw_celulas.findMany({
		where: {
			idDisciplina,
			idGrade,
			semestreCelula: semestre,
			...(excludeIds?.length ? { idCelula: { notIn: excludeIds } } : {}),
		},
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

	const criadas: number[] = [];

	for (const gId of gradeIds) {
		const existing = await prisma.alocacao_horario.findFirst({
			where: { idGrade: gId, idDisciplina, semestre },
		});

		if (!existing) {
			const record = await prisma.alocacao_horario.create({
				data: { idGrade: gId, idDisciplina, idProfessor, idDiaSemana, semestre },
			});
			criadas.push(record.idAlocacaoHorario);
		}
	}

	return { criadas, totalGrades: gradeIds.length };
};

export const updateComPropagacao = async (
	idDisciplina: number,
	semestre: number,
	anoLetivo: number,
	semestreLetivo: number,
	data: { idProfessor?: number; idDiaSemana?: number; semestre?: number },
) => {
	const gradesAlvo = await findGradesParaPropagacao(idDisciplina, anoLetivo, semestreLetivo);
	const gradeIds = gradesAlvo.map((g) => g.idGrade);

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
) => {
	const gradesAlvo = await findGradesParaPropagacao(idDisciplina, anoLetivo, semestreLetivo);
	const gradeIds = gradesAlvo.map((g) => g.idGrade);

	return prisma.alocacao_horario.deleteMany({
		where: {
			idDisciplina,
			semestre,
			idGrade: { in: gradeIds },
		},
	});
};

export const remove = async (idAlocacaoHorario: number) => {
	return prisma.alocacao_horario.delete({
		where: { idAlocacaoHorario },
	});
};
