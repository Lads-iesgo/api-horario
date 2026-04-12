import { Request, Response, NextFunction } from "express";
import * as salaService from "../services/salaService";
import { sala_tipoSala } from "../generated/prisma/client";

// Mapeamento: valor da API -> valor do enum Prisma
const tipoSalaMap: Record<string, sala_tipoSala> = {
	"Laboratório": "laborat_rio",
	"Sala de Aula": "sala_de_aula",
	"Auditorio": "auditorio",
	"Virtual": "virtual",
};

const tiposSalasValidos = Object.keys(tipoSalaMap);

export const getSala = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const rows = await salaService.findAll();
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const getSalaById = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const idSala = Number(req.params.idSala);
		const row = await salaService.findById(idSala);

		if (!row) {
			res.status(404).json({ message: "Sala não encontrada" });
			return;
		}

		res.status(200).json(row);
	} catch (error) {
		next(error);
	}
};

export const createSala = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const {
			codigoSala,
			nomeSala,
			capacidadeSala,
			tipoSala,
			recursos,
			localizacaoSala,
		} = req.body;

		// Validação dos campos obrigatórios
		if (!codigoSala || !capacidadeSala || !tipoSala) {
			res.status(400).json({
				message:
					"Preencha o código, capacidade e tipo da sala",
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

		// Validação da capacidade
		if (typeof capacidadeSala !== "number" || capacidadeSala <= 0) {
			res.status(400).json({
				message: "A capacidade da sala deve ser um número positivo",
			});
			return;
		}

		// Verificar se o código da sala já existe
		const existing = await salaService.findByCodigoSala(codigoSala);
		if (existing) {
			res.status(409).json({
				message: "Já existe uma sala com este código",
			});
			return;
		}

		const sala = await salaService.create({
			codigoSala,
			nomeSala: nomeSala || null,
			capacidadeSala,
			tipoSala: tipoSalaMap[tipoSala],
			recursos: recursos || null,
			localizacaoSala: localizacaoSala || null,
		});

		res.status(201).json({
			message: "Sala criada com sucesso",
			data: sala,
		});
	} catch (error) {
		next(error);
	}
};
