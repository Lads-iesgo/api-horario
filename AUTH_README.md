# Authentication and Authorization System

## Overview
This API implements JWT-based authentication with role-based access control (RBAC).

## User Roles
The system supports three different user roles:

1. **Professor** (idPerfil = 1)
   - Read-only access to their own data
   - Cannot modify or delete data

2. **Coordenador** (idPerfil = 2)
   - Full access (read, write, update, delete) to their own data
   - Cannot access other users' data

3. **Admin** (idPerfil = 3)
   - Full access to all data in the system
   - Can manage all users and resources

## Authentication Endpoints

### POST /auth/login
Authenticates a user and returns a JWT token stored in a cookie.

**Request Body:**
```json
{
  "emailUsuario": "user@example.com",
  "senha": "password123"
}
```

**Response (Success - 200):**
```json
{
  "message": "Login realizado com sucesso",
  "user": {
    "idUsuario": 1,
    "nomeUsuario": "John Doe",
    "emailUsuario": "user@example.com",
    "role": "professor",
    "idPerfil": 1
  }
}
```

**Cookie:** A JWT token is automatically stored in an httpOnly cookie named `token`.

**Response (Error - 401):**
```json
{
  "message": "Email ou senha inválidos"
}
```

### POST /auth/logout
Logs out the current user by clearing the authentication cookie.

**Response (Success - 200):**
```json
{
  "message": "Logout realizado com sucesso"
}
```

### GET /auth/me
Returns information about the currently authenticated user.

**Headers Required:**
- Cookie with valid JWT token

**Response (Success - 200):**
```json
{
  "user": {
    "idUsuario": 1,
    "emailUsuario": "user@example.com",
    "nomeUsuario": "John Doe",
    "role": "professor",
    "idPerfil": 1
  }
}
```

**Response (Error - 401):**
```json
{
  "message": "Não autenticado"
}
```

## User Management

### POST /usuario
Creates a new user with a hashed password.

**Request Body:**
```json
{
  "nomeUsuario": "John Doe",
  "emailUsuario": "user@example.com",
  "senha": "password123",
  "idPerfil": 1,
  "ativo": 1
}
```

**Note:** The password is automatically hashed using bcrypt before storage.

## Using Authentication Middleware

### Protecting Routes
To protect a route and require authentication, use the `authenticateToken` middleware:

```typescript
import { authenticateToken } from "../middleware/auth";

router.get("/protected-route", authenticateToken, controller);
```

### Role-Based Authorization
To restrict access based on user roles, use the `requireRole` middleware:

```typescript
import { authenticateToken, requireRole } from "../middleware/auth";
import { UserRole } from "../interface/types";

// Only admins can access
router.delete("/data/:id", 
  authenticateToken, 
  requireRole(UserRole.ADMIN), 
  controller
);

// Coordenadores and admins can access
router.put("/data/:id", 
  authenticateToken, 
  requireRole(UserRole.COORDENADOR, UserRole.ADMIN), 
  controller
);
```

### Ownership-Based Authorization
To allow users to access only their own data or allow higher-level roles:

```typescript
import { authenticateToken, requireOwnershipOrRole } from "../middleware/auth";
import { UserRole } from "../interface/types";

// Users can access their own data, or coordenadores/admins can access
router.get("/usuario/:idUsuario", 
  authenticateToken, 
  requireOwnershipOrRole(UserRole.COORDENADOR, UserRole.ADMIN), 
  controller
);
```

## Environment Variables

Add these to your `.env` file:

```env
JWT_SECRET=your-super-secret-key-here-change-this-in-production
NODE_ENV=development
```

**Important:** 
- Change `JWT_SECRET` to a strong, random string in production
- Set `NODE_ENV=production` in production to enable secure cookies

## Security Features

1. **Password Hashing:** All passwords are hashed using bcrypt with a salt factor of 10
2. **HTTP-Only Cookies:** JWT tokens are stored in httpOnly cookies to prevent XSS attacks
3. **Secure Cookies:** In production, cookies are marked as secure (HTTPS only)
4. **SameSite Protection:** Cookies use SameSite=strict to prevent CSRF attacks
5. **Token Expiration:** JWT tokens expire after 24 hours
6. **Role-Based Access Control:** Fine-grained access control based on user roles

## Frontend Integration

When making requests from the frontend, ensure:

1. **Include Credentials:** Set `credentials: 'include'` in fetch requests
   ```javascript
   fetch('http://localhost:3333/auth/login', {
     method: 'POST',
     credentials: 'include',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       emailUsuario: 'user@example.com',
       senha: 'password123'
     })
   })
   ```

2. **CORS Configuration:** The API is configured to accept requests from `http://localhost:3000` with credentials enabled

3. **Cookie Storage:** Cookies are automatically sent with subsequent requests when `credentials: 'include'` is set

## Testing the Authentication

You can test the authentication using curl or Postman:

```bash
# Login
curl -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailUsuario":"user@example.com","senha":"password123"}' \
  -c cookies.txt

# Get current user (using saved cookies)
curl http://localhost:3333/auth/me -b cookies.txt

# Logout
curl -X POST http://localhost:3333/auth/logout -b cookies.txt
```
