/**
 * Verifica se um idCurso está dentro do escopo do usuário.
 * Retorna true se o acesso é permitido (Admin ou curso no escopo).
 */
export const isCursoInScope = (
	scopedCursos: number[] | null | undefined,
	idCurso: number,
): boolean => {
	// Admin (null) tem acesso a tudo
	if (scopedCursos === null || scopedCursos === undefined) {
		return true;
	}
	return scopedCursos.includes(idCurso);
};
