# API Reference

## Overview

CodeWar provides a simple REST API for executing C++ and Python code. All requests use JSON and return JSON responses.

**Base URL:** `http://localhost:3000`

## Authentication

Currently, the API does not require authentication. In production, implement:
- API key authentication
- JWT tokens
- OAuth 2.0

## Rate Limiting

- **Limit:** 6 requests per minute per IP address
- **Header:** `RateLimit-Limit: 6`
- **Remaining:** `RateLimit-Remaining: 5`
- **Reset:** `RateLimit-Reset: 1704067260`

When limit is exceeded, the API returns a 429 status code.

## Endpoints

### 1. Execute Code

**POST /run**

Submit code for execution in the specified language.

#### Request

```json
{
  "code": "string",              // Required. Source code to execute
  "language": "cpp" | "python",  // Required. Programming language
  "input": "string"              // Optional. Standard input for the program
}
```

#### Examples

**C++ Example:**
```bash
curl -X POST http://localhost:3000/run \
  -H "Content-Type: application/json" \
  -d '{
    "code": "#include <iostream>\nint main() {\n  std::cout << \"Hello World\";\n  return 0;\n}",
    "language": "cpp",
    "input": ""
  }'
```

**Python Example:**
```bash
curl -X POST http://localhost:3000/run \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print(\"Hello World\")",
    "language": "python",
    "input": ""
  }'
```

**With Input:**
```bash
curl -X POST http://localhost:3000/run \
  -H "Content-Type: application/json" \
  -d '{
    "code": "import sys\nline = sys.stdin.read()\nprint(f\"You said: {line}\")",
    "language": "python",
    "input": "Hello, World!"
  }'
```

#### Responses

**Success (200 OK)**
```json
{
  "state": "completed",
  "output": "Hello World\n",
  "executionTime": "45ms",
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "language": "cpp"
}
```

**Bad Request (400)**
```json
{
  "error": "Missing required fields: code, language"
}
```

**Unsupported Language (400)**
```json
{
  "error": "Unsupported language. Supported: cpp, python"
}
```

**Compilation Error (500)**
```json
{
  "error": "Job failed or was cancelled",
  "details": "error: 'cout' was not declared in this scope"
}
```

**Server Error (500)**
```json
{
  "error": "Job failed or was cancelled",
  "details": "Docker execution failed: container exit code 1"
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| state | string | Job completion state: "completed" or "failed" |
| output | string | Program output (stdout) |
| executionTime | string | Time taken to execute (e.g., "45ms") |
| jobId | string | Unique identifier for the job |
| language | string | Programming language used |
| error | string | Error message (when failed) |
| details | string | Error details (when failed) |

### 2. Health Check

**GET /health**

Check if the server is running and healthy.

#### Request

```bash
curl http://localhost:3000/health
```

#### Response

**Success (200 OK)**
```json
{
  "status": "ok"
}
```

## Error Handling

### Error Response Format

All error responses follow this format:

```json
{
  "error": "Human readable error message",
  "details": "Optional detailed error information"
}
```

### HTTP Status Codes

| Code | Meaning | Scenario |
|------|---------|----------|
| 200 | OK | Code executed successfully |
| 400 | Bad Request | Missing required fields, invalid language, malformed JSON |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Error | Server error, Docker execution failed, Job processing failed |

### Common Errors

**Missing Required Fields**
```json
{
  "error": "Missing required fields: code, language"
}
```
**Solution:** Ensure both `code` and `language` are provided in request body.

**Invalid Language**
```json
{
  "error": "Unsupported language. Supported: cpp, python"
}
```
**Solution:** Use either "cpp" or "python" for the language field.

**Rate Limited**
```
Status: 429
Headers:
  RateLimit-Limit: 6
  RateLimit-Remaining: 0
  RateLimit-Reset: 1704067260
```
**Solution:** Wait until RateLimit-Reset timestamp before making another request.

**Compilation Error (C++)**
```json
{
  "error": "Job failed or was cancelled",
  "details": "main.cpp:2:5: error: 'cout' was not declared in this scope"
}
```
**Solution:** Check C++ code syntax and include necessary headers.

**Runtime Error (Python)**
```json
{
  "error": "Job failed or was cancelled",
  "details": "Traceback (most recent call last):\n  File \"main.py\", line 1, in <module>\nNameError: name 'undefined_var' is not defined"
}
```
**Solution:** Check Python code logic and variable definitions.

**Docker Error**
```json
{
  "error": "Job failed or was cancelled",
  "details": "Docker execution failed"
}
```
**Solution:** Ensure Docker is running and containers are built.

## Request/Response Examples

### Example 1: Simple Output

**Request:**
```bash
curl -X POST http://localhost:3000/run \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print(\"Hello, CodeWar!\")",
    "language": "python"
  }'
