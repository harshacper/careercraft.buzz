# AI Career Navigator

A modern, production-ready full-stack web application designed for career growth, featuring AI-powered resume analysis, chatbot advising, skill gap analysis, and interactive dashboards.

## Architecture

- **Frontend**: React (Vite) + Tailwind CSS v3 + Framer Motion
- **Backend**: Node.js + Express
- **Database**: MongoDB (Mongoose) - *Optional mock mode included*
- **AI Integration**: Google Gemini API (@google/genai)

## Folder Structure

- `/frontend`: The React application UI.
- `/backend`: The Express REST API.

## Local Development Setup

### 1. Environment Variables

Navigate to the `backend/` folder and create a `.env` file using the `.env.example` as a reference.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```
*Note: If `MONGO_URI` is not provided, the backend will use an in-memory mock store for authentication.*

### 2. Install Dependencies

In the root of `backend/`:
```bash
npm install
```

In the root of `frontend/`:
```bash
npm install
```

### 3. Run the Development Servers

Start the backend server (runs on `http://localhost:5000`):
```bash
cd backend
npm run start # (or node server.js)
```

Start the frontend server (runs on `http://localhost:5173`):
```bash
cd frontend
npm run dev
```

## Features

1. **Authentication**: JWT-based login/signup with secure password hashing.
2. **AI Chatbot**: Context-aware career advice via Gemini.
3. **Resume Builder & ATS Analyzer**: Interactive drag-and-drop tool for resume building.
4. **Skill Gap Analysis**: Identify missing skills with a dynamically generated roadmap.
5. **Top Companies Showcase**: Directory of companies with filtering functionality.
6. **Premium UI/UX**: Glassmorphism, smooth animations, fully responsive design.

## Deployment Instructions

### Frontend (Vercel/Netlify)
1. Push your repository to GitHub.
2. Import the `frontend` folder into Vercel or Netlify.
3. Build command: `npm run build`
4. Output directory: `dist`

### Backend (Render/Heroku)
1. Create a new Web Service on Render or Heroku.
2. Connect the repository and select the `backend` folder.
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add your `.env` variables in the dashboard settings.

### Database (MongoDB Atlas)
1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Get your connection string and add it to `MONGO_URI` in the backend `.env`.

*Enjoy building the future of career navigation!*
