import { v4 as uuidv4 } from 'uuid';
import { Task, TaskStatus } from '../models/task.model';
import { formatDate } from '../utils/date.util';
import { NotFoundError } from '../utils/errors.util';

export class TasksService {
  tasks: Task[] = [];   // temporary task queue for the POC

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
    this.tasks.push(task);
    return task;
  }

  async getAllTasks(): Promise<Task[]> {
    return this.tasks;
  }

  async getTaskById(id: string): Promise<Task> {
    for (const element of this.tasks) {
      if (element.id === id) {
        return element;
      }
    }
    throw new NotFoundError(`Task not found: ${id}`);
  }

  async updateTask(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      status: TaskStatus;
    }>,
  ): Promise<Task> {
    const task = await this.getTaskById(id);
    const updatedTask: Partial<Task> = {
      ...task,
      ...data,
      updatedAt: formatDate(new Date()),
    };
    return updatedTask as Task;
  }

  async deleteTask(id: string): Promise<void> {
    await this.getTaskById(id);
  }
}