import { Request, Response, NextFunction } from "express";
import * as professorService from "../services/professorService";
import { professor_titulacao } from "../generated/prisma/client";
import { isCursoInScope } from "../middleware/validateScope";

// Mapeamento: valor da API -> valor do enum Prisma
const titulacaoMap: Record<string, professor_titulacao> = {
	"Graduado": "graduado",
	"Especialista": "especialista",
	"Mestre": "mestre",
	"Doutor": "doutor",
	"Doutora": "doutora",
};

const titulacoesValidas = Object.keys(titulacaoMap);

export const getProfessor = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const rows = await professorService.findAll(req.scopedCursos!);
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const getProfessorById = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const idProfessor = Number(req.params.idProfessor);
		const row = await professorService.findById(idProfessor);
		res.status(200).json(row);
	} catch (error) {
		next(error);
	}
};

export const getProfessorByCoordenador = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const idProfessor = Number(req.params.coordenador_idProfessor);
		const rows = await professorService.findByCoordenador(idProfessor);
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const getProfessorByCurso = async (
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

		const rows = await professorService.findByCurso(idCurso);
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const createProfessor = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const {
			nomeProfessor,
			email,
			titulacao,
			curriculo_lattes,
			idCurso,
		} = req.body;

		// Validação dos campos obrigatórios
		if (!nomeProfessor || !email || !titulacao) {
			res.status(400).json({
				message: "Preencha o nome, email e titulação do professor",
			});
			return;
		}

		// Validação do formato do email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			res.status(400).json({
				message: "Formato de email inválido",
			});
			return;
		}

		// Validação da titulação
		if (!titulacoesValidas.includes(titulacao)) {
			res.status(400).json({
				message: "Titulação inválida",
				titulacoesValidas,
			});
			return;
		}

		// Verificar se o email já está cadastrado
		const emailExists = await professorService.findByEmail(email);
		if (emailExists) {
			res.status(409).json({
				message: "Este email já está cadastrado",
			});
			return;
		}

		// Resolver idCoordenador automaticamente com base no perfil do usuário
		let idCoordenador: number | null = null;
		const perfilLower = req.user!.nomePerfil.toLowerCase();

		if (perfilLower === "coordenador") {
			// Coordenador: vincular automaticamente pelo idUsuario da sessão
			const professorCoordenador = await professorService.findByUsuarioId(req.user!.idUsuario);
			if (!professorCoordenador) {
				res.status(400).json({
					message: "Seu perfil de coordenador não está vinculado a um registro de professor. Contate o administrador",
				});
				return;
			}
			idCoordenador = professorCoordenador.idProfessor;
		} else if (perfilLower === "admin") {
			// Admin: identificar o coordenador do curso selecionado
			if (!idCurso) {
				res.status(400).json({
					message: "Selecione o curso para cadastrar o professor",
				});
				return;
			}
			const coordenadorDoCurso = await professorService.findCoordenadorByCurso(Number(idCurso));
			if (!coordenadorDoCurso) {
				res.status(404).json({
					message: "Este curso não possui um coordenador cadastrado",
				});
				return;
			}
			idCoordenador = coordenadorDoCurso.idProfessor;
		}

		// Criar professor
		const professor = await professorService.create({
			nomeProfessor,
			email,
			titulacao: titulacaoMap[titulacao],
			curriculoLattes: curriculo_lattes || null,
			idCoordenador,
		});

		res.status(201).json({
			message: "Professor criado com sucesso",
			data: {
				idProfessor: professor.idProfessor,
				nomeProfessor,
				email,
				titulacao,
				curriculo_lattes: curriculo_lattes || null,
				idCoordenador,
			},
		});
	} catch (error) {
		next(error);
	}
};
