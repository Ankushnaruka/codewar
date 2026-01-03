# CodeWar Project Structure

## Complete Directory Tree

```
codewar/
│
├── 📄 README.md                    # Main project documentation
├── 📄 API.md                       # API reference guide
├── 📄 ARCHITECTURE.md              # System architecture documentation
├── 📄 DEVELOPMENT.md               # Development guide
├── 📄 PROJECT_SUMMARY.md           # Quick project overview
├── 📄 RESTRUCTURING_SUMMARY.md     # Changes made during restructuring
│
└── backend/                        # Node.js Backend Application
    │
    ├── 📁 src/                     # Source code (NEW)
    │   ├── server.js               # Application entry point
    │   ├── app.js                  # Express application setup
    │   │
    │   ├── 📁 config/              # Configuration Management (NEW)
    │   │   ├── index.js            # Centralized configuration
    │   │   ├── queue.js            # BullMQ queue setup
    │   │   └── redis.js            # Redis connection config
    │   │
    │   ├── 📁 routes/              # API Routes (NEW)
    │   │   └── execution.js        # Code execution endpoints
    │   │
    │   ├── 📁 workers/             # Job Processors (NEW)
    │   │   ├── cpp.js              # C++ code execution worker
    │   │   └── python.js           # Python code execution worker
    │   │
    │   ├── 📁 middleware/          # Express Middleware (NEW)
    │   │   └── rateLimiter.js      # Rate limiting middleware
    │   │
    │   ├── 📁 utils/               # Utilities (NEW)
    │   │   ├── logger.js           # Structured logging utility
    │   │   └── jobExecutor.js      # Job execution orchestration
    │   │
    │   └── 📁 constants/           # Constants (NEW)
    │       └── index.js            # Application-wide constants
    │
    ├── 📁 tests/                   # Test Suite (NEW)
    │   └── (test files go here)
    │
    ├── 📁 docker/                  # Docker Environments
    │   ├── 📁 cpp/
    │   │   ├── dockerfile          # C++ execution environment
    │   │   └── run.sh              # C++ execution script
    │   └── 📁 python/
    │       ├── dockerfile          # Python execution environment
    │       └── run.sh              # Python execution script
    │
    ├── 📁 tmp/                     # Temporary Job Storage
    │   ├── cpp/                    # C++ job output directories
    │   └── python/                 # Python job output directories
    │
    ├── 📄 .env                     # Environment Variables (NEW)
    ├── 📄 .env.example             # Configuration Template (NEW)
    ├── 📄 .gitignore               # Git Ignore Rules (NEW)
    ├── 📄 .eslintrc.json           # ESLint Configuration (NEW)
    ├── 📄 docker-compose.yml       # Redis Container Setup
    ├── 📄 package.json             # Dependencies (UPDATED)
    └── 📄 README.md                # Backend README (UPDATED)
```

## File Count Summary

| Category | Count | Examples |
|----------|-------|----------|
| **Configuration** | 4 | `.env`, `.gitignore`, `.eslintrc.json`, `docker-compose.yml` |
| **Source Code** | 12 | `server.js`, `app.js`, `routes/*.js`, `workers/*.js`, etc. |
| **Documentation** | 6 | `README.md`, `API.md`, `ARCHITECTURE.md`, `DEVELOPMENT.md`, etc. |
| **Docker** | 4 | `cpp/dockerfile`, `cpp/run.sh`, `python/dockerfile`, `python/run.sh` |
| **Tests** | 1 | `tests/` directory |
| **Total** | 27+ | Complete professional structure |

## Key Improvements Over Original Structure

### Original Structure
```
backend/
├── app.js           # Mixed routing and logic
├── queue.js         # Queue and config mixed
├── worker.js        # Single file for both languages
├── package.json     # Minimal metadata
└── docker-compose.yml
```

### New Professional Structure
```
backend/
├── src/
│   ├── server.js    # Entry point only
│   ├── app.js       # Express setup
│   ├── config/      # Separated configuration
│   ├── routes/      # Separated routing
│   ├── workers/     # Separated workers (language-specific)
│   ├── middleware/  # Extracted middleware
│   ├── utils/       # Reusable utilities
│   └── constants/   # Centralized constants
├── tests/           # Test directory
├── .env             # Environment configuration
├── .env.example     # Configuration template
├── .gitignore       # Git rules
├── .eslintrc.json   # Linting rules
├── package.json     # Professional metadata
└── docker-compose.yml
```

## Configuration Files Added

### `.env` - Environment Variables
```env
NODE_ENV=development
PORT=3000
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
TMP_DIR=tmp
DEBUG=false
```

