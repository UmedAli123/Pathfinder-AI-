# AI Browser Automation Agent

An autonomous agent that controls a real web browser to complete tasks — powered by **Groq** (LLM reasoning) and **Playwright** (browser automation). Give it a goal in plain English, and it observes the page, decides the next action, and executes it — looping until the task is done.

---

## 1. Overview

Traditional automation scripts (Selenium/Playwright scripts) require you to hardcode every click and selector. This agent instead uses an LLM as the "brain" — it looks at the current state of a webpage, reasons about what to do next, and issues an action. Playwright then executes that action in a real browser. This loop repeats until the goal is achieved.

**Example use cases to demo:**
- "Search Google for 'best laptops 2026' and return the top 3 result titles"
- "Go to a job board, search for 'AI Engineer' roles in Islamabad, and list the first 5 job titles"
- "Fill out a contact form with sample data and submit it"

---

## 2. Architecture

```
                    ┌─────────────────────┐
                    │      User Goal       │
                    │ "search flights X→Y" │
                    └──────────┬───────────┘
                               │
                               ▼
                 ┌─────────────────────────┐
                 │   Playwright Browser     │
                 │  (captures page state)   │
                 └──────────┬───────────────┘
                             │  simplified DOM
                             │  (buttons, links, inputs + labels)
                             ▼
                 ┌─────────────────────────┐
                 │      Groq LLM API        │
                 │ (decides next action)    │
                 └──────────┬───────────────┘
                             │  JSON action
                             │  {"action":"click","selector":"#submit"}
                             ▼
                 ┌─────────────────────────┐
                 │   Playwright executes    │
                 │   action in browser      │
                 └──────────┬───────────────┘
                             │
                             ▼
                    Loop until goal met
                    or max steps reached
```

**Core loop stages:**
1. **Observe** — Playwright extracts the page's interactive elements (not raw HTML)
2. **Think** — Groq LLM receives goal + page state, returns next action as JSON
3. **Act** — Playwright executes the action (click, type, scroll, navigate)
4. **Check** — Determine if goal is complete or continue looping
5. **Repeat** — Up to a max step limit (prevents infinite loops)

---

## 3. Tech Stack

| Component | Tool | Cost |
|---|---|---|
| Browser automation | Playwright (Python) | Free |
| LLM reasoning | Groq API (Llama 3.3 70B / Llama 3.1 8B) | Free tier |
| Language | Python 3.10+ | Free |
| Env management | `python-dotenv` | Free |
| Optional UI | Streamlit | Free |
| Optional deploy | Streamlit Community Cloud / Hugging Face Spaces | Free |

---

## 4. Prerequisites

- Python 3.10 or higher
- A free Groq API key from https://console.groq.com (no credit card required)
- Basic familiarity with terminal/command line

---

## 5. Installation

```bash
# 1. Create project folder
mkdir browser-agent && cd browser-agent

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate      # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install playwright groq python-dotenv

# 4. Install Playwright browser binaries
playwright install chromium
```

Create a `.env` file in the project root:
```
GROQ_API_KEY=your_groq_api_key_here
```

---

## 6. Project Structure

```
browser-agent/
├── .env                    # API key (never commit this)
├── requirements.txt
├── main.py                 # Entry point — runs the agent loop
├── agent/
│   ├── __init__.py
│   ├── browser.py          # Playwright wrapper: launch, screenshot, DOM extraction
│   ├── llm.py               # Groq API wrapper: sends state, parses action
│   ├── actions.py          # Executes actions (click, type, scroll, navigate)
│   └── loop.py              # Main observe-think-act loop + stop conditions
└── README.md
```

---

## 7. Core Components Explained

### 7.1 `browser.py` — Observation Layer
Launches a Playwright browser instance and extracts a **simplified representation** of the page — not raw HTML (too noisy and expensive for the LLM). It pulls out:
- All clickable elements (buttons, links) with visible text
- All input fields with placeholder/label text
- A unique reference ID for each element (e.g., `[1] Button: "Search"`, `[2] Input: "Email"`)

This simplified list is what gets sent to the LLM — keeping token usage low and accuracy high.

