import uvicorn
from uvicorn_config import log_config
from config import Config
import logging

logger = logging.getLogger(__name__)

if __name__ == "__main__":
    try:
        logger.info(f"Starting server on {Config.API_HOST}:{Config.API_PORT}")
        uvicorn.run(
            "main:app",
            host=Config.API_HOST,
            port=Config.API_PORT,
            reload=False,
            log_config=log_config,
            workers=1
        )
    except Exception as e:
        logger.error(f"Failed to start server: {str(e)}")
        raise 