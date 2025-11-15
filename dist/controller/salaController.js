"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSala = exports.getSalaById = exports.getSala = void 0;
const db_1 = __importDefault(require("../config/db"));
const getSala = async (req, res, next) => {
    try {
        const [rows] = await db_1.default.query("SELECT * FROM Salas");
        res.status(200).json(rows);
    }
    catch (error) {
        next(error);
    }
};
exports.getSala = getSala;
const getSalaById = async (req, res, next) => {
    try {
        const idSala = req.params.idSala;
        const [rows] = await db_1.default.query("SELECT * FROM Salas WHERE idSala = ?", [
            idSala,
        ]);
        if (Array.isArray(rows) && rows.length === 0) {
            res.status(404).json({ message: "Sala não encontrada" });
            return;
        }
        res.status(200).json(rows);
    }
    catch (error) {
        next(error);
    }
};
exports.getSalaById = getSalaById;
const createSala = async (req, res, next) => {
    try {
        const { codigoSala, nomeSala, capacidadeSala, tipoSala, recursos, localizcao, } = req.body;
        // Validação dos campos obrigatórios
        if (!codigoSala || !capacidadeSala || !tipoSala) {
            res.status(400).json({
                message: "Os campos codigoSala, capacidadeSala e tipoSala são obrigatórios",
            });
            return;
        }
        // Validação do tipo de sala
        const tiposSalasValidos = [
            "Laboratório",
            "Sala de Aula",
            "Auditorio",
            "Virtual",
        ];
        if (!tiposSalasValidos.includes(tipoSala)) {
            res.status(400).json({
                message: "Tipo de sala inválido",
                tiposSalasValidos: tiposSalasValidos,
            });
            return;
        }
        // Validação da capacidade
        if (typeof capacidadeSala !== "number" || capacidadeSala <= 0) {
            res.status(400).json({
                message: "A capacidade da sala deve ser um número positivo",
            });
            return;
        }
        // Verificar se o código da sala já existe
        const [codigoExists] = await db_1.default.query("SELECT idSala FROM Salas WHERE codigoSala = ?", [codigoSala]);
        if (Array.isArray(codigoExists) && codigoExists.length > 0) {
            res.status(409).json({
                message: "Já existe uma sala com este código",
            });
            return;
        }
        // Inserir a sala
        const [result] = await db_1.default.query(`INSERT INTO Salas 
      (codigoSala, nomeSala, capacidadeSala, tipoSala, recursos, localizacaoSala) 
      VALUES (?, ?, ?, ?, ?, ?)`, [
            codigoSala,
            nomeSala,
            capacidadeSala,
            tipoSala,
            recursos || null,
            localizcao || null,
        ]);
        const idSala = result.insertId;
        res.status(201).json({
            message: "Sala criada com sucesso",
            data: {
                idSala,
                codigoSala,
                nomeSala,
                capacidadeSala,
                tipoSala,
                recursos: recursos || null,
                localizcao: localizcao || null,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createSala = createSala;
