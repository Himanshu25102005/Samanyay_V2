# Vercel Deployment Guide for Samanyay Frontend

## Environment Variables Setup

To connect your Vercel-deployed frontend to your Railway-deployed backend, you need to set the following environment variable in your Vercel dashboard:

### Required Environment Variable

1. **NEXT_PUBLIC_API_URL**
   - Value: `https://backendv2-for-dep-production.up.railway.app`
   - This tells the frontend where to find your backend API

### How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add a new variable:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://backendv2-for-dep-production.up.railway.app`
   - **Environment**: Production (and Preview if you want)
5. Click "Save"
6. Redeploy your application

### Optional Environment Variables

If you have other microservices, you can also set:

- **ANALYZER_BASE_URL**: `http://34.93.247.115:8001` (for Document Analysis)
- **LEGAL_RESEARCH_BASE_URL**: `http://34.93.247.115:8000` (for Legal Research)

### Testing the Connection

After setting the environment variable and redeploying:

1. Go to your Vercel app URL
2. Navigate to Case Management
3. Check the browser console for any connection errors
4. Try creating a new case to test the backend connection

### Troubleshooting

If you still see connection errors:

1. **Check Vercel Function Logs**:
   - Go to Vercel Dashboard → Your Project → Functions tab
   - Look for any error logs in the API routes

2. **Verify Backend URL**:
   - Make sure your Railway backend is running
   - Test the backend URL directly: `https://backendv2-for-dep-production.up.railway.app/api/cases`

3. **Check CORS Settings**:
   - Your Railway backend should allow requests from your Vercel domain
   - Add your Vercel domain to CORS origins in your backend

### Local Development

For local development, create a `.env.local` file in the frontend_v2 directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

This will allow you to test locally with your local backend.
