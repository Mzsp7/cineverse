# 🚀 Deploying CineVerse

## Architecture Overview

Due to Vercel's 250 MB serverless function limit, we'll use a **split deployment strategy**:
- **Frontend (React)**: Deployed on Vercel
- **Backend (FastAPI)**: Deployed on Railway (or Render)

## Prerequisites
- GitHub account with the repository
- Vercel account ([vercel.com](https://vercel.com))
- Railway account ([railway.app](https://railway.app)) - Free tier available
- TMDB API Key

---

## Part 1: Deploy Backend to Railway

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub

### Step 2: Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `cineverse` repository
4. Railway will auto-detect it as a Python project

### Step 3: Configure Backend
1. **Set Root Directory** (if needed):
   - Go to Settings → Root Directory
   - Leave blank (Railway will use the root)

2. **Add Environment Variables**:
   - Go to **Variables** tab
   - Add these variables:
   ```
   TMDB_API_KEY=your_tmdb_api_key_here
   SECRET_KEY=your_secret_jwt_key_here
   PORT=8000
   ```

3. **Configure Start Command**:
   - Go to Settings → Deploy
   - Custom Start Command: `cd backend && uvicorn app:app --host 0.0.0.0 --port $PORT`
   - Or Railway will use the `Procfile` automatically

### Step 4: Deploy Backend
1. Click **"Deploy"**
2. Wait for deployment to complete (2-3 minutes)
3. **Copy your Railway URL** (e.g., `https://your-app.railway.app`)

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Import Project to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your `cineverse` repository
4. Vercel will auto-detect the configuration

### Step 2: Configure Environment Variables
In the Vercel project settings, add:

```
VITE_API_URL=https://your-railway-app.railway.app
```

**Important**: Replace `your-railway-app.railway.app` with your actual Railway backend URL from Part 1.

### Step 3: Deploy Frontend
1. Click **"Deploy"**
2. Wait for deployment (1-2 minutes)
3. Your frontend will be live at `https://your-project.vercel.app`

---

## Part 3: Configure CORS (Backend)

After deployment, you need to allow your Vercel frontend to access the Railway backend.

### Update Backend CORS Settings

The backend should already have CORS configured in `app.py`. Verify it allows your Vercel domain:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

For production, update `allow_origins` to:
```python
allow_origins=["https://your-project.vercel.app"]
```

---

## Testing Your Deployment

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Try registering a new account
3. Login and browse movies
4. Test search functionality
5. Check movie details and recommendations

---

## Important Notes

### Database
⚠️ **SQLite Limitations**: 
- Railway provides persistent storage, so your SQLite database will persist
- For production, consider upgrading to PostgreSQL:
  - Railway offers PostgreSQL with a free tier
  - Update connection string in `database.py`

### ML Model Files
The `.pkl` files are excluded from git. Options:
1. **Regenerate on Railway**: Run `python backend/build_models.py` after deployment
2. **Upload manually**: Use Railway's file upload feature
3. **Cloud storage**: Store in AWS S3/Google Cloud Storage

### Environment Variables Summary

**Railway (Backend)**:
- `TMDB_API_KEY` - Your TMDB API key
- `SECRET_KEY` - JWT secret key (generate random string)
- `PORT` - 8000

**Vercel (Frontend)**:
- `VITE_API_URL` - Your Railway backend URL

---

## Alternative: Deploy Backend to Render

If you prefer Render over Railway:

1. Go to [render.com](https://render.com)
2. Create a **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
5. Add the same environment variables as Railway
6. Deploy and copy the Render URL
7. Use this URL in Vercel's `VITE_API_URL`

---

## Troubleshooting

### Frontend Can't Connect to Backend
- Verify `VITE_API_URL` is set correctly in Vercel
- Check CORS settings in backend
- Ensure Railway/Render backend is running

### Backend Deployment Fails
- Check Railway logs for errors
- Verify `requirements.txt` has all dependencies
- Ensure Python version is compatible (3.8+)

### Database Errors
- Check if database file has write permissions
- Consider migrating to PostgreSQL for production

### ML Recommendations Not Working
- Verify `.pkl` files are present on Railway
- Check backend logs for model loading errors
- Run `build_models.py` to regenerate models

---

## Production Checklist

- [ ] Update CORS to specific domain (not `*`)
- [ ] Migrate to PostgreSQL database
- [ ] Set up custom domain on Vercel
- [ ] Configure environment-specific secrets
- [ ] Set up monitoring and error tracking
- [ ] Implement rate limiting on backend
- [ ] Add caching for API responses
- [ ] Set up automated backups for database

---

## Cost Estimate

- **Vercel**: Free tier (sufficient for hobby projects)
- **Railway**: Free tier with $5 credit/month (sufficient for small apps)
- **Total**: $0/month for hobby use, ~$5-10/month for production

---

## Next Steps

1. Deploy backend to Railway
2. Deploy frontend to Vercel
3. Test the application
4. Set up custom domain (optional)
5. Monitor usage and performance

