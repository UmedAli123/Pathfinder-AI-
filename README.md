# Pathfinder AI 🚀
### Autonomous AI Browser Automation Agent

Pathfinder AI is a next-generation autonomous web automation platform powered by **Groq LLM** for intelligent decision-making and **Playwright** for real-time browser action execution. Give Pathfinder AI any goal in natural language, and it will dynamically inspect web pages, reason about the next best action, execute interactions, and stream its live progress back to a sleek React dashboard.

---

## 🌟 Key Features

- 🤖 **LLM-Driven Browser Navigation**: Replaces rigid, fragile hardcoded scripts with intelligent multi-step reasoning powered by Groq LLM models (e.g. `llama-3.3-70b-versatile`).
- ⚡ **Real-Time WebSocket Streaming**: Instant dual-way communication updates step-by-step progress, screenshots, live logs, and actions directly to the user interface.
- 🎯 **Interactive Human-in-the-Loop (HITL)**: Pause, inspect, resume, or interrupt agent tasks at any point during execution.
- 📚 **Pre-built Recipes & Action Templates**: Jumpstart common automation workflows like web scraping, job searching, dynamic form submissions, and product price comparisons.
- 📜 **Execution History & Metrics**: Track duration, status, completed steps, and history of past agent runs.
- ⚙️ **Customizable Settings**: Seamlessly configure API keys, default LLM models, browser headless mode, and execution step limits.

---

## 🏗️ Architecture

```
                      ┌──────────────────────────────────────┐
                      │        React + Vite Frontend         │
                      │  (User Goal / Live Stream / Controls)│
                      └──────────────────┬───────────────────┘
                                         │ WebSocket (/ws/agent)
                                         ▼
                      ┌──────────────────────────────────────┐
                      │          FastAPI Backend             │
                      │          (Agent Loop Core)           │
                      └──────────┬────────────────┬──────────┘
                                 │                │
            Simplified DOM State │                │ Action JSON
                                 ▼                │ (click, type, navigate)
                      ┌──────────────────┐        │
                      │   Groq LLM API   │        │
                      │   (Brain Logic)  │        │
                      └──────────────────┘        ▼
                                       ┌─────────────────────┐
                                       │ Playwright Browser  │
                                       │ (Execution Engine)  │
                                       └─────────────────────┘
```

---

## 🛠️ Tech Stack

### **Backend**
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+)
- **LLM Engine**: [Groq SDK](https://console.groq.com/)
- **Browser Automation**: [Playwright](https://playwright.dev/python/)
- **Real-time Protocol**: WebSockets & asyncio
- **Data Validation**: Pydantic v2

### **Frontend**
- **Core**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling & UI Components**: Vanilla CSS with custom glassmorphism design system & micro-animations
- **Icons**: [Lucide React](https://lucide.dev/)
- **Linter**: [Oxlint](https://github.com/oxc-project/oxc)

---

## 📂 Project Structure

```
Pathfinder AI/
├── backend/
│   ├── app/
│   │   ├── agent/             # Core agent logic, LLM interface, & Playwright loop
│   │   ├── config.py          # Environment settings & configuration
│   │   ├── main.py            # FastAPI entrypoint & WebSocket handler
│   │   └── schemas.py         # Pydantic request/response schemas
│   ├── .env.example           # Backend environment variables template
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/        # React components (Dashboard, History, Recipes, Settings)
│   │   ├── App.jsx            # Main App layout & WebSocket state management
│   │   └── main.jsx           # Vite React entry point
│   ├── package.json           # Node dependencies & scripts
│   └── vite.config.js         # Vite configuration
├── browser-automation-agent-docs.md  # Detailed architecture & technical documentation
└── README.md                  # Project overview (this file)
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have installed:
- **Python**: v3.10 or higher
- **Node.js**: v18 or higher (npm v9+)
- **Groq API Key**: Obtainable from the [Groq Console](https://console.groq.com/)

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install Playwright browser binaries
playwright install chromium

# Create environment configuration file
cp .env.example .env
```

Edit your `backend/.env` file to add your Groq API key:
```env
GROQ_API_KEY=your_groq_api_key_here
PORT=8000
HOST=0.0.0.0
```

Start the FastAPI development server:
```bash
python app/main.py
# Or using uvicorn directly:
# uvicorn app.main:app --reload --port 8000
```
Backend API will run at: `http://localhost:8000`

---

### 2. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start the development server
npm run dev
```
Frontend App will run at: `http://localhost:5173`

---

## 🌐 API & WebSocket Reference

### HTTP Endpoints
- `GET /api/health`: Health check endpoint returns status and Groq API configuration state.

### WebSocket Connection
- `WS /ws/agent`: Primary WebSocket endpoint for controlling the agent.
  - **Action Payload Types**:
    - `start`: Begins a new agent workflow with `goal`, `start_url`, `max_steps`, `model_name`, `hitl_mode`, etc.
    - `stop`: Immediately stops the running agent.
    - `pause`: Pauses agent execution loop.
    - `resume`: Resumes paused agent execution loop.

---

## 📄 Documentation

For deep technical insights on prompt engineering, element simplification logic, state machines, and Playwright execution strategies, check out [`browser-automation-agent-docs.md`](file:///Users/datascientist/Downloads/Pathfinder%20AI/browser-automation-agent-docs.md).

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).