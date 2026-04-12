import prisma from "../lib/prisma";

export const findAll = async () => {
	return prisma.vw_disponbibilidade_professor.findMany();
};

export const findByProfessor = async (idProfessor: number) => {
	return prisma.vw_disponbibilidade_professor.findMany({
		where: { idProfessor },
	});
};

export const create = async (data: {
	idProfessor: number;
	idDiaSemana: number;
}) => {
	return prisma.professor_disponibilidade.create({ data });
};
