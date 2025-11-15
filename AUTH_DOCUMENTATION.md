# Sistema de Autenticação JWT - API Horário

Este documento descreve como usar o sistema de autenticação JWT implementado na API.

## Configuração

### 1. Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure as variáveis:

```bash
cp .env.example .env
```

Variáveis importantes:
- `JWT_SECRET`: Chave secreta para assinar os tokens JWT (ALTERE EM PRODUÇÃO!)
- `JWT_EXPIRES_IN`: Tempo de expiração do token (ex: "7d", "24h", "60m")
- `COOKIE_MAX_AGE`: Tempo máximo do cookie em milissegundos
- `NODE_ENV`: Ambiente (development/production)

### 2. Estrutura do Banco de Dados

É necessário criar uma tabela `users` no banco de dados com a seguinte estrutura:

```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('professor', 'coordenador', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 3. Criar Usuário de Teste

Para criar um usuário, você precisará fazer hash da senha usando bcrypt. Exemplo de script Node.js:

```javascript
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

async function createUser() {
    const password = 'senha123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('INSERT INTO users VALUES');
    console.log(`('${uuidv4()}', 'admin@example.com', '${hashedPassword}', 'Admin User', 'admin');`);
}

createUser();
```

## Endpoints de Autenticação

### POST /auth/login

Faz login e retorna um token JWT em um cookie HTTP-only.

**Request:**
```json
{
    "email": "usuario@email.com",
    "password": "senha123"
}
```

**Response (200 OK):**
```json
{
    "success": true,
    "user": {
        "id": "uuid",
        "email": "usuario@email.com",
        "name": "Nome do Usuário",
        "role": "professor"
    },
    "message": "Login realizado com sucesso"
}
```

**Response (401 Unauthorized):**
```json
{
    "success": false,
    "message": "Credenciais inválidas"
}
```

### POST /auth/logout

Faz logout limpando o cookie de autenticação.

**Headers:**
```
Cookie: authToken=<token>
```

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Logout realizado com sucesso"
}
```

### GET /auth/me

Retorna dados do usuário autenticado.

**Headers:**
```
Cookie: authToken=<token>
```

**Response (200 OK):**
```json
{
    "success": true,
    "user": {
        "id": "uuid",
        "email": "usuario@email.com",
        "name": "Nome do Usuário",
        "role": "professor"
    }
}
```

## Roles e Permissões

### Níveis de Acesso

1. **Professor** (`professor`)
   - Acesso apenas de LEITURA aos seus próprios dados
   - Não pode criar, editar ou deletar

2. **Coordenador** (`coordenador`)
   - Pode LER, CRIAR, ATUALIZAR e DELETAR apenas seus próprios dados
   - Acesso limitado aos recursos que possui

3. **Admin** (`admin`)
   - Acesso COMPLETO a todos os dados
   - Pode executar qualquer operação em qualquer recurso

## Middlewares Disponíveis

### authenticate

Valida o token JWT do cookie e anexa informações do usuário ao `req.user`.

```typescript
import { authenticate } from './middlewares/auth.middleware';

router.get('/horarios', authenticate, horarioController.list);
```

### requireRole

Verifica se o usuário tem uma das roles permitidas.

```typescript
import { requireRole } from './middlewares/role.middleware';
import { UserRole } from './types/auth.types';

router.delete('/users/:id', 
    authenticate, 
    requireRole([UserRole.ADMIN]), 
    userController.delete
);
```

### requireAdmin

Atalho para verificar se o usuário é Admin.

```typescript
import { requireAdmin } from './middlewares/role.middleware';

router.delete('/users/:id', 
    authenticate, 
    requireAdmin(), 
    userController.delete
);
```

### requireOwnership

Verifica se o usuário é dono do recurso (ou se é Admin).

```typescript
import { requireOwnership } from './middlewares/role.middleware';

// Verifica se o :id do parâmetro corresponde ao user.id
router.get('/professors/:id', 
    authenticate, 
    requireOwnership(), 
    professorController.get
);

// Verifica outro parâmetro
router.put('/coordenadores/:coordId', 
    authenticate, 
    requireOwnership('coordId'), 
    coordenadorController.update
);
```

### requireReadPermission

Verifica permissões de leitura baseadas em role.

