from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import (
    FarmerProfile, BuyerProfile, TransporterProfile, Category, Product,
    PricePrediction, WeatherData, DemandIntelligence,
)
from api.ai.predictions import predict_price
from api.ai.weather import get_weather

User = get_user_model()

DEFAULT_PASSWORD = 'agrolink123'

USERS = [
    {'username': 'admin', 'email': 'admin@agrolink.co.ke', 'first_name': 'System', 'last_name': 'Admin', 'role': 'admin', 'county': 'Nairobi', 'is_staff': True, 'is_superuser': True},
    {'username': 'farmer1', 'email': 'james.kamau@agrolink.co.ke', 'first_name': 'James', 'last_name': 'Kamau', 'role': 'farmer', 'county': 'Nakuru', 'phone': '0712345678'},
    {'username': 'farmer2', 'email': 'mary.wanjiku@agrolink.co.ke', 'first_name': 'Mary', 'last_name': 'Wanjiku', 'role': 'farmer', 'county': 'Meru', 'phone': '0722345678'},
    {'username': 'farmer3', 'email': 'peter.ochieng@agrolink.co.ke', 'first_name': 'Peter', 'last_name': 'Ochieng', 'role': 'farmer', 'county': 'Kirinyaga', 'phone': '0732345678'},
    {'username': 'buyer1', 'email': 'buyer@agrolink.co.ke', 'first_name': 'Sarah', 'last_name': 'Mwangi', 'role': 'buyer', 'county': 'Nairobi', 'phone': '0742345678'},
    {'username': 'buyer2', 'email': 'hotel@agrolink.co.ke', 'first_name': 'Hotel', 'last_name': 'Supplies Ltd', 'role': 'buyer', 'county': 'Nairobi', 'phone': '0752345678'},
    {'username': 'transporter1', 'email': 'driver@agrolink.co.ke', 'first_name': 'John', 'last_name': 'Kiprop', 'role': 'transporter', 'county': 'Eldoret', 'phone': '0762345678'},
]

