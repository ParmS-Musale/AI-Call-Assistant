# AI Call Assistant 📞 🤖

A full-stack, AI-powered "Smart Assistant" built to handle your missed incoming calls automatically. Instead of a standard voicemail, this system uses your existing Android Phone to detect when you miss a call and sends a **personalized, AI-generated SMS response** back to the caller based on your real-time status (e.g., Sleeping, Driving, Busy, Playing).

---

## 🌐 Live Deployments

- **Frontend Dashboard (Vercel):** [https://parm-call-assistant21.vercel.app](https://parm-call-assistant21.vercel.app)
- **Backend API (Render):** [https://ai-call-assistant-go9f.onrender.com](https://ai-call-assistant-go9f.onrender.com)
- **Database:** MongoDB Atlas Cloud

*(All live instances run 24/7 on free cloud tiers. No continuous local server required!)*

---

## 🛠️ Tech Stack

| Component | Technologies Used |
|-----------|-------------------|
| **Frontend** | React 18, Vite, Tailwind CSS 3, Recharts, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB & Mongoose |
| **AI Integration** | OpenAI GPT-3.5-turbo (Generates dynamic SMS responses) |
| **Authentication** | JWT (JSON Web Tokens) & bcrypt |
| **Hardware / Automation**| **MacroDroid** (Android Automation App) & Your actual Smartphone! |

---

## 🏛️ High-Level Architecture (The "Android Gateway" Pattern)

This project bypasses expensive telecom API fees (like Twilio virtual numbers or ISD charges) by turning your own Android Phone into an intelligent gateway.

### How it Works (End-to-End Workflow)
1. **The Caller Rings:** Someone calls your personal mobile number. You don't pick up (Missed Call).
2. **Device Detection:** Your Android phone uses **MacroDroid** to detect that a call was missed.
3. **Webhook Trigger:** MacroDroid instantly fires a `POST` request to the Cloud Backend.
   - *Payload:* `{ "callerNumber": "+91XXXXXXXXXX", "userId": "<your-mongo-id>" }`
4. **Backend Processing:**
   - The Node.js server looks up your profile in MongoDB using the `userId`.
   - It checks your current `status` (e.g., "Sleeping") and any custom instructions you've set (e.g., "Sher abhi so raha hai").
5. **AI Generation:** The backend pings OpenAI to craft a polite, natural-sounding response incorporating your status and the caller's number.
6. **The Reply:** The AI text is returned back to your phone.
7. **Automated SMS:** MacroDroid receives the response and automatically sends a real SMS to the caller from your own SIM card.
8. **Logging:** The call event and the AI's SMS content are securely logged into your Cloud MongoDB and instantly visible on your Vercel Dashboard.

---

## 📱 Features

- **Multi-Lingual AI:** Write your custom status message in Hindi, Marathi, or English. The AI understands the context and replies fluently in the same language.
- **5 Dynamic Status Modes:** Toggle between Available, Busy, Playing, Driving, and Sleeping from anywhere using the web dashboard.
- **Modern Dashboard UI:** Track your statistics, missed calls, SMS logs, and volume trends with beautiful charts.
- **Zero Ongoing Costs:** Hosted fully on Vercel, Render, and MongoDB Free Tiers. SMS charges are covered by your existing standard phone carrier plan.

---

## 👩‍💻 How to setup locally (Development)

If you wish to run the project locally instead of using the live deployments:

### Prerequisites
- Node.js v18+
- Local MongoDB running on port `27017`

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
# Server will run on http://localhost:5000
```
Make sure to configure your `backend/.env` with `MONGODB_URI` and `OPENAI_API_KEY`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Website will run on http://localhost:5173
```

---

## 🪪 License

MIT
https://parm-call-assistant21.vercel.app/