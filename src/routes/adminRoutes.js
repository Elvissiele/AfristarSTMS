import express from 'express';
import { updateTicket } from '../controllers/ticketController.js';
import { getUsers } from '../controllers/userController.js';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticateToken);

// Strictly Admin Only
// Matches path: /api/v1/admin/tickets/:id
router.patch('/tickets/:id', authorizeRole(['ADMIN']), updateTicket);

// Matches path: /api/v1/admin/users
router.get('/users', authorizeRole(['ADMIN']), getUsers);

export default router;
