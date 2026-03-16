# AI Call Assistant

A full-stack AI-powered call management application that handles incoming calls with personalized AI responses based on your current availability status.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS 3, Recharts, Lucide Icons |
| Backend | Node.js, Express, MongoDB, Mongoose |
| Auth | JWT + bcrypt |
| AI | OpenAI (mock-fallback when no API key) |
| Telephony | Twilio (mock-fallback when no API key) |

## Features

- **AI Call Handling** — Incoming calls are answered by AI with custom messages based on your status
- **5 Status Modes** — Available, Busy, Playing, Driving, Sleeping — each with a custom AI greeting
- **Call Logs** — Searchable, filterable table with AI summaries, expandable details, and pagination
- **Voice Messages** — Card grid with waveform audio player and transcriptions
- **Dashboard** — Stats overview, call volume chart (30 days), and recent activity feed
- **Dark/Light Mode** — System preference detection + manual toggle with persistence
- **Glassmorphism UI** — Modern frosted-glass design with smooth animations

## Project Structure

```
ai-call-assistant/
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── middleware/auth.js     # JWT auth middleware
│   ├── models/                # Mongoose schemas (User, CallLog)
│   ├── routes/                # Express routes (auth, user, call-logs, notifications, webhook)
│   ├── services/              # AI, Twilio, notification services
│   ├── seed.js                # Demo data seeder
│   └── server.js              # Express app entry point
├── frontend/
│   ├── src/
│   │   ├── components/        # UI components + layout shell
│   │   ├── contexts/          # AuthContext, ThemeContext
│   │   ├── pages/             # Dashboard, CallLogs, VoiceMessages, Settings, Login, Signup
│   │   ├── services/api.js    # Axios instance with JWT interceptor
│   │   ├── App.jsx            # Router + providers
│   │   └── index.css          # Design system (Tailwind + custom tokens)
│   └── index.html
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** 18+
- **MongoDB** running on `localhost:27017`

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file (or use the defaults):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-call-assistant
JWT_SECRET=your-secret-key-change-in-production
# Optional — leave blank for mock responses:
# OPENAI_API_KEY=sk-...
# TWILIO_ACCOUNT_SID=AC...
# TWILIO_AUTH_TOKEN=...
# TWILIO_PHONE_NUMBER=+1...
```

Seed the database with demo data:

```bash
node seed.js
```

Start the server:

```bash
node server.js
# Server running on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# App running on http://localhost:5173
```

### 3. Login

Open `http://localhost:5173` and use the demo credentials:

| Email | Password |
|-------|----------|
| `demo@aicall.com` | `demo123` |

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | ✗ | Register new user |
| POST | `/api/auth/login` | ✗ | Log in, returns JWT |
| GET | `/api/user/profile` | ✓ | Get user profile |
| PUT | `/api/user/status` | ✓ | Update user status |
| PUT | `/api/user/profile` | ✓ | Update profile fields |
| PUT | `/api/user/custom-message` | ✓ | Update custom AI message per status |
| GET | `/api/call-logs` | ✓ | List call logs (paginated, filterable) |
| GET | `/api/call-logs/stats` | ✓ | Call statistics + daily chart data |
| GET | `/api/call-logs/:id` | ✓ | Single call log detail |
| DELETE | `/api/call-logs/:id` | ✓ | Delete a call log |
| GET | `/api/notifications` | ✓ | List notifications |
| GET | `/api/notifications/unread-count` | ✓ | Unread notification count |
| PUT | `/api/notifications/:id/read` | ✓ | Mark notification as read |
| POST | `/webhook/incoming-call` | ✗ | Twilio webhook (TwiML response) |
| GET | `/api/health` | ✗ | Health check |

## License

MIT
