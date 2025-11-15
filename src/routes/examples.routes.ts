/**
 * Exemplos de Uso do Sistema de Autenticação JWT
 * 
 * Este arquivo demonstra como usar os middlewares de autenticação e autorização
 * nas rotas da aplicação.
 */

import express from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
	requireRole,
	requireAdmin,
	requireOwnership,
	requireReadPermission,
	requireWritePermission,
} from "../middlewares/role.middleware";
import { UserRole } from "../types/auth.types";

const router = express.Router();

// ============================================
// EXEMPLOS DE ROTAS PÚBLICAS
// ============================================

// Rota completamente pública - qualquer pessoa pode acessar
router.get("/public/info", (req, res) => {
	res.json({ message: "Esta é uma rota pública" });
});

// ============================================
// EXEMPLOS DE ROTAS AUTENTICADAS
// ============================================

// Qualquer usuário autenticado pode acessar
router.get("/horarios", authenticate, (req, res) => {
	res.json({
		message: "Lista de horários disponível para usuários autenticados",
	});
});

// ============================================
// EXEMPLOS COM CONTROLE DE ROLES
// ============================================

// Apenas Admins podem acessar
router.delete("/users/:id", authenticate, requireAdmin(), (req, res) => {
	res.json({ message: "Usuário deletado (apenas admin)" });
});

// Apenas Coordenadores e Admins podem acessar
router.post(
	"/disciplinas",
	authenticate,
	requireRole([UserRole.COORDENADOR, UserRole.ADMIN]),
	(req, res) => {
		res.json({ message: "Disciplina criada" });
	},
);

// ============================================
// EXEMPLOS COM VERIFICAÇÃO DE PROPRIEDADE
// ============================================

// Professor pode ler apenas seus próprios dados
router.get(
	"/professors/:id",
	authenticate,
	requireReadPermission(),
	(req, res) => {
		// req.user.id foi validado contra req.params.id
		res.json({
			message: "Dados do professor",
			userId: req.user?.id,
		});
	},
);

// Coordenador pode editar apenas seus próprios dados
// Admin pode editar qualquer coordenador
router.put(
	"/coordenadores/:id",
	authenticate,
	requireRole([UserRole.COORDENADOR, UserRole.ADMIN]),
	requireOwnership(),
	(req, res) => {
		res.json({ message: "Coordenador atualizado" });
	},
);

// ============================================
// EXEMPLOS COM PERMISSÕES DE ESCRITA
// ============================================

// Professores NÃO podem criar (apenas leitura)
// Coordenadores podem criar seus próprios registros
// Admins podem criar qualquer registro
router.post(
	"/aulas",
	authenticate,
	requireWritePermission(),
	(req, res) => {
		res.json({
			message: "Aula criada",
			role: req.user?.role,
		});
	},
);

// ============================================
// EXEMPLO COMPLEXO: Diferentes Ações por Role
// ============================================

// GET: Todos autenticados podem listar (com filtros por role)
router.get("/recursos", authenticate, (req, res) => {
	const userRole = req.user?.role;

	if (userRole === UserRole.ADMIN) {
		// Admin vê todos os recursos
		res.json({ message: "Todos os recursos", data: [] });
	} else {
		// Professor e Coordenador veem apenas seus recursos
		res.json({
			message: "Seus recursos",
			userId: req.user?.id,
			data: [],
		});
	}
});

// POST: Apenas Coordenador e Admin podem criar
router.post(
	"/recursos",
	authenticate,
	requireRole([UserRole.COORDENADOR, UserRole.ADMIN]),
	(req, res) => {
		res.json({ message: "Recurso criado" });
	},
);

// PUT: Apenas dono ou Admin podem atualizar
router.put(
	"/recursos/:id",
	authenticate,
	requireOwnership(),
	(req, res) => {
		res.json({ message: "Recurso atualizado" });
	},
);

// DELETE: Apenas Admin pode deletar
router.delete("/recursos/:id", authenticate, requireAdmin(), (req, res) => {
	res.json({ message: "Recurso deletado" });
});

// ============================================
// EXEMPLO COM PARÂMETRO CUSTOMIZADO
// ============================================

// Verifica propriedade usando um parâmetro diferente de 'id'
router.put(
	"/turmas/:turmaId/professor/:professorId",
	authenticate,
	requireOwnership("professorId"), // Verifica professorId ao invés de id
	(req, res) => {
		res.json({ message: "Professor atribuído à turma" });
	},
);

export default router;
