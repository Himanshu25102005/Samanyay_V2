# CORS and API URL Fix

## Issues Identified

1. **CORS Error**: Backend only allowed `http://localhost:3000` but frontend is on `https://samanyay-v2.vercel.app`
2. **Double Slash in URL**: API calls were generating URLs like `https://backendv2-for-dep-production.up.railway.app//api/user`

## Fixes Applied

### 1. Backend CORS Configuration (`backend_v2/app.js`)

**Before:**
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**After:**
```javascript
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'https://samanyay-v2.vercel.app',
      process.env.FRONTEND_URL
    ].filter(Boolean); // Remove undefined values
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

app.use(cors(corsOptions));
```

### 2. Frontend API URL Construction (`frontend_v2/src/lib/api.js`)

**Before:**
```javascript
const url = `${API_BASE_URL}${endpoint}`;
```

**After:**
```javascript
// Ensure endpoint starts with / and API_BASE_URL doesn't end with /
const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
const cleanBaseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
const url = `${cleanBaseUrl}${cleanEndpoint}`;
```

## What This Fixes

### ✅ CORS Issues
- Now allows requests from `https://samanyay-v2.vercel.app`
- Maintains support for `http://localhost:3000` for development
- Includes proper error logging for blocked origins
- Supports all necessary HTTP methods and headers

### ✅ URL Construction Issues
- Prevents double slashes in API URLs
- Handles both `/api/user` and `api/user` endpoint formats
- Ensures clean URL construction regardless of trailing slashes

## Testing

### Backend CORS Test
```bash
curl -H "Origin: https://samanyay-v2.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://backendv2-for-dep-production.up.railway.app/api/user
```

### Frontend API URL Test
```bash
cd frontend_v2
node test-api-url.js
```

## Expected Results

After deploying these changes:

1. **CORS Error Resolved**: No more "Access-Control-Allow-Origin" errors
2. **Clean URLs**: API calls will use `https://backendv2-for-dep-production.up.railway.app/api/user` instead of `https://backendv2-for-dep-production.up.railway.app//api/user`
3. **Successful API Calls**: All API requests should work properly
4. **User Authentication**: User context should load properly
5. **Case Management**: All CRUD operations should work

## Deployment Steps

1. **Deploy Backend**:
   - Push the updated `backend_v2/app.js` to Railway
   - Monitor logs for CORS-related messages

2. **Deploy Frontend**:
   - Push the updated `frontend_v2/src/lib/api.js` to Vercel
   - Ensure `NEXT_PUBLIC_API_URL` is set to `https://backendv2-for-dep-production.up.railway.app`

3. **Verify**:
   - Check browser console for successful API calls
   - Test user authentication flow
   - Test case management functionality

## Debug Information

The API utility now includes debug logging:
```javascript
console.log('API Configuration:');
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('API_BASE_URL:', API_BASE_URL);
```

This will help identify any remaining configuration issues.
