import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET!;
const SALT_ROUNDS = 10;

export const login = async (email: string, senha: string) => {
	// Buscar usuario por email com perfil
	const usuario = await prisma.usuario.findUnique({
		where: { emailUsuario: email },
		include: { perfil: true },
	});

	if (!usuario) {
		return null;
	}

	// Verificar se o usuario está ativo
	if (usuario.ativo !== 1) {
		return null;
	}

	// Comparar senha
	const senhaValida = await bcrypt.compare(senha, usuario.senha);
	if (!senhaValida) {
		return null;
	}

	// Buscar cursos vinculados (usuario → professor → professor_curso)
	const professor = await prisma.professor.findUnique({
		where: { idUsuario: usuario.idUsuario },
		include: {
			professor_curso: {
				select: {
					idCurso: true,
					isCoordenador: true,
				},
			},
		},
	});

	const cursos = professor
		? professor.professor_curso.map((pc) => ({
				idCurso: pc.idCurso,
				isCoordenador: pc.isCoordenador === 1,
			}))
		: [];

	// Gerar token JWT
	const token = jwt.sign(
		{
			idUsuario: usuario.idUsuario,
			nomePerfil: usuario.perfil.nomePerfil,
			cursos,
		},
		JWT_SECRET,
		{ expiresIn: "8h" },
	);

	return {
		token,
		usuario: {
			idUsuario: usuario.idUsuario,
			nomeUsuario: usuario.nomeUsuario,
			emailUsuario: usuario.emailUsuario,
			nomePerfil: usuario.perfil.nomePerfil,
			cursos,
		},
	};
};

export const hashPassword = async (senha: string): Promise<string> => {
	return bcrypt.hash(senha, SALT_ROUNDS);
};
