# Task Scheduler Backend

## Setup

### Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure the environment variables in the `.env` file
4. Run the backend in development mode: `npm run start:dev`

### Docker

1. Ensure Docker is installed and running
2. Build and run the Docker containers: `docker-compose up --build`
3. Access the application at `http://localhost:3000`

## API Endpoints

- `POST /tasks`: Create a new task
- `GET /tasks`: List all tasks
- `PUT /tasks/:id`: Update a task
- `DELETE /tasks/:id`: Delete a task
- `GET /logs`: View execution logs

## Running Tests

1. Run tests: `npm run test`
