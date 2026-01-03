# Pastebin-Lite

A minimal, shareable pastebin application built with Next.js. Create text pastes and share them via unique URLs with optional TTL (time-to-live) and view count limits.

## Features

- 📝 Create and share text pastes
- 🔗 Generate unique shareable URLs
- ⏰ Optional time-based expiry (TTL) with automatic cleanup
- 👁️ Optional view count limits
- 🔒 Secure XSS-safe content rendering
- 🧪 Deterministic test mode for automated testing
- ⚡ Redis-backed storage with built-in TTL support
- 🚀 Serverless-ready and highly scalable

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Redis instance (local or cloud-based)
- `pnpm` (or npm/yarn/bun)

### Local Development

1. **Clone the repository** (or navigate to the project directory)

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Set up environment variables:**

   We provide a `.env.example` file with the default configuration. Copy it to `.env.local` or `.env`:

   ```bash
   cp .env.example .env.local
   ```

   Then modify the values as needed for your local Redis setup.

4. **Start Redis using Docker Compose:**

   ```bash
   docker compose up -d
   ```

   This starts a Redis 7 container with persistent storage. Check that it's running:

   ```bash
   docker compose ps
   ```

   To stop Redis:

   ```bash
   docker compose down
   ```

   **Alternative: Run Redis locally without Docker**

   On macOS with Homebrew:

   ```bash
   brew services start redis
   ```

   Or run a single Redis container:

   ```bash
   docker run -d -p 6379:6379 redis:7-alpine
   ```

5. **Start the development server:**

   In a new terminal window:

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
pnpm build
pnpm start
```

## Local Development with Docker

This project includes a `compose.yaml` file for easy local development:

```bash
# Start Redis
docker compose up -d

# Stop Redis
docker compose down

# View Redis logs
docker compose logs redis

# Access Redis CLI
docker exec -it pastebin_redis redis-cli
```

The Docker Compose setup includes:

- Redis 7 with persistent storage (`redis_data` volume)
- Health checks to ensure Redis is ready
- Automatic data persistence with `--appendonly yes`

## Persistence Layer

This application uses **Redis** as the persistence layer.

### Why Redis?

- **Built-in TTL Support**: Redis natively supports key expiration, allowing pastes to automatically expire without additional cleanup logic
- **Serverless-Compatible**: Persists data across serverless function invocations without requiring a database migration layer
- **Ultra-Fast**: In-memory operations provide minimal latency for paste creation and retrieval
- **Simple Operations**: Key-value store is ideal for this use case - simple to implement and debug
- **Cost-Effective**: Minimal infrastructure overhead, especially when using managed services like Upstash on Vercel
- **No Schema Management**: No migrations or schema versioning needed

### How Expiry Works

- When a paste is created with `ttl_seconds`, Redis stores it with an expiration time using `SETEX`
- Redis automatically deletes the key when the TTL expires, making the paste unavailable
- View count limits are checked at access time - if exceeded, the paste is deleted immediately
- Test mode allows deterministic TTL testing via the `x-test-now-ms` header

## API Routes

### Health Check

```
GET /api/healthz
```

Returns `{ "ok": true }` if the application and database are healthy.

### Create Paste

```
POST /api/pastes
```

Request body:

```json
{
  "content": "string (required)",
  "ttl_seconds": 60,
  "max_views": 5
}
```

Response (201):

```json
{
  "id": "unique_paste_id",
  "url": "https://your-app.vercel.app/p/unique_paste_id"
}
```

### Fetch Paste (API)

```
GET /api/pastes/:id
```

Response (200):

```json
{
  "content": "the paste content",
  "remaining_views": 4,
  "expires_at": "2026-01-01T00:00:00.000Z"
}
```

Returns 404 if the paste is expired, view limit exceeded, or doesn't exist.

### View Paste (HTML)

```
GET /p/:id
```

Returns an HTML page displaying the paste content. Content is safely rendered without script execution.

## Testing

### Automated Testing Support

The application supports deterministic time testing via the `x-test-now-ms` header when `TEST_MODE=1` is set:

```bash
TEST_MODE=1 pnpm dev
```

Then include the header in requests:

```
GET /api/pastes/:id
x-test-now-ms: 1704067200000
```

The application will use the provided timestamp for TTL calculations instead of the current system time.

## Design Decisions

1. **Redis for Storage**: Native TTL support eliminates need for background cleanup jobs or migrations
2. **nanoid for Paste IDs**: URL-friendly, short, and collision-resistant unique identifiers
3. **View Count on Access**: Each API call increments the view count, enabling accurate limits
4. **Separate API and HTML Routes**: Clean separation between API consumption and user-facing views
5. **No Global Mutable State**: All state stored in Redis, making the app stateless and serverless-ready
6. **XSS Protection**: Paste content rendered in `<pre>` tags with proper escaping
7. **Metadata Headers**: `Content-Type: application/json` for all API responses
8. **Manual Expiry Check**: Combined with Redis TTL for safety and test mode support

## Deployment on Vercel

1. **Push code to GitHub**
2. **Connect repository to Vercel**
3. **Set environment variables in Vercel dashboard:**
   - `REDIS_URL`: Your Redis connection string
   - `NEXT_PUBLIC_BASE_URL`: Your deployed URL
4. **Deploy**: Vercel automatically runs `pnpm build` and starts the app

### Redis Setup for Vercel

We recommend using **Upstash Redis** (integrated with Vercel):

- Go to [Upstash Console](https://console.upstash.com/)
- Create a new Redis database
- Copy the `REDIS_URL` (REST or Node.js client URL)
- Paste it into Vercel environment variables

Alternatively, use any Redis provider:

- AWS ElastiCache
- Redis Cloud
- Self-hosted Redis instance

## Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

## Environment Variables

| Variable               | Required | Description                                                                                   |
| ---------------------- | -------- | --------------------------------------------------------------------------------------------- |
| `REDIS_URL`            | Yes      | Redis connection URL (e.g., `redis://localhost:6379` or `redis://default:password@host:port`) |
| `NEXT_PUBLIC_BASE_URL` | No       | Base URL for share links (defaults to request origin)                                         |
| `TEST_MODE`            | No       | Set to `1` to enable deterministic testing with `x-test-now-ms` header                        |