```typescript
import { requireReadPermission } from './middlewares/role.middleware';

router.get('/professors/:id', 
    authenticate, 
    requireReadPermission(), 
    professorController.get
);
```

### requireWritePermission

Verifica permissões de escrita (Professor não pode escrever).

```typescript
import { requireWritePermission } from './middlewares/role.middleware';

router.put('/coordenadores/:id', 
    authenticate, 
    requireWritePermission(), 
    coordenadorController.update
);
```

## Exemplos de Uso

### Rota Pública (sem autenticação)
```typescript
router.get('/horarios', horarioController.list);
```

### Rota que Requer Autenticação
```typescript
router.get('/horarios', authenticate, horarioController.list);
```

### Rota Apenas para Admin
```typescript
router.delete('/users/:id', authenticate, requireAdmin(), userController.delete);
```

### Rota para Professor Ver Seus Próprios Dados
```typescript
router.get('/professors/:id', 
    authenticate, 
    requireReadPermission(), 
    professorController.get
);
```

### Rota para Coordenador Editar Seus Próprios Dados
```typescript
router.put('/coordenadores/:id', 
    authenticate, 
    requireRole([UserRole.COORDENADOR, UserRole.ADMIN]),
    requireOwnership(), 
    coordenadorController.update
);
```

### Rota com Múltiplas Verificações
```typescript
// Coordenador e Admin podem criar, mas Professor não
router.post('/disciplinas', 
    authenticate, 
    requireRole([UserRole.COORDENADOR, UserRole.ADMIN]),
    disciplinaController.create
);
```

## Testando com cURL

### Login
```bash
curl -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"senha123"}' \
  -c cookies.txt
```

### Acessar Rota Autenticada
```bash
curl -X GET http://localhost:3333/auth/me \
  -b cookies.txt
```

### Logout
```bash
curl -X POST http://localhost:3333/auth/logout \
  -b cookies.txt
```

## Testando com Postman/Insomnia

1. Faça login no endpoint `/auth/login`
2. O cookie `authToken` será automaticamente salvo
3. As próximas requisições para rotas autenticadas usarão o cookie automaticamente
4. Para logout, chame `/auth/logout`

## Segurança

### Boas Práticas Implementadas

- ✅ Senhas armazenadas com hash bcrypt (salt rounds: 10)
- ✅ JWT secret armazenado em variável de ambiente
- ✅ Cookies HTTP-only (proteção contra XSS)
- ✅ Cookies Secure em produção (apenas HTTPS)
- ✅ Cookies SameSite strict (proteção contra CSRF)
- ✅ Validação de entrada em todos os endpoints
- ✅ Mensagens de erro genéricas para login (não revela se email existe)
- ✅ Token expira após período configurável

### Recomendações Adicionais

- [ ] Implementar rate limiting no endpoint de login (recomendação de segurança)
  - Usar biblioteca como `express-rate-limit`
  - Limitar tentativas de login por IP (ex: 5 tentativas por 15 minutos)
- [ ] Adicionar validação de força de senha
- [ ] Implementar refresh tokens
- [ ] Adicionar auditoria/logging de ações
- [ ] Implementar 2FA (Two-Factor Authentication)

**Nota sobre Segurança:** CodeQL detectou a ausência de rate limiting nas rotas de autenticação. 
Isso é uma recomendação importante para produção para prevenir ataques de força bruta. 
A proteção CSRF está implementada via configuração `sameSite: 'strict'` nos cookies.

## Códigos de Status HTTP

- `200 OK`: Requisição bem-sucedida
- `400 Bad Request`: Dados de entrada inválidos
- `401 Unauthorized`: Não autenticado ou credenciais inválidas
- `403 Forbidden`: Autenticado mas sem permissão para o recurso
- `500 Internal Server Error`: Erro no servidor

## Troubleshooting

### Token Inválido
- Verifique se o JWT_SECRET está configurado corretamente
- Verifique se o token não expirou
- Certifique-se de que está enviando o cookie corretamente

### Credenciais Inválidas
- Verifique se a senha foi hasheada corretamente no banco
- Confirme que o email existe na tabela users
- Verifique se a role está correta (professor, coordenador, admin)

### CORS Errors
- Configure o `credentials: true` no frontend
- Certifique-se de que a origem está permitida em `src/routes/app.ts`
