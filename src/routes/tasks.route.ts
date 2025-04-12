import { Router } from 'express';
import { TasksController } from '../controllers/tasks.controller';
import {
  validateTaskId,
  validateTask,
  validateRequest,
} from '../middlewares/validate.middleware';

const router = Router();
const controller = new TasksController();

router.post('/', validateTask, validateRequest, controller.createTask.bind(controller));
router.get('/', controller.getAllTasks.bind(controller));
router.get(
  '/:id',
  validateTaskId,
  validateRequest,
  controller.getTaskById.bind(controller),
);
router.put(
  '/:id',
  validateTaskId,
  validateTask,
  validateRequest,
  controller.updateTask.bind(controller),
);
router.delete(
  '/:id',
  validateTaskId,
  validateRequest,
  controller.deleteTask.bind(controller),
);

export default router;