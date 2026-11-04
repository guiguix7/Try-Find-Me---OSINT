from fastapi import FastAPI

app = FastAPI(
    title="Try Find Me! — OSINT",
    description="Authorized Digital Exposure Assessment Platform",
    version="0.1.0",
)


@app.get("/")
def root():
    return {"message": "Try Find Me! API", "status": "running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
