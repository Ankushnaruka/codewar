# CodeWar - Project Summary

## What is CodeWar?

CodeWar is a **professional-grade code execution backend** that safely executes C++ and Python code in isolated Docker containers. It's designed for educational platforms, coding challenges, and automated testing scenarios.

## Key Features

✅ **Safe Execution** - Isolated Docker containers with resource limits  
✅ **Queue System** - Async job processing with BullMQ and Redis  
✅ **Rate Limiting** - Protection against abuse (6 req/min per IP)  
✅ **Professional Architecture** - Modular, scalable, production-ready  
✅ **Comprehensive Logging** - Structured logging with severity levels  
✅ **Well Documented** - API docs, architecture guide, development guide  
✅ **Error Handling** - Graceful error handling with detailed feedback  

## Project Structure

```
codewar/
├── README.md              # Quick start and overview
├── API.md                 # API reference documentation
├── ARCHITECTURE.md        # System design and architecture
├── DEVELOPMENT.md         # Development guide and setup
├── backend/
│   ├── src/
│   │   ├── server.js      # Entry point
│   │   ├── app.js         # Express setup
│   │   ├── config/        # Configuration management
│   │   ├── routes/        # API endpoints
│   │   ├── workers/       # Job processors
│   │   ├── middleware/    # Express middleware
│   │   ├── utils/         # Utilities (logger, executor)
│   │   └── constants/     # App-wide constants
│   ├── docker/
│   │   ├── cpp/           # C++ execution environment
│   │   └── python/        # Python execution environment
│   ├── .env               # Environment variables
│   ├── .gitignore         # Git ignore rules
│   ├── .eslintrc.json     # Linting rules
│   ├── docker-compose.yml # Redis setup
│   └── package.json       # Dependencies and scripts
└── tests/                 # Test suite
```

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose

### Setup (5 minutes)

```bash
cd codewar/backend
npm install
docker-compose up -d    # Start Redis
npm run dev             # Start server (port 3000)
```

### Test It

```bash
curl -X POST http://localhost:3000/run \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print(\"Hello, CodeWar!\")",
    "language": "python"
  }'
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Node.js 18+ | JavaScript runtime |
| **Web Framework** | Express.js 5+ | REST API |
| **Job Queue** | BullMQ | Async job processing |
| **Message Broker** | Redis 7 | Queue backend |
| **Containerization** | Docker | Isolated code execution |
| **Code Quality** | ESLint | Linting and style |
| **Config** | dotenv | Environment management |

## Core Concepts

### 1. REST API
- **Endpoint:** `POST /run` - Submit code for execution
- **Supported Languages:** C++, Python
- **Response:** Output, execution time, job ID

### 2. Job Queue System
```
Request → Queue → Worker → Docker → Result → Response
```

- C++ and Python jobs processed separately
- Async processing with BullMQ
- Redis stores queue state
- Automatic job cleanup after completion

### 3. Docker Containers
- **Isolation:** Each job runs in separate container
- **Resource Limits:** 1 CPU, 256MB memory
- **Security:** Network disabled, temporary filesystem

### 4. Configuration Management
- Environment variables in `.env`
- Centralized config in `src/config/`
- Development and production modes

### 5. Logging & Monitoring
- Structured logging with timestamps
- Severity levels (ERROR, WARN, INFO, DEBUG)
- Job execution tracking
- Error context preservation

## File Organization Philosophy

### Separation of Concerns
- **Routes** - HTTP request handling
- **Workers** - Async job processing
- **Middleware** - Cross-cutting concerns
- **Utils** - Reusable functions
- **Config** - Environment & external services
- **Constants** - Centralized magic values

### Scalability Pattern
Each component is independent and can be scaled:
- Multiple Express servers (load balanced)
- Multiple worker processes per language
- Redis cluster for queue backend
- Separate services for monitoring/analytics

## Development Workflow

### Getting Started as Developer

```bash
# Setup environment
npm install
npm run dev

# Check code quality
npm run lint
npm run lint:fix

# Test your changes
npm test

# Run in production mode
NODE_ENV=production npm start
```

### Code Standards

- **Language:** JavaScript (ES modules)
- **Linting:** ESLint
- **Formatting:** 2-space indentation, single quotes
- **Error Handling:** Try-catch with proper logging
- **Testing:** Unit and integration tests in `tests/`

## API Examples

### Execute Python Code

```bash
curl -X POST http://localhost:3000/run \
  -H "Content-Type: application/json" \
  -d '{
    "code": "numbers = [1,2,3]\nprint(sum(numbers))",
    "language": "python"
  }'

