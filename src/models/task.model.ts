/**
 * Possible statuses of a task
 */
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
}

/**
 * Structure of task as stored in db
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  fileUrls?: string[]; // Array of S3 file URLs (optional)
  createdAt: string;
  updatedAt: string;
}