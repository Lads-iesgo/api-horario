"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const promise_1 = __importDefault(require("mysql2/promise"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const celula_routes_1 = __importDefault(require("./celula.routes"));
const curso_routes_1 = __importDefault(require("./curso.routes"));
const disciplina_routes_1 = __importDefault(require("./disciplina.routes"));
const professor_routes_1 = __importDefault(require("./professor.routes"));
const grade_routes_1 = __importDefault(require("./grade.routes"));
const diaSemana_routes_1 = __importDefault(require("./diaSemana.routes"));
const disponibilidade_routes_1 = __importDefault(require("./disponibilidade.routes"));
const professorDisciplina_routes_1 = __importDefault(require("./professorDisciplina.routes"));
const usuario_routes_1 = __importDefault(require("./usuario.routes"));
const sala_routes_1 = __importDefault(require("./sala.routes"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "http://localhost:3000", // Permite requisições do seu frontend
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Adiciona uma rota para a raiz
app.get("/", (req, res) => {
    res.status(200).json({ message: "API Grade Horário está funcionando!" });
});
app.use("/auth", auth_routes_1.default);
app.use("/celula", celula_routes_1.default);
app.use("/curso", curso_routes_1.default);
app.use("/disciplina", disciplina_routes_1.default);
app.use("/professor", professor_routes_1.default);
app.use("/grade", grade_routes_1.default);
app.use("/diaSemana", diaSemana_routes_1.default);
app.use("/disponibilidade", disponibilidade_routes_1.default);
app.use("/professorDisciplina", professorDisciplina_routes_1.default);
app.use("/usuario", usuario_routes_1.default);
app.use("/sala", sala_routes_1.default);
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.status || 500;
    res
        .status(statusCode)
        .json({ message: err.message || "Internal Server Error" });
});
(async () => {
    try {
        const connection = await promise_1.default.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            port: Number(process.env.DB_PORT),
        });
        console.log("Conexão com o banco de dados bem-sucedida!");
        connection.end();
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Erro ao conectar ao banco de dados:", error.message);
        }
        else {
            console.error("Erro ao conectar ao banco de dados:", error);
        }
        process.exit(1);
    }
})();
exports.default = app;
