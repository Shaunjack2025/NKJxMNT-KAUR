# NKJxMNT KAUR 🎲

A real-time online multiplayer **2-player Snake & Ladder web game** designed for two people to play together from different devices, laptops, tablets, or phones.

> **"Roll the dice. Climb the ladders. Blame the snakes. 🎲🐍🪜"**

---

## 🏗️ Production Architecture

```text
             INTERNET / PLAYERS
                     │
                     ▼
                  VERCEL
          (Global Edge Network / HTTPS)
                     │
                     ▼
             React / Vite Web App
                     │
                     ▼
                  SUPABASE
               ↙          ↘
         PostgreSQL      Realtime
        (Persistent)   (WebSocket Channels)
                           │
                           ▼
               Realtime Multiplayer Game
```

- **Frontend Hosting**: **Vercel** provides fast edge CDN hosting, automated HTTPS, and instant GitHub CI/CD deployments.
- **Backend / Realtime Engine**: **Supabase** provides persistent PostgreSQL tables (`rooms`, `players`, `game_events`) and WebSocket Realtime subscriptions for sub-millisecond turn and dice sync.
- **Zero Localhost Dependency**: Neither player needs to be on localhost or keep a computer running—the game is 100% cloud-hosted.

---

## ✨ Features & Visual Highlights

- **The Secret Meaning of Number 5 (Her Birthday Easter Egg 🎂💗)**:
  - Number 5 is her birthday! It is the recurring centerpiece theme throughout the board and dice.
  - **Guaranteed Visibility (Layer z-30)**: Rendered on a dedicated top layer above all snakes, ladders, and tokens with glowing gold/pink gradient typography, lucky crown badge, and sparkles.
  - **Unobstructed Master Ladder**: The white Master Ladder starts from the upper edge of Tile 5 and climbs to Tile 58, ensuring the number 5 itself is **never covered or hidden**.
- **Every Number 1–100 Readable (Strict Layering)**:
  - Visual hierarchy:
    ```text
    1. Board Background & Tile Surfaces (z-0)
    2. Pure White Ladders Overlay (z-10)
    3. All Pink Snakes Overlay (z-15)
    4. Player Tokens (z-20)
    5. NUMBER LABELS LAYER (z-30) ← Always on top!
    6. Particle Celebration Bursts (z-40)
    ```
  - Every number is bold, high-contrast, and text-shadowed, completely readable on mobile without disappearing behind ladders or snakes.
- **Special Dice 5 Easter Egg**:
  - Rolling 1, 2, 3, 4, 6 plays the standard roll animation.
  - Rolling a **5** triggers a special animation: a pink sparkle burst, celebratory pulse, and `"✨ 💗 SPECIAL FIVE 💗 ✨"` floating badge, accompanied by a special procedural twinkle chime!
- **Landing on Tile 5 Celebration**:
  - Landing on Tile 5 triggers an exclusive 1.5-second celebration: expanding pink ripple halo, floating mini hearts and sparkles, and `"✨ Landed on 5! Special Birthday Tile! ✨"` before ascending the Master Ladder.
  - *Note: Game rules and dice probabilities remain classic and balanced—this is purely a visual/audio Easter egg!*
- **All Pink Snakes 💖**:
  - Curved SVG bodies with vibrant pink gradients, drop shadows, expressive eyes, and natural slithering curves connecting heads and tails accurately.
  - Landing on a snake: descending slide with `"🐍 Snake! Down you go!"`.
- **All White Ladders 🪜**:
  - Pure white and glowing translucent rails with climbing arpeggio and `"🪜 Climb!"`.
- **Procedural Web Audio Engine**:
  - Web Audio API procedural synthesizer (dice rolling clatter, step blips, ladder ascending chimes, pink snake whoosh, special 5 birthday chime, and victory fanfare) with instant **Mute/Unmute** toggle.
  - Zero external sound asset downloads—instant playback on iOS and Android.
- **Mobile-First Responsive Layout**:
  - Fits mobile screens with zero horizontal scrolling.

---

## 🚀 Quick Local Development & Multi-Tab Testing

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Dev Server
```bash
npm run dev
```

### 3. Immediate Multi-Tab Testing (Zero Config)
The app includes a built-in cross-tab broadcast fallback for local testing:
- Window 1: Click **CREATE GAME**, enter `NKJ`, and copy the invite link.
- Window 2: Paste the link, enter `MNT`, and click **JOIN GAME 🎲**.
- Both windows synchronize turns, 3D dice rolls, and token movements in real-time.

---

## 🌐 Supabase Online Database Setup

To enable multiplayer between two physical phones or remote computers:

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in the Supabase Dashboard.
3. Paste and run the complete [`supabase/schema.sql`](./supabase/schema.sql) file included in this repository.
   - This provisions `rooms`, `players`, and `game_events` tables with Row Level Security and realtime publication enabled.
4. Add your project credentials to `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
*(You can also click the connection status badge in the top-left corner of the game UI at any time to inspect or paste your credentials directly in the browser!)*

---

## ▲ Deploying to Vercel (Recommended & Effortless)

Deploying to Vercel takes less than 2 minutes and automatically provides global HTTPS and continuous deployment on every git push.

### Step 1: Push Repository to GitHub
Ensure all your project files are committed to a GitHub repository:
```bash
git add .
git commit -m "Deploy NKJxMNT KAUR to Vercel"
git push origin master
```

### Step 2: Import into Vercel
1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **Add New...** → **Project**.
3. Select your GitHub repository: `NKJxMNT KAUR`.

### Step 3: Configure Build & Environment Variables
1. **Framework Preset**: Vercel automatically detects **Vite**.
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. Expand **Environment Variables** and add:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL (e.g. `https://xyz.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Public Key
5. Click **Deploy**!

### Step 4: Access Your Live Game!
Vercel will build and assign a production URL (e.g., `https://nkjxmnt-kaur.vercel.app`):
1. Open the URL on your device.
2. Click **CREATE GAME**, enter `NKJ`, and tap **COPY LINK**.
3. Send the link to your partner:
   `https://nkjxmnt-kaur.vercel.app/game/XXXXXX`
4. When your partner opens the link, the game room loads immediately with their invite ready!

### Step 5: Updating the Game in the Future
Whenever you push changes to GitHub:
```bash
git push origin master
```
Vercel automatically triggers a fresh build and updates the live site with zero downtime.

---

## 🔒 Security Best Practices

- **Zero Hardcoded Secrets**: Secrets are read exclusively from `import.meta.env` at build time.
- **Git Protection**: `.env` and `.env.*` are excluded via `.gitignore`.
- **Public Key Only**: Only the Supabase `anon` public key is ever used. The `service_role` secret key is **never** included in frontend client code.
- **Row Level Security**: The database restricts modifications and allows safe anonymous rooms.
- **SPA Rewrites**: Handled securely via `vercel.json` to ensure clean routing without server leakage.

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
