import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { jwtConfig } from "../config/jwt.config";
import { LoginRequest } from "../types/auth.types";

export class AuthController {
	/**
	 * POST /auth/login
	 * Endpoint de login
	 */
	static async login(req: Request, res: Response, next: NextFunction) {
		try {
			const { email, password } = req.body as LoginRequest;

			// Validação de entrada
			if (!email || !password) {
				return res.status(400).json({
					success: false,
					message: "Email e senha são obrigatórios",
				});
			}

			// Validar credenciais
			const user = await AuthService.login(email, password);

			if (!user) {
				return res.status(401).json({
					success: false,
					message: "Credenciais inválidas",
				});
			}

			// Gerar token JWT
			const token = AuthService.generateToken(user);

			// Salvar token em cookie
			res.cookie("authToken", token, jwtConfig.cookieOptions);

			// Retornar dados do usuário (sem senha)
			return res.status(200).json({
				success: true,
				user: {
					id: user.id,
					email: user.email,
					name: user.name,
					role: user.role,
				},
				message: "Login realizado com sucesso",
			});
		} catch (error) {
			next(error);
		}
	}

	/**
	 * POST /auth/logout
	 * Endpoint de logout
	 */
	static async logout(req: Request, res: Response, next: NextFunction) {
		try {
			// Limpar cookie
			res.clearCookie("authToken", jwtConfig.cookieOptions);

			return res.status(200).json({
				success: true,
				message: "Logout realizado com sucesso",
			});
		} catch (error) {
			next(error);
		}
	}

	/**
	 * GET /auth/me
	 * Retorna dados do usuário logado
	 */
	static async me(req: Request, res: Response, next: NextFunction) {
		try {
			if (!req.user) {
				return res.status(401).json({
					success: false,
					message: "Usuário não autenticado",
				});
			}

			return res.status(200).json({
				success: true,
				user: req.user,
			});
		} catch (error) {
			next(error);
		}
	}
}
