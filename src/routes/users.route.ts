import { Router } from 'express';
import { UserController } from '../controllers/users.controller';

const router = Router();
const controller = new UserController();

/**
 * GET /users  - Fetches users
 */
router.get('/', controller.getUsers.bind(controller));

export default router;