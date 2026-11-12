# ⚡ GRIDLOCK — Plan. Focus. Grow.

> **An Autonomous Discipline Protocol & AI Accountability Mobile Architecture**  
> Built with **React Native**, **Expo SDK 58**, **TypeScript**, **Google Gemini AI**, and **Supabase**.

---

## 📌 Executive Summary

**GRIDLOCK** is a high-performance personal accountability and execution engine designed to eliminate procrastination through verifiable proof mechanisms, adaptive AI coaching, and competitive squad dynamics.

Unlike passive to-do apps, GRIDLOCK operates on a **Zero Unverified Quotas** model:
- Tasks cannot be marked complete without **cryptographic or visual evidence** audited in real-time by Multimodal AI.
- An intelligent **AI Coach (Vance)** detects daily friction (burnout, distraction, trading tilt, procrastination) and enforces corrective micro-sprints.
- Squad mechanics foster peer accountability through **Group Leaderboards**, weekly XP resets, and customizable privacy filters.

---

## 🚀 Core Features & Architectural Pillars

### 1. ⚡ HQ Command Center & Daily Discipline To-Do
- **"What I Did vs What Not" Protocol**: Clear separation of verified completions and pending quotas.
- **AI-Audited Proof Submission**: Users submit photo or camera proofs of completed tasks (e.g. textbook pages, gym check-in, code commits); Gemini Vision audits proof authenticity, assign confidence scores, and verifies completion.
- **Lockout Countdown Gauge**: Real-time timer counting down to the midnight (00:00) deadline, creating urgency and focus.
- **Circular Progress Ring**: Real-time completion percentage and task completion metrics.
- **"Today's Top 3" Priority Focus**: High-priority mandates surfaced front-and-center.

### 2. 🤖 AI Coach Vance (Contextual Performance Engine)
- **Deep Performance Analysis**: Continuously scans completed mandates, remaining hours, and active streaks to assess lockout risk.
- **Problem-Understanding Chatbot**: Diagnoses user fatigue, distraction, or overwhelm and prescribes surgical 3-step action protocols rather than canned responses.
- **One-Tap Focus Lockout**: Initiates distraction-free sprint timers.

### 3. 🧭 Adaptive Learning Roadmap Suggestor
- **AI Curriculum Architect**: Enter any custom domain (e.g., *Trading & Price Action*, *Operating Systems & Kernels*, *Hypertrophy Biomechanics*).
- **Curated Learning Pipelines**: Generates structured, phased roadmaps with authoritative textbooks, video courses, and research papers.
- **1-Tap Task Sync**: Directly converts roadmap milestones into daily executable tasks in the HQ dashboard.

### 4. ⏱️ Training & Execution Hub
- **Proctor Study Timer & Note Scan**: Focus timer with camera presence simulation and handwritten note scanner.
- **Domain-Adaptive Quiz Playground**: 4 training modes (Memory Recall, 60s Rapid Blitz, 3-Lives Sudden Death, and Spaced-Repetition Flashcards) dynamically tailored to user-specified topics.
- **Distraction-Free Focus Lockout**: Full-screen Pomodoro protocol designed to keep operatives on task.
- **Sunday Reset Protocol**: 5-step weekly operational review and penalty multiplier clear.

### 5. 📊 Squad Performance & Group Leaderboard
- **Squad Code System**: Create or join 5-operative accountability squads using unique codes.
- **Performance Comparison Graph**: Live bar-graph comparison of XP, daily tasks, and consecutive streaks across teammates.
- **Dual-XP Architecture**: Weekly XP (reloaded every Monday 00:00 to give everyone a fresh start) alongside permanent lifetime career XP.
- **Granular Privacy Controls**: Operatives choose exactly which metrics (XP, streak, task list, physique logs) to disclose to squad members.

