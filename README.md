# Production GraphQL Backend

A production-grade GraphQL backend demonstrating how modern GraphQL APIs are built beyond simple CRUD operations.

This project implements authentication, authorization, real-time subscriptions, DataLoader batching, service/repository architecture, Redis-backed Pub/Sub, and production-ready middleware patterns commonly used in scalable backend systems.

---

## Why I Built This

Most GraphQL tutorials stop at creating queries and mutations.

This project explores the engineering patterns required to run GraphQL in production:

- Authentication & Authorization
- Subscription Infrastructure
- Request Scoped Context
- DataLoader & N+1 Prevention
- Service Layer Architecture
- Repository Pattern
- Redis-backed Event Distribution
- Graceful Shutdown
- Error Standardization
- Rate Limiting

The goal was to understand how large-scale GraphQL systems are structured internally.

---

## Tech Stack

| Layer | Technology |
|---------|------------|
| Runtime | Node.js |
| API Layer | Apollo Server 4 |
| HTTP Server | Express 5 |
| Database | SQLite |
| ORM | Prisma |
| Authentication | JWT |
| Password Hashing | bcryptjs |
| Real-Time Communication | graphql-ws |
| Event System | Redis Pub/Sub |
| Caching & Batching | DataLoader |
| Security | Helmet |
| Rate Limiting | express-rate-limit |
| Logging | Morgan |

---

## Features

### Authentication

- User Registration
- Login
- JWT Access Tokens
- Password Hashing
- Request Authentication Middleware

### Authorization

- Role-Based Access Control
- Protected Queries
- Protected Mutations
- Admin-only Operations

### Real-Time Subscriptions

- Post Creation Events
- Comment Creation Events
- Redis-backed Subscription Infrastructure
- WebSocket Authentication
- Automatic Token Expiration Handling

### GraphQL Performance

- DataLoader Integration
- N+1 Query Prevention
- Request Scoped Loaders

### Architecture

- Repository Pattern
- Service Layer Pattern
- Dependency Injection through GraphQL Context
- Centralized Error Handling

### Production Concerns

- Request IDs
- Rate Limiting
- Helmet Security Headers
- Graceful Shutdown
- Health Checks
- Readiness Checks

---

## Architecture Overview

```text
                        ┌─────────────┐
                        │   Client    │
                        └──────┬──────┘
                               │
          HTTP Queries         │       WebSocket Subscriptions
        & Mutations            │
                               ▼

                     ┌──────────────────┐
                     │ Apollo Server 4  │
                     └────────┬─────────┘
                              │
                              ▼

                   ┌────────────────────┐
                   │ GraphQL Resolvers  │
                   └────────┬───────────┘
                            │
                            ▼

                   ┌────────────────────┐
                   │ Service Layer      │
                   └────────┬───────────┘
                            │
                            ▼

                   ┌────────────────────┐
                   │ Repository Layer   │
                   └────────┬───────────┘
                            │
                            ▼

                   ┌────────────────────┐
                   │ Prisma ORM         │
                   └────────┬───────────┘
                            │
                            ▼

                   ┌────────────────────┐
                   │ SQLite Database    │
                   └────────────────────┘
```

---

## Project Structure

```text
src
│
├── config/
│   ├── auth.js
│   ├── jwt.js
│   ├── prisma.js
│   ├── redis.js
│   └── pubsub.js
│
├── graphql/
│   ├── schema.js
│   ├── typeDefs.js
│   └── resolvers.js
│
├── repositories/
│   ├── user.repository.js
│   ├── post.repository.js
│   └── comment.repository.js
│
├── services/
│   ├── user.service.js
│   ├── post.service.js
│   └── comment.service.js
│
├── loaders/
│   └── DataLoader implementations
│
├── middleware/
│   ├── requestContext.js
│   └── graphqlRateLimit.js
│
├── data/
│   ├── context.js
│   └── datasources.js
│
└── utils/
    ├── validation.js
    ├── errors.js
    └── scalars/
```

---

## Database Schema

### User

```text
User
 ├── id
 ├── name
 ├── email
 ├── passwordHash
 ├── role
 ├── tokenVersion
 ├── createdAt
 └── updatedAt
```

### Post

```text
Post
 ├── id
 ├── title
 ├── body
 ├── authorId
 ├── createdAt
 └── updatedAt
```

### Comment

```text
Comment
 ├── id
 ├── body
 ├── authorId
 ├── postId
 ├── createdAt
 └── updatedAt
```

---

## Authentication Flow

```text
Login
   │
   ▼

Validate Credentials
   │
   ▼

Generate JWT
   │
   ▼

Client Stores Token
   │
   ▼

Authorization Header
   │
   ▼

Auth Middleware
   │
   ▼

GraphQL Context
   │
   ▼

Protected Resolver
```

---

## Logout Strategy

This project implements token invalidation using a `tokenVersion`.

When a user logs out:

1. `tokenVersion` is incremented in the database.
2. Existing JWTs become invalid.
3. Future requests using old tokens are rejected.

This avoids maintaining a token blacklist.

---

## DataLoader & N+1 Prevention

Without DataLoader:

```graphql
{
  posts {
    author {
      name
    }
  }
}
```

Could trigger:

```text
1 Query -> Posts
N Queries -> Authors
```

With DataLoader:

```text
1 Query -> Posts
1 Query -> Authors
```

The loaders batch and cache requests during a single GraphQL operation.

---

## Real-Time Subscription Flow

```text
Create Post
    │
    ▼

Post Service
    │
    ▼

Redis PubSub Publish
    │
    ▼

Subscription Channel
    │
    ▼

WebSocket Server
    │
    ▼

Connected Clients
```

Events:

- POST_CREATED
- COMMENT_CREATED

---

## Example Operations

### Register

```graphql
mutation {
  register(
    input: {
      name: "Neel"
      email: "neel@example.com"
      password: "password123"
    }
  ) {
    success
    message
  }
}
```

### Login

```graphql
mutation {
  login(
    input: {
      email: "neel@example.com"
      password: "password123"
    }
  ) {
    token
  }
}
```

### Create Post

```graphql
mutation {
  createPost(
    input: {
      title: "GraphQL"
      body: "Learning GraphQL internals"
    }
  ) {
    success
  }
}
```

### Subscription

```graphql
subscription {
  postCreated {
    id
    title
  }
}
```

---

## Health Endpoints

### Liveness

```http
GET /health
```

### Readiness

```http
GET /ready
```

Verifies database connectivity before accepting traffic.

---

## Running Locally

### Install

```bash
npm install
```

### Configure Environment

```env
PORT=3000
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret"
JWT_EXPIRES_IN="1h"
REDIS_URL="redis://localhost:6379"
```

### Run Migrations

```bash
npx prisma migrate dev
```

### Start

```bash
npm run dev
```

---

## Key Concepts Demonstrated

- GraphQL Server Architecture
- Resolver Design
- Service Layer Pattern
- Repository Pattern
- Context Injection
- Authentication
- Authorization
- DataLoader
- GraphQL Subscriptions
- Redis Pub/Sub
- Prisma ORM
- Production Middleware
- WebSocket Authentication
- Graceful Shutdown

---

Built to understand how production GraphQL systems are structured internally rather than just how to write queries and mutations.