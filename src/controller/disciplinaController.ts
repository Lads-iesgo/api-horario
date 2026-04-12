import { Request, Response, NextFunction } from "express";
import * as disciplinaService from "../services/disciplinaService";
import { disciplina_modalidade, disciplina_tipoSala } from "../generated/prisma/client";
import { isCursoInScope } from "../middleware/validateScope";

// Mapeamento: valor da API -> valor do enum Prisma
const modalidadeMap: Record<string, disciplina_modalidade> = {
	"Presencial": "presencial",
	"Sincrona": "sincrona",
	"Hibrido": "hibrido",
};

const tipoSalaMap: Record<string, disciplina_tipoSala> = {
	"Laboratório": "laborat_rio",
	"Sala de Aula": "sala_de_aula",
	"Auditorio": "auditorio",
	"Virtual": "virtual",
};

const modalidadesValidas = Object.keys(modalidadeMap);
const tiposSalasValidos = Object.keys(tipoSalaMap);

export const getDisciplina = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const rows = await disciplinaService.findAll(req.scopedCursos!);
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const getDisciplinaById = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const idDisciplina = Number(req.params.idDisciplina);
		const row = await disciplinaService.findById(idDisciplina);
		res.status(200).json(row);
	} catch (error) {
		next(error);
	}
};

export const getDisciplinaByCurso = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const idCurso = Number(req.params.idCurso);

		// Validar escopo
		if (!isCursoInScope(req.scopedCursos, idCurso)) {
			res.status(403).json({
				message: "Você não tem permissão para acessar dados deste curso",
			});
			return;
		}

		const rows = await disciplinaService.findByCurso(idCurso);
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const createDisciplina = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const {
			codigoDisciplina,
			nomeDisciplina,
			cargaHoraria,
			modalidade,
			tipoSala,
			semestreDisciplina,
			idCurso,
		} = req.body;

		// Validação dos campos obrigatórios
		if (
			!codigoDisciplina ||
			!nomeDisciplina ||
			!cargaHoraria ||
			!modalidade ||
			!tipoSala ||
			!semestreDisciplina ||
			!idCurso
		) {
			res.status(400).json({
				message: "Preencha todos os campos obrigatórios: código, nome, carga horária, modalidade, tipo de sala, semestre e curso",
			});
			return;
		}

		// Validar escopo: só pode criar disciplina para cursos do seu escopo
		if (!isCursoInScope(req.scopedCursos, idCurso)) {
			res.status(403).json({
				message: "Você não tem permissão para criar disciplina para este curso",
			});
			return;
		}

		// Validação da modalidade
		if (!modalidadesValidas.includes(modalidade)) {
			res.status(400).json({
				message: "Modalidade inválida",
				modalidadesValidas,
			});
			return;
		}

		// Validação do tipo de sala
		if (!tiposSalasValidos.includes(tipoSala)) {
			res.status(400).json({
				message: "Tipo de sala inválido",
				tiposSalasValidos,
			});
			return;
		}

		// Validação da carga horária
		if (typeof cargaHoraria !== "number" || cargaHoraria <= 0) {
			res.status(400).json({
				message: "A carga horária deve ser um número positivo",
			});
			return;
		}

		// Validação do semestre
		if (typeof semestreDisciplina !== "number" || semestreDisciplina <= 0) {
			res.status(400).json({
				message: "O semestre deve ser um número positivo",
			});
			return;
		}

		// Verificar se o curso existe
		const curso = await disciplinaService.findCursoById(idCurso);
		if (!curso) {
			res.status(404).json({
				message: "Curso não encontrado",
			});
			return;
		}

		// Criar disciplina e vincular ao curso (transação)
		const disciplina = await disciplinaService.create({
			codigoDisciplina,
			nomeDisciplina,
			cargaHoraria,
			modalidade: modalidadeMap[modalidade],
			tipoSala: tipoSalaMap[tipoSala],
			semestreDisciplina,
			idCurso,
		});

		res.status(201).json({
			message: "Disciplina criada e vinculada ao curso com sucesso",
			data: {
				idDisciplina: disciplina.idDisciplina,
				codigoDisciplina,
				nomeDisciplina,
				cargaHoraria,
				modalidade,
				tipoSala,
				semestreDisciplina,
				idCurso,
			},
		});
	} catch (error) {
		next(error);
	}
};

export const createCursoDisciplina = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { idDisciplina, idCurso } = req.body;

		// Validação dos campos obrigatórios
		if (!idDisciplina || !idCurso) {
			res.status(400).json({
				message: "Selecione a disciplina e o curso para realizar a vinculação",
			});
			return;
		}

		// Validar escopo
		if (!isCursoInScope(req.scopedCursos, idCurso)) {
			res.status(403).json({
				message: "Você não tem permissão para vincular disciplina a este curso",
			});
			return;
		}

		// Verificar se o curso existe
		const curso = await disciplinaService.findCursoById(idCurso);
		if (!curso) {
			res.status(404).json({
				message: "Curso não encontrado",
			});
			return;
		}

		// Verificar se a disciplina existe
		const disciplina = await disciplinaService.findById(idDisciplina);
		if (!disciplina) {
			res.status(404).json({
				message: "Disciplina não encontrada",
			});
			return;
		}

		// Verificar se a relação já existe
		const existing = await disciplinaService.findCursoDisciplina(idCurso, idDisciplina);
		if (existing) {
			res.status(409).json({
				message: "Esta disciplina já está vinculada a este curso",
			});
			return;
		}

		await disciplinaService.createCursoDisciplina(idCurso, idDisciplina);

		res.status(201).json({
			message: "Disciplina vinculada ao curso com sucesso",
			data: {
				idCurso,
				idDisciplina,
			},
		});
	} catch (error) {
		next(error);
	}
};
