# API Error Fix - Samanyay V2

## Issues Identified

1. **404 Error for `/api/user`**: Backend routing conflict
2. **500 Error for `/api/cases`**: Backend routing and database connection issues  
3. **Frontend Configuration**: Missing environment variable `NEXT_PUBLIC_API_URL`

## Root Causes

### 1. Backend Route Order Issue
The routes in `app.js` were ordered incorrectly:
```javascript
app.use('/', casesRouter);      // Handles /api/cases
app.use('/', indexRouter);      // Handles /api/user (but has catch-all route)
app.use('/users', usersRouter);
```

The `indexRouter` has a catch-all route `router.all("*", ...)` that was intercepting API requests before they reached the cases router.

### 2. Missing Environment Variable
The frontend on Vercel doesn't have `NEXT_PUBLIC_API_URL` set to the correct backend URL.

## Fixes Applied

### 1. Fixed Backend Route Order
```javascript
app.use('/users', usersRouter);
app.use('/', casesRouter);      // Now cases routes are handled first
app.use('/', indexRouter);      // indexRouter last, with improved catch-all
```

### 2. Improved Catch-All Route
Updated the catch-all route in `indexRouter` to not interfere with API routes:
```javascript
router.all("*", (req, res) => {
  // Skip if this is an API route that should be handled by other routers
  if (req.url.startsWith('/api/')) {
    return res.status(404).json({ 
      error: "API route not found", 
      method: req.method, 
      url: req.url,
      message: "This API endpoint is not implemented"
    });
  }
  // ... rest of the catch-all logic
});
```

### 3. Frontend Environment Variable
The frontend needs `NEXT_PUBLIC_API_URL` set to `https://backendv2-for-dep-production.up.railway.app` in Vercel.

## Required Actions

### For Vercel Deployment (Frontend)
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `NEXT_PUBLIC_API_URL` = `https://backendv2-for-dep-production.up.railway.app`
3. Redeploy the application

### For Railway Deployment (Backend)
1. Deploy the updated backend code with the route fixes
2. Ensure MongoDB connection is working
3. Test the endpoints directly

## Testing

### Backend Routes Test
Run the test script to verify all routes work:
```bash
cd backend_v2
node test-routes.js
```

### Frontend Connection Test
After setting the environment variable, test the connection:
```bash
cd frontend_v2
node test-backend-connection.js
```

## Expected Results

After applying these fixes:
- ✅ `/api/user` should return 200 (or 401 if not authenticated)
- ✅ `/api/cases` should return 200 with cases data
- ✅ Frontend should successfully connect to backend
- ✅ Case management functionality should work

## Environment Variables Summary

### Frontend (Vercel)
- `NEXT_PUBLIC_API_URL`: `https://backendv2-for-dep-production.up.railway.app`

### Backend (Railway)
- `MONGO_URL` or `DB_SAMANYAY`: MongoDB connection string
- `SESSION_SECRET`: Session secret key
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `FRONTEND_URL`: `https://samanyay-v2.vercel.app`
