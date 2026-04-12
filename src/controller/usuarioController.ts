import { Request, Response, NextFunction } from "express";
import * as usuarioService from "../services/usuarioService";

export const getUsuario = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const rows = await usuarioService.findAll();
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const getUsuarioById = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const idUsuario = Number(req.params.idUsuario);
		const row = await usuarioService.findById(idUsuario);
		res.status(200).json(row);
	} catch (error) {
		next(error);
	}
};

export const createUsuario = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { nomeUsuario, emailUsuario, senha, idPerfil, ativo } = req.body;

		if (!nomeUsuario || !emailUsuario || !senha || !idPerfil) {
			res.status(400).json({
				message: "Preencha o nome, email, senha e perfil do usuário",
			});
			return;
		}

		// Bug corrigido: agora o campo "ativo" do body é respeitado (default 1)
		const usuario = await usuarioService.create({
			nomeUsuario,
			emailUsuario,
			senha,
			idPerfil,
			ativo: ativo ?? 1,
		});

		res.status(201).json({
			message: "Usuário criado com sucesso",
			data: usuario,
		});
	} catch (error) {
		next(error);
	}
};
