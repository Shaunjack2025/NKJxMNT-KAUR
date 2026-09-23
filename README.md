# NKJxMNT KAUR 🎲

A real-time online multiplayer **2-player Snake & Ladder web game** designed for two people to play together from different devices, laptops, tablets, or phones.

> **"Roll the dice. Climb the ladders. Blame the snakes. 🎲🐍🪜"**

---

## ✨ Features & Visual Highlights

- **Real-Time Online Multiplayer**: Built on **Supabase PostgreSQL & Realtime Broadcast engine**, allowing instant turns, synchronized 3D dice rolls, and smooth token movement across different devices without refreshing.
- **Centerpiece Special Tile #5**:
  - The most visually special tile on the entire board!
  - Glowing multi-layered animated border, radiant gold/pink sparkles, and lucky crown badge.
  - Features the **Master White Ladder** climbing from Tile 5 to Tile 58 with shimmering light rungs and high luminescence.
- **Minimal Tile #1**: Intentionally designed with the simplest, minimalist flat design to establish visual contrast with the rest of the board.
- **All Pink Snakes 💖**:
  - Every snake is designed with vibrant pink gradients, drop shadows, expressive eyes, and natural slithering curves connecting heads and tails accurately.
  - When landing on a snake: smooth descending animation with "🐍 Snake! Down you go!".
- **All White Ladders 🪜**:
  - Crafted from pure white and glowing translucent stiles.
  - When landing on a ladder: climbing arpeggio with "🪜 Climb!".
- **Top Branding**:
  - Prominent **NKJxMNT KAUR** animated identity with periodic floating pop effect and romantic gradient.
  - Subtitle: *"Our little game 🎲"*.
- **Interactive 3D Dice**:
  - Realistic 3D cube with 6 faces and authentic dot pips.
  - Physics-based tumble and spin animations synchronized across both player screens.
- **Procedural Sound Engine**:
  - Web Audio API procedural sound synthesizer (dice rolling clatter, soft hopping step blips, ladder ascending chimes, pink snake whoosh, and victory fanfare) with instant Mute/Unmute toggle.
  - Zero external sound asset downloads—guaranteed instant playback on iOS and Android.
- **Celebration Win Screen**:
  - Full-screen animated celebration with multi-burst colorful confetti, victory fanfare, and "PLAY AGAIN" & "RETURN TO ROOM" options.
- **Mobile-First Responsive Layout**:
  - Perfectly fitted board for phones with zero horizontal scrolling.
  - Easy thumb-friendly roll controls and player status cards.

---

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom CSS 3D transforms & Glassmorphism
- **Animations**: Framer Motion
- **Confetti**: Canvas-confetti
- **Audio**: Web Audio API procedural synthesis
- **Backend / Realtime**: Supabase (PostgreSQL + Realtime Channels)
- **Deployment**: Vercel ready (`vercel.json`)

---

## 🚀 Quick Setup & Local Testing

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Immediate Multi-Tab Testing (Zero Config)
The app includes a built-in cross-tab event bus fallback. You can open two browser windows right away:
- Window 1: Click **CREATE GAME**, enter `NKJ`, and copy the invite link.
- Window 2: Paste the invite link, enter `MNT`, and click **JOIN GAME 🎲**.
- Both windows will update in real time!

---

## 🌐 Supabase Online Multiplayer Setup (Cross-Device)

To enable live gameplay between two physical devices on different networks (e.g. your iPhone and your partner's Android phone):

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In the left sidebar, navigate to the **SQL Editor**.

### Step 2: Run Database Schema
1. Open [`supabase/schema.sql`](./supabase/schema.sql) in this repository.
2. Paste the SQL into the Supabase SQL Editor and click **Run**.
3. This creates:
   - `rooms` table with realtime replication
   - `players` table with realtime replication
   - `game_events` table
   - Row Level Security (RLS) policies allowing seamless anonymous play

### Step 3: Add Credentials
In your project root, add your credentials to `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

*(You can also click the connection status badge in the top-left of the game UI at any time to inspect or paste your credentials directly in the browser!)*

---

## 🚢 Deploying to Vercel (1-Click Ready)

1. Push this repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
4. Click **Deploy**.
5. Vercel will build and deploy your game to a live URL (e.g. `https://nkjxmnt-kaur.vercel.app`).
6. Open the link on your phone, click **CREATE GAME**, tap **SHARE** or **COPY LINK**, and send it to your partner!

---

## 🎲 Game Rules Summary

1. Both players start off-board at position **0**.
2. Players take turns rolling the 3D dice (values 1–6).
3. The player piece hops step-by-step to the destination.
4. If the destination is:
   - **White Ladder base**: Climb up! (Tile 5 climbs up to Tile 58!).
   - **Pink Snake head**: Slide down!
5. **Exact 100 Rule**: A player must land on exactly tile **100** to win. If a roll overshoots 100, the player keeps their current position and the turn passes.
6. The first player to reach 100 triggers the grand celebration screen!
