"""Application configuration settings."""

import json
from typing import Annotated, List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="allow",
    )
    
    # Application
    app_name: str = Field(default="AEGIS-AI Backend", alias="APP_NAME")
    app_version: str = Field(default="1.0.0", alias="APP_VERSION")
    debug: bool = Field(default=True, alias="DEBUG")
    environment: str = Field(default="development", alias="ENVIRONMENT")
    
    # Database
    database_url: str = Field(default="sqlite+aiosqlite:///./aegis.db", alias="DATABASE_URL")
    
    # API
    api_host: str = Field(default="0.0.0.0", alias="API_HOST")
    api_port: int = Field(default=8000, alias="API_PORT")
    api_prefix: str = Field(default="/api", alias="API_PREFIX")
    
    # CORS
    cors_origins: Annotated[List[str], NoDecode] = Field(
        default=["http://localhost:3000", "http://localhost:8080"],
        alias="CORS_ORIGINS"
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: object) -> List[str]:
        """Allow either JSON arrays or comma-separated CORS origins in .env."""
        if isinstance(value, str):
            raw = value.strip()
            if not raw:
                return []
            if raw.startswith("["):
                parsed = json.loads(raw)
                if not isinstance(parsed, list):
                    raise ValueError("CORS_ORIGINS JSON value must be a list")
                return [str(origin).strip() for origin in parsed if str(origin).strip()]
            return [origin.strip() for origin in raw.split(",") if origin.strip()]

        if isinstance(value, (list, tuple, set)):
            return [str(origin).strip() for origin in value if str(origin).strip()]

        raise ValueError("CORS_ORIGINS must be a list or comma-separated string")
    
    # WebSocket
    ws_heartbeat_interval: int = Field(default=30, alias="WS_HEARTBEAT_INTERVAL")
    
    # Simulation
    simulation_interval: float = Field(default=1.0, alias="SIMULATION_INTERVAL")
    simulation_enabled: bool = Field(default=True, alias="SIMULATION_ENABLED")
    
    # Alert Settings
    alert_escalation_minutes: int = Field(default=5, alias="ALERT_ESCALATION_MINUTES")
    alert_auto_resolve_hours: int = Field(default=24, alias="ALERT_AUTO_RESOLVE_HOURS")
    
    # AI Integration
    helmet_ai_url: str = Field(default="http://localhost:5001", alias="HELMET_AI_URL")
    ppe_ai_url: str = Field(default="http://localhost:5002", alias="PPE_AI_URL")
    predictive_ai_url: str = Field(default="http://localhost:5003", alias="PREDICTIVE_AI_URL")
    
    # Logging
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")
    log_file: str = Field(default="logs/aegis.log", alias="LOG_FILE")
    
    # Report Settings
    report_output_dir: str = Field(default="reports", alias="REPORT_OUTPUT_DIR")
    

settings = Settings()
