import { NextFunction, Request, Response } from 'express';
import { TasksService } from '../services/tasks';
import { CreateTaskDTO, UpdateTaskDTO } from '../dtos/task.dto';

/**
 * Controllers for /tasks API endpoints
 */
export class TasksController {
  private tasksService: TasksService;

  constructor() {
    this.tasksService = new TasksService();
  }

  async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const models = await this.tasksService.createTask(req.body);
      const resource: CreateTaskDTO = {
        ...models.task,
        uploadUrls: models.uploadUrls,
      };
      res.status(201).json(resource);
    } catch (error) {
      next(error);
    }
  }

  async getAllTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tasks = {
        tasks: await this.tasksService.getAllTasks(),
      };
      res.status(200).json(tasks);
    } catch (error) {
      next(error);
    }
  }

  async getTaskById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const task = await this.tasksService.getTaskById(req.params.id);
      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const models = await this.tasksService.updateTask(req.params.id, req.body);
      const resource: UpdateTaskDTO = {
        ...models.task,
        uploadUrls: models.uploadUrls,
      };
      res.status(200).json(resource);
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.tasksService.deleteTask(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}