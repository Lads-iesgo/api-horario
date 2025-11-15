export enum UserRole {
	PROFESSOR = "professor",
	COORDENADOR = "coordenador",
	ADMIN = "admin",
}

export interface UserPayload {
	id: string;
	email: string;
	name: string;
	role: UserRole;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface JWTPayload {
	userId: string;
	email: string;
	name: string;
	role: UserRole;
}

// Estender o tipo Request do Express para incluir user
declare global {
	namespace Express {
		interface Request {
			user?: UserPayload;
		}
	}
}
