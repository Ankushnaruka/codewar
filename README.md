# CodeWar - Code Execution Backend

A Node.js-based code execution service that supports C++ and Python code compilation and execution using Docker containers and job queuing with Redis.

## Overview

This project provides a REST API backend that accepts code snippets in C++ or Python, executes them in isolated Docker containers, and returns the execution results. It uses **BullMQ** for job queuing and **Redis** as the message broker.

## Tech Stack

- **Express.js** - REST API framework
- **BullMQ** - Job queue management
- **Redis** - Message broker and data store
- **Docker** - Container runtime for code execution
- **Node.js** - Runtime environment (type: module)

## Project Structure

```
backend/
├── app.js                    # Express server and API routes
├── queue.js                  # BullMQ queue configuration
├── worker.js                 # Job worker for processing code execution
├── docker-compose.yml        # Docker Compose configuration for Redis
├── package.json              # Project dependencies
├── docker/
│   ├── cpp/
│   │   ├── dockerfile       # C++ compilation and execution environment
│   │   └── run.sh           # C++ code execution script
│   └── python/
│       ├── dockerfile       # Python execution environment
│       └── run.sh           # Python code execution script
├── test_docker/             # Docker testing files
└── tmp/                      # Temporary storage for job files
    └── python/
        └── 15/              # Sample execution output
```

## Docker Setup

### Docker Compose (Redis)

The project uses Docker Compose to run a Redis container for message queuing:

```yaml
version: "3.8"

services:
  redis:
    image: redis:7
    container_name: redis
    ports:
      - "6379:6379"
    restart: unless-stopped
```

**To start Redis:**
```bash
cd backend
docker-compose up -d
```

### C++ Execution Container

**Dockerfile** (`backend/docker/cpp/dockerfile`)
- Base Image: `gcc:13` (includes g++ compiler)
- Executes C++ code by compiling and running it
- Mounted with code files at runtime
- Script: `run.sh` handles compilation and execution

**Usage:** Dynamically created when C++ code is submitted

### Python Execution Container

**Dockerfile** (`backend/docker/python/dockerfile`)
- Base Image: `python:3.14.0` (Python 3.14)
- Executes Python scripts
- Mounted with code files at runtime
- Script: `run.sh` handles execution

**Usage:** Dynamically created when Python code is submitted

## API Routes

### 1. **POST `/run`**

Submit code for execution.

**Request Body:**
```json
{
  "code": "string",        // Source code to execute
  "input": "string",       // Standard input for the program
  "language": "cpp|python" // Programming language
}
```

**Example (C++):**
```bash
curl -X POST http://localhost:3000/run \
  -H "Content-Type: application/json" \
  -d '{
    "code": "#include <iostream>\nint main() { std::cout << \"Hello\"; return 0; }",
    "input": "",
    "language": "cpp"
  }'
```

**Example (Python):**
```bash
curl -X POST http://localhost:3000/run \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print(\"Hello\")",
    "input": "",
    "language": "python"
  }'
```

**Response:**
```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "language": "cpp"
}
```

### 2. **GET `/:lang/job/:id`**

Retrieve the execution status and result of a submitted job.

**Parameters:**
- `lang` - Programming language (`cpp` or `python`)
- `id` - Job ID from the `/run` response

**Example:**
```bash
curl http://localhost:3000/cpp/job/550e8400-e29b-41d4-a716-446655440000
```

**Response (Pending):**
```json
{
  "state": "active",
  "output": null
}
```

**Response (Completed):**
```json
{
  "state": "completed",
  "output": "Hello\n"
}
```

**Possible States:**
- `waiting` - Job is queued
- `active` - Job is being processed
- `completed` - Job finished execution
- `failed` - Job encountered an error

## Installation & Setup

### Prerequisites
- Node.js (v18+)
- Docker and Docker Compose
- Redis (via Docker Compose)

### Steps

1. **Clone the repository:**
```bash
git clone <repo-url>
cd codewar
```

2. **Install dependencies:**
```bash
cd backend
npm install
```

3. **Start Redis:**
```bash
docker-compose up -d
```

4. **Start the server:**
```bash
node app.js
```

The server will start on `http://localhost:3000`

## Environment Variables

Currently, the application uses hardcoded values:
- Redis Connection: `localhost:6379`
- Server Port: `3000`

You can modify these in `app.js` and `queue.js` as needed.

## Job Queue Flow

1. **Client submits code** → POST `/run`
2. **Job created** → Added to BullMQ queue (C++ or Python)
3. **Worker processes** → Retrieves job from queue
4. **Docker execution** → Runs code in isolated container
5. **Result stored** → Job result available in queue
6. **Client retrieves** → GET `/:lang/job/:id`

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^5.2.1 | REST API framework |
| `bullmq` | ^5.66.4 | Job queue management |
| `ioredis` | ^5.8.2 | Redis client |
| `uuid` | ^13.0.0 | Generate unique job IDs |

## Error Handling

- **Job not found (404):** Returns error when job ID doesn't exist
- **Invalid language:** Only `cpp` and `python` are supported
- **Compilation/Runtime errors:** Captured in job result with error messages

## Security Considerations

⚠️ **This project is for educational purposes.** For production use:
- Implement input validation and sanitization
- Add rate limiting
- Add authentication/authorization
- Isolate code execution in restricted environments
- Implement timeout mechanisms for long-running code
- Add resource limits (memory, CPU)

## Contributing

Feel free to submit issues and enhancement requests!

## License

ISC
