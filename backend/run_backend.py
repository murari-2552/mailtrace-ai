import os
import uvicorn
from app.config import settings

if __name__ == "__main__":
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting {settings.APP_NAME} Backend on http://{host}:{port} ...")
    uvicorn.run("app.main:app", host=host, port=port, reload=False)

