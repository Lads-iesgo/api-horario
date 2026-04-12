import prisma from "../lib/prisma";
import { hashPassword } from "./authService";

export const findAll = async () => {
	return prisma.usuario.findMany();
};

export const findById = async (idUsuario: number) => {
	return prisma.usuario.findUnique({
		where: { idUsuario },
	});
};

export const create = async (data: {
	nomeUsuario: string;
	emailUsuario: string;
	senha: string;
	idPerfil: number;
	ativo?: number;
}) => {
	const senhaHash = await hashPassword(data.senha);

	return prisma.usuario.create({
		data: {
			nomeUsuario: data.nomeUsuario,
			emailUsuario: data.emailUsuario,
			senha: senhaHash,
			idPerfil: data.idPerfil,
			ativo: data.ativo ?? 1,
		},
	});
};
