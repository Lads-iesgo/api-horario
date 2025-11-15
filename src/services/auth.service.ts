import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db";
import { jwtConfig } from "../config/jwt.config";
import { JWTPayload, UserRole } from "../types/auth.types";

export class AuthService {
	/**
	 * Valida credenciais do usuário e retorna dados se válido
	 */
	static async login(
		email: string,
		password: string,
	): Promise<{
		id: string;
		email: string;
		name: string;
		role: UserRole;
	} | null> {
		try {
			// Busca usuário no banco de dados
			const [rows] = await pool.query(
				"SELECT id, email, name, password, role FROM users WHERE email = ?",
				[email],
			);

			const users = rows as any[];

			if (users.length === 0) {
				return null;
			}

			const user = users[0];

			// Verifica a senha
			const isPasswordValid = await bcrypt.compare(password, user.password);

			if (!isPasswordValid) {
				return null;
			}

			// Retorna dados do usuário sem a senha
			return {
				id: user.id,
				email: user.email,
				name: user.name,
				role: user.role as UserRole,
			};
		} catch (error) {
			console.error("Erro ao fazer login:", error);
			throw new Error("Erro ao processar login");
		}
	}

	/**
	 * Gera um token JWT para o usuário
	 */
	static generateToken(user: {
		id: string;
		email: string;
		name: string;
		role: UserRole;
	}): string {
		const payload: JWTPayload = {
			userId: user.id,
			email: user.email,
			name: user.name,
			role: user.role,
		};

		const options: jwt.SignOptions = {
			expiresIn: jwtConfig.expiresIn,
		};

		return jwt.sign(payload, jwtConfig.secret, options);
	}

	/**
	 * Verifica a validade de um token JWT
	 */
	static verifyToken(token: string): JWTPayload | null {
		try {
			return jwt.verify(token, jwtConfig.secret) as JWTPayload;
		} catch (error) {
			return null;
		}
	}

	/**
	 * Faz hash de uma senha usando bcrypt
	 */
	static async hashPassword(password: string): Promise<string> {
		const saltRounds = 10;
		return bcrypt.hash(password, saltRounds);
	}

	/**
	 * Verifica se uma senha corresponde ao hash
	 */
	static async verifyPassword(
		password: string,
		hash: string,
	): Promise<boolean> {
		return bcrypt.compare(password, hash);
	}
}
