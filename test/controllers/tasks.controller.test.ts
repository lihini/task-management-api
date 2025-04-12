import request from 'supertest';
import express from 'express';
import tasksRouter from '../../src/routes/tasks.route';
import { TasksService } from '../../src/services/tasks.service';
import { Task, TaskStatus } from '../../src/models/task.model';
import { NotFoundError } from '../../src/utils/errors.util';
import { errorHandler } from '../../src/middlewares/error.middleware';

jest.mock('../../src/services/tasks.service');

const app = express();
app.use(express.json());
app.use('/tasks', tasksRouter);
app.use(errorHandler);


describe('Tasks Controller', () => {
  const mockTasksService = TasksService as jest.MockedClass<typeof TasksService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /tasks creates a task', async () => {
    const task: Task = {
      id: '7f327bd1-ff48-49e2-83e4-d5a303403be8',
      title: 'Test Task',
      description: 'Test Description',
      status: TaskStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockTasksService.prototype.createTask.mockResolvedValue(task);

    const response = await request(app)
      .post('/tasks')
      .send({
        title: 'Test Task',
        description: 'Test Description',
      })
      .expect(201);

    expect(response.body).toEqual(task);
    expect(mockTasksService.prototype.createTask).toHaveBeenCalled();
  });

  it('POST /tasks returns 400 for invalid data', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({
        id: 'somestring',
        title: 'Test Task',
        status: TaskStatus.PENDING,
      })
      .expect(400);

    expect(response.body).toMatchObject({
      message: 'Validation errors found',
      status: 400,
      type: 'ValidationError',
    });
    expect(mockTasksService.prototype.createTask).not.toHaveBeenCalled();
  });

  it('GET /tasks returns all tasks', async () => {
    const tasks: Task[] = [
      {
        id: 'uuid',
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.PENDING,
        createdAt: '2023-10-01T00:00:00Z',
        updatedAt: '2023-10-01T00:00:00Z',
      },
    ];
    mockTasksService.prototype.getAllTasks.mockResolvedValue(tasks);

    const response = await request(app).get('/tasks').expect(200);
    expect(response.body).toEqual({ tasks });
  });

  it('GET /tasks/:id fetches task', async () => {
    const task: Task = {
      id: '69d623ab-f1ef-4b1f-bd90-d741e4f45c48',
      title: 'Test Task',
      description: 'Test Description',
      status: TaskStatus.PENDING,
      createdAt: '2023-10-01T00:00:00Z',
      updatedAt: '2023-10-01T00:00:00Z',
    };
    mockTasksService.prototype.getTaskById.mockResolvedValue(task);

    const response = await request(app).get('/tasks/69d623ab-f1ef-4b1f-bd90-d741e4f45c48').expect(200);
    expect(response.body).toEqual(task);
  });

  it('GET /tasks/:id returns 400 for invalid task id', async () => {
    const response = await request(app).get('/tasks/somestring').expect(400);

    expect(response.body).toMatchObject({
      message: 'Validation errors found',
      status: 400,
      type: 'ValidationError',
    });
    expect(mockTasksService.prototype.getTaskById).not.toHaveBeenCalled();
  });


  it('GET /tasks/:id returns 404 for non-existent task', async () => {
    mockTasksService.prototype.getTaskById.mockRejectedValue(
      new NotFoundError('Task with ID 69d623ab-f1ef-4b1f-bd90-d741e4f45c48 not found'),
    );

    const response = await request(app).get('/tasks/69d623ab-f1ef-4b1f-bd90-d741e4f45c48').expect(404);

    expect(response.body).toEqual({
      error: {
        message: 'Task with ID 69d623ab-f1ef-4b1f-bd90-d741e4f45c48 not found',
        type: 'NotFoundError',
      },
      status: 404,
    });
    expect(mockTasksService.prototype.getTaskById).toHaveBeenCalledWith('69d623ab-f1ef-4b1f-bd90-d741e4f45c48');
  });

  it('PUT /tasks/:id updates task', async () => {
    const task: Task = {
      id: '69d623ab-f1ef-4b1f-bd90-d741e4f45c48',
      title: 'Updated Task',
      description: 'Updated Description',
      status: TaskStatus.IN_PROGRESS,
      createdAt: '2023-10-01T00:00:00Z',
      updatedAt: '2023-10-01T00:00:00Z',
    };
    mockTasksService.prototype.updateTask.mockResolvedValue(task);

    const response = await request(app)
      .put('/tasks/69d623ab-f1ef-4b1f-bd90-d741e4f45c48')
      .send({
        title: 'Updated Task',
        description: 'Updated Description',
      })
      .expect(200);
    expect(response.body).toEqual(task);
  });

  it('PUT /tasks/:id returns 400 for invalid data', async () => {
    const response = await request(app)
      .put('/tasks/somestring')
      .send({
        title: 'Test Task',
        status: TaskStatus.PENDING,
      })
      .expect(400);

    expect(response.body).toMatchObject({
      message: 'Validation errors found',
      status: 400,
      type: 'ValidationError',
    });
    expect(mockTasksService.prototype.createTask).not.toHaveBeenCalled();
  });

  it('PUT /tasks/:id returns 404 for non-existent task', async () => {
    mockTasksService.prototype.updateTask.mockRejectedValue(
      new NotFoundError('Task with ID 69d623ab-f1ef-4b1f-bd90-d741e4f45c48 not found'),
    );

    const response = await request(app)
      .put('/tasks/69d623ab-f1ef-4b1f-bd90-d741e4f45c48')
      .send({ title: 'Updated Task', description: 'Existing description', status: 'pending' })
      .expect(404);

    expect(response.body).toEqual({
      error: {
        message: 'Task with ID 69d623ab-f1ef-4b1f-bd90-d741e4f45c48 not found',
        type: 'NotFoundError',
      },
      status: 404,
    });
  });

  it('DELETE /tasks/:id deletes task', async () => {
    mockTasksService.prototype.deleteTask.mockResolvedValue();

    await request(app).delete('/tasks/69d623ab-f1ef-4b1f-bd90-d741e4f45c48').expect(204);
  });

  it('DELETE /tasks/:id returns 404 for non-existent task', async () => {
    mockTasksService.prototype.deleteTask.mockRejectedValue(
      new NotFoundError('Task with ID 69d623ab-f1ef-4b1f-bd90-d741e4f45c48 not found'),
    );

    const response = await request(app).delete('/tasks/69d623ab-f1ef-4b1f-bd90-d741e4f45c48').expect(404);

    expect(response.body).toEqual({
      error: {
        message: 'Task with ID 69d623ab-f1ef-4b1f-bd90-d741e4f45c48 not found',
        type: 'NotFoundError',
      },
      status: 404,
    });
  });
});