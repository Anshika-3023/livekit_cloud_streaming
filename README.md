# LiveKit Cloud Video Calling App

A production-ready full-stack video calling application built with React, Vite, Node.js, Express, and LiveKit Cloud.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Manual Setup](#manual-setup)
- [Configuration](#configuration)
- [Running Locally](#running-locally)
- [Docker Deployment](#docker-deployment)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)

---

## Features

- Real-time video/audio calling with LiveKit Cloud
- JWT token-based authentication
- Room management (join/leave)
- Recording capabilities (start/stop)
- Responsive UI with Tailwind CSS
- Production-ready Docker deployment
- CORS-enabled backend

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   React + Vite                        │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │    │
│  │  │  JoinRoom   │  │  VideoRoom  │  │  VideoTile  │  │    │
│  │  │   (Page)    │  │   (Page)    │  │ (Component) │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                 │
│              ┌─────────────▼─────────────┐                  │
│              │  LiveKit Cloud (WSS)      │                  │
│              │  wss://<subdomain>        │                  │
│              │  .livekit.cloud           │                  │
│              └───────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
                            │
              ┌─────────────▼─────────────┐
              │      Nginx (Reverse       │
              │        Proxy)             │
              └─────────────┬─────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
┌───────▼───────┐                    ┌─────────▼─────────┐
│   Frontend    │                    │     Backend       │
│   (Port 80)   │                    │   (Port 3001)     │
│   React SPA   │◄──────────────────►│  Express REST API │
└───────────────┘                    └───────────────────┘
```

---

## Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **Docker** and **Docker Compose** (for containerized deployment)
- **LiveKit Cloud Account** - [Sign up here](https://cloud.livekit.io)

---

## Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Clone or navigate to project directory
cd livekit_cloud_streaming

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your LiveKit credentials

# Update frontend config
# Edit frontend/src/config/livekit.js with your subdomain

# Build and start
docker-compose up --build

# Access at http://localhost:80
```

### Option 2: Manual Setup

```bash
# Backend
cd backend
npm install
npm start

# Frontend (new terminal)
cd frontend
npm install
npm run dev

# Access at http://localhost:3000
```

---

## Manual Setup

### Step 1: LiveKit Cloud Configuration

1. Go to [LiveKit Cloud Dashboard](https://cloud.livekit.io)
2. Create a new project
3. Copy the following from project settings:
   - **API Key**
   - **API Secret**
   - **Subdomain** (e.g., `myproject.livekit.cloud`)

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

**backend/.env:**
```env
LIVEKIT_API_KEY=your_api_key_here
LIVEKIT_API_SECRET=your_api_secret_here
PORT=3001
```

### Step 3: Frontend Configuration

Edit `frontend/src/config/livekit.js`:

```javascript
export const LIVEKIT_URL = "wss://your-subdomain.livekit.cloud";
export const TOKEN_ENDPOINT = "http://localhost:3001/token";
```

**Important:** Replace `your-subdomain` with your actual LiveKit Cloud subdomain.

### Step 4: Install Frontend Dependencies

```bash
cd frontend
npm install
```

---

## Configuration

### Environment Variables (Backend)

| Variable | Description | Required |
|----------|-------------|----------|
| `LIVEKIT_API_KEY` | LiveKit Cloud API Key | Yes |
| `LIVEKIT_API_SECRET` | LiveKit Cloud API Secret | Yes |
| `PORT` | Backend server port (default: 3001) | No |

### Frontend Configuration (`frontend/src/config/livekit.js`)

| Variable | Description | Default |
|----------|-------------|---------|
| `LIVEKIT_URL` | LiveKit Cloud WebSocket URL | `wss://<subdomain>.livekit.cloud` |
| `TOKEN_ENDPOINT` | Backend token endpoint | `http://localhost:3001/token` |

---

## Running Locally

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev  # Enables hot reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Production Build (Frontend)

```bash
cd frontend
npm run build
# Output: dist/ folder
```

---

## Docker Deployment

### Build Images

```bash
# Build all services
docker-compose build

# Or build individually
docker build -t livekit-frontend ./frontend
docker build -t livekit-backend ./backend
```

### Run Containers

```bash
# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Docker Services

| Service | Port | Description |
|---------|------|-------------|
| frontend | 80 | Nginx serving React app |
| backend | 3001 | Express API server |

### Nginx Configuration

The frontend's nginx.conf proxies API requests:
- `/token` → `backend:3001`
- `/record` → `backend:3001`

---

## API Reference

### POST /token

Generate a LiveKit access token for joining a room.

**URL:** `http://localhost:3001/token`

**Method:** `POST`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "identity": "user-123",
  "room": "room-456"
}
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `identity` | string | Yes | Unique participant identifier |
| `room` | string | Yes | Room ID to join |

**Success Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (400):**
```json
{
  "error": "Missing required fields: room and identity"
}
```

---

### POST /record/start

Start recording a room to MP4 using LiveKit Egress.

**URL:** `http://localhost:3001/record/start`

**Method:** `POST`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "roomName": "room-456"
}
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `roomName` | string | Yes | Name of room to record |

**Success Response:**
```json
{
  "egressId": "egress_abc123",
  "status": "starting"
}
```

---

### POST /record/stop

Stop an active recording.

**URL:** `http://localhost:3001/record/stop`

**Method:** `POST`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "egressId": "egress_abc123"
}
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `egressId` | string | Yes | ID returned from /record/start |

**Success Response:**
```json
{
  "egressId": "egress_abc123",
  "status": "stopped"
}
```

---

## Project Structure

```
livekit_cloud_streaming/
│
├── frontend/                          # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── VideoTile.jsx         # Video participant tile
│   │   ├── config/
│   │   │   ├── livekit.js            # LiveKit configuration
│   │   │   └── env.js                # Environment loader
│   │   ├── pages/
│   │   │   ├── JoinRoom.jsx          # Room join form
│   │   │   └── VideoRoom.jsx         # Video room component
│   │   ├── App.jsx                   # Main app with routes
│   │   ├── main.jsx                  # Entry point
│   │   └── index.css                 # Tailwind imports
│   ├── Dockerfile                    # Multi-stage build
│   ├── nginx.conf                    # Nginx configuration
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/                           # Express.js backend
│   ├── src/
│   │   ├── routes/
│   │   │   ├── token.js              # Token generation endpoint
│   │   │   └── record.js             # Recording endpoints
│   │   ├── utils/
│   │   │   └── generateToken.js      # LiveKit token generator
│   │   └── index.js                  # Express app entry
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
│
├── docker-compose.yml                 # Docker orchestration
└── README.md                          # This file
```

---

## Troubleshooting

### Token Generation Fails

**Error:** `Failed to generate token`

**Solutions:**
1. Verify LiveKit API credentials in `backend/.env`
2. Ensure credentials are Base64 encoded correctly in API requests
3. Check that API key/secret are from LiveKit Cloud (not self-hosted)

### Cannot Connect to LiveKit Cloud

**Error:** `Connection failed`

**Solutions:**
1. Verify `LIVEKIT_URL` in `frontend/src/config/livekit.js`
2. Ensure subdomain matches your LiveKit Cloud project
3. Check firewall allows WebSocket connections (port 443)

### CORS Errors

**Error:** `Access to fetch blocked by CORS policy`

**Solutions:**
1. Ensure backend is running
2. Check CORS is enabled in `backend/src/index.js`
3. Verify TOKEN_ENDPOINT URL matches backend location

### Docker Build Fails

**Error:** `npm ci` or `node_modules` issues

**Solutions:**
```bash
# Clear Docker cache and rebuild
docker-compose down
docker-compose build --no-cache

# Or remove node_modules and reinstall
rm -rf frontend/node_modules backend/node_modules
docker-compose up --build
```

### Frontend Not Loading

**Solutions:**
1. Check nginx logs: `docker-compose logs frontend`
2. Verify port 80 is not in use
3. Ensure frontend built successfully

### Recording Not Working

**Solutions:**
1. Verify LiveKit Cloud has Egress enabled
2. Check API key/secret have Egress permissions
3. Review Egress quotas in LiveKit Cloud dashboard

---

## Security Considerations

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Use HTTPS in production** - Configure SSL in nginx
3. **Validate all inputs** - Backend validation in place
4. **Rotate API credentials** - Regularly update keys
5. **Rate limiting** - Add for production use

---

## License

MIT License
