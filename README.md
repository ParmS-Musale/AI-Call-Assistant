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

## 4. Android Gateway Setup (Jugaad / No Twilio Required)

Instead of paying for Twilio ISD or virtual numbers, you can use your **existing Android phone** to detect missed calls and send AI-powered SMS responses automatically.

### Prerequisites
1. An Android phone with an active SIM card.
2. The **MacroDroid** app installed from the Google Play Store.
3. Your backend server running locally and exposed to the internet via **Ngrok**.

### Step 1: Expose Backend via Ngrok
Run ngrok to get a public URL for your local backend (port 5000):
```bash
ngrok http 5000
```
*Note the Forwarding URL (e.g., `https://1234-abcd.ngrok-free.app`).*

### Step 2: Get Your User ID
You need to pass your `userId` to the backend so the AI knows who is receiving the call and what their current status is. You can find this in MongoDB or via your logged-in session. For the demo user (`Parmeshwar Musale`), it is typically `69b829682a48fd5ad671caef` or similar.

### Step 3: Configure MacroDroid
1. **Enable System Permissions**: Open MacroDroid, go to Settings -> `Accessibility` and grant the needed permissions, including "Display over other apps". Ensure the master switch on the Home Screen is ON.
2. **Create New Macro**: Tap **Add Macro** and name it "AI Call Assistant".
3. **Add Trigger (Call Missed)**:
   - Tap `+` under Triggers -> `Call/SMS` -> `Call Missed`.
   - Select `Any Number`.
4. **Add Action 1 (HTTP Request)**:
   - Tap `+` under Actions -> `Applications` -> `HTTP Request`.
   - **Request Method**: `POST`
   - **URL**: `https://<YOUR-NGROK-URL>/api/gateway/incoming-call` *(Replace with your actual Ngrok URL)*.
   - **Content Body**: Select `JSON` and enter:
     ```json
     {
       "callerNumber": "[call_number]",
       "userId": "<YOUR-USER-ID>"
     }
     ```
   - Tick the box for **"Block next actions until complete"**.
   - Under checking response, choose **"Save HTTP response in string variable"** and create a temporary variable `ai_resp`.
5. **Add Action 2 (Send SMS)**:
   - Tap `+` under Actions -> `Messaging` -> `Send SMS`.
   - **Select Contact**: `[call_number]` (From local variables).
   - **Message text**: `[v=ai_resp]`
6. **Save**: Tap the Checkmark (✔) to save the Macro.

Now, whenever you miss a call or reject a call, your Android phone will fetch an AI response based on your current status (e.g., Sleeping, Driving) and send it as an SMS!

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
