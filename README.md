# CodeWar - Code Execution Backend

A professional Node.js-based code execution service that supports C++ and Python code compilation and execution using Docker containers and job queuing with Redis.

## Overview

This project provides a robust REST API backend that accepts code snippets in C++ or Python, executes them in isolated Docker containers, and returns the execution results. It uses **BullMQ** for job queuing and **Redis** as the message broker, with comprehensive logging and professional code organization.

## Tech Stack

- **Express.js** - REST API framework
- **BullMQ** - Distributed job queue management
- **Redis** - Message broker and data store
- **Docker** - Container runtime for code execution
- **Node.js** - Runtime environment (v18+, ES modules)
- **ESLint** - Code quality and style enforcement

## Project Structure

```
backend/
├── src/
│   ├── server.js                    # Application entry point
│   ├── app.js                       # Express app setup
│   ├── config/
│   │   ├── index.js                 # Centralized configuration
│   │   ├── queue.js                 # BullMQ queue setup
│   │   └── redis.js                 # Redis connection config
│   ├── routes/
│   │   └── execution.js             # Code execution endpoints
│   ├── workers/
│   │   ├── cpp.js                   # C++ code execution worker
│   │   └── python.js                # Python code execution worker
│   ├── middleware/
│   │   └── rateLimiter.js           # Rate limiting middleware
│   ├── utils/
│   │   ├── logger.js                # Logging utility
│   │   └── jobExecutor.js           # Job execution logic
│   └── constants/
│       └── index.js                 # Application constants
├── tests/                           # Unit and integration tests
├── docker/
│   ├── cpp/
│   │   ├── dockerfile               # C++ execution environment
│   │   └── run.sh                   # C++ execution script
│   └── python/
│       ├── dockerfile               # Python execution environment
│       └── run.sh                   # Python execution script
├── .env                             # Environment variables (local)
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore rules
├── .eslintrc.json                   # ESLint configuration
├── docker-compose.yml               # Redis container setup
├── package.json                     # Project dependencies
└── README.md                        # This file
```

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Start Redis container:**
```bash
docker-compose up -d
```

3. **Start the server:**
```bash
npm run dev          # Development mode with hot reload
# or
npm start            # Production mode
```

Server starts on `http://localhost:3000`

## Configuration

Environment variables are managed through `.env` file:

```env
NODE_ENV=development
PORT=3000
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
TMP_DIR=tmp
DEBUG=false
```

Copy `.env.example` to `.env` and customize as needed.

## API Documentation

### POST `/run` - Execute Code

Submit code for execution in the specified language.

**Rate Limit:** 6 requests per minute per IP

**Request Body:**
```json
{
  "code": "string",              // Source code (required)
  "input": "string",             // Standard input (optional)
  "language": "cpp" | "python"   // Language (required)
}
```

**C++ Example:**
```bash
curl -X POST http://localhost:3000/run \
  -H "Content-Type: application/json" \
  -d '{
    "code": "#include <iostream>\nint main() { std::cout << \"Hello World\"; return 0; }",
    "input": "",
    "language": "cpp"
  }'
```

**Python Example:**
```bash
curl -X POST http://localhost:3000/run \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print(\"Hello World\")",
    "input": "",
    "language": "python"
  }'
```

**Success Response (200):**
```json
{
  "state": "completed",
  "output": "Hello World\n",
  "executionTime": "45ms",
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "language": "cpp"
}
```

**Error Response (400):**
```json
{
  "error": "Missing required fields: code, language"
}
```

**Error Response (500):**
```json
{
  "error": "Job failed or was cancelled",
  "details": "Compilation error: ..."
}
```

### GET `/health` - Health Check

Check if the server is running.

**Response (200):**
```json
{
  "status": "ok"
}
```

## Docker Setup

### Redis (via Docker Compose)

```bash
# Start Redis
docker-compose up -d

# View logs
docker-compose logs -f redis

# Stop Redis
docker-compose down
```

### C++ Execution Container

- **Base Image:** `gcc:13`
- **Built at runtime** when C++ code is submitted
- Includes g++ compiler and standard libraries
- Isolated with resource limits (1 CPU, 256MB memory)

### Python Execution Container

- **Base Image:** `python:3.14.0`
- **Built at runtime** when Python code is submitted
- Includes Python interpreter and standard library
- Isolated with resource limits (1 CPU, 256MB memory)

## Scripts

```bash
# Development server with hot reload
npm run dev

# Production server
npm start

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test
```

## Job Execution Flow

```
Client Request
    ↓
POST /run endpoint
    ↓
Job ID generated (UUID)
    ↓
Job added to BullMQ queue
    ↓
Worker processes job
    ↓
Docker container created & code executed
    ↓
Output/errors captured
    ↓
Results stored in job
    ↓
Job cleanup
    ↓
Response returned to client
```

## Logging

The application includes comprehensive logging with timestamps and severity levels:

```javascript
logger.info('Job completed', { jobId, executionTime });
logger.error('Job failed', { error });
logger.warn('Cleanup failed', { details });
logger.debug('Processing step', { data });
```

Debug logging can be enabled via `DEBUG=true` environment variable.

## Security Considerations

✅ **Implemented:**
- Rate limiting (6 requests/minute)
- Isolated Docker containers
- Resource limits (1 CPU, 256MB memory)
- Network isolation (`--network none`)

⚠️ **For Production:**
- Add authentication/authorization
- Implement request validation
- Add timeout mechanisms for long-running code
- Monitor and log security events
- Use container security scanning
- Implement audit logging
- Set up monitoring and alerting

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^5.2.1 | REST API framework |
| bullmq | ^5.66.4 | Job queue management |
| ioredis | ^5.8.2 | Redis client |
| uuid | ^13.0.0 | Generate unique IDs |
| express-rate-limit | ^8.2.1 | Rate limiting middleware |
| dotenv | ^16.3.1 | Environment variables |
| eslint | ^8.54.0 | Code linting (dev) |

## Troubleshooting

**Connection refused to Redis**
- Ensure `docker-compose up -d` has been run
- Check Redis is running: `docker ps | grep redis`
- Verify Redis port (6379) is not in use

**Docker command not found**
- Verify Docker is installed and running
- On Windows, ensure Docker Desktop is running
- Check file paths use proper separators

**Rate limit exceeded**
- Current limit: 6 requests per minute per IP
- Wait 60 seconds before retrying
- Modify `RATE_LIMIT` in `src/constants/index.js` to adjust

**Compilation/Runtime errors**
- Check code syntax in the error response
- Ensure input data matches program requirements
- View Docker logs for detailed error messages

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Follow ESLint rules (`npm run lint`)
4. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue on the repository.
