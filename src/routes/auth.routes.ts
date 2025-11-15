import express from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = express.Router();

// Rota de login - não requer autenticação
// TODO: Adicionar rate limiting para prevenir ataques de força bruta (ex: express-rate-limit)
// Exemplo: router.post("/login", rateLimiter, AuthController.login);
router.post("/login", AuthController.login);

// Rota de logout - requer autenticação
router.post("/logout", authenticate, AuthController.logout);

// Rota para obter dados do usuário logado - requer autenticação
router.get("/me", authenticate, AuthController.me);

export default router;
