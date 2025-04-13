import { TasksService } from '../../src/services/tasks.service';
import { TasksRepository } from '../../src/repositories/tasks.repository';
import { Task, TaskStatus } from '../../src/models/task.model';
import { NotFoundError } from '../../src/utils/errors.util'; // Adjust path if needed
import { v4 as uuidv4 } from 'uuid';
import { formatDate } from '../../src/utils/date.util';

// Mock the TasksRepository
jest.mock('../../src/repositories/tasks.repository');
const mockTasksRepository = TasksRepository as jest.MockedClass<typeof TasksRepository>;

// Mock uuid and formatDate to control outputs
jest.mock('uuid');
jest.mock('../../src/utils/date.util');

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(() => {
    service = new TasksService();
    mockTasksRepository.prototype.createTask.mockReset();
    mockTasksRepository.prototype.readTasks.mockReset();
    mockTasksRepository.prototype.readTaskById.mockReset();
    mockTasksRepository.prototype.updateTask.mockReset();
    mockTasksRepository.prototype.deleteTask.mockReset();
    (uuidv4 as jest.Mock).mockReset();
    (formatDate as jest.Mock).mockReset();
  });

  describe('createTask', () => {
    it('should create a task with generated ID and timestamps', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
      };
      const mockTask: Task = {
        id: 'uuid-123',
        title: taskData.title,
        description: taskData.description,
        status: TaskStatus.PENDING,
        createdAt: '2023-10-01T00:00:00Z',
        updatedAt: '2023-10-01T00:00:00Z',
      };

      (uuidv4 as jest.Mock).mockReturnValue('uuid-123');
      (formatDate as jest.Mock).mockReturnValue('2023-10-01T00:00:00Z');
      mockTasksRepository.prototype.createTask.mockResolvedValue(mockTask);

      const result = await service.createTask(taskData);

      expect(uuidv4).toHaveBeenCalled();
      expect(formatDate).toHaveBeenCalledTimes(2);
      expect(mockTasksRepository.prototype.createTask).toHaveBeenCalledWith(mockTask);
      expect(result).toEqual(mockTask);
    });

    it('should create a task with provided title, description and status', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.IN_PROGRESS,
      };
      const mockTask: Task = {
        id: 'uuid-123',
        title: taskData.title,
        description: taskData.description,
        status: TaskStatus.IN_PROGRESS,
        createdAt: '2023-10-01T00:00:00Z',
        updatedAt: '2023-10-01T00:00:00Z',
      };

      (uuidv4 as jest.Mock).mockReturnValue('uuid-123');
      (formatDate as jest.Mock).mockReturnValue('2023-10-01T00:00:00Z');
      mockTasksRepository.prototype.createTask.mockResolvedValue(mockTask);

      const result = await service.createTask(taskData);

      expect(mockTasksRepository.prototype.createTask).toHaveBeenCalledWith(mockTask);
      expect(result).toEqual(mockTask);
    });
  });

  describe('getAllTasks', () => {
    it('should return all tasks', async () => {
      const mockTasks: Task[] = [
        {
          id: 'uuid-123',
          title: 'Test Task',
          description: 'Test Description',
          status: TaskStatus.PENDING,
          createdAt: '2023-10-01T00:00:00Z',
          updatedAt: '2023-10-01T00:00:00Z',
        },
      ];

      mockTasksRepository.prototype.readTasks.mockResolvedValue(mockTasks);

      const result = await service.getAllTasks();

      expect(mockTasksRepository.prototype.readTasks).toHaveBeenCalled();
      expect(result).toEqual(mockTasks);
    });

    it('should return an empty array if no tasks exist', async () => {
      mockTasksRepository.prototype.readTasks.mockResolvedValue([]);

      const result = await service.getAllTasks();

      expect(result).toEqual([]);
    });
  });

  describe('getTaskById', () => {
    it('should return a task by ID', async () => {
      const mockTask: Task = {
        id: 'uuid-123',
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.PENDING,
        createdAt: '2023-10-01T00:00:00Z',
        updatedAt: '2023-10-01T00:00:00Z',
      };

      mockTasksRepository.prototype.readTaskById.mockResolvedValue(mockTask);

      const result = await service.getTaskById('uuid-123');

      expect(mockTasksRepository.prototype.readTaskById).toHaveBeenCalledWith('uuid-123');
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundError if task does not exist', async () => {
      mockTasksRepository.prototype.readTaskById.mockResolvedValue(null);

      await expect(service.getTaskById('uuid-123')).rejects.toThrow(
        new NotFoundError('Task not found: uuid-123'),
      );
    });
  });

  describe('updateTask', () => {
    it('should update a task and return the updated task', async () => {
      const existingTask: Task = {
        id: 'uuid-123',
        title: 'Old Task',
        description: 'Old Description',
        status: TaskStatus.PENDING,
        createdAt: '2023-10-01T00:00:00Z',
        updatedAt: '2023-10-01T00:00:00Z',
      };
      const updateData = {
        title: 'New Task',
        status: TaskStatus.IN_PROGRESS,
      };
      const updatedTask: Task = {
        ...existingTask,
        ...updateData,
        updatedAt: '2023-10-02T00:00:00Z',
      };

      mockTasksRepository.prototype.readTaskById.mockResolvedValue(existingTask);
      (formatDate as jest.Mock).mockReturnValue('2023-10-02T00:00:00Z');
      mockTasksRepository.prototype.updateTask.mockResolvedValue(updatedTask);

      const result = await service.updateTask('uuid-123', updateData);

      expect(mockTasksRepository.prototype.readTaskById).toHaveBeenCalledWith('uuid-123');
      expect(mockTasksRepository.prototype.updateTask).toHaveBeenCalledWith({
        ...existingTask,
        ...updateData,
        updatedAt: '2023-10-02T00:00:00Z',
      });
      expect(result).toEqual(updatedTask);
    });

    it('should throw NotFoundError if task does not exist', async () => {
      mockTasksRepository.prototype.readTaskById.mockResolvedValue(null);

      await expect(service.updateTask('uuid-123', { title: 'New Task' })).rejects.toThrow(
        new NotFoundError('Task not found: uuid-123')
      );
    });
  });

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      mockTasksRepository.prototype.deleteTask.mockResolvedValue(undefined);

      await service.deleteTask('uuid-123');

      expect(mockTasksRepository.prototype.deleteTask).toHaveBeenCalledWith('uuid-123');
    });
  });
});