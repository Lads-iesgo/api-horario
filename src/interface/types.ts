export interface CelulaViewInterface {
	idCelula: number;
	curso: string;
	disciplina: string;
	modadalidade: string;
	tipo_sala: string;
	professor: string;
	titulacao: string;
	dia_semana: string;
	semestre: string;
	data_criacao: Date;
}

export interface CelulaCursoViewInterface {
	idCurso: number;
	curso: string;
	disciplina: string;
	modadalidade: string;
	professor: string;
	titulacao: string;
	dia_semana: string;
	semestre: string;
}

// User roles enum
export enum UserRole {
	PROFESSOR = "professor",
	COORDENADOR = "coordenador",
	ADMIN = "admin",
}

// JWT payload interface
export interface JwtPayload {
	idUsuario: number;
	emailUsuario: string;
	nomeUsuario: string;
	role: UserRole;
	idPerfil: number;
}

// User from database interface
export interface Usuario {
	idUsuario: number;
	nomeUsuario: string;
	emailUsuario: string;
	senha: string;
	idPerfil: number;
	ativo: number;
}
