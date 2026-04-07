# 🎓 CampusMart — Autonomous AI Negotiator

> **Haggling shouldn't be a headache. Automating campus commerce with Edge-AI.**

---

## 🤔 The Problem

Students are busy. Selling a used textbook, a calculator, or a skincare set shouldn't require 20 back-and-forth messages just to agree on ₹50 less. Manual negotiation is awkward, slow, and often abandoned — leaving both sides worse off.

**CampusMart** replaces that friction with an autonomous AI agent that haggles on the seller's behalf, in real time, right inside the marketplace.

---

## ✨ What It Does

- 🛒 Browse and list campus items with AI-suggested pricing
- 🤖 Buyers negotiate with a live AI agent — no seller needed in the loop
- 💬 Once a deal is struck, buyer and seller connect via a direct chat to arrange pickup
- 📊 Sellers see ranked buyer offers with AI-powered recommendations

---

## 🏗️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Vanilla JS + Firebase v8 | Zero build step, instant load, real-time Firestore sync |
| Backend | FastAPI (Python) | Async request handling, clean REST API |
| 🧠 The Brain | **Ollama + Phi-3 (Local)** | See below |
| Database | Google Firestore | Real-time product & negotiation state, no polling |
| Auth | Firebase Auth | College email login, zero backend auth code |

---

## 🧠 The Brain: Why Local LLM (Ollama + Phi-3)

We started with Gemini 2.0 Flash via the Google GenAI cloud API. We hit the wall fast — free tier rate limits (429 RESOURCE_EXHAUSTED) made live demos unreliable.

We switched to **Ollama running Phi-3 (3.8B parameters) locally**. The results:

| | Cloud API (Gemini) | Local LLM (Phi-3 via Ollama) |
|---|---|---|
| Latency | 1–3s + network | ~200ms on-device |
| Cost per request | Rate-limited / paid | ₹0 forever |
| Privacy | Conversation sent to Google | Never leaves the machine |
| Offline capable | ❌ | ✅ |
| Demo reliability | Fragile | Rock solid |

```bash
# One command to run the brain
ollama serve
ollama pull phi3
```

---

## ⚙️ Key Technical Innovations

### 1. 🔀 Hybrid Intelligence — The Demo-Proof Fallback

If Ollama is unavailable (cold start, resource spike), the system doesn't crash or show an error. A **math-based heuristic negotiator** takes over silently:

```python
# From agent.py — the fail-safe
if user_offer >= min_price:
    return f"Deal! [[DEAL:{user_offer}]]"
if user_offer > 0:
    return f"Lowest I can go is ₹{min_price}. Take it or leave it! 😤"
```

The buyer never knows the AI swapped out. The deal still closes.

### 2. 🔍 Regex-Powered Deal Parsing

The AI appends a structured token when a deal is reached: `[[DEAL:450]]`

The frontend parses this with a single regex, strips it from the displayed message, and instantly triggers the "Price Agreed" UI state — no polling, no extra API call:

```js
// From script.js
const dealMatch = reply.match(/\[\[DEAL:(\d+)\]\]/);
if (dealMatch) {
  const agreedPrice = parseInt(dealMatch[1], 10);
  reply = reply.replace(/\[\[DEAL:\d+\]\]/, '').trim();
  finalizeNegotiation(pid, agreedPrice); // triggers the blue "Deal Locked" bar
}
```

### 3. 🎯 Prompt Engineering for Small LLMs

Phi-3 at 3.8B parameters will hallucinate buyer dialogue and write essays if you let it. We engineered the system prompt specifically to constrain it:

- **Role isolation**: "You are the SELLER. NEVER write lines starting with Buyer: or User:"
- **Hard conciseness**: "1–2 sentences. Think WhatsApp text, not an essay."
- **No internal monologue**: "Do not explain your reasoning. Just give the reply."
- **Injected product context**: Name, price, MRP, condition, and floor price are formatted directly into the system instruction per request

Result: consistent, on-brand, 1–2 sentence responses that feel like a real student texting.

---

## 🚀 How to Run

### Prerequisites
- Python 3.10+
- [Ollama](https://ollama.com) installed
- Firebase project with Firestore enabled
- `serviceAccountKey.json` in the backend folder

### 1. Pull the model
```bash
ollama pull phi3
ollama serve
```

### 2. Backend
```bash
cd campus-agent-backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install fastapi uvicorn firebase-admin ollama python-dotenv
uvicorn main:app --reload --port 8000
```

### 3. Frontend
Open `campus-agent-frontend/StudAI/index.html` directly in a browser, or serve it with any static server:
```bash
npx serve campus-agent-frontend/StudAI
```

---

## 📁 Project Structure

```
campus-agent-backend/
├── main.py          # FastAPI app + CORS
├── agent.py         # Ollama (Phi-3) + math fallback
├── prompts.py       # Phi-3 optimized system instruction
├── database.py      # Firestore helpers
└── .env             # (optional) env vars

campus-agent-frontend/StudAI/
├── index.html       # Single-page app
├── css/styles.css
└── js/script.js     # All app logic + Gemini integration
```

---

## 👥 Built for

University hackathons. Campus marketplaces. Students who just want a fair deal without the drama.
