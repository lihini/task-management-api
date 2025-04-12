import { config } from '../config';
import { Task } from '../models/task.model';
import { DynamoDBService } from '../services/dynamodb.service';

/**
 * Data access layer for tasks. Integrates with DynamoDB to persist tasks.
 */
export class TasksRepository {
  private db = new DynamoDBService();
    
  private tableName = config.aws.tables.tasks || 'tasks';  // load db table name from configuration

  /**
   * Create
   * @param task model
   * @returns 
   */
  async createTask(task: Task): Promise<Task> {
    return this.db.putItem(this.tableName, task);
  }

  /**
   * Read all
   * @returns all tasks
   */
  async readTasks(): Promise<Task[]> {
    return this.db.scanItems<Task>(this.tableName);
  }

  /**
   * Read by id
   * @param id task id
   * @returns 
   */
  readTaskById(id: string): Promise<Task | null> {
    return this.db.getItem<Task>(this.tableName, { id });
  }

  /**
   * Update title, description or status of a task
   * @param task model
   * @returns 
   */
  updateTask(task: Partial<Task>): Promise<Task | null> {
    return this.db.updateItem<Task>(
      this.tableName,
      { id: task.id },
      'set title = :title, description = :desc, #stat = :stat, updatedAt = :updatedAt',
      {
        '#stat': 'status',
      },
      {
        ':title': task.title,
        ':desc': task.description,
        ':stat': task.status,
        ':updatedAt': task.updatedAt,
      },
    );
  }

  /**
   * Permanently delete a task
   * @param id task id
   */
  async deleteTask(id: string) {
    await this.db.deleteItem(this.tableName, { id });
  }
}