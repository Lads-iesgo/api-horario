/**
 * Script para limpar alocações incorretamente propagadas.
 *
 * Uma alocação é considerada incorreta quando a disciplina NÃO pertence
 * ao curso da grade com o mesmo `periodo` que o `semestre` da alocação.
 *
 * Uso: npx tsx scripts/cleanup-propagacao.ts [--dry-run]
 *   --dry-run  (padrão) apenas lista o que seria removido
 *   --execute  efetivamente remove as alocações incorretas
 */

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const url = new URL(process.env.DATABASE_URL!);
const adapter = new PrismaMariaDb({
	host: url.hostname,
	port: Number(url.port || 3306),
	user: decodeURIComponent(url.username),
	password: decodeURIComponent(url.password),
	database: url.pathname.replace("/", ""),
	connectionLimit: 5,
});
const prisma = new PrismaClient({ adapter });

async function main() {
	const dryRun = !process.argv.includes("--execute");

	if (dryRun) {
		console.log("=== DRY RUN — nenhuma alteração será feita ===\n");
	} else {
		console.log("=== EXECUTE MODE — alocações incorretas serão REMOVIDAS ===\n");
	}

	// 1. Buscar todas as alocações com suas grades (para saber o idCurso)
	const alocacoes = await prisma.alocacao_horario.findMany({
		include: {
			grade: { select: { idCurso: true } },
			disciplina: { select: { nomeDisciplina: true } },
		},
	});

	console.log(`Total de alocações no banco: ${alocacoes.length}\n`);

	// 2. Buscar todo o mapeamento curso_disciplina
	const cursoDisciplinas = await prisma.curso_disciplina.findMany();
	// Criar um Map: "idCurso-idDisciplina" → periodo
	const cdMap = new Map<string, number | null>();
	for (const cd of cursoDisciplinas) {
		cdMap.set(`${cd.idCurso}-${cd.idDisciplina}`, cd.periodo);
	}

	// 3. Identificar alocações incorretas
	const incorretas: { id: number; idCurso: number; idDisciplina: number; nomeDisciplina: string; semestre: number; periodo: number | null | undefined }[] = [];

	for (const aloc of alocacoes) {
		const idCurso = aloc.grade.idCurso;
		const key = `${idCurso}-${aloc.idDisciplina}`;
		const periodo = cdMap.get(key);

		if (periodo === undefined) {
			// Disciplina não pertence a este curso de forma alguma
			incorretas.push({
				id: aloc.idAlocacaoHorario,
				idCurso,
				idDisciplina: aloc.idDisciplina,
				nomeDisciplina: aloc.disciplina.nomeDisciplina,
				semestre: aloc.semestre,
				periodo,
			});
		} else if (periodo !== null && periodo !== aloc.semestre) {
			// Disciplina pertence ao curso, mas em um período diferente do semestre da alocação
			incorretas.push({
				id: aloc.idAlocacaoHorario,
				idCurso,
				idDisciplina: aloc.idDisciplina,
				nomeDisciplina: aloc.disciplina.nomeDisciplina,
				semestre: aloc.semestre,
				periodo,
			});
		}
	}

	if (incorretas.length === 0) {
		console.log("Nenhuma alocação incorreta encontrada. Banco está limpo!");
		return;
	}

	console.log(`Alocações incorretas encontradas: ${incorretas.length}\n`);
	console.log("Detalhes:");
	for (const inc of incorretas) {
		const motivo = inc.periodo === undefined
			? "disciplina NÃO pertence ao curso"
			: `periodo=${inc.periodo} ≠ semestre=${inc.semestre}`;
		console.log(
			`  ID ${inc.id}: curso=${inc.idCurso}, disciplina="${inc.nomeDisciplina}" (${inc.idDisciplina}), semestre=${inc.semestre} — ${motivo}`,
		);
	}

	if (!dryRun) {
		const ids = incorretas.map((i) => i.id);
		const result = await prisma.alocacao_horario.deleteMany({
			where: { idAlocacaoHorario: { in: ids } },
		});
		console.log(`\nRemovidas: ${result.count} alocações`);
	} else {
		console.log(`\nPara executar a limpeza, rode: npx tsx scripts/cleanup-propagacao.ts --execute`);
	}
}

main()
	.catch(console.error)
	.finally(() => prisma.$disconnect());
