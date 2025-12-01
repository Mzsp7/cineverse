# 🚀 Deploying CineVerse to Vercel

## Prerequisites
- GitHub account with the repository pushed
- Vercel account (sign up at [vercel.com](https://vercel.com))
- TMDB API Key

## Step-by-Step Deployment Guide

### 1. Import Project to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository: `Mzsp7/cineverse`
4. Vercel will auto-detect the configuration from `vercel.json`

### 2. Configure Environment Variables

In the Vercel project settings, add these environment variables:

#### Backend Variables:
- `TMDB_API_KEY` = `your_tmdb_api_key_here`
- `SECRET_KEY` = `your_secret_jwt_key_here` (generate a random string)
- `VERCEL` = `1` (tells the app it's running on Vercel)

#### Frontend Variables:
- `VITE_API_URL` = `https://your-project-name.vercel.app/api`

**Note**: Replace `your-project-name` with your actual Vercel project URL after deployment.

### 3. Deploy

1. Click **"Deploy"**
2. Vercel will build and deploy your application
3. Wait for the deployment to complete (usually 2-3 minutes)

### 4. Post-Deployment Configuration

After the first deployment:

1. **Update Frontend API URL**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Update `VITE_API_URL` to: `https://your-actual-vercel-url.vercel.app/api`
   - Redeploy the project

2. **Test the Deployment**:
   - Visit your Vercel URL
   - Try registering a new account
   - Test login and browsing movies

## Important Notes

### Database Limitations
⚠️ **SQLite on Vercel**: The database uses `/tmp` storage on Vercel, which is **ephemeral**. This means:
- Data is lost when the serverless function restarts
- Not suitable for production use

**Recommended Solutions**:
1. **PostgreSQL** (Recommended): Use Vercel Postgres or Supabase
2. **MySQL**: Use PlanetScale or Railway
3. **MongoDB**: Use MongoDB Atlas

### ML Model Files
The `.pkl` files are excluded from the repository due to size. For production:
1. Upload them to cloud storage (AWS S3, Google Cloud Storage)
2. Download them at runtime in the serverless function
3. Or use a dedicated ML service API

### API Routes
All backend routes will be available at:
- `https://your-app.vercel.app/api/home`
- `https://your-app.vercel.app/api/search`
- `https://your-app.vercel.app/api/movie/{id}`
- etc.

## Troubleshooting

### Build Fails
- Check the build logs in Vercel dashboard
- Ensure all dependencies are in `requirements.txt` and `package.json`

### API Not Working
- Verify environment variables are set correctly
- Check that `VITE_API_URL` points to the correct Vercel URL
- Look at Function logs in Vercel dashboard

### Database Errors
- Remember that SQLite data is temporary on Vercel
- Consider migrating to a persistent database solution

## Alternative: Deploy Backend Separately

For better performance, consider:
1. **Frontend on Vercel**: Deploy the React app
2. **Backend on Railway/Render**: Deploy FastAPI separately
3. Update `VITE_API_URL` to point to the backend URL

This approach provides:
- Better performance
- Persistent database
- Easier debugging
- More control over scaling

## Next Steps

After successful deployment:
1. Set up a custom domain (optional)
2. Configure CORS if needed
3. Set up monitoring and analytics
4. Migrate to a production database
5. Implement caching for better performance