```

**Response:**
```json
{
  "state": "completed",
  "output": "Hello, CodeWar!\n",
  "executionTime": "30ms",
  "jobId": "abc-123-def",
  "language": "python"
}
```

### Example 2: C++ with Input

**Request:**
```bash
curl -X POST http://localhost:3000/run \
  -H "Content-Type: application/json" \
  -d '{
    "code": "#include <iostream>\n#include <string>\nint main() {\n  std::string name;\n  std::getline(std::cin, name);\n  std::cout << \"Hello, \" << name << \"!\\n\";\n  return 0;\n}",
    "language": "cpp",
    "input": "Alice"
  }'
```

**Response:**
```json
{
  "state": "completed",
  "output": "Hello, Alice!\n",
  "executionTime": "120ms",
  "jobId": "xyz-789-uvw",
  "language": "cpp"
}
```

### Example 3: Python with Complex Logic

**Request:**
```bash
curl -X POST http://localhost:3000/run \
  -H "Content-Type: application/json" \
  -d '{
    "code": "numbers = [1, 2, 3, 4, 5]\nsquares = [n**2 for n in numbers]\nprint(squares)",
    "language": "python"
  }'
```

**Response:**
```json
{
  "state": "completed",
  "output": "[1, 4, 9, 16, 25]\n",
  "executionTime": "28ms",
  "jobId": "def-456-ghi",
  "language": "python"
}
```

### Example 4: Error Handling

**Request (Syntax Error):**
```bash
curl -X POST http://localhost:3000/run \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print(\"unclosed string",
    "language": "python"
  }'
```

**Response:**
```json
{
  "error": "Job failed or was cancelled",
  "details": "  File \"main.py\", line 1\n    print(\"unclosed string\n          ^\nSyntaxError: EOL while scanning string literal"
}
```

## Best Practices

### 1. Error Handling

Always check for error responses:

```javascript
async function executeCode(code, language, input) {
  const response = await fetch('http://localhost:3000/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language, input })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('API Error:', error.error);
    console.error('Details:', error.details);
    return null;
  }

  const result = await response.json();
  return result;
}
```

### 2. Rate Limiting

Implement client-side rate limiting to avoid hitting server limits:

```javascript
const queue = [];
const MAX_REQUESTS_PER_MINUTE = 5;
const REQUEST_INTERVAL = 60000 / MAX_REQUESTS_PER_MINUTE;

async function submitCodeWithRateLimit(code, language) {
  return new Promise((resolve) => {
    queue.push(() => executeCode(code, language));
    processQueue();
  });
}

function processQueue() {
  if (queue.length === 0) return;
  
  const task = queue.shift();
  task();
  
  setTimeout(processQueue, REQUEST_INTERVAL);
}
```

### 3. Input Handling

Properly escape special characters in input:

```javascript
// Good
const input = "line1\nline2\nline3";

// Also good
const input = JSON.stringify("raw input string");

// Avoid
const input = "line1\\nline2";  // Will be literal \n, not newline
```

### 4. Timeout Handling

Implement timeouts to prevent hanging requests:

```javascript
async function executeCodeWithTimeout(code, language, input, timeout = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch('http://localhost:3000/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language, input }),
      signal: controller.signal
    });
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Request timeout');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
```

## Language-Specific Notes

### C++

**Requirements:**
- C++17 or later
- Standard library only (no external packages)
- Input via `std::cin`
- Output via `std::cout`

**Memory Limit:** 256MB
**Time Limit:** No hard limit (depends on execution)

**Example:**
```cpp
#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    cout << n * 2 << endl;
    return 0;
}
```

### Python

**Requirements:**
- Python 3.14+
- Standard library only
- Input via `input()` or `sys.stdin`
- Output via `print()`

**Memory Limit:** 256MB
**Time Limit:** No hard limit (depends on execution)

**Example:**
```python
n = int(input())
print(n * 2)
```

## Versioning

Current API version: **1.0**

Future versions may introduce:
- Support for additional languages
- Advanced execution options
- Job history/persistence
- Batch execution
- Custom timeouts
- Resource allocation control

## Support

For issues or questions about the API:
1. Check this documentation
2. Review error messages carefully
3. Check server logs: `DEBUG=true npm run dev`
4. Open an issue on GitHub
