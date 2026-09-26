import os
import sys
from pathlib import Path
import uvicorn

root_dir = Path(__file__).resolve().parent
backend_dir = root_dir / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.config import settings

if __name__ == "__main__":
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting {settings.APP_NAME} Backend on http://{host}:{port} ...")
    uvicorn.run("app.main:app", host=host, port=port, reload=False, app_dir=str(backend_dir))
