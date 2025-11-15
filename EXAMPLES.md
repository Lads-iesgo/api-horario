# Examples: Protecting Routes with Authentication

This file provides examples of how to apply authentication and authorization to existing routes in the API.

## Basic Authentication Protection

To require authentication for a route:

```typescript
import { authenticateToken } from "../middleware/auth";

// Before (no authentication)
router.get("/professor", getProfessor);

// After (requires authentication)
router.get("/professor", authenticateToken, getProfessor);
```

## Role-Based Protection Examples

### Example 1: Professor Routes (Read-Only)
```typescript
import { authenticateToken, requireRole } from "../middleware/auth";
import { UserRole } from "../interface/types";

// Professors can only view their own data
router.get(
  "/professor/:idProfessor",
  authenticateToken,
  requireOwnershipOrRole(UserRole.COORDENADOR, UserRole.ADMIN),
  getProfessorById
);
```

### Example 2: Coordenador Routes (Own Data Management)
```typescript
import { authenticateToken, requireRole, requireOwnershipOrRole } from "../middleware/auth";
import { UserRole } from "../interface/types";

// Only coordenadores and admins can create professors
router.post(
  "/professor",
  authenticateToken,
  requireRole(UserRole.COORDENADOR, UserRole.ADMIN),
  createProfessor
);

// Coordenadores can update their supervised professors, admins can update any
router.put(
  "/professor/:idProfessor",
  authenticateToken,
  requireOwnershipOrRole(UserRole.COORDENADOR, UserRole.ADMIN),
  updateProfessor
);

// Coordenadores can delete their supervised professors, admins can delete any
router.delete(
  "/professor/:idProfessor",
  authenticateToken,
  requireOwnershipOrRole(UserRole.COORDENADOR, UserRole.ADMIN),
  deleteProfessor
);
```

### Example 3: Admin Routes (Full Access)
```typescript
import { authenticateToken, requireRole } from "../middleware/auth";
import { UserRole } from "../interface/types";

// Only admins can manage all users
router.get(
  "/usuario",
  authenticateToken,
  requireRole(UserRole.ADMIN),
  getUsuario
);

router.delete(
  "/usuario/:idUsuario",
  authenticateToken,
  requireRole(UserRole.ADMIN),
  deleteUsuario
);
```

## Complete Example: Updated Professor Routes

Here's how to update the professor routes file:

```typescript
// src/routes/professor.routes.ts
import express from "express";
import {
  getProfessor,
  getProfessorById,
  getProfessorByCoordenador,
  getProfessorByCurso,
  createProfessor,
} from "../controller/professorController";
import { authenticateToken, requireRole, requireOwnershipOrRole } from "../middleware/auth";
import { UserRole } from "../interface/types";

const router = express.Router();

// Public routes (no authentication needed)
// None - all professor data should be protected

// Protected routes - require authentication
// All authenticated users can view professor lists
router.get("/", authenticateToken, getProfessor);
router.get("/coordenador/:coordenador_idProfessor", authenticateToken, getProfessorByCoordenador);
router.get("/curso/:idCurso", authenticateToken, getProfessorByCurso);

// Professors can view their own data, coordenadores and admins can view any
router.get(
  "/:idProfessor",
  authenticateToken,
  requireOwnershipOrRole(UserRole.COORDENADOR, UserRole.ADMIN),
  getProfessorById
);

// Only coordenadores and admins can create professors
router.post(
  "/",
  authenticateToken,
  requireRole(UserRole.COORDENADOR, UserRole.ADMIN),
  createProfessor
);

// Note: Add update and delete routes as needed following the same pattern

export default router;
```

## Complete Example: Updated Usuario Routes

```typescript
// src/routes/usuario.routes.ts
import express from "express";
import {
  getUsuario,
  getUsuarioById,
  createUsuario,
} from "../controller/usuarioController";
import { authenticateToken, requireRole, requireOwnershipOrRole } from "../middleware/auth";
import { UserRole } from "../interface/types";

const router = express.Router();

// Only admins can view all users
router.get("/", authenticateToken, requireRole(UserRole.ADMIN), getUsuario);

// Users can view their own data, admins can view any user
router.get(
  "/:idUsuario",
  authenticateToken,
  requireOwnershipOrRole(UserRole.ADMIN),
  getUsuarioById
);

// Admin-only: Create new users
// In production, you might want a public registration endpoint with different logic
router.post("/", authenticateToken, requireRole(UserRole.ADMIN), createUsuario);

export default router;
```

