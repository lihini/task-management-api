import { v4 as uuidv4 } from 'uuid';
import { Task, TaskStatus } from '../models/task.model';
import { formatDate } from '../utils/date.util';
import { NotFoundError } from '../utils/errors.util';
import { TasksRepository } from '../repositories/tasks.repository';
import { S3Service } from './s3.service';
import { logger } from '../utils/logger.util';

/**
 * Service for Task specific business logic
 */
export class TasksService {
  private repo = new TasksRepository();

  private s3 = new S3Service();

  /**
   * Creates and persists a new task. Task ID is auto generated.
   * If file names are provided, pre-signed urls to upload the files will be returned.
   * @param data properties of the new task
   * @returns created task instance and uploadable urls
   */
  async createTask(data: {
    title: string;
    description: string;
    status?: TaskStatus;
    fileNames?: string[]; // Optional list of file names for upload
  }): Promise<{ task: Task; uploadUrls?: string[] }> {
    const task: Task = {
      id: uuidv4(),   // generate uuid for the task
      title: data.title,
      description: data.description,
      status: data.status || TaskStatus.PENDING,
      createdAt: formatDate(new Date()),
      updatedAt: formatDate(new Date()),
      fileUrls: [],
    };

    const uploadUrls = await this.appendFileUrlsToTask(task, data.fileNames);
    const createdTask = await this.repo.createTask(task);
    logger.info(`Created task with ID: ${task.id}`);
    return { task: createdTask, uploadUrls };
  }

  async getAllTasks(): Promise<Task[]> {
    return this.repo.readTasks();
  }

  /**
   * Fetch a task by its ID.
   * @param id task uuid
   * @returns task instance
   * @throws NotFoundError if task doesn't exist
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
   * If file names are provided, pre-signed urls to upload the files will be returned.
   * @param id task uuid
   * @param data properties of the updated task
   * @returns the updated task
   * @throws NotFoundError if task doesn't exist
   */
  async updateTask(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      status: TaskStatus;
      fileNames?: string[]; // Optional list of additional file names
    }>,
  ): Promise<{ task: Task | null; uploadUrls?: string[] }> {
    const task = await this.getTaskById(id);
    const updatedTask: Partial<Task> = {
      ...task,
      ...data,
      updatedAt: formatDate(new Date()),
      fileUrls: task.fileUrls || [],
    };

    const uploadUrls = await this.appendFileUrlsToTask(updatedTask, data.fileNames);

    const result = await this.repo.updateTask(updatedTask);
    logger.info(`Updated task with ID: ${id}`);
    return { task: result, uploadUrls };
  }

  /**
   * Deletes a task and associated files along with it.
   * @param id task uuid
   */
  async deleteTask(id: string): Promise<void> {
    const task = await this.getTaskById(id); // Ensure task exists
    if (task && task.fileUrls && task.fileUrls.length > 0) {
      // Delete associated files from S3
      const deletePromises = task.fileUrls.map((url) => {
        const key = this.extractS3KeyFromUrl(url);
        return this.s3.deleteFile(key);
      });
      await Promise.all(deletePromises);
      logger.info(`Deleted ${task.fileUrls.length} files for task ${id}`);
    }
    const deleted = await this.repo.deleteTask(id);
    if (!deleted) {
      throw new Error(`Failed to delete task: ${id}`);
    }
    logger.info(`Deleted task with ID: ${id}`);
  }

  /**
   * Extracts the S3 key from a permanent S3 URL.
   * @param url - The S3 URL.
   * @returns The S3 key.
   */
  private extractS3KeyFromUrl(url: string): string {
    const urlParts = new URL(url);
    return urlParts.pathname.slice(1); // Remove leading '/'
  }

  /**
   * Generate pre-signed URLs to upload task attachments. The S3 object URLs for the attachments
   * are appended to the task.
   * @param task task data
   * @param fileNames new attachment names
   * @returns pre-signed URLs for the given fileNames. Use this to put the file to S3.
   */
  private async appendFileUrlsToTask(task: Task | Partial<Task>, fileNames: string[] | undefined): Promise<string[] | undefined> {
    let uploadUrls: string[] | undefined;
    if (fileNames && fileNames.length > 0) {
      // Generate pre-signed URLs and append new permanent URLs
      uploadUrls = await Promise.all(
        fileNames.map(async (fileName) => {
          const key = `${task.id}/${fileName}`;
          const s3Url = this.s3.getFileUrl(key);
          let fileReplaced = false;
          for (const url of (task.fileUrls || [])) {
            if (url === s3Url) {
              fileReplaced = true;
              break;
            }
          }
          if (!fileReplaced) {
            task.fileUrls!.push(s3Url);
          }
          return this.s3.generateUploadUrl(key);
        }),
      );
    }
    return uploadUrls;
  }
}