# Response
{
  "state": "completed",
  "output": "6\n",
  "executionTime": "28ms",
  "jobId": "uuid-here",
  "language": "python"
}
```

### Execute C++ Code

```bash
curl -X POST http://localhost:3000/run \
  -H "Content-Type: application/json" \
  -d '{
    "code": "#include <iostream>\nint main() {\n  std::cout << \"Hello\";\n  return 0;\n}",
    "language": "cpp"
  }'

# Response
{
  "state": "completed",
  "output": "Hello",
  "executionTime": "145ms",
  "jobId": "uuid-here",
  "language": "cpp"
}
```

### Health Check

```bash
curl http://localhost:3000/health

# Response
{ "status": "ok" }
```

## Production Deployment

### Recommended Setup

```yaml
# Kubernetes
- Multiple Express pods (load balanced)
- Redis StatefulSet with persistence
- Worker DaemonSet or separate deployment
- Monitoring with Prometheus/Grafana
- Logging with ELK stack or CloudWatch
```

### Environment Configuration

```env
NODE_ENV=production
PORT=3000
REDIS_HOST=redis.production
REDIS_PORT=6379
TMP_DIR=/var/tmp/codewar
DEBUG=false
```

### Security Enhancements

- [ ] API key authentication
- [ ] Rate limiting per user
- [ ] Request validation
- [ ] Audit logging
- [ ] Container security scanning
- [ ] DDoS protection
- [ ] WAF rules

## Performance Characteristics

### Latency
- First request (cold start): ~200-500ms
- Subsequent requests: ~50-150ms
- Python typically faster than C++

### Throughput
- **Single server:** 6-10 requests/minute (rate limited)
- **Scalable:** Add workers and load balance

### Resource Usage
- **Memory per container:** 256MB
- **CPU per container:** 1 core
- **Queue overhead:** ~50MB base Redis

## Testing Strategy

### Unit Tests
- Utility functions
- Configuration validation
- Input validation

### Integration Tests
- Queue operations
- Docker execution
- Full request cycle

### Load Tests
- Concurrent requests
- Queue depth handling
- Memory stability

## Documentation

### For Users
- **README.md** - Quick start
- **API.md** - Complete API reference with examples

### For Developers
- **DEVELOPMENT.md** - Setup, coding standards, debugging
- **ARCHITECTURE.md** - System design, data flow, scalability

### For Operators
- **Docker Compose** - Local environment setup
- **Configuration** - Environment variables guide
- **Troubleshooting** - Common issues and solutions

## Maintenance

### Regular Tasks
```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Clean up temp files
rm -rf tmp/*

# View logs
DEBUG=true npm run dev
```

### Monitoring Checklist
- [ ] Redis connectivity
- [ ] Worker process status
- [ ] Disk space (temp directory)
- [ ] Error rate trends
- [ ] Queue depth
- [ ] Response latency

## Future Enhancements

### Planned Features
- JavaScript/Node.js execution
- Java execution environment
- Rust execution environment
- Code syntax highlighting
- Execution profiling
- Job history/persistence
- Collaborative editing

### Scalability Roadmap
- [ ] Redis cluster support
- [ ] Multiple worker pools
- [ ] Distributed tracing
- [ ] Metrics collection
- [ ] Auto-scaling policies
- [ ] WebSocket real-time updates

## Getting Help

### Documentation
1. **API Issues** → Check [API.md](API.md)
2. **Architecture Questions** → See [ARCHITECTURE.md](ARCHITECTURE.md)
3. **Setup Problems** → Review [DEVELOPMENT.md](DEVELOPMENT.md)

### Troubleshooting

**Docker not found?**
- Ensure Docker Desktop is running
- Check `docker ps` command works

**Redis connection refused?**
- Run `docker-compose up -d`
- Verify with `docker ps | grep redis`

**Port 3000 in use?**
- Change `PORT=3001` in `.env`
- Or kill existing process: `lsof -i :3000`

**Rate limited?**
- Current limit: 6 req/min per IP
- Wait 60 seconds before retry

## Key Decisions & Rationale

### Why Docker?
- Isolation and security
- Consistent execution environment
- Easy to add new languages
- Resource containment

### Why BullMQ + Redis?
- Reliable job processing
- Horizontal scalability
- Simple setup for development
- Production-proven

### Why ES Modules?
- Modern JavaScript standard
- Better tree-shaking
- Cleaner imports
- Future-proof

### Why Modular Structure?
- Easy to test individual components
- Scales with team size
- Clear separation of concerns
- Maintainability

## License

MIT - See LICENSE file for details

## Support & Contact

- 📖 Documentation: See README.md, API.md, ARCHITECTURE.md
- 🐛 Issues: Check GitHub issues
- 💬 Discussions: Use GitHub discussions
- 📧 Questions: Open an issue or discussion

---

**Version:** 1.0.0  
**Last Updated:** January 2026  
**Status:** Production Ready
