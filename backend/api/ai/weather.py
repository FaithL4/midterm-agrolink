import hashlib
from decimal import Decimal
from datetime import datetime

COUNTY_COORDS = {
    'nakuru': {'temp_base': 22, 'humidity_base': 65},
    'kitale': {'temp_base': 18, 'humidity_base': 72},
    'eldoret': {'temp_base': 17, 'humidity_base': 70},
    'nairobi': {'temp_base': 24, 'humidity_base': 58},
    'meru': {'temp_base': 21, 'humidity_base': 68},
    'kiambu': {'temp_base': 20, 'humidity_base': 70},
    'kisumu': {'temp_base': 26, 'humidity_base': 75},
    'machakos': {'temp_base': 25, 'humidity_base': 55},
}

CONDITIONS = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Heavy Rain', 'Thunderstorms']


def get_weather(county: str) -> dict:
    key = county.lower().strip()
    base = COUNTY_COORDS.get(key, {'temp_base': 22, 'humidity_base': 65})

    seed = f'weather-{key}-{datetime.now().strftime("%Y-%m-%d")}'
    h = int(hashlib.md5(seed.encode()).hexdigest()[:8], 16)

    temp = Decimal(base['temp_base']) + Decimal((h % 8) - 4)
    humidity = base['humidity_base'] + (h % 20) - 10
    rainfall = Decimal((h % 50)) if (h % 5) == 0 else Decimal('0')
    condition = CONDITIONS[h % len(CONDITIONS)]

    if rainfall > 30:
        advisory = f'Delay harvesting in {county.title()} due to heavy rains expected. Protect stored produce.'
    elif rainfall > 10:
        advisory = f'Light rains in {county.title()}. Good for planting but delay field drying activities.'
    elif temp > 28:
        advisory = f'High temperatures in {county.title()}. Increase irrigation for sensitive crops.'
    else:
        advisory = f'Favorable weather in {county.title()} for most farming activities. Good harvesting conditions.'

    return {
        'county': county.title(),
        'temperature': temp,
        'humidity': max(30, min(95, humidity)),
        'rainfall_mm': rainfall,
        'condition': condition,
        'forecast_days': 7,
        'advisory': advisory,
    }
