from fastapi import Request
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {exc}")
    # Return a clean JSON response that won't break CORS
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": str(exc) or "Internal Server Error"},
        headers={"Access-Control-Allow-Origin": "*"}
    )
