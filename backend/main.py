from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.ai import main as run_ai
from backend.agents import TASKS

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/test/{task_type}")
async def test(task_type: str):
    if task_type not in TASKS:
        return {"error": f"Invalid task type. Choose from: {', '.join(TASKS.keys())}"}

    result = await run_ai(task_type)
    return result