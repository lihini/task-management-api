import { v4 as uuidv4 } from 'uuid';
import { Task, TaskStatus } from '../models/task.model';
import { formatDate } from '../utils/date.util';
import { NotFoundError } from '../utils/errors.util';
import { TasksRepository } from '../repositories/tasks.repository';

/**
 * Service for Task specific business logic
 */
export class TasksService {
  private repo = new TasksRepository();

  /**
   * Creates and persists a new task. Task ID is auto generated.
   * @param data properties of the new task
   * @returns created task instance
   */
  async createTask(data: {
    title: string;
    description: string;
    status?: TaskStatus;
  }): Promise<Task> {
    const task: Task = {
      id: uuidv4(),   // generate uuid for the task
      title: data.title,
      description: data.description,
      status: data.status || TaskStatus.PENDING,
      createdAt: formatDate(new Date()),
      updatedAt: formatDate(new Date()),
    };
    return this.repo.createTask(task);
  }

  /**
   * Fetch all persisted tasks. 
   * @returns list of tasks
   */
  async getAllTasks(): Promise<Task[]> {
    return this.repo.readTasks();
  }

  /**
   * Fetch a task by its ID.
   * @param id task uuid
   * @returns task instance
   */
  async getTaskById(id: string): Promise<Task> {
    const task = await this.repo.readTaskById(id);
    if (!task) {
      throw new NotFoundError(`Task not found: ${id}`);
    }
    return task;
  }

  /**
   * Updates a given task. This will replace the existing task.
   * @param id task uuid
   * @param data properties of the updated task
   * @returns null if a task doesn't exist for the given id or the updated task
   */
  async updateTask(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      status: TaskStatus;
    }>,
  ): Promise<Task | null> {
    const task = await this.getTaskById(id);
    const updatedTask: Partial<Task> = {
      ...task,
      ...data,
      updatedAt: formatDate(new Date()),
    };
    return this.repo.updateTask(updatedTask);
  }

  /**
   * Deletes a task.
   * @param id task uuid
   */
  async deleteTask(id: string): Promise<void> {
    return this.repo.deleteTask(id);
  }
}