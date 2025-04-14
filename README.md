# Task Management API

A scalable RESTful API for managing tasks, built with Node.js, TypeScript, and AWS services (DynamoDB and S3).

## Features
- Create, read, update, and delete tasks.
- Task fields: `id`, `title`, `description`, `status`, `createdAt`, `updatedAt`.
- Input validation and error handling.
- Integration with AWS DynamoDB for task storage.
- Integration with AWS S3 for file attachments.
- Comprehensive unit and integration tests.
- Logging with Winston.

## Prerequisites
- Node.js v22 LTS
- AWS account with DynamoDB and S3 access
- TypeScript
- Git
- AWS CLI (for provisioning)
- AWS CDK (optional, for CDK-based provisioning)

## Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd task-management-api
   ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Provision DynamoDB Table**:

    3.1. Create a table named `tasks` with a partition key `id` (string).

    ```bash
    aws dynamodb create-table \
        --table-name tasks \
        --attribute-definitions AttributeName=id,AttributeType=S \
        --key-schema AttributeName=id,KeyType=HASH \
        --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
        --region us-east-1
    ```

    3.2. Create a table name `cache` with a partition key `key` (string).

    ```bash
    aws dynamodb create-table \
        --table-name cache \
        --attribute-definitions AttributeName=key,AttributeType=S \
        --key-schema AttributeName=key,KeyType=HASH \
        --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
        --region us-east-1
    ```

4. **Provision S3 bucket**:

    Create an S3 bucket named `task-attachments`.
    ```bash
    aws s3api create-bucket \
        --bucket task-attachments \
        --region us-east-1
    ```

    Configure CORS for client-side uploads (save as cors.json):
    ```json
    {
        "CORSRules": [
            {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["PUT"],
            "AllowedOrigins": ["*"],
            "MaxAgeSeconds": 3000
            }
        ]
    }
    ```

    Apply CORS:
    ```bash
    aws s3api put-bucket-cors \
        --bucket task-attachments \
        --cors-configuration file://cors.json
    ```

5. **Configure environment variables**: 

    Copy `.env.sample` to `.env` and fill in your AWS credentials and configurations.

6. Build the project:
    ```bash
    npm run build
    ```

7. Run the application:
    ```bash
    npm start
    ```

8. Run in development mode:
    ```bash
    npm run dev
    ```

9. Run tests:
    ```bash
    npm run test
    ```

## API Endpoints
- POST /tasks: Create a task
- GET /tasks: Get all tasks
- GET /tasks/:id: Get a task by ID
- PUT /tasks/:id: Update a task
- DELETE /tasks/:id: Delete a task

## File Upload Workflow
1. Send fileNames in POST /tasks or PUT /tasks/:id.
2. Receive pre-signed uploadUrls in the response.
3. Use the URLs to upload files directly to S3 via client-side PUT requests.
4. Permanent file URLs are stored in the task's fileUrls field.

## External API Integration
- Endpoint: `GET /users`
- Source: JSONPlaceholder (`https://jsonplaceholder.typicode.com/users`)
- Caching: Responses are cached in DynamoDB (`cache` table) for 5 minutes using TTL.
- Service: Handled by `UserService` for modularity.

## Project Structure

- `src/config/`: Environment variable configuration
- `src/controllers/`: Request handling logic
- `src/middlewares/`: Custom middleware for validation and error handling
- `src/models/`: Data models
- `src/repositories/`: Data access logic
- `src/routes/`: API route definitions
- `src/services/`: Business logic
- `src/utils/`: Utility functions
- `tests`: Unit and integration tests

## AWS Setup
- DynamoDB Tables:
    - `tasks`: partition key `id` (string).
        - Provisioned Throughput: 5 read/write capacity units (adjust as needed)
    - `cache`: Partition key `key` (string), TTL on `expiresAt`.
- S3 Bucket: `task-attachments`, with CORS enabled for uploads.
- IAM Permissions: Ensure `s3:PutObject`, `s3:DeleteObject`, and DynamoDB CRUD permissions.

## Key Modular Design Principles
- Separation of Concerns
    - Each module has a distinct responsibility.
    - Business logic is isolated in services while data access and external interactions are abstracted into repositories and utility services.
- Dependency Inversion
    - High level modules (controllers and services) depend on abstractions (`TaskRepository` and `ExternalUserApiService`)
- Single Responsibility Principle
    - Each class has its own scope of responsibility. For example,
        - `TaskService`: business logic
        - `TaskRepository`: abstracts data access
        - `DynamoDBService`: generic db operations
- Loose Coupling
    - Components communicate through well-defined interfaces
- Generic Abstractions
    - Generic services like `DynamoDBService` and `S3Service` are designed to be reusable across different use cases, not tied to specific business logic.

## Future Enhancements
- Dependency injection using Awilix or TypeDI
- Rate limiting
- Pagination for GET endpoints
- Authentication
- File download URLs with pre-signed access
- Associate tasks with users
- Query users by their properties