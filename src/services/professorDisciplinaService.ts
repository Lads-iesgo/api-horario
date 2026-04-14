import prisma from "../lib/prisma";

export const findAll = async () => {
	return prisma.vw_disciplina_professor.findMany();
};

export const findByProfessor = async (idProfessor: number) => {
	return prisma.vw_disciplina_professor.findMany({
		where: { idProfessor },
	});
};

export const findByDisciplina = async (idDisciplina: number) => {
	return prisma.vw_disciplina_professor.findMany({
		where: { idDisciplina },
	});
};

export const create = async (data: {
	idProfessor: number;
	idDisciplina: number;
}) => {
	return prisma.disciplina_professor.create({ data });
};