### 6. 🎨 Dynamic Reactive Theme Engine
Instantaneous theme switching across 6 tactical palettes:
- **Obsidian × Amber Gold** (Default Luxury Performance)
- **Midnight × Acid Lime** (Tactical Neon)
- **Electric Blue** (Sapphire Deep Focus)
- **Cyber Cyan** (High-Tech Terminal)
- **Crimson Fury** (High-Alert Intensity)
- **Stealth Monochrome** (Distraction-Free Minimalist)

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Framework** | [React Native](https://reactnative.dev/) with [Expo SDK 58](https://expo.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict typing across models and views) |
| **AI Integration** | [Google Gemini 1.5 Flash](https://ai.google.dev/) (Multimodal vision audit, roadmap architecture, contextual coaching) |
| **Backend & Cloud** | [Supabase](https://supabase.com/) (PostgreSQL real-time squad synchronization & cloud backup) |
| **Storage & Security** | `@react-native-async-storage/async-storage` (Hardware-level local persistence and multi-account state) |
| **Hardware APIs** | `expo-camera`, `expo-image-picker`, `expo-file-system`, `expo-status-bar` |

---

## 📂 Project Directory Structure

```
gridlock-app/
├── App.tsx                     # Master app shell, auth gate, bottom navigation & top dossier
├── app.json                    # Expo configuration & hardware permissions
├── package.json                # Dependencies and project scripts
├── tsconfig.json               # TypeScript compiler options
└── src/
    ├── types.ts                # TypeScript domain models (UserProfile, TaskItem, Squad, Theme)
    ├── theme.ts                # Dynamic 6-palette reactive theme engine
    ├── components/
    │   ├── TopCoachWidget.tsx          # Real-time AI Coach Vance widget & friction analyzer
    │   ├── QuickAddModal.tsx           # Rapid mandate creation with priority & calendar sync
    │   ├── ProofSubmissionModal.tsx    # Multimodal photo proof upload & AI verification
    │   └── PhoneWidgetPreview.tsx      # Homescreen widget preview
    ├── screens/
    │   ├── DashboardScreen.tsx         # HQ Command Center (What I Did vs Not, Top 3, Metrics)
    │   ├── SuggestorScreen.tsx         # Learning Roadmap AI Suggestor
    │   ├── TrainingHubScreen.tsx       # Training Barracks & protocols selector
    │   ├── AnalysisScreen.tsx          # Squad comparison, leaderboards, and analytics
    │   ├── SettingsScreen.tsx          # Theme switcher, privacy controls, multi-account setup
    │   ├── CoachScreen.tsx             # Interactive intelligent coach chat terminal
    │   ├── PlaygroundScreen.tsx        # 4-mode topic-adaptive quiz simulator
    │   ├── StudyScreen.tsx             # Camera study proctor timer
    │   ├── FocusModeScreen.tsx         # Distraction-free lockout Pomodoro
    │   ├── GroupLeaderboardScreen.tsx  # Detailed squad rankings & graph
    │   ├── SundayResetScreen.tsx       # Weekly reset protocol
    │   ├── HabitTemplatesScreen.tsx    # Turnkey habit stacks
    │   ├── MonthlyWrappedScreen.tsx    # End-of-month performance review
    │   └── onboarding/
    │       ├── WelcomeScreen.tsx       # Boot screen
    │       ├── AuthScreen.tsx          # Multi-account selector (up to 3 accounts)
    │       └── OnboardingFlow.tsx      # Squad creation, habit selection, and AI plan generation
    └── services/
        ├── storage.ts          # Local persistent key-value & profile manager
        ├── gemini.ts           # Gemini Vision proof auditing, coach NLP & quiz generation
        └── backend.ts          # Supabase cloud synchronization
```

---

## 💻 Installation & Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- [npm](https://www.npmjs.com/) or `yarn`
- [Expo Go](https://expo.dev/go) app installed on your physical mobile device (Android/iOS) **OR** Android Studio Emulator.

### 1. Clone the Repository
```bash
git clone https://github.com/anshumanholkar/gridlock.git
cd gridlock
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npx expo start
```

### 4. Run on Device / Emulator
- **Physical Device**: Scan the QR code shown in your terminal using the **Expo Go** app (Android) or the native Camera app (iOS).
- **Android Emulator**: Press `a` in the terminal (or run `npm run android`).
- **iOS Simulator**: Press `i` in the terminal (or run `npm run ios`).

---

## 🔑 Environment & API Configuration

GRIDLOCK is designed to run seamlessly out-of-the-box with built-in heuristic fallbacks and offline resilience.

To activate live cloud features and high-precision Gemini AI auditing:
1. Open the app and navigate to **Settings** (⚙️ top-right icon).
2. Enter your **Google Gemini API Key** (get a free key at [Google AI Studio](https://aistudio.google.com/)).
3. (Optional) Enter your **Supabase URL & Anon Key** to enable live multi-device squad synchronization.
4. Tap **Save Configuration** — keys are encrypted in device hardware storage.

---

## 👨‍💻 Author

**Anshuman Holkar**  
- GitHub: [@anshumanholkar](https://github.com/anshumanholkar)  
- Email: anshumanholkar30@gmail.com  
- Project: **GRIDLOCK Mobile Architecture**

---

*GRIDLOCK — Plan. Focus. Grow. Built for academic submission and high-performance discipline.*
