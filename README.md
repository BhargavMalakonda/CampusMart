# CampusMart — Autonomous AI Negotiator

> An AI-powered campus marketplace where a local LLM haggles on the seller's behalf in real time — no seller required in the loop.
> **Built in 24 hours for the [StudAI One] Hackathon!**

---

## Tech Stack & Architecture

| Layer | Technology |
|---|---|
| Frontend | Vanilla JS, Firebase v8 (Auth, Firestore, Storage) |
| Backend | Python, FastAPI, Uvicorn |
| AI Engine | Ollama + Phi-3 (3.8B, runs fully local) |
| Fallback | Math-based heuristic negotiator (demo-proof) |
| Database | Google Firestore (real-time, no polling) |
| Auth | Firebase Authentication (email/password) |

**Architecture overview:**
The frontend is a single-page app that communicates with a FastAPI backend over a local REST endpoint (`/negotiate`). The backend loads product context from Firestore, builds a structured prompt, and calls a locally-running Ollama instance (Phi-3). A regex-based deal parser (`[[DEAL:price]]`) on the frontend detects when a price is agreed and triggers the post-deal UI state without any additional API call.

---

## Repository Structure

```
campusmart_backend/
├── main.py           # FastAPI app, CORS config, /negotiate endpoint
├── agent.py          # Ollama (Phi-3) negotiation logic + math fallback
├── prompts.py        # Phi-3 optimised system prompt
├── database.py       # Firestore helpers (products, negotiations, messages)
└── serviceAccountKey.json   # ← NOT in version control (see below)

campusmart_frontend/StudAI/
├── index.html        # Single-page application shell
├── css/styles.css    # Full production stylesheet
└── js/script.js      # All app logic, Firebase integration, negotiation UI
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- [Ollama](https://ollama.com) installed and running
- A Firebase project with Firestore and Authentication enabled
- `serviceAccountKey.json` placed in `campusmart_backend/` (see below)

### 1. Pull and serve the local model

```bash
ollama pull phi3
ollama serve
```

### 2. Backend

```bash
cd campusmart_backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux

pip install fastapi uvicorn firebase-admin ollama python-dotenv
uvicorn main:app --reload --port 8000
```

### 3. Frontend

Open `campusmart_frontend/StudAI/index.html` directly in a browser, or serve it with any static file server:

```bash
npx serve campusmart_frontend/StudAI
```

---

## Firebase Configuration & Service Account

### Why this file is not in version control

`serviceAccountKey.json` is a private credential file that grants admin-level access to your Firebase project. Committing it to a public repository is a critical security vulnerability. It is listed in `.gitignore` and must never be pushed to version control.

### How to generate your own key

1. Go to the [Firebase Console](https://console.firebase.google.com) and open your project.
2. Navigate to **Project Settings → Service Accounts**.
3. Click **Generate new private key** and confirm.
4. A JSON file will be downloaded to your machine.
5. Rename it to `serviceAccountKey.json`.
6. Place it inside the `campusmart_backend/` directory.

The backend (`database.py`) loads this file at startup:

```python
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
```

The server will not start without this file present.

---

## Key Technical Decisions

**Local LLM over cloud API** — Switched from Gemini 2.0 Flash to Ollama + Phi-3 after hitting free-tier rate limits (429 RESOURCE_EXHAUSTED) during live demos. Local inference runs at ~200ms with zero cost and no data leaving the machine.

**Demo-proof fallback** — If Ollama is unavailable (cold start, resource spike), a math-based heuristic negotiator takes over silently. The buyer never sees an error; the deal still closes.

**Structured deal token** — The AI appends `[[DEAL:price]]` when accepting an offer. The frontend parses this with a single regex, strips it from the displayed message, and triggers the "Deal Locked" UI state instantly — no polling, no extra round-trip.

**Price guard** — A post-processing step in `agent.py` prevents the model from accidentally closing a deal below the buyer's own offer, which would be a logical contradiction.

## Team

- **Malakonda Chaitanya Bhargav** - Backend Developement and Integration ([GitHub](https://github.com/BhargavMalakonda) | [LinkedIn](https://www.linkedin.com/in/chaitanya-bhargav-malakonda/))
- **Burle Tejash** - Frontend & UI/UX ([GitHub](https://github.com/Tejash1002) | [LinkedIn](https://www.linkedin.com/in/burle-tejash))
- **Dhruv Malu** - Testing and Debugging ([GitHub](https://github.com/Dhruvmalu) | [LinkedIn](https://www.linkedin.com/in/dhruv-malu-845788324))
- **Ravula Akash** - Frontend & UI/UX ([GitHub](https://github.com/akash-795) | [LinkedIn](https://www.linkedin.com/in/ravula-akash-449989401/))
