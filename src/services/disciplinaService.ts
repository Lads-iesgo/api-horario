import prisma from "../lib/prisma";
import { disciplina_modalidade, disciplina_tipoSala } from "../generated/prisma/client";

export const findAll = async (scopedCursos: number[] | null) => {
	if (!scopedCursos) {
		return prisma.disciplina.findMany();
	}
	// Filtrar disciplinas vinculadas aos cursos do escopo
	return prisma.vw_disciplina_curso.findMany({
		where: { idCurso: { in: scopedCursos } },
	});
};

export const findById = async (idDisciplina: number) => {
	return prisma.disciplina.findUnique({
		where: { idDisciplina },
	});
};

export const findByCurso = async (idCurso: number) => {
	return prisma.vw_disciplina_curso.findMany({
		where: { idCurso },
	});
};

export const create = async (data: {
	codigoDisciplina: string;
	nomeDisciplina: string;
	cargaHoraria: number;
	modalidade: disciplina_modalidade;
	tipoSala: disciplina_tipoSala;
	semestreDisciplina: number;
	idCurso: number;
}) => {
	// Transação: cria disciplina + vincula ao curso
	return prisma.$transaction(async (tx) => {
		const disciplina = await tx.disciplina.create({
			data: {
				codigoDisciplina: data.codigoDisciplina,
				nomeDisciplina: data.nomeDisciplina,
				cargaHoraria: data.cargaHoraria,
				modalidade: data.modalidade,
				tipoSala: data.tipoSala,
			},
		});

		await tx.curso_disciplina.create({
			data: {
				idCurso: data.idCurso,
				idDisciplina: disciplina.idDisciplina,
				periodo: data.semestreDisciplina,
			},
		});

		return disciplina;
	});
};

export const findCursoById = async (idCurso: number) => {
	return prisma.curso.findUnique({
		where: { idCurso },
	});
};

export const findCursoDisciplina = async (idCurso: number, idDisciplina: number) => {
	return prisma.curso_disciplina.findUnique({
		where: {
			idCurso_idDisciplina: { idCurso, idDisciplina },
		},
	});
};

export const createCursoDisciplina = async (idCurso: number, idDisciplina: number) => {
	return prisma.curso_disciplina.create({
		data: { idCurso, idDisciplina },
	});
};
