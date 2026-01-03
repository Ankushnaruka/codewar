# CodeWar Architecture Documentation

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Application                        │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/REST
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      Express.js Server                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Routes (/run, /health)                                  │  │
│  │  Middleware (Rate Limiting, Logging)                     │  │
│  └──────────────────┬───────────────────────────────────────┘  │
└─────────────────────┼──────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
   ┌────▼─────┐  ┌────▼─────┐  ┌───▼──────┐
   │ C++ Jobs │  │Python Jobs│  │ Redis    │
   │ Queue    │  │ Queue     │  │(Broker)  │
   └────┬─────┘  └────┬──────┘  └──────────┘
        │             │
        │    BullMQ   │
        │             │
   ┌────▼────────────▼──────┐
   │    Job Workers         │
   │  ┌─────────────────┐   │
   │  │ C++ Worker      │   │
   │  │ Python Worker   │   │
   │  └─────────────────┘   │
   └──────────┬──────────────┘
              │
      ┌───────┴──────────┐
      │                  │
   ┌──▼────────────┐  ┌──▼────────────┐
   │ C++ Container │  │Python Container│
   │ (Docker)      │  │ (Docker)       │
   └───────────────┘  └────────────────┘
```

## Component Overview

### 1. **Express Server** (`src/app.js`, `src/server.js`)

**Responsibilities:**
- HTTP server setup and middleware configuration
- Request routing
- Error handling
- Graceful shutdown

**Key Features:**
- JSON parsing middleware
- Request logging
- Global error handler
- Signal handling (SIGTERM, SIGINT)

### 2. **Routes** (`src/routes/execution.js`)

**Endpoints:**
- `POST /run` - Submit code for execution
- `GET /health` - Health check

**Features:**
- Input validation
- Queue job submission
- Job status polling
- Response formatting

### 3. **Queue System** (`src/config/queue.js`)

**Components:**
- C++ Job Queue
- Python Job Queue
- Queue Events for status monitoring

**Features:**
- Job deduplication
- Automatic retry on failure
- Event-driven architecture
- Memory-efficient job cleanup

### 4. **Workers** (`src/workers/cpp.js`, `src/workers/python.js`)

**Responsibilities:**
- Process queued jobs
- Coordinate Docker execution
- Capture and format results
- Error handling and logging

**Lifecycle:**
1. Receive job from queue
2. Create temporary directory
3. Write source code to disk
4. Execute Docker container
5. Read and parse results
6. Return results to queue
7. Handle errors appropriately

### 5. **Configuration** (`src/config/`)

**Files:**
- `index.js` - Centralized app configuration
- `queue.js` - BullMQ setup
- `redis.js` - Redis connection

**Environment Variables:**
- `NODE_ENV` - Application environment
- `PORT` - Server port
- `REDIS_HOST`, `REDIS_PORT` - Redis connection
- `TMP_DIR` - Temporary directory path
- `DEBUG` - Debug logging flag

### 6. **Middleware** (`src/middleware/`)

**Rate Limiter:**
- Prevents abuse
- 6 requests per minute per IP
- Configurable limits

### 7. **Utilities** (`src/utils/`)

**Logger:**
- Structured logging with timestamps
- Severity levels (ERROR, WARN, INFO, DEBUG)
- Production-friendly output

**Job Executor:**
- Docker execution abstraction
- File I/O operations
- Error handling
- Job cleanup

### 8. **Constants** (`src/constants/index.js`)

**Centralized Configuration:**
- Language definitions
- Queue names
- Job types
- Docker limits
- File names
- HTTP status codes

## Data Flow

### Code Execution Request

```
1. Client sends POST /run with code, language, input
   ↓
2. Validation - Check language and required fields
   ↓
3. Generate unique job ID (UUID)
   ↓
4. Add to appropriate queue (cpp-jobs or python-jobs)
   ↓
5. Create queue events listener
   ↓
6. Wait for job completion (with timeout)
   ↓
