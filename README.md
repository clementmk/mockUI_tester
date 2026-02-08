# ATester - Autonomous Mystery Shopper

AI-powered UI/UX testing that detects friction before users do.

## Quick Start

### Requirements

- python 3.11
- vision enabled llm (used to conduct the testing)
   - currently using `seed-1-8-251228` from `bytedance`
- chat llm (used to generate the report)
   - currently using `google/gemini-3-flash-preview` from `openrouter`

### Setup

- **Create and activate a virtual environment**:

```bash
python -m venv venv
source venv/bin/activate
```

- **Install dependencies**:
```bash
pip install -r requirements.txt
```

### Start servers

1. **Start the tested website and Testing dashboard:**
```bash
python server.py
```

2. **Start BE server:**
```bash
python -m fastapi dev backend/main.py
```

3. **Open your browser:**
- Navigate to `http://localhost:8001`
- Click on `New Test`
- Enter `Test Name` and `Target Url` (target url is currently ignored by the backend server)
- Select a `Test Scenario`
- Click `Start Run`
- Result will be sent to the configured slack channel or it can be found at `/results` folder

## Project Structure

```
MysteryShopper/
├── server.py                  # Dual HTTP server (dashboard on :8001, buggy UI on :8002)
├── mokeBuggyUI.html           # Sample buggy UI used as the test target
├── requirements.txt           # Python dependencies
│
├── backend/
│   ├── main.py                # FastAPI app – exposes /api/test/{task_type}
│   ├── ai.py                  # Orchestrator – runs browser task → generates report → sends to Slack
│   └── agents.py              # Core agent logic: browser automation, report generation, Slack delivery
│
├── frontend/                  # Dashboard UI (served on :8001)
│   ├── index.html
│   ├── css/styles.css
│   └── js/
│       ├── main.js            # App entry point
│       ├── api.js             # API client for backend calls
│       ├── tests.js           # Test run management
│       ├── charts.js          # Result visualisations
│       ├── modals.js          # Modal dialogs
│       └── navigation.js      # Page routing
│
├── browser-extension/         # Chrome extension for triggering tests
│   ├── manifest.json
│   ├── background.js
│   ├── content.js / content.css
│   └── popup/                 # Extension popup UI
│
└── results/                   # Auto-generated test output (gitignored)
    └── {task}_{timestamp}/
        ├── result.txt         # Raw step-by-step results
        ├── report.html        # AI-generated QA report
        └── screenshots/       # Step screenshots (PNG)
```
