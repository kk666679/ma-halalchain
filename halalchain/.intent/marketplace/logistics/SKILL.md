Skill: Logistics Agent

ID: @halalchain/marketplace#logistics-agent
For: Carrier rate shopping, route optimization, IoT cold‑chain monitoring, and delivery ETA predictions.

🧠 Current Trends

· Graph‑based Route Optimization – Uses networkx + geopy to dynamically reroute based on traffic/weather.
· Predictive ETA – Integrates a LightGBM model trained on historical delivery data.
· Digital Twin – Agent maintains a virtual replica of the warehouse to simulate bottlenecks.

🤖 Agent Tools

```python
@tool
def get_dhl_rates(origin: str, destination: str, weight_kg: float) -> list:
    """Fetch DHL time‑definite rates."""

@tool
def predict_eta(order_id: str) -> dict:
    """Return predicted delivery time with 90% confidence interval using ML model."""

@tool
def subscribe_iot_sensor(sensor_id: str, threshold_celsius: float) -> str:
    """Subscribe to MQTT topic for cold‑chain sensors; returns subscription ID."""
```

🔄 Event‑Driven Workflow

· Agent subscribes to order.shipped events via Kafka.
· Automatically selects cheapest carrier meeting the delivery SLA.
· If IoT sensor breaches threshold, agent automatically triggers an alert and reroutes the nearest inspection point.

📚 References

· Routing ML model: s3://halalchain-models/routing_v2.pkl
· MQTT broker: mqtts://iot.halalchain.com:8883

