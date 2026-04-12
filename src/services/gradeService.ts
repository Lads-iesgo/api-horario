import prisma from "../lib/prisma";

export const findAll = async (scopedCursos: number[] | null) => {
	return prisma.grade.findMany({
		where: scopedCursos ? { idCurso: { in: scopedCursos } } : undefined,
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
