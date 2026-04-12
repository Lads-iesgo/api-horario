import prisma from "../lib/prisma";
import { sala_tipoSala } from "../generated/prisma/client";

export const findAll = async () => {
	return prisma.sala.findMany();
};

export const findById = async (idSala: number) => {
	return prisma.sala.findUnique({
		where: { idSala },
	});
};

export const findByCodigoSala = async (codigoSala: string) => {
	return prisma.sala.findUnique({
		where: { codigoSala },
	});
};

export const create = async (data: {
	codigoSala: string;
	nomeSala?: string | null;
	capacidadeSala: number;
	tipoSala: sala_tipoSala;
	recursos?: string | null;
	localizacaoSala?: string | null;
}) => {
	return prisma.sala.create({ data });
};
