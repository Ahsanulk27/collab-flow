# CollabFlow - Setup Guide

A full-stack collaboration platform built with React, TypeScript, Express, and PostgreSQL.

## Prerequisites

Before setting up the project, make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** (comes with Node.js)

## Project Structure

```
collab-flow/
├── backend/          # Express.js backend server
├── frontend/         # React + Vite frontend application
└── README.md         # This file
```

## Setup Instructions

### 1. Install Dependencies

#### Backend Dependencies
```bash
cd backend
npm install
```

#### Frontend Dependencies
```bash
cd frontend
npm install
```

### 2. Database Setup

1. **Create a PostgreSQL database:**
   ```bash
   # Using psql command line
   psql -U postgres
   CREATE DATABASE collabflow;
   \q
   ```

   Or use a database management tool like pgAdmin.

2. **Set up environment variables for the backend:**
   
   Create a `.env` file in the `backend/` directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/collabflow?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   PORT=3000
   NODE_ENV=development
   ```

   Create a `.env.development` file in the `backend/` directory (optional, for development-specific overrides):
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/collabflow?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   PORT=3000
   NODE_ENV=development
   ```

   **Important:** Replace `username`, `password`, and `collabflow` with your actual PostgreSQL credentials and database name.

### 3. Run Database Migrations

From the `backend/` directory:
```bash
npm run prisma:generate
npm run prisma:migrate:dev
```

This will:
- Generate the Prisma Client
- Run all database migrations to set up your schema

### 4. Set up Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:
```env
VITE_API_BASE=http://localhost:3000/api/v1
```

**Note:** Make sure the port matches the `PORT` you set in your backend `.env` file (default is 3000).

### 5. Start the Development Servers

#### Start Backend Server

Open a terminal and run:
```bash
cd backend
npm run dev
```

The backend server should start on `http://localhost:3000` (or the port you specified in `.env`).

#### Start Frontend Development Server

Open another terminal and run:
```bash
cd frontend
npm run dev
```

The frontend should start on `http://localhost:8080`.

### 6. Access the Application

Open your browser and navigate to:
```
http://localhost:8080
```

## Available Scripts

### Backend Scripts (in `backend/` directory)

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate:dev` - Run database migrations in development
- `npm run prisma:migrate:deploy` - Deploy migrations in production
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

### Frontend Scripts (in `frontend/` directory)

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready` or check your PostgreSQL service
- Double-check your `DATABASE_URL` in the `.env` file
- Ensure the database exists: `psql -U postgres -l` to list databases

### Port Already in Use

- Backend: Change `PORT` in `backend/.env`
- Frontend: The port is configured in `frontend/vite.config.ts` (default: 8080)

### Prisma Issues

- If migrations fail, try: `npm run prisma:generate` first
- Check that your database URL is correct
- Ensure you have the latest Prisma CLI: `npm install -g prisma`

### CORS Errors

- Make sure the frontend URL in `backend/src/app.ts` matches your frontend port (default: 8080)
- Verify `VITE_API_BASE` in frontend `.env` matches your backend URL

## Production Deployment

1. Set `NODE_ENV=production` in your backend `.env`
2. Build the frontend: `cd frontend && npm run build`
3. Build the backend: `cd backend && npm run build`
4. Run migrations: `npm run prisma:migrate:deploy`
5. Start the server: `npm start`

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

## Support

If you encounter any issues during setup, please check:
1. All environment variables are correctly set
2. PostgreSQL is running and accessible
3. All dependencies are installed
4. Ports are not in use by other applications

