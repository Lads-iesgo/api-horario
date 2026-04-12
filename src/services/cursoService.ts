import prisma from "../lib/prisma";

export const findAll = async () => {
	return prisma.curso.findMany();
};

export const findById = async (idCurso: number) => {
	return prisma.curso.findUnique({
		where: { idCurso },
	});
};

export const create = async (data: {
	codigoCurso: string;
	nomeCurso: string;
	descricaoCurso?: string | null;
	duracaoSemestres: number;
}) => {
	return prisma.curso.create({
		data: {
			codigoCurso: data.codigoCurso,
			nomeCurso: data.nomeCurso,
			descricaoCurso: data.descricaoCurso ?? null,
			duracaoSemestres: data.duracaoSemestres,
		},
	});
};
