import asyncio
import random
from datetime import datetime
from app.websocket.manager import manager

class SensorProvider:
    def __init__(self):
        self.temperature = 35.0
        self.gas_level = 25.0
        self.machine_fault = False
        self.override_active = False
        self.scenario = "Normal Operation"
        
    def set_override(self, temperature: float, gas_level: float, machine_fault: bool, scenario: str):
        self.override_active = True
        self.temperature = temperature
        self.gas_level = gas_level
        self.machine_fault = machine_fault
        self.scenario = scenario

    def generate_readings(self):
        if not self.override_active:
            # Fluctuate temperature
            self.temperature += random.uniform(-1.0, 1.0)
            # Drift towards normal but occasionally spike
            if random.random() < 0.05:
                self.temperature += random.uniform(5.0, 15.0)
            elif self.temperature > 35.0:
                self.temperature -= 0.5
                
            self.temperature = max(20.0, min(100.0, self.temperature))
            
            # Fluctuate gas level
            self.gas_level += random.uniform(-2.0, 2.0)
            if random.random() < 0.02:
                self.gas_level += random.uniform(20.0, 40.0)
            elif self.gas_level > 25.0:
                self.gas_level -= 1.0
                
            self.gas_level = max(0.0, min(200.0, self.gas_level))
            
            # Machine fault (rare, 1% chance, resolves itself randomly)
            if not self.machine_fault and random.random() < 0.01:
                self.machine_fault = True
            elif self.machine_fault and random.random() < 0.1:
                self.machine_fault = False
            
        return {
            "temperature": round(self.temperature, 1),
            "gasLevel": round(self.gas_level, 1),
            "machineFault": self.machine_fault,
            "source": "tinkercad_sync" if self.override_active else "simulation",
            "scenario": self.scenario if self.override_active else "Auto Simulation",
            "connected": self.override_active,
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