7. Return results: output, execution time, job ID
   ↓
8. Cleanup: Remove job from queue
```

### Worker Processing

```
1. Worker receives job from queue
   ↓
2. Create temp directory: tmp/[language]/[jobId]/
   ↓
3. Write files:
   - main.cpp/main.py (source code)
   - input.txt (standard input)
   ↓
4. Execute Docker container:
   docker run --rm --cpus="1" --memory="256m" \
     --network none -v [jobDir]:/app [image]
   ↓
5. Docker container:
   - Compiles (C++) or runs (Python) code
   - Redirects output to output.txt
   - Measures execution time to time.txt
   ↓
6. Read results from container:
   - output.txt → output
   - time.txt → executionTime
   ↓
7. Return { output, executionTime }
   ↓
8. Job marked as completed in queue
```

## Queue Architecture

### BullMQ Configuration

**Two Separate Queues:**
- `cpp-jobs` - For C++ code execution
- `python-jobs` - For Python code execution

**Queue Features:**
- Automatic retry on failure
- Dead letter queue for permanent failures
- Job progress tracking
- Event-driven notifications

**Connection:**
- Redis at configured host:port
- Persistent storage
- Real-time updates via QueueEvents

## Docker Integration

### Container Execution Model

```
┌────────────────────────────────┐
│    Host System (Windows)        │
│  ┌──────────────────────────┐   │
│  │ tmp/cpp/[jobId]/         │   │
│  │ ├── main.cpp             │   │
│  │ ├── input.txt            │   │
│  │ ├── output.txt (created) │   │
│  │ └── time.txt (created)   │   │
│  └──────────────┬───────────┘   │
│                 │ -v mount      │
│                 │               │
│  ┌──────────────▼────────────┐  │
│  │  Docker Container         │  │
│  │  ├── /app (mounted)       │  │
│  │  ├── Compiler/Interpreter │  │
│  │  ├── run.sh (script)      │  │
│  │  └── Standard Libraries   │  │
│  └──────────────────────────┘  │
│                                 │
│  Resource Limits:               │
│  - CPU: 1 core                  │
│  - Memory: 256MB                │
│  - Network: None                │
└────────────────────────────────┘
```

### C++ Container

**Base Image:** `gcc:13`
**Includes:**
- g++ compiler
- Standard C++ library
- Basic Unix utilities

**Execution (`run.sh`):**
1. Compile: `g++ main.cpp -o executable`
2. Run: `./executable < input.txt > output.txt`
3. Measure time using `/usr/bin/time`

### Python Container

**Base Image:** `python:3.14.0`
**Includes:**
- Python 3.14 interpreter
- Standard library
- pip package manager

**Execution (`run.sh`):**
1. Run: `python main.py < input.txt > output.txt`
2. Measure time using `/usr/bin/time`

## Error Handling Strategy

### Levels of Error Handling

**1. Request Validation (400 Bad Request)**
```javascript
- Missing required fields
- Unsupported language
- Invalid payload format
```

**2. Job Execution (500 Internal Error)**
```javascript
- Compilation errors
- Runtime errors
- Container execution failures
- File I/O errors
```

**3. Queue Errors (5xx Errors)**
```javascript
- Redis connection failures
- Queue operation failures
- Job processing timeouts
```

**4. Logging & Recovery**
```javascript
- All errors logged with context
- Job cleanup attempted regardless of outcome
- Graceful degradation
- Clear error messages to client
```

## Security Architecture

### Implemented Security Measures

1. **Container Isolation**
   - Network namespace: `--network none`
   - Resource limits: CPU and memory
   - Read-only filesystems where possible

2. **Rate Limiting**
   - 6 requests per minute per IP
   - Prevents DoS attacks
   - Configurable thresholds

3. **Input Validation**
   - Required field checks
   - Language whitelist validation
   - Type checking

4. **Execution Environment**
   - Temporary directories cleaned up after execution
   - No persistence between executions
   - Logs separated from application

### Recommended Production Enhancements

1. **Authentication**
   - API key validation
   - JWT token support
   - User-specific rate limits

2. **Authorization**
   - Role-based access control
   - Resource quotas per user
   - Code scanning for malicious patterns

3. **Monitoring**
   - Request logging with user context
   - Execution time tracking
   - Resource usage monitoring
   - Audit trails

4. **Container Security**
   - Image scanning for vulnerabilities
   - Minimal base images
   - Read-only root filesystem
   - Non-root user execution

## Performance Considerations

### Optimization Strategies

1. **Queue Processing**
   - Multiple workers per language
   - Configurable concurrency
   - Priority queue support

2. **Docker Optimization**
   - Pre-built images (not dynamic)
   - Layer caching
   - Minimal image size

3. **Resource Management**
   - Automatic cleanup of temp files
   - Memory limits prevent exhaustion
   - Timeout mechanisms

4. **Caching Opportunities**
   - Job result caching (optional)
   - Docker layer caching
   - Redis memory optimization

## Deployment Architecture

### Development Setup
```
┌────────────────────────────┐
│ Developer Machine          │
├────────────────────────────┤
│ Node.js (dev mode)         │
│ Redis (Docker)             │
│ Docker (C++ & Python)      │
└────────────────────────────┘
```

### Production Setup (Recommended)
```
┌─────────────────────────────────────────┐
│        Kubernetes Cluster               │
├─────────────────────────────────────────┤
│  Pod: API Server (Express)              │
│  Pod: Workers (C++, Python)             │
│  Service: Redis (Persistent)            │
│  Ingress: Load Balancer / API Gateway   │
│  Storage: PVC for tmp directories       │
└─────────────────────────────────────────┘
```

### Docker Compose (Development)
```yaml
services:
  redis:
    image: redis:7
    ports:
      - "6379:6379"
    
  app:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - redis
