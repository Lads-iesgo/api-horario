import pool from "../config/db";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";

export const getUsuario = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const [rows] = await pool.query("SELECT * FROM usuarios");
		res.status(200).json(rows);
	} catch (error) {
		next(error);
	}
};

export const getUsuarioById = async (
	req: Request<{ idUsuario: number }>,
	res: Response,
	next: NextFunction,
) => {
	try {
		const idUsuario = req.params.idUsuario;
		const [rows] = await pool.query(
			"SELECT * FROM usuarios WHERE idUsuario = ?",
			[idUsuario],
		);
		res.status(200).json(rows);
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
				message: "nomeUsuario, emailUsuario, senha e idPerfil são obrigatórios",
			});
			return;
		}

		// Hash password before storing
		const hashedPassword = await bcrypt.hash(senha, 10);

		const [result]: any = await pool.query(
			`INSERT INTO usuarios 
        (nomeUsuario, emailUsuario, senha, idPerfil, ativo)
        VALUES (?, ?, ?, ?, 1)`,
			[nomeUsuario, emailUsuario, hashedPassword, idPerfil, ativo],
		);
		res.status(201).json({
			message: "Usuário criado com sucesso",
			data: {
				idUsuario: result.insertId,
				nomeUsuario,
				emailUsuario,
				idPerfil,
				ativo: ativo,
			},
		});
	} catch (error) {
		next(error);
	}
};
