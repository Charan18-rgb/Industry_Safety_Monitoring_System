"""AI integration middleware clients."""

from app.integrations.helmet_ai import HelmetAIClient
from app.integrations.ppe_ai import PPEAIClient
from app.integrations.predictive_ai import PredictiveAIClient

__all__ = [
    "HelmetAIClient",
    "PPEAIClient",
    "PredictiveAIClient",
]
