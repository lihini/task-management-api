import { TaskStatus } from '../models/task.model';

export interface CreateTaskDTO {
  title: string;
  description: string;
  status: TaskStatus;
  uploadUrls?: string[];
}

export interface UpdateTaskDTO extends Partial<CreateTaskDTO> {}