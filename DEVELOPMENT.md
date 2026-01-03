# Development Guide

## Getting Started

### Prerequisites
- Node.js 18 or higher
- Docker and Docker Compose
- Git
- Code editor (VS Code recommended)

### Initial Setup

1. **Clone and install:**
```bash
git clone <repository>
cd codewar/backend
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env if needed
```

3. **Start Redis:**
```bash
docker-compose up -d
```

4. **Start development server:**
```bash
npm run dev
```

The server will run on `http://localhost:3000` with hot-reload enabled.

## Project Structure

### Source Code Organization

```
src/
├── server.js           # Entry point - starts HTTP server and workers
├── app.js              # Express application setup
├── config/
│   ├── index.js        # Centralized configuration from env
│   ├── queue.js        # BullMQ queues configuration
│   └── redis.js        # Redis connection settings
├── routes/
│   └── execution.js    # /run and /health endpoints
├── workers/
│   ├── cpp.js          # C++ job processor
│   └── python.js       # Python job processor
├── middleware/
│   └── rateLimiter.js  # Express rate limiting middleware
├── utils/
│   ├── logger.js       # Application logging utility
│   └── jobExecutor.js  # Docker execution orchestration
├── constants/
│   └── index.js        # Application-wide constants
└── tests/              # Unit and integration tests
```

## Development Workflow

### Adding a New Feature

1. **Create a branch:**
```bash
git checkout -b feature/my-feature
```

2. **Make changes and test:**
```bash
npm run lint          # Check code style
npm test              # Run tests
npm run dev           # Test in development mode
```

3. **Commit and push:**
```bash
git add .
git commit -m "feat: description of changes"
git push origin feature/my-feature
```

### Code Style

The project uses ESLint for code quality. Configuration is in `.eslintrc.json`.

**Check for issues:**
```bash
npm run lint
```

**Auto-fix issues:**
```bash
npm run lint:fix
```

**Key rules:**
- 2-space indentation
- Single quotes for strings
- Semicolons required
- Camel case for variables
- 80-character line length (soft limit)

### Logging Standards

Use the logger utility for all console output:

```javascript
import { logger } from '../utils/logger.js';

// Information
logger.info('User authenticated', { userId, timestamp });

// Warnings
logger.warn('Slow query detected', { duration: 5000 });

// Errors
logger.error('Database connection failed', { error: err.message });

// Debug (only shown with DEBUG=true)
logger.debug('Processing step', { data });
```

### Error Handling

Follow consistent error handling patterns:

```javascript
// Validation errors
if (!code || !language) {
  return res.status(400).json({
    error: 'Missing required fields',
    details: 'code and language are required'
  });
}

// Operational errors
try {
  const result = await executeJob(jobId, code, input, language, tmpDir);
  return res.json({ state: 'completed', ...result });
} catch (error) {
  logger.error('Job execution failed', { jobId, error: error.message });
  return res.status(500).json({
    error: 'Job failed',
    details: error.message
  });
}
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode (re-run on file changes)
npm test -- --watch
```

### Writing Tests

Test files should be in `tests/` directory with `.test.js` extension:

```javascript
// tests/routes.test.js
import assert from 'assert';
import app from '../src/app.js';

describe('POST /run', () => {
  it('should accept valid code submission', async () => {
    const response = await request(app)
      .post('/run')
      .send({
        code: 'print("hello")',
        language: 'python'
      });
    
    assert.strictEqual(response.status, 200);
    assert(response.body.jobId);
  });

  it('should reject missing language', async () => {
    const response = await request(app)
      .post('/run')
      .send({ code: 'print("hello")' });
    
    assert.strictEqual(response.status, 400);
  });
});
```

## Debugging

### Enable Debug Logging

```bash
DEBUG=true npm run dev
```

This enables `logger.debug()` output for detailed execution traces.

### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "program": "${workspaceFolder}/src/server.js",
      "restart": true,
      "console": "integratedTerminal"
    }
  ]
}
```

Then press `F5` to start debugging.

### Common Issues

**Issue: Redis connection refused**
```bash
# Verify Redis is running
docker ps | grep redis

# Start Redis if not running
docker-compose up -d
```

**Issue: Port 3000 already in use**
```bash
# Change PORT in .env
PORT=3001

# Or find and kill process
lsof -i :3000
kill -9 <PID>
```

**Issue: Docker commands fail**
```bash
# Verify Docker daemon is running
docker ps

# Verify image exists
docker images | grep -E "cpp-runner|python-runner"
```

## Database Migration

Currently using Redis with BullMQ. No traditional migrations needed, but:

1. **Queue schema changes:** Update in `src/config/queue.js`
2. **Job format changes:** Update in `src/routes/execution.js`
3. **Backward compatibility:** Test with existing job data

## Performance Optimization

### Profiling

```bash
# Use Node.js built-in profiler
node --prof src/server.js
# Then analyze with
node --prof-process isolate-*.log > profile.txt
```

### Common Optimizations

1. **Reduce Docker image size**
   - Use multi-stage builds in Dockerfile
   - Remove unnecessary dependencies

2. **Cache frequently compiled code**
   - Store binaries in Redis
   - Check cache before compilation

3. **Use worker pools**
   - Multiple worker processes
   - Load balance across workers

4. **Monitor queue depth**
   - Alert if queue builds up
   - Scale workers based on depth

## Deployment

### Development Environment

```bash
npm run dev
```

### Production Environment

```bash
NODE_ENV=production npm start
```

Ensure `.env` is configured with production values:
```env
NODE_ENV=production
PORT=3000
REDIS_HOST=redis.production
REDIS_PORT=6379
TMP_DIR=/var/tmp/codewar
DEBUG=false
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t codewar-backend .
docker run -p 3000:3000 --link redis codewar-backend
```

## Contributing

### Pull Request Process

1. Update documentation as needed
2. Add tests for new features
3. Run `npm run lint:fix` to format code
4. Ensure all tests pass: `npm test`
5. Update CHANGELOG.md
6. Request review from team

### Code Review Checklist

- [ ] Code follows style guide
- [ ] Tests are comprehensive
- [ ] Documentation is updated
- [ ] No console.log (use logger)
- [ ] Error handling is proper
- [ ] Security best practices followed

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [Docker Documentation](https://docs.docker.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## Getting Help

1. Check existing issues and discussions
2. Review documentation in docs/
3. Ask in team chat
4. Create new issue with detailed description

## Additional Commands

```bash
# Install new dependency
npm install package-name

# Remove dependency
npm uninstall package-name

# Update dependencies
npm update

# Audit for security vulnerabilities
npm audit

# Fix security issues automatically
npm audit fix

# View dependency tree
npm list
```