### 7.2 `llm.py` — Decision Layer
Sends the Groq API a prompt containing:
- The overall goal
- The current simplified page state
- The action history so far (to avoid repeating mistakes)

Asks for a **strict JSON response** specifying the next single action. Example prompt structure:

```
SYSTEM: You are a browser automation agent. Given a goal and the current
page elements, respond ONLY with a JSON object for the next action.
Valid actions: click, type, scroll, navigate, done.

GOAL: {goal}
CURRENT PAGE ELEMENTS: {simplified_dom}
HISTORY: {previous_actions}

Respond with JSON only, e.g.:
{"action": "click", "element_id": 3}
{"action": "type", "element_id": 5, "text": "AI Engineer"}
{"action": "navigate", "url": "https://example.com"}
{"action": "done", "result": "summary of what was found"}
```

### 7.3 `actions.py` — Execution Layer
Takes the JSON action returned by the LLM and maps it to a real Playwright command:

| Action | Playwright call |
|---|---|
| `click` | `page.click(selector)` |
| `type` | `page.fill(selector, text)` |
| `scroll` | `page.mouse.wheel(0, amount)` |
| `navigate` | `page.goto(url)` |
| `done` | Ends the loop, returns result |

### 7.4 `loop.py` — Controller
Ties everything together:
```python
MAX_STEPS = 15

def run_agent(goal, start_url):
    browser.launch()
    browser.goto(start_url)
    history = []

    for step in range(MAX_STEPS):
        state = browser.get_simplified_state()
        action = llm.decide_next_action(goal, state, history)
        history.append(action)

        if action["action"] == "done":
            return action["result"]

        browser.execute(action)

    return "Max steps reached without completing goal"
```

---

## 8. Groq API Integration Snippet

```python
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def decide_next_action(goal, page_state, history):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"GOAL: {goal}\nPAGE: {page_state}\nHISTORY: {history}"}
        ],
        response_format={"type": "json_object"},
        temperature=0
    )
    return response.choices[0].message.content
```

Note: `temperature=0` keeps action selection deterministic and reliable — important for an agent making structured decisions.

---

## 9. Safety & Reliability Notes

- **Max step limit** — always cap loop iterations to avoid runaway browsing
- **Whitelisted domains** — restrict which sites the agent can navigate to, especially for a public demo
- **JSON validation** — wrap LLM output parsing in try/except; retry once on malformed JSON before failing gracefully
- **Human-in-the-loop mode** — for a portfolio demo, add a confirmation step before any "submit" or "purchase" type actions
- **Rate limits** — Groq's free tier has request-per-minute limits; add basic retry/backoff logic

---

## 10. Optional: Streamlit Demo UI

Wrap the agent in a simple Streamlit app so visitors can type a goal and watch the agent work:
```python
import streamlit as st
from agent.loop import run_agent

st.title("AI Browser Agent")
goal = st.text_input("What should the agent do?")
url = st.text_input("Starting URL")

if st.button("Run Agent") and goal and url:
    with st.spinner("Agent working..."):
        result = run_agent(goal, url)
    st.success(result)
```
Deploy free on Streamlit Community Cloud for a live portfolio link.

---

## 11. Limitations (be upfront about these in your portfolio write-up)

- Struggles with complex/dynamic pages (heavy JS, CAPTCHAs, infinite scroll)
- Not fully deterministic — same goal may take different paths on different runs
- Free Groq tier has rate limits, not meant for high-frequency production use
- No built-in memory across sessions (each run starts fresh)

---

## 12. Future Enhancements

- Add vision capability (screenshot + multimodal model) for pages where DOM extraction fails
- Add a "plan first, then execute" mode (agent outlines steps before acting)
- Persist run logs/history to a database for analytics
- Add multi-tab support for parallel tasks

---

## 13. Portfolio Positioning

When presenting this project, emphasize:
- **Fully free/open stack** — no paid APIs beyond Groq's generous free tier
- **Real agentic behavior** — not a scripted bot; it reasons and adapts
- **Live demo** — a working Streamlit link lets recruiters try it themselves, which is a much stronger signal than a README alone
