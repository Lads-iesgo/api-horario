import express from "express";
import { login, logout, me } from "../controller/authController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Auth routes
router.post("/login", login); // POST /auth/login
router.post("/logout", logout); // POST /auth/logout
router.get("/me", authenticateToken, me); // GET /auth/me

export default router;
