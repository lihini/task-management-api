import { TasksRepository } from '../../src/repositories/tasks.repository';
import { DynamoDBService } from '../../src/services/dynamodb.service';
import { Task, TaskStatus } from '../../src/models/task.model';

// Mock the DynamoDBService
jest.mock('../../src/services/dynamodb.service');
const mockDynamoDBService = DynamoDBService as jest.MockedClass<typeof DynamoDBService>;

// Mock the config to control tableName
jest.mock('../../src/config', () => ({
  config: {
    aws: {
      tables: {
        tasks: 'test-tasks',
      },
    },
  },
}));

describe('TasksRepository', () => {
  let repository: TasksRepository;

  beforeEach(() => {
    repository = new TasksRepository();
    mockDynamoDBService.prototype.putItem.mockReset();
    mockDynamoDBService.prototype.scanItems.mockReset();
    mockDynamoDBService.prototype.getItem.mockReset();
    mockDynamoDBService.prototype.updateItem.mockReset();
    mockDynamoDBService.prototype.deleteItem.mockReset();
  });

  describe('createTask', () => {
    it('should create a task in DynamoDB', async () => {
      const task: Task = {
        id: 'uuid-123',
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.PENDING,
        createdAt: '2023-10-01T00:00:00Z',
        updatedAt: '2023-10-01T00:00:00Z',
      };

      mockDynamoDBService.prototype.putItem.mockResolvedValue(task);

      const result = await repository.createTask(task);

      expect(mockDynamoDBService.prototype.putItem).toHaveBeenCalledWith('test-tasks', task);
      expect(result).toEqual(task);
    });
  });

  describe('readTasks', () => {
    it('should return all tasks from DynamoDB', async () => {
      const tasks: Task[] = [
        {
          id: 'uuid-123',
          title: 'Test Task',
          description: 'Test Description',
          status: TaskStatus.PENDING,
          createdAt: '2023-10-01T00:00:00Z',
          updatedAt: '2023-10-01T00:00:00Z',
        },
      ];

      mockDynamoDBService.prototype.scanItems.mockResolvedValue(tasks);

      const result = await repository.readTasks();

      expect(mockDynamoDBService.prototype.scanItems).toHaveBeenCalledWith('test-tasks');
      expect(result).toEqual(tasks);
    });

    it('should return an empty array if no tasks exist', async () => {
      mockDynamoDBService.prototype.scanItems.mockResolvedValue([]);

      const result = await repository.readTasks();

      expect(result).toEqual([]);
    });
  });

  describe('readTaskById', () => {
    it('should return a task by ID', async () => {
      const task: Task = {
        id: 'uuid-123',
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.PENDING,
        createdAt: '2023-10-01T00:00:00Z',
        updatedAt: '2023-10-01T00:00:00Z',
      };

      mockDynamoDBService.prototype.getItem.mockResolvedValue(task);

      const result = await repository.readTaskById('uuid-123');

      expect(mockDynamoDBService.prototype.getItem).toHaveBeenCalledWith('test-tasks', {
        id: 'uuid-123',
      });
      expect(result).toEqual(task);
    });

    it('should return null if task does not exist', async () => {
      mockDynamoDBService.prototype.getItem.mockResolvedValue(null);

      const result = await repository.readTaskById('uuid-123');

      expect(result).toBeNull();
    });
  });

  describe('updateTask', () => {
    it('should update a task and return the updated task', async () => {
      const task: Partial<Task> = {
        id: 'uuid-123',
        title: 'Updated Task',
        description: 'Updated Description',
        status: TaskStatus.IN_PROGRESS,
        updatedAt: '2023-10-02T00:00:00Z',
      };
      const updatedTask: Task = {
        id: 'uuid-123',
        title: 'Updated Task',
        description: 'Updated Description',
        status: TaskStatus.IN_PROGRESS,
        createdAt: '2023-10-01T00:00:00Z',
        updatedAt: '2023-10-02T00:00:00Z',
      };

      mockDynamoDBService.prototype.updateItem.mockResolvedValue(updatedTask);

      const result = await repository.updateTask(task);

      expect(mockDynamoDBService.prototype.updateItem).toHaveBeenCalledWith(
        'test-tasks',
        { id: 'uuid-123' },
        'SET title = :title, description = :desc, #stat = :stat, updatedAt = :updatedAt, fileUrls = :fileUrls',
        { '#stat': 'status' },
        {
          ':title': task.title,
          ':desc': task.description,
          ':stat': task.status,
          ':updatedAt': task.updatedAt,
          ':fileUrls': [],
        },
      );
      expect(result).toEqual(updatedTask);
    });

    it('should return null if task does not exist', async () => {
      const task: Partial<Task> = {
        id: 'uuid-123',
        title: 'Updated Task',
        description: 'Updated Description',
        status: TaskStatus.IN_PROGRESS,
        updatedAt: '2023-10-02T00:00:00Z',
      };

      mockDynamoDBService.prototype.updateItem.mockResolvedValue(null);

      const result = await repository.updateTask(task);

      expect(result).toBeNull();
    });
  });

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      mockDynamoDBService.prototype.deleteItem.mockResolvedValue(true);

      await repository.deleteTask('uuid-123');

      expect(mockDynamoDBService.prototype.deleteItem).toHaveBeenCalledWith('test-tasks', {
        id: 'uuid-123',
      });
    });

    it('should not throw if task does not exist', async () => {
      mockDynamoDBService.prototype.deleteItem.mockResolvedValue(false);

      await expect(repository.deleteTask('uuid-123')).resolves.toBeFalsy();
    });
  });
});