CATEGORIES = [
    {'name': 'Grains', 'slug': 'grains', 'image_url': 'https://images.unsplash.com/photo-1560807707-8ec872a548ec?w=600&q=80'},
    {'name': 'Vegetables', 'slug': 'vegetables', 'image_url': 'https://images.unsplash.com/photo-1592924357238-94a8a477086a?w=600&q=80'},
    {'name': 'Fruits', 'slug': 'fruits', 'image_url': 'https://images.unsplash.com/photo-1523049673857-eb18f1af67ad?w=600&q=80'},
    {'name': 'Dairy', 'slug': 'dairy', 'image_url': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&q=80'},
    {'name': 'Livestock', 'slug': 'livestock', 'image_url': 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&q=80'},
]

PRODUCTS = [
    {'name': 'Maize', 'price': 4500, 'unit': 'bag', 'quantity': 120, 'county': 'Nakuru', 'category': 'grains', 'farmer': 'farmer1', 'featured': True,
     'image': 'https://images.unsplash.com/photo-1560807707-8ec872a548ec?w=600&q=80', 'desc': 'Freshly harvested yellow maize, sun-dried and ready for market.'},
    {'name': 'Irish Potatoes', 'price': 150, 'unit': 'kg', 'quantity': 500, 'county': 'Meru', 'category': 'vegetables', 'farmer': 'farmer2', 'featured': True,
     'image': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&q=80', 'desc': 'Clean, medium-sized Irish potatoes ideal for retail and wholesale.'},
    {'name': 'Tomatoes', 'price': 80, 'unit': 'kg', 'quantity': 300, 'county': 'Kirinyaga', 'category': 'vegetables', 'farmer': 'farmer3', 'featured': True,
     'image': 'https://images.unsplash.com/photo-1592924357238-94a8a477086a?w=600&q=80', 'desc': 'Ripe, red tomatoes harvested daily from greenhouse farms.'},
    {'name': 'Fresh Milk', 'price': 55, 'unit': 'litre', 'quantity': 200, 'county': 'Kiambu', 'category': 'dairy', 'farmer': 'farmer1', 'featured': True,
     'image': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&q=80', 'desc': 'Fresh whole milk from healthy Friesian cows.'},
    {'name': 'Avocados', 'price': 60, 'unit': 'kg', 'quantity': 450, 'county': 'Muranga', 'category': 'fruits', 'farmer': 'farmer2', 'featured': True,
     'image': 'https://images.unsplash.com/photo-1523049673857-eb18f1af67ad?w=600&q=80', 'desc': 'Premium Hass avocados, export-grade quality.'},
    {'name': 'Green Beans', 'price': 120, 'unit': 'kg', 'quantity': 200, 'county': 'Machakos', 'category': 'vegetables', 'farmer': 'farmer3', 'featured': False,
     'image': 'https://images.unsplash.com/photo-1597361909610-bce173b3a916?w=600&q=80', 'desc': 'Crisp fresh green beans, perfect for export and local markets.'},
    {'name': 'Wheat', 'price': 5200, 'unit': 'bag', 'quantity': 80, 'county': 'Kitale', 'category': 'grains', 'farmer': 'farmer1', 'featured': False,
     'image': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80', 'desc': 'High-quality wheat grain from Trans-Nzoia farms.'},
    {'name': 'Onions', 'price': 90, 'unit': 'kg', 'quantity': 350, 'county': 'Eldoret', 'category': 'vegetables', 'farmer': 'farmer2', 'featured': False,
     'image': 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=600&q=80', 'desc': 'Red and white onions, freshly harvested.'},
    {'name': 'Tea Leaves', 'price': 25, 'unit': 'kg', 'quantity': 1000, 'county': 'Kericho', 'category': 'vegetables', 'farmer': 'farmer3', 'featured': False,
     'image': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80', 'desc': 'Premium green tea leaves from highland farms.'},
    {'name': 'Dairy Cow', 'price': 85000, 'unit': 'head', 'quantity': 3, 'county': 'Kiambu', 'category': 'livestock', 'farmer': 'farmer1', 'featured': False,
     'image': 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&q=80', 'desc': 'Healthy Friesian dairy cows with high milk yield potential.'},
]

DEMAND = [
    ('Nakuru', 'potatoes', 'high', 'High demand for potatoes from Nairobi hotels and restaurants.', 45),
    ('Nakuru', 'maize', 'medium', 'Steady maize demand from millers and feed suppliers.', 28),
    ('Kitale', 'wheat', 'high', 'Wheat buyers actively sourcing from Trans-Nzoia region.', 32),
    ('Eldoret', 'milk', 'very_high', 'Very high demand for fresh milk in Eldoret urban area.', 55),
    ('Meru', 'avocados', 'high', 'Export demand for Hass avocados increasing.', 38),
    ('Kirinyaga', 'tomatoes', 'medium', 'Tomato supply meeting local demand with slight surplus.', 22),
]

COUNTIES = ['Nakuru', 'Kitale', 'Eldoret', 'Nairobi', 'Meru', 'Kiambu', 'Kisumu', 'Machakos']


class Command(BaseCommand):
    help = 'Seed AgroLink database with sample data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding AgroLink database...')

        for u in USERS:
            user, created = User.objects.get_or_create(
                username=u['username'],
                defaults={
                    'email': u['email'],
                    'first_name': u['first_name'],
                    'last_name': u['last_name'],
                    'role': u['role'],
                    'county': u.get('county', ''),
                    'phone': u.get('phone', ''),
                    'is_staff': u.get('is_staff', False),
                    'is_superuser': u.get('is_superuser', False),
                },
            )
            if created or not user.check_password(DEFAULT_PASSWORD):
                user.set_password(DEFAULT_PASSWORD)
                user.save()

            if u['role'] == 'farmer':
                FarmerProfile.objects.get_or_create(
                    user=user,
                    defaults={'farm_name': f"{u['first_name']}'s Farm", 'reliability_score': Decimal('88.50')},
                )
            elif u['role'] == 'buyer':
                BuyerProfile.objects.get_or_create(user=user, defaults={'business_name': u.get('last_name', '')})
            elif u['role'] == 'transporter':
                TransporterProfile.objects.get_or_create(
                    user=user,
                    defaults={'vehicle_type': 'Pickup Truck', 'vehicle_plate': 'KDA 123X', 'is_available': True},
                )

        for c in CATEGORIES:
            Category.objects.get_or_create(slug=c['slug'], defaults=c)

        for p in PRODUCTS:
            farmer = User.objects.get(username=p['farmer'])
            category = Category.objects.get(slug=p['category'])
            Product.objects.get_or_create(
                name=p['name'],
                farmer=farmer,
                defaults={
                    'category': category,
                    'description': p['desc'],
                    'price': Decimal(str(p['price'])),
                    'unit': p['unit'],
                    'quantity_available': Decimal(str(p['quantity'])),
                    'county': p['county'],
                    'image_url': p['image'],
                    'is_featured': p['featured'],
                },
            )

        crops = ['maize', 'potatoes', 'tomatoes', 'avocados', 'milk']
        for county in COUNTIES:
            for crop in crops[:3]:
                pred = predict_price(crop, county, 3)
                PricePrediction.objects.get_or_create(
                    crop=pred['crop'],
                    county=pred['county'],
                    forecast_weeks=3,
                    defaults={
                        'current_price': pred['current_price'],
                        'predicted_price': pred['predicted_price'],
                        'change_percent': pred['change_percent'],
                        'trend': pred['trend'],
                        'season': pred['season'],
                        'confidence': pred['confidence'],
                        'summary': pred['summary'],
                    },
                )

            w = get_weather(county)
            WeatherData.objects.get_or_create(
                county=w['county'],
                condition=w['condition'],
                defaults={
                    'temperature': w['temperature'],
                    'humidity': w['humidity'],
                    'rainfall_mm': w['rainfall_mm'],
                    'forecast_days': w['forecast_days'],
                    'advisory': w['advisory'],
                },
            )

        for county, crop, level, summary, count in DEMAND:
            DemandIntelligence.objects.update_or_create(
                county=county,
                crop=crop,
                defaults={'demand_level': level, 'summary': summary, 'buyer_count': count},
            )

        self.stdout.write(self.style.SUCCESS(
            f'Seed complete! Default password for all users: {DEFAULT_PASSWORD}'
        ))
