# NKJxMNT KAUR 🎲

A real-time online multiplayer **2-player Snake & Ladder web game** designed for two people to play together from different devices, laptops, tablets, or phones.

> **"Roll the dice. Climb the ladders. Blame the snakes. 🎲🐍🪜"**

---

## ✨ Features & Visual Highlights

- **Real-Time Online Multiplayer**: Built on **Supabase PostgreSQL & Realtime Broadcast engine**, allowing instant turns, synchronized 3D dice rolls, and smooth token movement across different devices without refreshing.
- **The Secret Meaning of Number 5 (Her Birthday Easter Egg 🎂💗)**:
  - Number 5 is her birthday! It is the recurring centerpiece theme throughout the board and dice.
  - **Guaranteed Visibility (Layer z-30)**: Rendered on a dedicated top layer above all snakes, ladders, and tokens with glowing gold/pink gradient typography, lucky crown badge, and sparkles.
  - **Unobstructed Master Ladder**: The white Master Ladder starts from the upper edge of Tile 5 and climbs to Tile 58, ensuring the number 5 itself is **never covered or hidden**.
- **Every Number 1–100 Readable (Strict Layering)**:
  - Visual hierarchy:
    ```text
    1. Board Background & Tile Surfaces (z-0)
    2. White Ladders Overlay (z-10)
    3. Pink Snakes Overlay (z-15)
    4. Player Tokens (z-20)
    5. NUMBER LABELS LAYER (z-30) ← Always on top!
    6. Particle Celebration Bursts (z-40)
    ```
  - Every number is bold, high-contrast, and text-shadowed, completely readable on mobile without disappearing behind ladders or snakes.
- **Special Dice 5 Easter Egg**:
  - Rolling 1, 2, 3, 4, 6 plays the standard roll animation.
  - Rolling a **5** triggers a special animation: a pink sparkle burst, celebratory pulse, and `"✨ 💗 FIVE 💗 ✨"` floating badge, accompanied by a special procedural twinkle chime!
- **Landing on Tile 5 Celebration**:
  - Landing on Tile 5 triggers an exclusive 1.5-second celebration: expanding pink ripple halo, floating hearts, sparkles, and `"✨ Landed on 5! Special Birthday Tile! ✨"` before ascending the Master Ladder.
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

## 🛠️ Architecture

```text
INTERNET / PLAYERS
       │
       ▼
AWS CloudFront (HTTPS CDN / Edge Caching / SPA Routing Rewrite: 403/404 -> /index.html 200)
       │
       ▼
AWS S3 Bucket (Static React Frontend `dist/`)
       │
       ▼
Supabase Backend
 ├── PostgreSQL Database (`rooms`, `players`, `game_events`)
 └── Realtime WebSocket Engine (instant cross-device synchronization)
```

---

## 🚀 Local Development & Multi-Tab Testing

### 1. Install & Run Locally
```bash
npm install
npm run dev
```

### 2. Multi-Tab Testing (Zero Config)
The app includes an automatic cross-tab broadcast fallback for local testing:
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

## ☁️ AWS S3 + CloudFront Production Deployment

Follow these exact steps to host the game on AWS with HTTPS and worldwide CDN delivery:

### Step 1: Create an S3 Bucket
1. Open the [Amazon S3 Console](https://s3.console.aws.amazon.com/s3/).
2. Click **Create bucket**.
3. **Bucket name**: Enter a unique name, e.g., `nkjxmnt-kaur-web` (note down your chosen name).
4. **AWS Region**: Select your preferred region (e.g., `us-east-1` or `ap-south-1`).
5. **Object Ownership**: Keep **ACLs disabled (recommended)**.
6. **Block Public Access settings for this bucket**:
   - If using CloudFront with **Origin Access Control (OAC)** (recommended), keep **Block all public access** checked!
7. Click **Create bucket**.

---

### Step 2: Build the Application
Ensure your `.env` contains your production Supabase keys, then run:
```bash
npm run build
```
This compiles the production assets into the `dist/` directory.

---

### Step 3: Create a CloudFront Distribution
1. Open the [Amazon CloudFront Console](https://console.aws.amazon.com/cloudfront/v4/home).
2. Click **Create distribution**.
3. **Origin domain**: Click the field and select your S3 bucket (e.g. `nkjxmnt-kaur-web.s3.amazonaws.com`).
4. **Origin access**: Select **Origin access control settings (recommended)**:
   - Click **Create control setting** → Click **Create**.
5. **Default cache behavior**:
   - **Viewer protocol policy**: Select **Redirect HTTP to HTTPS**.
   - **Allowed HTTP methods**: `GET, HEAD`.
6. **Web Application Firewall (WAF)**: Select **Do not enable security protections** (to keep costs at $0 for personal use).
7. **Default root object**: Enter `index.html`.
8. Click **Create distribution**.
9. **Copy S3 Bucket Policy**:
   - CloudFront will display a banner: *"The S3 bucket policy needs to be updated"*.
   - Click **Copy policy**.
   - Open your S3 bucket → **Permissions** tab → **Bucket policy** → **Edit** → Paste the policy and click **Save changes**.

---

### Step 4: Configure CloudFront SPA Routing (CRITICAL)
Because React is a Single Page Application, direct links like `/game/AB12CD` or page refreshes must return `index.html` instead of a 403/404 error:

1. In your CloudFront distribution, navigate to the **Error pages** tab.
2. Click **Create custom error response**.
3. Fill in:
   - **HTTP error code**: `403: Forbidden`
   - **Customize error response**: `Yes`
   - **Response page path**: `/index.html`
   - **HTTP response code**: `200: OK`
4. Click **Create custom error response**.
5. Repeat for error code `404: Not Found`:
   - **HTTP error code**: `404: Not Found`
   - **Response page path**: `/index.html`
   - **HTTP response code**: `200: OK`
   - Click **Create**.

---

### Step 5: Upload Files to S3

#### Option A: Using the Automated Script (Recommended)
Once your AWS CLI is authenticated (`aws login` or `aws configure`):
```powershell
# Windows PowerShell
.\scripts\deploy-aws.ps1 -BucketName "your-bucket-name" -DistributionId "your-cf-distribution-id"
```
```bash
# macOS / Linux / Git Bash
./scripts/deploy-aws.sh "your-bucket-name" "your-cf-distribution-id"
```

#### Option B: Manual Upload via AWS Console
1. Open your S3 bucket in the [AWS S3 Console](https://s3.console.aws.amazon.com/s3/).
2. Click **Upload**.
3. Open the `dist/` folder on your computer.
4. Drag and drop all files and folders inside `dist/` (`index.html`, `favicon.svg`, `assets/`, etc.) into the S3 upload area.
5. Click **Upload**.

---

### Step 6: Access Your Live Game!
1. In CloudFront, copy your **Distribution domain name** (e.g. `d111111abcdef8.cloudfront.net`).
2. Open `https://d111111abcdef8.cloudfront.net` on your phone or laptop.
3. Click **CREATE GAME**, enter `NKJ`, and tap **COPY LINK**.
4. Send the link to your partner (`https://d111111abcdef8.cloudfront.net/game/XXXXXX`).
5. Your partner opens the link on their device, enters `MNT`, and you can play online together!

---

## 🔒 Security Best Practices

- **Zero Hardcoded Secrets**: Secrets are read exclusively from `import.meta.env` at build time.
- **Git Protection**: `.env` and `.env.*` are excluded via `.gitignore`.
- **Public Key Only**: Only the Supabase `anon` public key is ever used. The `service_role` secret key is **never** included in frontend client code.
- **Row Level Security**: The database restricts modifications and allows safe anonymous rooms.

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
