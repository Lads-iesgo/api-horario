import express, { Request, Response, NextFunction } from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import cookieParser from "cookie-parser";

import celulaRoutes from "./celula.routes";
import cursoRoutes from "./curso.routes";
import disciplinaRoutes from "./disciplina.routes";
import professorRoutes from "./professor.routes";
import authRoutes from "./auth.routes";

const app = express();

app.use(
	cors({
		origin: "http://localhost:3000", // Permite requisições do seu frontend
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

app.use(express.json());
app.use(cookieParser());

// Adiciona uma rota para a raiz
app.get("/", (req: Request, res: Response) => {
	res.status(200).json({ message: "API Grade Horário está funcionando!" });
});

app.use("/auth", authRoutes);
app.use("/celula", celulaRoutes);
app.use("/curso", cursoRoutes);
app.use("/disciplina", disciplinaRoutes);
app.use("/professor", professorRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
	console.error(err.stack);
	const statusCode = err.status || 500;
	res
		.status(statusCode)
		.json({ message: err.message || "Internal Server Error" });
});

(async () => {
	try {
		const connection = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_DATABASE,
			port: Number(process.env.DB_PORT),
		});
		console.log("Conexão com o banco de dados bem-sucedida!");
		connection.end();
	} catch (error) {
		if (error instanceof Error) {
			console.error("Erro ao conectar ao banco de dados:", error.message);
		} else {
			console.error("Erro ao conectar ao banco de dados:", error);
		}
		process.exit(1);
	}
})();

export default app;