### `.env.example` - Configuration Template
```env
# Copy to .env and customize
NODE_ENV=development
PORT=3000
REDIS_HOST=127.0.0.1
# ... etc
```

### `.gitignore` - Git Ignore Rules
```
node_modules/
.env
tmp/
logs/
.vscode/
.DS_Store
```

### `.eslintrc.json` - Code Quality Rules
```json
{
  "env": { "node": true, "es2021": true },
  "extends": "eslint:recommended",
  "rules": { ... }
}
```

## Source Code Organization

### By Responsibility

| Module | Purpose |
|--------|---------|
| `server.js` | Start HTTP server, initialize workers, handle signals |
| `app.js` | Express configuration, middleware setup, routing |
| `config/` | Load env, connect to services, centralize settings |
| `routes/` | HTTP request handlers, validation, response formatting |
| `workers/` | BullMQ workers, Docker orchestration, error handling |
| `middleware/` | Rate limiting, request logging, error handling |
| `utils/` | Logger, job executor, reusable functions |
| `constants/` | Languages, queue names, magic numbers |

### By Function

| Type | Files | Purpose |
|------|-------|---------|
| **Entry Point** | `server.js` | Initialize app and workers |
| **Framework** | `app.js` | Express setup and middleware |
| **API** | `routes/execution.js` | HTTP endpoints |
| **Workers** | `cpp.js`, `python.js` | Job processing |
| **Config** | `config/*` | External service configuration |
| **Utilities** | `utils/*` | Reusable code |
| **Cross-cutting** | `middleware/*` | Concerns affecting multiple modules |

## Dependencies Added/Updated

### New Direct Dependencies
- ✅ `dotenv` - Environment variable management

### Existing Dependencies (Enhanced Usage)
- ✅ `express` - Used with proper middleware pattern
- ✅ `bullmq` - Separated queue configuration
- ✅ `ioredis` - Centralized connection config
- ✅ `uuid` - Generate job IDs
- ✅ `express-rate-limit` - In middleware module

### New Dev Dependencies
- ✅ `eslint` - Code quality checking

## Environment Variables Supported

| Variable | Default | Purpose |
|----------|---------|---------|
| `NODE_ENV` | development | Application mode |
| `PORT` | 3000 | Server port |
| `REDIS_HOST` | 127.0.0.1 | Redis server host |
| `REDIS_PORT` | 6379 | Redis server port |
| `TMP_DIR` | tmp | Temporary directory for jobs |
| `DEBUG` | false | Enable debug logging |

## NPM Scripts Provided

```json
{
  "scripts": {
    "start": "node src/server.js",           // Production
    "dev": "NODE_ENV=development node src/server.js",  // Development
    "test": "...",                            // Run tests
    "lint": "eslint src/",                    // Check code quality
    "lint:fix": "eslint src/ --fix"           // Auto-fix issues
  }
}
```

## Documentation Files

| File | Purpose | Audience |
|------|---------|----------|
| `README.md` | Quick start & overview | Everyone |
| `API.md` | Complete API reference | API consumers |
| `ARCHITECTURE.md` | System design & scalability | Architects, Senior Devs |
| `DEVELOPMENT.md` | Setup & coding standards | Developers |
| `PROJECT_SUMMARY.md` | Quick reference | New team members |
| `RESTRUCTURING_SUMMARY.md` | Changes made | Reviewers |

## Startup Sequence

```
User runs: npm run dev
         ↓
node src/server.js
         ↓
Load .env (dotenv)
         ↓
Create Express app (src/app.js)
         ↓
Start workers (cpp.js, python.js)
         ↓
Listen on configured PORT
         ↓
Ready to accept requests
```

## Request Handling Flow

```
HTTP Request to POST /run
         ↓
Express routing (routes/execution.js)
         ↓
Input validation
         ↓
Create job ID
         ↓
Add to queue (config/queue.js)
         ↓
Worker processes (workers/*.js)
         ↓
Execute Docker (utils/jobExecutor.js)
         ↓
Log events (utils/logger.js)
         ↓
Return results
         ↓
HTTP Response (200 or error status)
```

## Deployment Structure

### Development
```bash
.env (development settings)
npm run dev
```

### Production
```bash
.env (production settings)
NODE_ENV=production npm start
```

### Docker
```dockerfile
FROM node:18
COPY src/ ./src/
COPY package.json ./
RUN npm ci --production
CMD ["npm", "start"]
```

## Future Scalability

The structure supports:
- ✅ Multiple worker instances
- ✅ Load balancing
- ✅ Kubernetes deployment
- ✅ Microservices split
- ✅ Testing frameworks
- ✅ Additional languages
- ✅ Monitoring systems
- ✅ Analytics integration

---

**This professional structure is ready for team development and production deployment!**
