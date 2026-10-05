from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class User(AbstractUser):
    ROLE_CHOICES = [
        ('farmer', 'Farmer'),
        ('buyer', 'Buyer'),
        ('transporter', 'Transporter'),
        ('admin', 'Admin'),
    ]
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='buyer')
    phone = models.CharField(max_length=20, blank=True)
    county = models.CharField(max_length=100, blank=True)
    avatar = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Email Verification & OTP properties
    is_email_verified = models.BooleanField(default=False)
    email_verification_token = models.CharField(max_length=100, blank=True, null=True)
    otp_code = models.CharField(max_length=100, blank=True, null=True)
    otp_expires_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'users'


class FarmerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='farmer_profile')
    farm_name = models.CharField(max_length=200, blank=True)
    farm_size_acres = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    reliability_score = models.DecimalField(max_digits=4, decimal_places=2, default=80.00)
    total_deliveries = models.PositiveIntegerField(default=0)
    successful_deliveries = models.PositiveIntegerField(default=0)
    bio = models.TextField(blank=True)

    class Meta:
        db_table = 'farmer_profiles'


class BuyerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='buyer_profile')
    business_name = models.CharField(max_length=200, blank=True)
    preferred_counties = models.CharField(max_length=500, blank=True)

    class Meta:
        db_table = 'buyer_profiles'


class TransporterProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='transporter_profile')
    vehicle_type = models.CharField(max_length=100, blank=True)
    vehicle_plate = models.CharField(max_length=20, blank=True)
    vehicle_brand = models.CharField(max_length=100, blank=True)
    vehicle_model = models.CharField(max_length=100, blank=True)
    vehicle_color = models.CharField(max_length=50, blank=True)
    load_capacity = models.CharField(max_length=50, blank=True)
    is_refrigerated = models.BooleanField(default=False)
    
    operating_county = models.CharField(max_length=100, blank=True)
    operating_town = models.CharField(max_length=100, blank=True)
    service_radius = models.CharField(max_length=50, blank=True, default='50 km')
    areas_served = models.CharField(max_length=500, blank=True, default='Nakuru, Naivasha, Gilgil')
    
    license_number = models.CharField(max_length=100, blank=True)
    license_expiry = models.CharField(max_length=100, blank=True)
    
    mpesa_number = models.CharField(max_length=20, blank=True)
    is_verified = models.BooleanField(default=False)
    
    is_available = models.BooleanField(default=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=4.50)

    class Meta:
        db_table = 'transporter_profiles'


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    image_url = models.URLField(blank=True)

    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'categories'

    def __str__(self):
        return self.name


class Product(models.Model):
    UNIT_CHOICES = [
        ('kg', 'Kilogram'),
        ('bag', 'Bag'),
        ('litre', 'Litre'),
        ('head', 'Head'),
        ('crate', 'Crate'),
    ]
    farmer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    unit = models.CharField(max_length=20, choices=UNIT_CHOICES, default='kg')
    quantity_available = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    county = models.CharField(max_length=100)
    image_url = models.URLField(blank=True)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    APPROVAL_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    approval_status = models.CharField(max_length=20, choices=APPROVAL_CHOICES, default='pending')
    rejection_reason = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'products'
        indexes = [
            models.Index(fields=['county', 'is_active', 'approval_status']),
            models.Index(fields=['name']),
        ]


    @property
    def status(self):
        if self.quantity_available > 20:
            return 'Available'
        elif self.quantity_available >= 1:
            return 'Low Stock'
        else:
            return 'Out of Stock'

    def __str__(self):
        return self.name


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('in_transit', 'In Transit'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    farmer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='farmer_orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    delivery_address = models.TextField(blank=True)
    delivery_county = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=200)
    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = 'order_items'


class Payment(models.Model):
    METHOD_CHOICES = [
        ('mpesa', 'M-Pesa'),
        ('card', 'Visa/Mastercard'),
        ('cod', 'Cash on Delivery'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_id = models.CharField(max_length=50, blank=True, unique=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    checkout_request_id = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = 'payments'


class ChatRoom(models.Model):
    order = models.ForeignKey('Order', on_delete=models.CASCADE, related_name='chat_rooms')
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='buyer_chats')
    farmer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='farmer_chats')
    transporter = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='transporter_chats')
    status = models.CharField(max_length=20, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chat_rooms'


# Compatibility alias
Conversation = ChatRoom


class Message(models.Model):
    MESSAGE_TYPES = [
        ('text', 'Text'),
        ('image', 'Image'),
        ('location', 'Location'),
        ('file', 'File'),
        ('system', 'System'),
    ]
    chat_room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    message = models.TextField(blank=True)
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPES, default='text')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'messages'
        ordering = ['created_at']


class Attachment(models.Model):
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='attachments')
    file_url = models.URLField()
    file_type = models.CharField(max_length=50)

    class Meta:
        db_table = 'attachments'


