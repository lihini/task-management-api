import { Router } from 'express';
import { TasksController } from '../controllers/tasks.controller';
import {
  validateTaskId,
  validateTask,
  validateRequest,
} from '../middlewares/validate.middleware';

const router = Router();
const controller = new TasksController();

/**
 * POST /tasks  - Creates a task
 */
router.post('/', validateTask, validateRequest, controller.createTask.bind(controller));

/**
 * GET /tasks  - Fetches all tasks
 */
router.get('/', controller.getAllTasks.bind(controller));

/**
 * GET /tasks/:id  - Fetches a specific task
 */
router.get(
  '/:id',
  validateTaskId,
  validateRequest,
  controller.getTaskById.bind(controller),
);

/**
 * PUT /tasks/:id  - Updates a specific task
 */
router.put(
  '/:id',
  validateTaskId,
  validateTask,
  validateRequest,
  controller.updateTask.bind(controller),
);

/**
 * DELETE /tasks/:id  - Deletes a task
 */
router.delete(
  '/:id',
  validateTaskId,
  validateRequest,
  controller.deleteTask.bind(controller),
);

export default router;