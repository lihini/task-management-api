# Task Management API

A RESTful API for managing tasks using Node.js, TypeScript, and AWS (DynamoDB, S3).

## Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd task-management-api
   ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Configure environment variables: Copy .env.example to .env and fill in your AWS credentials and configurations.

4. Build the project:
    ```bash
    npm run build
    ```

5. Run the application:
    ```bash
    npm start
    ```

6. Run in development mode:
    ```bash
    npm run dev
    ```

7. Run tests:
    ```bash
    npm run test
    ```

## Endpoints
- POST /tasks: Create a task
- GET /tasks: Get all tasks
- GET /tasks/:id: Get a task by ID
- PUT /tasks/:id: Update a task
- DELETE /tasks/:id: Delete a task