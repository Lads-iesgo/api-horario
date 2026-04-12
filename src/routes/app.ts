import express, { Request, Response, NextFunction } from "express";
import cors from "cors";

import celulaRoutes from "./celula.routes";
import cursoRoutes from "./curso.routes";
import disciplinaRoutes from "./disciplina.routes";
import professorRoutes from "./professor.routes";
import gradeRoutes from "./grade.routes";
import diaSemanaRoutes from "./diaSemana.routes";
import disponibilidadeRoutes from "./disponibilidade.routes";
import professorDisciplinaRoutes from "./professorDisciplina.routes";
import usuarioRoutes from "./usuario.routes";
import salaRoutes from "./sala.routes";
import authRoutes from "./auth.routes";

const app = express();

app.use(
	cors({
		origin: "http://localhost:3000",
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

app.use(express.json());

// Rota raiz - health check
app.get("/", (req: Request, res: Response) => {
	res.status(200).json({ message: "API Grade Horário está funcionando!" });
});

app.use("/auth", authRoutes);

app.use("/celula", celulaRoutes);
app.use("/curso", cursoRoutes);
app.use("/disciplina", disciplinaRoutes);
app.use("/professor", professorRoutes);
app.use("/grade", gradeRoutes);
app.use("/diaSemana", diaSemanaRoutes);
app.use("/disponibilidade", disponibilidadeRoutes);
app.use("/professorDisciplina", professorDisciplinaRoutes);
app.use("/usuario", usuarioRoutes);
app.use("/sala", salaRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
	console.error(err.stack);
	const statusCode = err.status || 500;
	res
		.status(statusCode)
		.json({ message: err.message || "Internal Server Error" });
});

export default app;
