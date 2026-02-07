from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/test/{type}")
def login(type):
    if type == "login":
        return {"Hello": "login"}
    elif type == "signup":
        return {"Hello": "signup"}
    elif type == "recaptcha":
        return {"Hello": "Admin"}
    elif type == "forget-password":
        return {"Hello": "Admin"}

    return {"Error": "Invalid type"}
