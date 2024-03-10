import { Router } from 'express';
import { authToken, passportCall, authorization } from '../dirname.js';
import UsersController from '../controllers/UsersViewsController.js';
import passport from 'passport';

const router = Router();

// Renderiza la vista de inicio de sesión
router.get("/login", UsersController.renderLogin);

// Renderiza la vista de registro
router.get("/register", UsersController.renderRegister);

// Renderiza la vista del perfil de usuario
router.get("/", passportCall('jwt'), UsersController.renderProfile);

// Obtiene información del usuario por ID
router.get("/:userId", authToken, UsersController.getUserById);

export default router;