## Accessing User Information in Controllers

Once authenticated, you can access user information in your controllers:

```typescript
export const getProfessorById = async (
  req: Request<{ idProfessor: number }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const idProfessor = req.params.idProfessor;
    
    // Access authenticated user information
    const currentUser = req.user;
    console.log(`User ${currentUser?.nomeUsuario} (${currentUser?.role}) is accessing professor ${idProfessor}`);
    
    // For professors, ensure they can only access their own data
    if (currentUser?.role === UserRole.PROFESSOR && currentUser.idUsuario !== Number(idProfessor)) {
      res.status(403).json({ message: "Você só pode acessar seus próprios dados" });
      return;
    }
    
    const [rows] = await pool.query(
      "SELECT * FROM Professores WHERE idProfessor = ?",
      [idProfessor],
    );

    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
};
```

## Testing with cURL

### 1. Create a user
```bash
curl -X POST http://localhost:3333/usuario \
  -H "Content-Type: application/json" \
  -d '{
    "nomeUsuario": "Professor João",
    "emailUsuario": "joao@example.com",
    "senha": "senha123",
    "idPerfil": 1
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailUsuario": "joao@example.com",
    "senha": "senha123"
  }' \
  -c cookies.txt
```

### 3. Access protected route
```bash
curl http://localhost:3333/professor \
  -b cookies.txt
```

### 4. Access own user data
```bash
curl http://localhost:3333/auth/me \
  -b cookies.txt
```

### 5. Logout
```bash
curl -X POST http://localhost:3333/auth/logout \
  -b cookies.txt
```

## Frontend Integration Example (React/JavaScript)

```javascript
// Login function
async function login(email, password) {
  const response = await fetch('http://localhost:3333/auth/login', {
    method: 'POST',
    credentials: 'include', // Important: enables cookies
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      emailUsuario: email,
      senha: password
    })
  });
  
  if (response.ok) {
    const data = await response.json();
    return data.user; // Contains user info and role
  } else {
    throw new Error('Login failed');
  }
}

// Fetch protected data
async function fetchProfessors() {
  const response = await fetch('http://localhost:3333/professor', {
    credentials: 'include', // Important: sends cookies
  });
  
  if (response.ok) {
    return await response.json();
  } else if (response.status === 401) {
    // User is not authenticated, redirect to login
    window.location.href = '/login';
  } else if (response.status === 403) {
    // User doesn't have permission
    alert('Você não tem permissão para acessar este recurso');
  }
}

// Logout function
async function logout() {
  await fetch('http://localhost:3333/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
  
  // Redirect to login page
  window.location.href = '/login';
}

// Check current user
async function getCurrentUser() {
  const response = await fetch('http://localhost:3333/auth/me', {
    credentials: 'include',
  });
  
  if (response.ok) {
    const data = await response.json();
    return data.user;
  }
  return null;
}
```

## Role-Based UI Example (React)

```javascript
function Dashboard() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);
  
  if (!user) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Welcome, {user.nomeUsuario}</h1>
      <p>Role: {user.role}</p>
      
      {/* Show different options based on role */}
      {user.role === 'professor' && (
        <div>
          <h2>My Data</h2>
          <button onClick={() => viewMyData()}>View My Profile</button>
        </div>
      )}
      
      {(user.role === 'coordenador' || user.role === 'admin') && (
        <div>
          <h2>Management</h2>
          <button onClick={() => manageProfessors()}>Manage Professors</button>
          <button onClick={() => manageGrades()}>Manage Grades</button>
        </div>
      )}
      
      {user.role === 'admin' && (
        <div>
          <h2>Admin Panel</h2>
          <button onClick={() => manageUsers()}>Manage All Users</button>
          <button onClick={() => viewSystemLogs()}>View System Logs</button>
        </div>
      )}
    </div>
  );
}
```

## Important Notes

1. **Always use `credentials: 'include'`** in frontend fetch requests to send cookies
2. **The middleware order matters**: Always use `authenticateToken` before `requireRole` or `requireOwnershipOrRole`
3. **Test each role**: Make sure to test with users of different roles to verify permissions work correctly
4. **Handle 401 and 403 errors**: Redirect to login on 401, show error message on 403
5. **Secure the cookie**: In production, ensure HTTPS is used and NODE_ENV is set to 'production'
