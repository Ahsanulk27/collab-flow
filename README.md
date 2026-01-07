# CollabFlow  
### Real-Time Collaboration & Project Management Platform

CollabFlow is a real-time collaboration and project management web application that enables teams to work together in shared workspaces.  
The platform integrates **real-time chat, task management, collaborative whiteboards, and video conferencing** in one place.


---

## 🚀 Features

- 🔐 User Authentication (JWT-based)
- 🏢 Workspace creation and joining via invite codes
- 💬 Real-time chat using Socket.io
- 📋 Task board with full CRUD operations
- 🖊️ Collaborative whiteboard with real-time sync
- 👥 Online user presence indicators
- 📊 Task progress visualization using QuickChart API
- 🎥 Video conferencing via Jitsi Meet API

---

## 🛠️ Tech Stack

### Frontend
- TypeScript
- React
- Vite
- Tailwind CSS
- Socket.io Client
- React Konva (Whiteboard)

### Backend
- Node.js
- Express
- TypeScript
- Socket.io
- PostgreSQL
- Prisma ORM
- JWT Authentication

---
```text
## 📁 Project Structure

root/
│
├── frontend/          # React frontend application
│
└── backend/           # Express backend API and Socket.io server
```
Each folder is an independent application with its own dependencies and environment variables.


⚙️ Prerequisites
Ensure the following are installed on your system:

Node.js (v18 or later)

npm or yarn

PostgreSQL (local or cloud)

Git

🔧 Environment Variables
Backend (backend/.env)
```
env
NODE_ENV=production
DATABASE_URL="postgresql://neondb_owner:npg_6GQwon0xbCRZ@ep-old-water-a1ki24y9-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"     # Production db access for testing
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your_jwt_secret
PORT=1045
```
Frontend (frontend/.env)
```
env
VITE_API_BASE=http://localhost:1045/api/v1
```
⚠️ Do not commit .env files to version control.

▶️ Running the Application Locally
1️⃣ Clone the Repository
```
git clone https://github.com/Ahsanulk27/collab-flow.git
cd collab-flow
```
2️⃣ Backend Setup
Navigate to the backend directory and install dependencies:
```
cd backend
npm install
```
Generate Prisma client and apply database migrations:
```
npx prisma generate
npx prisma migrate dev
```
Start the backend development server:
```
npm run dev
npm start     # for prod db
```
The backend server will be available at:

http://localhost:1045

3️⃣ Frontend Setup
Open a new terminal window, then run:


```
cd frontend
npm install
npm run dev
```
The frontend application will run at:

http://localhost:8080
