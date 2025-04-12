import { TaskStatus } from '../models/task.model';

export interface CreateTaskDTO {
  title: string;
  description: string;
  status: TaskStatus;
}

export interface UpdateTaskDTO extends CreateTaskDTO {}