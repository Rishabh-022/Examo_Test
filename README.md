# 🎓 EduQuest — AI-Powered Gamified Learning Platform

[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-blue)]()
[![Tech](https://img.shields.io/badge/Stack-MERN%20%2B%20AI-purple)]()
[![License](https://img.shields.io/badge/License-MIT-green)]()

**Examo_test** is a full‑stack mobile educational app that makes learning addictive.  
It combines **AI‑generated quizzes**, **real‑time multiplayer battles**, **live AI tutoring**, and a **rich gamification engine** to turn boring subjects into engaging challenges.

Students can learn, compete, and track their progress — all from one beautifully designed app.

---


---

## 🧠 Key Features

- **AI‑Generated Question Bank** – Automatically creates hundreds of MCQs from NCERT/CBSE/ICSE textbooks using Google Gemini & Groq.
- **Live AI Tutor** – Ask any doubt and get an instant, context‑aware answer from a subject‑expert chatbot.
- **Real‑Time Multiplayer Battles** – Challenge friends in 1v1 quizzes with WebSocket matchmaking.
- **Gamification** – Earn XP, coins, streaks, badges, and level up as you learn.
- **Timed Quizzes** – Global countdown timer; test auto‑submits when time runs out.
- **Daily Rewards** – Login bonuses that increase with your streak.
- **Dynamic Leaderboard** – See where you stand among all players.
- **Achievement System** – Unlock badges for milestones (Streak 7, Scholar, etc.).
- **Smart Answer Highlighting** – Even if the AI returns a letter (A/B/C/D), the app correctly marks right/wrong answers.
- **Dark / Light Gradient UI** – Beautiful gradient backgrounds with floating animations.

---
## 🏗️ System Architecture

```text
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Expo App   │────▶ │  Express API │────▶ │   MongoDB    │
│(React Native)│      │  (Node.js)   │      │   (Atlas)    │
└──────────────┘      └──────────────┘      └──────────────┘
                             │                      
                             │ (Socket.io)          
                             ▼                      
                      ┌──────────────┐              
                      │  Real-Time   │              
                      │   Battles    │              
                      └──────────────┘              
                             ▼                      
                      ┌──────────────┐              
                      │ AI Services  │              
                      │   (Python)   │              
                      │ Gemini/Groq  │              
                      └──────────────┘
```

**Data Flow:**
1. **PDF Ingestion** – Python scripts download/process PDFs → Extract text → Send to Gemini/Groq → Insert questions into MongoDB.
2. **Mobile App** → Calls Express API → Fetches questions, user data, leaderboard.
3. **Live AI Tutor** → Mobile → Express → Groq LLM → returns explanation.
4. **Battles** – Socket.io matchmaking → Shared random questions → Real‑time answer exchange.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React Native (Expo), Expo Router, LinearGradient, Animatable |
| **Backend** | Node.js, Express, Socket.io, JWT, Bcrypt |
| **Database** | MongoDB Atlas, Mongoose |
| **AI Pipeline** | Python, PyPDF2, Google Gemini, Groq (Llama 3) |
| **Real‑Time** | Socket.io |
| **Auth** | JWT (stored in SecureStore) |

---

```markdown
## 📁 Project Structure

```text
exam/ 
├── frontend/                 # React Native (Expo) App 
│   ├── app/                  # Expo Router screens 
│   ├── src/ 
│   │   ├── screens/          # All screens (Login, Dashboard, Quiz, etc.) 
│   │   ├── context/          # AuthContext 
│   │   ├── services/         # API client (Axios) 
│   │   ├── constants/        # Colors & theme 
│   │   └── navigation/       # AppNavigator 
│   └── package.json 
└── backend/                  # Express REST API + Socket.io 
    ├── config/ 
    │   └── db.js 
    ├── models/               # User, Chapter, Question 
    ├── routes/               # auth, chapters, questions, leaderboard, tutor, achievements 
    ├── middleware/           # JWT auth middleware 
    ├── server.js 
    ├── package.json 
    └── ai-service/           # Python data pipeline 
        ├── pdfs/             # Organized textbook PDFs (CBSE/ICSE) 
        ├── Raw_Zips/         # Downloaded ZIP archives 
        ├── bulk_process.py   # Extract & rename PDFs 
        ├── populate_chapters.py # Auto-create chapter docs in MongoDB 
        ├── batch_generate.py # Send PDFs to Gemini → insert questions 
        ├── gemini_service.py # Gemini prompt logic 
        ├── pdf_extractor.py  # PyPDF2 text extractor 
        ├── db_inserter.py    # MongoDB insert helper 
        └── requirements.txt
```

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js** v18+
- **Python** 3.10+
- **MongoDB Atlas** (free tier)
- **Gemini API Key** (from Google AI Studio)
- **Groq API Key** (from console.groq.com)
- **Expo Go** app on your phone

### 1. Clone the repository
```bash
git clone https://github.com/Rishabh-02/examo_test.git
cd exam_test
```
### 2. Environment Variables
```bash
Create two .env files:

backend/.env

env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/exam
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=AIzaSy...       
GROQ_API_KEY=gsk_...               
backend/ai-service/.env

env
MONGO_URI=same_as_above
GEMINI_API_KEY=your_gemini_key
```
### 3. Install & Run
```bash
Backend (Express)
bash
cd backend
npm install
npm run dev     
```
AI Pipeline (Python)
```bash
cd backend/ai-service
python -m venv venv
source venv/bin/activate   # or .\venv\Scripts\activate on Windows


pip install -r requirements.txt
python bulk_process.py     
python populate_chapters.py  
python batch_generate.py    
```
Frontend (Expo)
```bash
cd frontend
npm install
npx expo start --clear
```
Scan the QR code with Expo Go on your phone.

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login and receive JWT |
| GET | `/api/auth/user` | Yes | Get current user profile |
| POST | `/api/auth/claim-daily` | Yes | Claim daily login reward |
| POST | `/api/auth/update-progress` | Yes | Update XP/level after quiz |
| GET | `/api/chapters?board=…&classLevel=…&subject=…` | Yes | Get chapters for selected filters |
| GET | `/api/questions?chapterId=…` | Yes | Get questions for a chapter |
| GET | `/api/questions/random?board=…&…&limit=…` | Yes | Get random questions for a subject |
| POST | `/api/questions/explain` | No* | Generate live AI explanation for a question |
| POST | `/api/tutor` | Yes | AI chat tutor (returns reply) |
| GET | `/api/leaderboard` | Yes | Top 50 users by XP |
| GET | `/api/achievements` | Yes | Get all badges with earned status |
* can be protected if needed

## 🎮 Gamification Mechanics

| Mechanic | Description |
|----------|-------------|
| **XP & Leveling** | Every correct answer = +10 XP. Level = floor(totalXP / 100) + 1. XP bar shows progress within current level. |
| **Coins** | Earned through daily rewards and quiz bonuses. |
| **Streaks** | Consecutive days logging in or claiming reward. |
| **Daily Reward** | Base 10 coins + (streak × 5). Can only claim once per day. |
| **Achievements** | Dynamic badges: Beginner (10 XP), Streak 3, Streak 7, Coin Collector, Scholar (500 XP), Level 5. |
| **Leaderboard** | Sorted by total XP (descending). |

---

## ⚔️ Real‑Time Battle Flow

1. Player selects subject → taps **Find Match**.
2. Socket.io finds an opponent → generates shared 10 random questions.
3. Both players see an instruction screen → press **Ready**.
4. Battle starts simultaneously when both are ready.
5. During battle, no correct/wrong colours – only a blue selection border.
6. Opponent’s progress shown as green dots.
7. After the last question, a review screen shows every question with ✔/✘ and correct answer.
8. Winner is declared based on total score.

🤖 AI Pipeline Overview
```text
NCERT/ICSE PDFs → extract text (PyPDF2) → Gemini/Groq → JSON questions → MongoDB
```
- Chapter population: populate_chapters.py scans the folder structure and creates chapter documents with theoryNotes (first 500 chars).

- Batch generation: batch_generate.py sends each chapter’s text to the LLM with a structured prompt → receives 30 MCQs → inserts into questions collection.

- Live explanation: After each answer, the app calls POST /api/questions/explain → backend forwards to Groq → returns a custom, encouraging explanation.

- AI Tutor: A dedicated chat screen sends user messages to POST /api/tutor → Groq responds with subject‑aware answers.

🚀 Future Roadmap
- [ ] Adaptive difficulty (question selection based on performance)
- [ ]  In‑app voice reading (Text‑to‑Speech)
- [ ] Push notifications for daily reward reminders
- [ ] Custom avatar / profile picture
- [ ] Detailed analytics dashboard (charts, time spent)
- [ ] Offline mode (cache questions locally)
- [ ] Social sharing of achievements
🤝 Contributing
Contributions, issues, and feature requests are welcome!
Feel free to fork this repository and submit a pull request.


Built with ❤️ and a lot of ☕ by Rishabh Tiwari

text

---