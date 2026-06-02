# TaskFlow — Modern Task & Project Management App

TaskFlow is a premium, real-time collaboration and project management application built using a modern React frontend and a Node.js/Express backend, backed by SQLite via Prisma ORM.

---

## 🚀 Key Features

* **Project & Task Boards**: Seamless project creation, task management, prioritization, status progression, and team member assignment.
* **Team Activity Logs**: Automatic tracking and logging of tasks created, moved, updated, or deleted.
* **Persistent SQLite Database**: Dynamic, robust database storage using Prisma client.
* **Advanced Security Suite**:
  * **HTTP Security Headers**: Powered by `helmet` to protect against common web vulnerabilities.
  * **CORS Protection**: Access limited to local frontend host for secure API consumption.
  * **IP Rate Limiting**: Dedicated rate-limiters for general API requests (`apiLimiter`) and strict limiters for authentication endpoints (`authLimiter`) to prevent brute-force attacks.
  * **Input Validation & Sanitization**: Strict email pattern verification and password constraints on registration and update routines.
* **User Authentication**: Secure credentials-based authentication with `bcrypt` password hashing and JWT token authorization.

---

## 🛠️ Project Structure

```text
newtaskapp/
├── backend/                  # Express + Prisma Node.js backend
│   ├── prisma/               # SQLite schema definition & migrations
│   │   ├── dev.db            # SQLite database file
│   │   └── schema.prisma     # Prisma database schema
│   ├── src/
│   │   ├── controllers/      # Route request/response handlers
│   │   ├── middlewares/      # Auth, rate-limiter, and secure headers middlewares
│   │   ├── routes/           # Express router namespaces
│   │   ├── utils/            # JWT helper and common utilities
│   │   └── index.ts          # Server entry point
│   └── package.json          # Backend dependencies
│
├── src/                      # Vite + React frontend client
│   ├── components/           # Reusable UI views (Modals, Task Cards, Boards)
│   ├── context/              # AppContext state manager & API client integration
│   ├── pages/                # Main views (Dashboard, Login, User Progress)
│   └── main.tsx              # React mounting root
│
└── package.json              # Frontend configurations & package manager
```

---

## 💻 Setup and Local Running

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **npm** or **yarn**

### Step 1: Install Dependencies
Run in the root folder to install frontend dependencies:
```bash
npm install
```

Run in the `backend` folder to install backend dependencies:
```bash
cd backend
npm install
```

### Step 2: Initialize Database (Backend)
Run these commands inside the `backend` folder to set up your SQLite database and generate the Prisma Client:
```bash
npx prisma generate
npx prisma db push
npm run seed
```

### Step 3: Run the Project
Start the backend server (starts on `http://localhost:5000`):
```bash
cd backend
npm run dev
```

Start the frontend application (starts on `http://localhost:3000`):
```bash
# In the root project directory
npm run dev
```

---

## 🔒 Security Configurations
Security features can be modified via environment variables in `backend/.env`:
* `JWT_SECRET`: Secret key used for signing JWT login tokens.
* `FRONTEND_URL`: URL of the approved frontend client (defaults to `http://localhost:3000`).
* `NODE_ENV`: Set to `production` or `development` to trigger dev CORS bypasses.
