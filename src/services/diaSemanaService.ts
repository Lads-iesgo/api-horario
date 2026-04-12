import prisma from "../lib/prisma";

export const findAll = async () => {
	return prisma.dia_semana.findMany();
};

export const findById = async (idDiaSemana: number) => {
	return prisma.dia_semana.findUnique({
		where: { idDiaSemana },
	});
};
