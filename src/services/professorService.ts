import prisma from "../lib/prisma";
import { professor_titulacao } from "../generated/prisma/client";

export const findAll = async (scopedCursos: number[] | null) => {
	if (!scopedCursos) {
		return prisma.professor.findMany();
	}
	// Filtrar professores vinculados aos cursos do escopo
	return prisma.vw_professor_curso.findMany({
		where: { idCurso: { in: scopedCursos } },
	});
};

export const findById = async (idProfessor: number) => {
	return prisma.professor.findUnique({
		where: { idProfessor },
	});
};

export const findByCoordenador = async (idProfessor: number) => {
	return prisma.vw_professor_coordenador.findMany({
		where: { idProfessor },
	});
};

export const findByCurso = async (idCurso: number) => {
	return prisma.vw_professor_curso.findMany({
		where: { idCurso },
	});
};

export const findByEmail = async (email: string) => {
	return prisma.professor.findUnique({
		where: { email },
	});
};

export const findByUsuarioId = async (idUsuario: number) => {
	return prisma.professor.findUnique({
		where: { idUsuario },
	});
};

export const findCoordenadorByCurso = async (idCurso: number) => {
	const vinculo = await prisma.professor_curso.findFirst({
		where: { idCurso, isCoordenador: 1 },
		include: { professor: true },
	});
	return vinculo?.professor ?? null;
};

export const create = async (data: {
	nomeProfessor: string;
	email: string;
	titulacao: professor_titulacao;
	curriculoLattes?: string | null;
	idCoordenador?: number | null;
	idUsuario?: number | null;
	idCurso?: number | null;
	isCoordenador?: number;
}) => {
	const { idCurso, isCoordenador: isCoordenadorFlag, ...professorData } = data;

	const professor = await prisma.professor.create({
		data: {
			...professorData,
			idUsuario: professorData.idUsuario ?? null,
		},
	});

	// Se idCurso foi informado, criar o vínculo professor_curso
	if (idCurso) {
		await prisma.professor_curso.create({
			data: {
				idProfessor: professor.idProfessor,
				idCurso,
				isCoordenador: isCoordenadorFlag ?? 0,
			},
		});
	}

	return professor;
};
