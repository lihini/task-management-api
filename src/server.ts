import express from 'express';
import { config } from './config';
import tasksRouter from './routes/tasks.route';
import { errorHandler } from './middlewares/error.middleware';
import cors from 'cors';
import morgan from 'morgan';
import { serve, setup } from 'swagger-ui-express';
import swaggerDocument from './swagger.json';

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use('/tasks', tasksRouter);
app.use('/api-docs', serve, setup(swaggerDocument));

app.get<{}, { message: string }>('/', (req, res) => {
  res.json({
    message: 'Task Management API',
  });
});

app.use(errorHandler);

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});