class Delivery(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('picked_up', 'Picked Up'),
        ('in_transit', 'In Transit'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='delivery')
    transporter = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='deliveries')
    pickup_county = models.CharField(max_length=100)
    dropoff_county = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    estimated_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'deliveries'
        verbose_name_plural = 'deliveries'


class PricePrediction(models.Model):
    TREND_CHOICES = [
        ('increase', 'Increase'),
        ('decrease', 'Decrease'),
        ('stable', 'Stable'),
    ]
    crop = models.CharField(max_length=100)
    county = models.CharField(max_length=100)
    current_price = models.DecimalField(max_digits=12, decimal_places=2)
    predicted_price = models.DecimalField(max_digits=12, decimal_places=2)
    change_percent = models.DecimalField(max_digits=6, decimal_places=2)
    trend = models.CharField(max_length=20, choices=TREND_CHOICES)
    forecast_weeks = models.PositiveIntegerField(default=3)
    season = models.CharField(max_length=50, blank=True)
    confidence = models.DecimalField(max_digits=5, decimal_places=2, default=85.00)
    summary = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'price_predictions'


class WeatherData(models.Model):
    county = models.CharField(max_length=100)
    temperature = models.DecimalField(max_digits=5, decimal_places=1)
    humidity = models.PositiveIntegerField()
    rainfall_mm = models.DecimalField(max_digits=6, decimal_places=1, default=0)
    condition = models.CharField(max_length=100)
    forecast_days = models.PositiveIntegerField(default=7)
    advisory = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'weather_data'
        verbose_name_plural = 'weather data'


class DemandIntelligence(models.Model):
    LEVEL_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('very_high', 'Very High'),
    ]
    county = models.CharField(max_length=100)
    crop = models.CharField(max_length=100)
    demand_level = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    summary = models.TextField()
    buyer_count = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'demand_intelligence'
        unique_together = ['county', 'crop']


class Review(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='reviews')
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_given')
    farmer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_received')
    rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reviews'


from django.db.models.signals import post_save
from django.dispatch import receiver

class Wallet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'wallets'

    def __str__(self):
        return f"{self.user.username}'s Wallet (KES {self.balance})"


class WalletTransaction(models.Model):
    TRANSACTION_TYPES = [
        ('deposit', 'Deposit'),
        ('withdrawal', 'Withdrawal'),
        ('payment_sent', 'Payment Sent'),
        ('payment_received', 'Payment Received'),
        ('refund', 'Refund'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed')
    reference = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'wallet_transactions'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.transaction_type.upper()} | {self.amount} | {self.status}"


@receiver(post_save, sender=User)
def create_user_wallet(sender, instance, created, **kwargs):
    if created:
        Wallet.objects.get_or_create(user=instance)


from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

def send_ws_update(group, event_type, data):
    channel_layer = get_channel_layer()
    if channel_layer:
        async_to_sync(channel_layer.group_send)(
            group,
            {
                'type': 'send_update',
                'event_type': event_type,
                'data': data
            }
        )

@receiver(post_save, sender=Product)
def product_update_signal(sender, instance, **kwargs):
    from .serializers import ProductSerializer
    try:
        data = ProductSerializer(instance).data
        send_ws_update('global_updates', 'product_update', data)
    except Exception as e:
        pass

@receiver(post_save, sender=Order)
def order_update_signal(sender, instance, **kwargs):
    from .serializers import OrderSerializer
    try:
        data = OrderSerializer(instance).data
        send_ws_update(f'user_{instance.buyer.id}', 'order_update', data)
        send_ws_update(f'user_{instance.farmer.id}', 'order_update', data)
    except Exception as e:
        pass

@receiver(post_save, sender=Wallet)
def wallet_update_signal(sender, instance, **kwargs):
    from .serializers import WalletSerializer
    try:
        data = WalletSerializer(instance).data
        send_ws_update(f'user_{instance.user.id}', 'wallet_update', data)
    except Exception as e:
        pass

@receiver(post_save, sender=Delivery)
def delivery_update_signal(sender, instance, **kwargs):
    from .serializers import DeliverySerializer
    try:
        data = DeliverySerializer(instance).data
        # Broadcast pending and accepted status updates globally so transporters' requests streams sync instantly
        if instance.status in ['pending', 'accepted']:
            send_ws_update('global_updates', 'delivery_update', data)
            # Also notify the buyer, farmer, and the assigned transporter explicitly
            send_ws_update(f'user_{instance.order.buyer.id}', 'delivery_update', data)
            send_ws_update(f'user_{instance.order.farmer.id}', 'delivery_update', data)
            if instance.transporter:
                send_ws_update(f'user_{instance.transporter.id}', 'delivery_update', data)
        else:
            send_ws_update(f'user_{instance.order.buyer.id}', 'delivery_update', data)
            send_ws_update(f'user_{instance.order.farmer.id}', 'delivery_update', data)
            if instance.transporter:
                send_ws_update(f'user_{instance.transporter.id}', 'delivery_update', data)
    except Exception as e:
        pass

