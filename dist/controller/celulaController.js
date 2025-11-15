"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCelula = exports.createCelula = exports.getCelulaCurso = exports.getCelula = void 0;
const db_1 = __importDefault(require("../config/db"));
const getCelula = async (req, res, next) => {
    try {
        const [rows] = await db_1.default.query("SELECT * FROM vw_celulas");
        res.status(200).json(rows);
    }
    catch (error) {
        next(error);
    }
};
exports.getCelula = getCelula;
const getCelulaCurso = async (req, res, next) => {
    try {
        const idCurso = req.params.idCurso;
        const [rows] = await db_1.default.query("SELECT * FROM vw_celulas WHERE idCurso = ?", [idCurso]);
        if (Array.isArray(rows) && rows.length === 0) {
            res
                .status(404)
                .json({ message: "Nenhuma célula encontrada para este curso" });
            return;
        }
        res.status(200).json(rows);
    }
    catch (error) {
        next(error);
    }
};
exports.getCelulaCurso = getCelulaCurso;
const createCelula = async (req, res, next) => {
    try {
        const { idGrade, idDisciplina, idProfessor, idDiaSemana, semestre } = req.body;
        // Validação dos campos obrigatórios
        if (!idGrade ||
            !idDisciplina ||
            !idProfessor ||
            !idDiaSemana ||
            !semestre) {
            res.status(400).json({ message: "Todos os campos são obrigatórios" });
            return;
        }
        // Buscar informações da nova célula que está sendo cadastrada
        const [novaCelulaInfo] = await db_1.default.query(`SELECT 
                p.nomeProfessor as professor,
                d.nomeDisciplina as disciplina,
                c.nomeCurso as curso,
                ds.diaSemana
            FROM Professores p
            CROSS JOIN Disciplinas d
            CROSS JOIN Cursos c
            CROSS JOIN Dia_semana ds
            CROSS JOIN Alocacao_horario ah
            WHERE p.idProfessor = ?
            AND d.idDisciplina = ?
            AND ah.idGrade = ?
            AND ds.idDiaSemana = ?
            LIMIT 1`, [idProfessor, idDisciplina, idGrade, idDiaSemana]);
        // Verificar se o professor já está cadastrado em outra disciplina/curso no mesmo dia
        const [professorConflict] = await db_1.default.query(`SELECT 
                curso,
                disciplina,
                professor,
                dia_semana
            FROM vw_celulas 
            WHERE idProfessor = ? 
            AND idDiaSemana = ?`, [idProfessor, idDiaSemana]);
        if (Array.isArray(professorConflict) && professorConflict.length > 0) {
            const conflict = professorConflict[0];
            const novaCelula = novaCelulaInfo[0];
            res.status(409).json({
                message: `O professor ${novaCelula.professor} já está alocado na disciplina "${conflict.disciplina}" do curso "${conflict.curso}" no dia ${conflict.dia_semana}`,
                tipo: "professor",
                tentativa: {
                    curso: novaCelula.curso,
                    disciplina: novaCelula.disciplina,
                    professor: novaCelula.professor,
                    dia: novaCelula.dia_semana,
                },
                conflito: {
                    curso: conflict.curso,
                    disciplina: conflict.disciplina,
                    professor: conflict.professor,
                    dia: conflict.dia_semana,
                },
            });
            return;
        }
        // Verificar se a disciplina já está cadastrada neste curso no mesmo dia
        const [disciplinaConflict] = await db_1.default.query(`SELECT 
                curso,
                disciplina,
                professor,
                dia_semana
            FROM vw_celulas 
            WHERE idDisciplina = ? 
            AND idGrade = ? 
            AND idDiaSemana = ?`, [idDisciplina, idGrade, idDiaSemana]);
        if (Array.isArray(disciplinaConflict) && disciplinaConflict.length > 0) {
            const conflict = disciplinaConflict[0];
            const novaCelula = novaCelulaInfo[0];
            res.status(409).json({
                message: `A disciplina "${novaCelula.disciplina}" do curso "${novaCelula.curso}" já está cadastrada no dia ${novaCelula.dia_semana} com o professor ${conflict.professor}`,
                tipo: "disciplina",
                tentativa: {
                    curso: novaCelula.curso,
                    disciplina: novaCelula.disciplina,
                    professor: novaCelula.professor,
                    dia: novaCelula.dia_semana,
                },
                conflito: {
                    curso: conflict.curso,
                    disciplina: conflict.disciplina,
                    professor: conflict.professor,
                    dia: conflict.dia_semana,
                },
            });
            return;
        }
        const [result] = await db_1.default.query(`CALL stp_cadastrar_celula(?, ?, ?, ?, ?)`, [idGrade, idDisciplina, idProfessor, idDiaSemana, semestre]);
        res.status(201).json({
            message: "Célula criada com sucesso",
            data: {
                idGrade,
                idDisciplina,
                idProfessor,
                idDiaSemana,
                semestre,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createCelula = createCelula;
const deleteCelula = async (req, res, next) => {
    try {
        const { idCelula } = req.params;
        // Validação do parâmetro
        if (!idCelula) {
            res.status(400).json({
                message: "O ID da célula é obrigatório",
            });
            return;
        }
        // Deleta da tabela Alocacao_horario usando o idCelula
        const [result] = await db_1.default.query(`DELETE FROM Alocacao_horario WHERE idCurso_Disciplina_Professor = ?`, [idCelula]);
        if (result.affectedRows === 0) {
            res.status(404).json({
                message: "Célula não encontrada",
            });
            return;
        }
        res.status(200).json({
            message: "Célula deletada com sucesso",
            data: {
                idCelula,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCelula = deleteCelula;
