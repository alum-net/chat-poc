# Chat POC

POC for a **chat application**.  
This repository is organized as a **monorepo**, separating the backend and the frontend.

---

## Project Structure

```
chat-poc/
│── README.md
│── .gitignore
│
├── backend/ → API REST + WebSocket (Java + Spring Boot)
│   ├── build.gradle
│   ├── settings.gradle
│   ├── gradlew / .bat
│   ├── gradle/
│   └── src/
│
└── frontend/ → Web interface (Vite + TypeScript + React)
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── public/
    └── src/
```

---

##  Features

- Real-time messaging using **WebSocket + STOMP**.
- REST API for **chat history** (with cursor-based pagination).
- **MongoDB persistence** for messages.
- Frontend built with **React + Vite + TypeScript**.

---

## Technologies

**Backend**
- Java 17+
- Spring Boot (WebSocket + REST)
- Spring Data MongoDB

**Frontend**
- React + Vite + TypeScript
- @stomp/stompjs (STOMP WebSocket client)

**Database**
- MongoDB

---

## Environment Variables

### Frontend  
Create a `.env.development.local` file inside `frontend/`:

```
VITE_API_URL=http://localhost:8081
VITE_WS_URL=ws://localhost:8081/ws-native
```

### Backend  
Configure in `application.properties` (default):

```
server.port=8081
spring.data.mongodb.uri=mongodb://localhost:27017/chatpoc
```

---

##  Getting Started

### 1. Backend (Java + Spring Boot)

Requirements: **JDK 17+** and Gradle Wrapper (included).

```bash
cd backend
./gradlew bootRun       # Linux/Mac
gradlew.bat bootRun     # Windows
```

The backend will be available at:  
👉 http://localhost:8081

---

### 2. Frontend (React + Vite + TS)

Requirements: **Node.js 18+** and npm.

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at:  
 http://localhost:5173

---

##  API Endpoints

### REST
- `GET /api/conversations/{id}/messages?limit=50[&beforeId=<ObjectId>]`  
  → Returns chat history (paginated).

### WebSocket
- Connect to: `ws://localhost:8081/ws-native`
- **SEND** → `/app/conversations/{id}/send`
- **SUBSCRIBE** → `/topic/conversations/{id}`

---
