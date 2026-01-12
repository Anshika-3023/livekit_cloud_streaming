# LiveKit Cloud Setup Guide

This document helps you fix the "invalid token", "401 unauthorized", "websocket closed", and "could not establish signal connection" errors.

## Common Causes

1. **Expired Token** - The JWT token has an expiration timestamp that's in the past
2. **Incorrect Credentials** - The API key/secret don't match your LiveKit Cloud project
3. **Environment Configuration** - Frontend and backend configurations are mismatched

## Step-by-Step Fix

### 1. Verify LiveKit Cloud Credentials

1. Go to your LiveKit Cloud Dashboard: https://cloud.livekit.io/
2. Select your project: `hirevibe-code-wud39ncg`
3. Navigate to **Settings** → **API Keys**
4. Copy your **API Key** and **API Secret**
5. Update `backend/.env`:

```env
LIVEKIT_API_KEY=your_api_key_here
LIVEKIT_API_SECRET=your_api_secret_here
PORT=3001
```

### 2. Update Frontend Configuration

For production deployment, set the API URL to match your backend endpoint:

**Option A: Using environment variables (recommended)**
Create `frontend/.env`:
```env
VITE_API_URL=https://your-backend-domain.com/token
```

**Option B: Direct configuration**
Edit `frontend/src/config/livekit.js`:
```javascript
export const TOKEN_ENDPOINT = "https://your-backend-domain.com/token";
```

### 3. Check Token Expiration

The token error you received shows an expired token. To fix:

1. Clear browser cache and cookies
2. Clear localStorage by running in browser console:
   ```javascript
   localStorage.removeItem("livekit_token");
   localStorage.removeItem("participant_name");
   ```
3. Rejoin the room to get a fresh token

### 4. Verify CORS Configuration

Ensure your backend allows requests from your frontend domain:

```javascript
// backend/src/index.js
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-production-domain.com'],
  credentials: true,
}));
```

### 5. Test Token Generation

Run the backend and test the token endpoint:

```bash
cd backend
npm install
npm start
```

Then make a test request:
```bash
curl -X POST http://localhost:3001/token \
  -H "Content-Type: application/json" \
  -d '{"room": "test-room", "identity": "test-user"}'
```

### 6. Debug LiveKit Connection

Add more logging to understand the connection flow:

```javascript
// In VideoRoom.jsx, add before connecting
console.log("LIVEKIT_URL:", LIVEKIT_URL);
console.log("Token endpoint:", TOKEN_ENDPOINT);
console.log("Token available:", !!token);
```

## Checking Your Token

You can decode your JWT token at https://jwt.io to verify:
- `iss` (issuer) should match your LiveKit API Key
- `exp` (expiration) should be in the future
- `sub` (subject) should be the participant identity
- `video.room` should match the room name you're joining

## Production Deployment

For production, ensure:

1. Backend is deployed and accessible at a public URL
2. Frontend's `VITE_API_URL` points to the production backend
3. CORS is configured to allow your frontend domain
4. SSL/TLS is enabled (LiveKit Cloud requires wss:// for WebSocket)
5. Environment variables are set securely in your deployment platform

## Still Having Issues?

If you continue to experience connection errors:

1. Check LiveKit Cloud project status
2. Verify your LiveKit Cloud project is active and has available minutes
3. Check the LiveKit Cloud console for any project-level issues
4. Review browser console for detailed error messages
5. Ensure your system clock is correct (token expiration depends on accurate time)
