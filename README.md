# 🚀 Project Title

> Project Management App — manage projects, tasks, teams and activity with role-based access.

---

## 📌 Overview

- What the project does: Provides a web application to create and manage projects, assign and track tasks, comment, and monitor activity across teams.
- Who it is for: Small teams, project managers, and developers who want a simple self-hosted project management tool.
- What problem it solves: Centralizes task assignment, progress tracking, team collaboration, and basic project reporting.

Example: This application helps organizations manage projects, assign tasks, track issues, and collaborate through comments and teams with role-based access control.

---

## 🧠 Features

- 🔐 Authentication & Authorization (RBAC)
- 📁 Project creation & management
- ✅ Task / Issue tracking
- 👥 Team management
- 💬 Comment system
- 📊 Activity tracking
- 🛠 Admin / PM / Member roles
- 📌 Priority & status workflow

---

## 🏗 Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router

### Backend
- Node.js
- Express.js

### Database
- MongoDB / Mongoose

### Other Tools
- JWT Authentication
- Axios
- ESLint

---

## 📂 Folder Structure

Top-level structure (important files only):

- `backend/`
  - `server.js` — Express entrypoint
  - `src/` — server source files
    - `config/db.js` — MongoDB connection
    - `controllers/` — route controllers
    - `models/` — Mongoose models
    - `routes/` — Express routes
    - `middleware/` — auth and helpers

- `frontend/`
  - `index.html`, `vite.config.js`
  - `src/` — React app
    - `app/` — router
    - `layout/` — layouts and sidebar
    - `pages/` — pages (projects, tasks, activity, profile)
    - `context/` — theme & language providers
    - `services/` — API clients

---

## ⚙️ Installation & Setup (Full runnable project)

These steps let anyone run the app locally (frontend + backend) end-to-end.

### Prerequisites

- Node.js 18+ (recommended)
- npm 9+ (bundled with Node)
- A MongoDB instance (Atlas or local)

### 1️⃣ Clone repository

```bash
git clone https://github.com/VaibhavChaudhari-07/project-mgmt-app.git
cd project-mgmt-app
```

### 2️⃣ Install dependencies

Install frontend and backend packages (two terminals recommended):

```bash
# Terminal A: frontend
cd frontend
npm ci

# Terminal B: backend
cd backend
npm ci
```

### 3️⃣ Create environment file for backend

Create `backend/.env` (DO NOT COMMIT). Example:

```env
# MongoDB connection (replace with your credentials)
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.example.net/mydb?retryWrites=true&w=majority

# Server port
PORT=5000

# JWT secret (use a long random string)
JWT_SECRET=change_this_to_a_strong_secret

# Optional debug toggle for auth middleware
DEBUG_AUTH=false
```

> Note: `.gitignore` already excludes `.env` to prevent accidental commits.

### 4️⃣ Run the app in development

Start frontend dev server:

```bash
cd frontend
npm run dev
```

Start backend server (in its terminal):

```bash
cd backend
npm run dev
# or: node server.js
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000 (or the `PORT` you configured)

If you prefer a single terminal workflow, use a process manager (e.g., `concurrently` or `npm-run-all`) but the repo currently expects separate processes.

### 5️⃣ Build for production (frontend)

```bash
cd frontend
npm run build
```

You can serve `frontend/dist` from a static host (Vercel/Netlify/S3) or from the Express backend.

To serve from the backend add static middleware in `backend/server.js`:

```js
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html')));

app.listen(process.env.PORT || 5000);
```

Then start backend in production mode:

```bash
cd backend
node server.js
```

Consider adding this to `backend/package.json`:

```json
"main": "server.js",
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

---

## 🔐 Security & Best Practices

- Never commit real credentials. Keep `backend/.env` local and add `backend/.env.example` with placeholders for contributors.
- Use a strong `JWT_SECRET` and rotate credentials as needed.
- Lock down MongoDB access (Atlas IP whitelist and user roles) before production.

---

## 🧪 Troubleshooting

- If backend prints many auth logs and you want to silence them, set `DEBUG_AUTH=false` in `backend/.env` (default). To enable debug logs only when required set `DEBUG_AUTH=true`.
- If Vite HMR shows Fast Refresh warnings or component export errors, try restarting the dev server or run a full `npm run build` to surface build-time errors.
- If MongoDB connection fails, verify `MONGO_URI`, your network, and Atlas IP whitelist.

---

## ✅ Optional TODOs I can implement

- Create `backend/.env.example` (placeholders)
- Add `start` script and set `main` in `backend/package.json`
- Scaffold a `Dockerfile` and basic GitHub Actions CI workflow

Tell me which of the above you'd like me to apply and I will patch the repository.

---

## 📝 Frontend README (template notes)

The `frontend/` folder includes a small template README generated by Vite when the project was scaffolded. It's informational only and not required for build or runtime; its contents are preserved here for contributor reference.

Key notes from `frontend/README.md`:

- The template explains two available React plugins for Vite:
  - `@vitejs/plugin-react` (uses Babel for Fast Refresh)
  - `@vitejs/plugin-react-swc` (uses SWC for Fast Refresh)
- A note about the optional React Compiler and where to find installation docs.
- Guidance about expanding ESLint when using TypeScript and links to the Vite TypeScript template.

If you prefer, the original `frontend/README.md` can be removed; its content is now included here.

---

## 🖼 Architecture Diagrams

Below is the role-based flow diagram illustrating Admin / Project Manager / Member actions and the resulting notifications/activity log flows.

<p align="center">
  <img src="backend/role%20based%20flow%20diagram.jpeg" alt="RBAC role based flow diagram" style="max-width:100%;height:auto;" />
</p>

*Image source: `backend/role based flow diagram.jpeg`*
