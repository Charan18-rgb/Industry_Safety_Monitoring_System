import asyncio
import random
from datetime import datetime
from app.websocket.manager import manager

class SensorProvider:
    def __init__(self):
        self.temperature = 30.0
        self.gas_level = 15.0
        self.machine_fault = False
        self.ticks = 0
        
    def generate_readings(self):
        self.ticks += 1
        
        # Normal Nominal Operation
        # Fluctuate temperature slowly in 25-35°C
        self.temperature += random.uniform(-1.0, 1.0)
        self.temperature = max(25.0, min(35.0, self.temperature))
        self.temperature = round(self.temperature, 1)
        
        # Fluctuate gas level slowly in 10-25 ppm
        self.gas_level += random.uniform(-1.5, 1.5)
        self.gas_level = max(10.0, min(25.0, self.gas_level))
        self.gas_level = round(self.gas_level, 1)
        
        self.machine_fault = False
        scenario = "Normal Operation"
            
        return {
            "temperature": self.temperature,
            "gasLevel": self.gas_level,
            "machineFault": self.machine_fault,
            "source": "simulation",
            "scenario": scenario,
            "connected": True,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }

sensor_provider = SensorProvider()

async def sensor_loop():
    while True:
        data = sensor_provider.generate_readings()
        message = {
            "type": "tinkercad_sensor",
            "data": data,
        }
        await manager.broadcast(message)
        await asyncio.sleep(1.0)

