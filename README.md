# 🚀 Production GraphQL Backend

A production-ready GraphQL API built with **Apollo Server 4**, **Express 5**, **Prisma ORM**, and **Redis** — featuring JWT authentication, real-time subscriptions, and N+1 query prevention out of the box.

---

## ✨ Features

- **GraphQL API** via Apollo Server 4 with `@graphql-tools/schema`
- **JWT Authentication** — secure token-based auth with `jsonwebtoken` + `bcryptjs`
- **Real-time Subscriptions** — powered by `graphql-ws` and `graphql-redis-subscriptions` over Redis pub/sub
- **Prisma ORM** — type-safe database access with SQLite (easily swappable to PostgreSQL/MySQL)
- **DataLoader** — automatic request batching to eliminate N+1 query problems
- **Production Security** — Helmet headers, CORS, and request logging via Morgan
- **ES Modules** — full `import/export` syntax throughout

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ES Modules) |
| Framework | Express 5 |
| GraphQL Server | Apollo Server 4 |
| Schema | `@graphql-tools/schema` |
| ORM | Prisma 7 + better-sqlite3 adapter |
| Subscriptions | `graphql-ws` + `graphql-redis-subscriptions` |
| Cache / Pub-Sub | Redis (`ioredis`) |
| Auth | JWT + bcryptjs |
| N+1 Prevention | DataLoader |
| Security | Helmet, CORS |
| Logging | Morgan |
| Dev Server | Nodemon |

---

## 📁 Project Structure

```
production_graphql/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Migration history
├── src/                    # Application source
├── index.js                # Server entry point
├── prisma.config.ts        # Prisma configuration
├── .env.example            # Environment variable template
└── package.json
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js 18+
- Redis instance (local or remote)

### Installation

```bash
# Clone the repository
git clone https://github.com/Neel-stack-deb/production_graphql.git
cd production_graphql

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Environment Variables

```env
PORT=3000
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-strong-secret-here"
JWT_EXPIRES_IN="1h"
REDIS_URL="redis://localhost:6379"
```

### Database Setup

```bash
# Run Prisma migrations
npx prisma migrate dev

# (Optional) Open Prisma Studio
npx prisma studio
```

### Running the Server

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

The GraphQL playground will be available at `http://localhost:3000/graphql`.

---

## 🔐 Authentication

The API uses JWT-based authentication. Include the token in your request headers:

```http
Authorization: Bearer <your_jwt_token>
```

Passwords are hashed with **bcryptjs** before storage — never stored in plain text.

---

## 📡 Real-Time Subscriptions

WebSocket subscriptions are handled via `graphql-ws` with Redis as the pub/sub backend, making subscriptions scalable across multiple server instances.

Connect to subscriptions at:
```
ws://localhost:3000/graphql
```

---

## 🚀 Production Considerations

- **Helmet** sets secure HTTP headers on every response
- **CORS** is configured to control cross-origin access
- **DataLoader** batches and caches database reads per request to eliminate N+1 queries
- **Morgan** logs every HTTP request for observability
- Redis pub/sub ensures subscriptions work in a horizontally scaled deployment
- Swap `DATABASE_URL` to a PostgreSQL or MySQL connection string and update the Prisma provider for a production database

---

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with Nodemon (auto-restart on changes) |
| `npm start` | Start the production server |

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

ISC
