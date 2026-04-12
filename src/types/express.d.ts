declare namespace Express {
	interface Request {
		user?: {
			idUsuario: number;
			nomePerfil: string;
			cursos: Array<{ idCurso: number; isCoordenador: boolean }>;
		};
		scopedCursos?: number[] | null;
	}
}
