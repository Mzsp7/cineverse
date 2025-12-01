# 🎬 CineVerse - AI-Powered Movie Recommendation System

CineVerse is a modern, full-stack movie recommendation platform that leverages Machine Learning (TF-IDF & Cosine Similarity) to provide personalized movie suggestions. Built with **FastAPI** and **React**, it offers a seamless, premium user experience with region-based content filtering.

## ✨ Key Features

*   **🤖 AI-Powered Recommendations**: "More Like This" suggestions generated using a content-based filtering ML model.
*   **🌍 Region-Based Content**: Automatically filters trending and popular movies based on the user's registered country (e.g., users in India see Bollywood/Indian content first).
*   **🔍 Global Search**: While the home feed is personalized, the search bar allows you to explore the entire global TMDB catalog.
*   **🔐 Secure Authentication**: Robust JWT-based registration and login system.
*   **📱 Responsive Design**: A stunning, mobile-first UI built with React and Tailwind CSS.
*   **⚡ Real-Time Data**: Integrates with the TMDB API for up-to-date movie information.

## 🛠️ Tech Stack

### Backend
*   **Framework**: FastAPI (Python)
*   **ML Engine**: Scikit-learn (TF-IDF, Cosine Similarity)
*   **Database**: SQLite (with SQLModel ORM)
*   **Authentication**: OAuth2 with JWT
*   **API Integration**: TMDB v3 REST API

### Frontend
*   **Framework**: React (Vite)
*   **Styling**: Tailwind CSS
*   **State Management**: React Hooks
*   **Routing**: React Router

## 📋 Prerequisites

*   **Python 3.8+**
*   **Node.js 16+** (and npm)
*   **TMDB API Key**: Get one from [The Movie Database (TMDB)](https://www.themoviedb.org/documentation/api).

## 🚀 Installation & Setup

### 1. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create and activate a virtual environment:

```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

**Configuration**: Create a `.env` file in the `backend` directory with your API key:
```env
TMDB_API_KEY=your_api_key_here
SECRET_KEY=your_secret_key_here
```

Run the server:

```bash
uvicorn app:app --reload
```
The backend will start at `http://localhost:8000`.

### 2. Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```
The frontend will start at `http://localhost:5173`.

## 📖 Usage & Testing

### Test Accounts
You can use these pre-configured accounts to test specific features:

| Account Type | Email | Password | Purpose |
|--------------|-------|----------|---------|
| **India User** | `india@test.com` | `testpass123` | Test region-based filtering for Indian content |
| **Debug User** | `debug@test.com` | `testpass123` | General testing |

### How to Test Region Filtering
1.  **Login** with `india@test.com`.
2.  Observe that the **Home** page shows "Trending in India" and "Popular in India".
3.  Use the **Search** bar to find a Hollywood movie (e.g., "Inception") - search remains global.

## 🔌 API Documentation

Interactive API docs are available when the backend is running:
*   **Swagger UI**: `http://localhost:8000/docs`
*   **ReDoc**: `http://localhost:8000/redoc`

## 🔮 Future Roadmap

We are planning to introduce an **Admin Panel** with the following features:
*   **User Management**: View, block, or manage users.
*   **Analytics Dashboard**: Track user engagement, popular searches, and regional demographics.
*   **Content Management**: Curate featured collections and editorial picks.
*   **System Monitoring**: Track API usage and server health.

## 📁 Project Structure

```
MRS/
├── backend/
│   ├── app.py              # Main FastAPI application
│   ├── recommender.py      # ML Recommendation Engine
│   ├── tmdb.py             # TMDB API Wrapper
│   ├── routers/            # API Route Handlers
│   └── data/               # ML Models & Data
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI Components
│   │   ├── pages/          # Application Pages
│   │   └── App.jsx         # Main React Component
└── README.md
```

