# Projeto Horário - Backend

API REST do sistema de gestão de horários acadêmicos. Este README descreve apenas o módulo backend localizado em `api-horario`.

## Sumário

- [Visão Geral](#visão-geral)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Execução](#execução)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Rotas Principais](#rotas-principais)
- [Contribuição (Git Flow)](#contribuição-git-flow)

## Visão Geral

A API é responsável por:

- autenticação e emissão de JWT,
- autorização por perfil e escopo de cursos,
- regras de negócio de cadastro e vínculo acadêmico,
- persistência em MySQL/MariaDB via Prisma.

## Tecnologias Utilizadas

- Node.js + TypeScript
- Express 5
- Prisma ORM 7
- MariaDB/MySQL
- `@prisma/adapter-mariadb`
- JWT (`jsonwebtoken`)
- `bcrypt`
- `cors`
- `dotenv`

## Estrutura do Projeto

```text
📦 api-horario
┣ 📂 prisma/
┃ ┣ 📜 schema.prisma
┃ ┗ 📂 views/
┣ 📂 src/
┃ ┣ 📂 controller/                    # Camada HTTP
┃ ┣ 📂 services/                      # Regras de negócio
┃ ┣ 📂 routes/                        # Definição de endpoints
┃ ┣ 📂 middleware/                    # Auth, autorização e escopo
┃ ┣ 📂 lib/                           # Cliente Prisma
┃ ┣ 📂 generated/prisma/              # Prisma Client gerado
┃ ┣ 📂 types/                         # Extensões de tipos
┃ ┗ 📜 server.ts                      # Bootstrap da aplicação
┣ 📜 prisma.config.ts
┣ 📜 package.json
┗ 📜 tsconfig.json
```

## Pré-requisitos

- Node.js 20+
- npm 10+
- Instância MySQL/MariaDB ativa

## Configuração do Ambiente

Instale dependências:

```bash
npm install
```

Crie um arquivo `.env` na raiz de `api-horario` com os valores do seu ambiente:

```env
PORT=3333
JWT_SECRET=sua_chave_jwt

# Usado em prisma.config.ts
DATABASE_URL="mysql://seu_usuario:sua_senha@localhost:3306/seu_banco"
```

Gere o Prisma Client:

```bash
npx prisma generate
```

Observação: execute novamente o comando após alterações em `prisma/schema.prisma`.

## Execução

Desenvolvimento:

```bash
npm run dev
```

Produção:

```bash
npm run build
npm run start
```

API padrão em:

- `http://localhost:3333`

Health check:

- `GET /`

## Scripts Disponíveis

- `npm run dev`: inicia a API com recarga automática.
- `npm run build`: compila TypeScript para `dist`.
- `npm run start`: executa a versão compilada.
- `npm run typecheck`: valida tipagem sem gerar build.

## Rotas Principais

- `POST /auth/login`
- `GET /curso`
- `GET /disciplina`
- `GET /professor`
- `GET /grade`
- `GET /sala`
- `GET /usuario`

As rotas protegidas exigem `Authorization: Bearer <token>`.

## Contribuição (Git Flow)

Este módulo segue o fluxo Git Flow do projeto.

Branches:

- `main`: produção
- `develop`: integração
- `feature/<nome-da-feature>`: novas funcionalidades
- `release/<versao>`: preparação de release
- `hotfix/<descricao>`: correções urgentes

Para contribuir com o projeto, siga estes passos:

1. **Crie uma nova branch a partir da `develop`:**

   ```bash
   git checkout develop
   git checkout -b sua-nova-branch
   ```

2. **Faça suas alterações e commits:**

   ```bash
   git add .
   git commit -m "Descrição das suas alterações"
   ```

3. **Envie suas alterações para o GitHub:**

   ```bash
   git push origin sua-nova-branch
   ```

4. **Crie um Pull Request (PR) para a branch `develop`.**

## Dicas adicionais

- Escreva mensagens de commit claras e concisas.
- Mantenha o PR o menor e mais focado possível.
- Comunique-se de forma eficaz com os revisores.

## Contato

lads@iesgo.edu.br
