import dotenv from "dotenv";
import type { StringValue } from "ms";

dotenv.config();

export const jwtConfig = {
	secret: process.env.JWT_SECRET || "default_secret_change_in_production",
	expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as StringValue,
	cookieOptions: {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production", // Apenas HTTPS em produção
		sameSite: "strict" as const,
		maxAge: Number(process.env.COOKIE_MAX_AGE) || 604800000, // 7 dias em ms
	},
};
