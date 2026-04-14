import prisma from "../lib/prisma";

export const findAll = async (scopedCursos: number[] | null, idCurso?: number) => {
	const where: Record<string, unknown> = {};
	if (idCurso) {
		where.idCurso = idCurso;
	} else if (scopedCursos) {
		where.idCurso = { in: scopedCursos };
	}
	return prisma.grade.findMany({
		where: Object.keys(where).length > 0 ? where : undefined,
	});
};

export const findById = async (idGrade: number) => {
	return prisma.grade.findUnique({
		where: { idGrade },
	});
};

export const create = async (data: {
	idCurso: number;
	anoLetivo: number;
	semestreLetivo: number;
}) => {
	return prisma.grade.create({ data });
};