```

## Scalability Strategy

### Horizontal Scaling

1. **Multiple Worker Instances**
   - Deploy multiple worker processes
   - Each connects to same Redis queue
   - Auto-scales based on queue depth

2. **Load Balancing**
   - API requests distributed across servers
   - Session/job awareness
   - Health check endpoints

3. **Database Scaling**
   - Redis cluster for queue
   - Persistent storage for audit logs
   - Separate analytics database

### Vertical Scaling

1. **Resource Allocation**
   - Increase server CPU/memory
   - Multiple workers per container
   - Connection pooling

2. **Caching Layer**
   - Cache compilation results
   - Memoize common operations
   - CDN for static content

## Monitoring & Observability

### Metrics to Track

1. **Performance**
   - Request latency
   - Queue depth
   - Worker processing time
   - Docker build time

2. **Reliability**
   - Job success rate
   - Worker crash rate
   - Queue recovery time
   - Error rates by type

3. **Resource Usage**
   - CPU utilization
   - Memory consumption
   - Disk space (temp files)
   - Network bandwidth

### Logging Strategy

1. **Application Logs**
   - Structured JSON format
   - Include job context
   - Timestamp and severity

2. **Access Logs**
   - HTTP request logging
   - Response status codes
   - Client IP tracking

3. **Audit Logs**
   - Code execution history
   - User actions
   - Security events

## Testing Strategy

### Test Coverage

1. **Unit Tests**
   - Utility functions
   - Configuration loading
   - Validation logic

2. **Integration Tests**
   - Queue operations
   - Docker execution
   - Full request lifecycle

3. **Load Tests**
   - Concurrent requests
   - Queue throughput
   - Container scaling

## Future Enhancements

1. **Additional Languages**
   - JavaScript/Node.js
   - Java, Go, Rust
   - Custom containers

2. **Advanced Features**
   - Code syntax highlighting
   - Execution profiling
   - Collaborative editing
   - Version control integration

3. **Enterprise Features**
   - Multi-tenancy
   - Advanced authentication
   - Compliance reporting
   - Cost tracking
