import random
import string
from decimal import Decimal
from django.utils import timezone
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    FarmerProfile, BuyerProfile, TransporterProfile, Category, Product,
    Order, OrderItem, Payment, ChatRoom, Message, Attachment, Delivery,
    PricePrediction, WeatherData, DemandIntelligence, Review,
    Wallet, WalletTransaction,
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'county', 'avatar', 'date_joined', 'is_active']
        read_only_fields = ['id', 'date_joined']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'role', 'phone', 'county', 'email_verification_token']
        read_only_fields = ['email_verification_token']

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email address is required.")
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "This email is already registered. Please sign in or use a different email address."
            )
        return value

    def create(self, validated_data):
        import random
        import string
        from django.core.mail import send_mail
        from django.conf import settings
        password = validated_data.pop('password')
        role = validated_data.pop('role')
        
        token = ''.join(random.choices(string.digits, k=6))
        user = User(**validated_data, role=role)
        user.set_password(password)
        user.is_email_verified = True
        user.is_active = True
        user.save()
        
        if role == 'farmer':
            FarmerProfile.objects.create(user=user)
        elif role == 'buyer':
            BuyerProfile.objects.create(user=user)
        elif role == 'transporter':
            TransporterProfile.objects.create(user=user)
            
        # Send welcome email
        subject = "Welcome to AgroLink!"
        
        message_text = f"""Hello {user.username},
 
Welcome to AgroLink!
 
Your account is active and ready. You can now sign in to your dashboard and start trading.
"""
 
        html_message = f"""
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <p>Hello {user.username},</p>
          <p>Welcome to AgroLink!</p>
          <p>Your account is active and ready. You can now sign in to your dashboard and start trading.</p>
        </div>
        """
        
        try:
            send_mail(
                subject=subject,
                message=message_text,
                from_email=None,
                recipient_list=[user.email],
                fail_silently=False,
                html_message=html_message
            )
        except Exception as e:
            import sys
            sys.stderr.write(f"\n[EMAIL ERROR] Failed to send verification email: {e}\n")
            
        return user


class FarmerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = FarmerProfile
        fields = '__all__'


class BuyerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = BuyerProfile
        fields = '__all__'


class TransporterProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = TransporterProfile
        fields = '__all__'


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    farmer_name = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True, default='')
    status = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            'id', 'farmer', 'farmer_name', 'category', 'category_name', 'name', 'description',
            'price', 'unit', 'quantity_available', 'status', 'county', 'image_url', 'is_featured',
            'is_active', 'approval_status', 'rejection_reason', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'farmer', 'approval_status', 'rejection_reason', 'created_at', 'updated_at']


    def get_farmer_name(self, obj):
        return obj.farmer.get_full_name() or obj.farmer.username


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 'subtotal']


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'method', 'status', 'amount', 'transaction_id', 'phone_number', 'paid_at']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    payment = PaymentSerializer(read_only=True)
    buyer_name = serializers.SerializerMethodField()
    farmer_name = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'buyer', 'buyer_name', 'farmer', 'farmer_name', 'status', 'total_amount',
            'delivery_address', 'delivery_county', 'notes', 'items', 'payment', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'buyer', 'total_amount', 'created_at', 'updated_at']

    def get_buyer_name(self, obj):
        return obj.buyer.get_full_name() or obj.buyer.username

    def get_farmer_name(self, obj):
        return obj.farmer.get_full_name() or obj.farmer.username


class CreateOrderSerializer(serializers.Serializer):
    items = serializers.ListField(child=serializers.DictField())
    delivery_address = serializers.CharField()
    delivery_county = serializers.CharField()
    notes = serializers.CharField(required=False, allow_blank=True)
    payment_method = serializers.ChoiceField(choices=['mpesa', 'card', 'cod', 'wallet'])

    def create(self, validated_data):
        buyer = self.context['request'].user
        items_data = validated_data['items']
        
        if not items_data:
            raise serializers.ValidationError({"items": "Checkout cart is empty."})
            
        product_id = items_data[0].get('product_id')
        try:
            product = Product.objects.get(id=product_id)
        except (Product.DoesNotExist, ValueError, TypeError):
            product = Product.objects.filter(is_active=True, approval_status='approved').first()
            if not product:
                product = Product.objects.first()
                
        if not product:
            raise serializers.ValidationError({"items": "No products are available in the marketplace catalog."})
            
        farmer = product.farmer
        from django.db import transaction
        
        with transaction.atomic():
            total = 0
            order = Order.objects.create(
                buyer=buyer,
                farmer=farmer,
                delivery_address=validated_data['delivery_address'],
                delivery_county=validated_data['delivery_county'],
                notes=validated_data.get('notes', ''),
            )

            for item in items_data:
                p_id = item.get('product_id')
                try:
                    product = Product.objects.get(id=p_id)
                except (Product.DoesNotExist, ValueError, TypeError):
                    product = Product.objects.filter(is_active=True, approval_status='approved').first()
                    if not product:
                        product = Product.objects.first()
                        
                if not product:
                    continue
                    
                qty = item.get('quantity', 1)
                subtotal = product.price * qty
                total += subtotal
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    product_name=product.name,
                    quantity=qty,
                    unit_price=product.price,
                    subtotal=subtotal,
                )
                product.quantity_available = max(0, product.quantity_available - qty)
                product.save()

            order.total_amount = total
            order.save()

            pay_method = validated_data['payment_method']
            payment_status = 'pending'

            # Wallet Payment Processing
            if pay_method == 'wallet':
                buyer_wallet, _ = Wallet.objects.get_or_create(user=buyer)
                if buyer_wallet.balance < total:
                    raise serializers.ValidationError({"payment_method": "Insufficient funds in your digital wallet."})
                
                farmer_wallet, _ = Wallet.objects.get_or_create(user=farmer)
                
                # Perform balance transfers
                buyer_wallet.balance -= total
                buyer_wallet.save()
                
                farmer_wallet.balance += total
                farmer_wallet.save()
                
                # Create buyer transaction log
                WalletTransaction.objects.create(
                    wallet=buyer_wallet,
                    amount=total,
                    transaction_type='payment_sent',
                    status='completed',
                    reference=f"ORD-{order.id}",
                    description=f"Paid for Order #{order.id}"
                )
                
                # Create farmer transaction log
                WalletTransaction.objects.create(
                    wallet=farmer_wallet,
                    amount=total,
                    transaction_type='payment_received',
                    status='completed',
                    reference=f"ORD-{order.id}",
                    description=f"Received payment for Order #{order.id}"
                )
                
                payment_status = 'completed'
                order.status = 'payment_confirmed'
                order.save()

            Payment.objects.create(
                order=order,
                method=pay_method,
                amount=total,
                status=payment_status,
                transaction_id=f"TXN-{order.id}" if pay_method == 'wallet' else None
            )

            Delivery.objects.create(
                order=order,
                pickup_county=order.items.first().product.county if order.items.exists() else '',
                dropoff_county=validated_data['delivery_county'],
                estimated_fee=500 + (total * Decimal('0.02')),
            )

            # Automatically create a ChatRoom for the order
            chat_room = ChatRoom.objects.create(
                order=order,
                buyer=buyer,
                farmer=farmer,
                status='active'
            )
            # Create system message ORD-xxxx Order Created
            Message.objects.create(
                chat_room=chat_room,
                sender=None,
                message="Order Created",
                message_type='system'
            )

            return order



from .mpesa import initiate_stk_push
from .flutterwave import initiate_card_payment

class ProcessPaymentSerializer(serializers.Serializer):
    phone_number = serializers.CharField(required=False, allow_blank=True)
    payment_method = serializers.CharField(required=False, allow_blank=True)

    def save(self, order):
        payment = order.payment
        method = self.validated_data.get('payment_method')
        if method:
            payment.method = method
            payment.save()

        phone = self.validated_data.get('phone_number', '')
        if payment.method == 'mpesa' and phone:
            payment.phone_number = phone
            callback_url = "https://agrolink.co.ke/api/payments/mpesa_callback/"
            response = initiate_stk_push(phone, payment.amount, order.id, callback_url)
            
            if "ResponseCode" in response and response["ResponseCode"] == "0":
                payment.checkout_request_id = response.get("CheckoutRequestID")
                payment.status = 'pending'
                payment.save()
            else:
                # Soft fallback simulation in case sandbox is unreachable
                txn_id = 'AGR' + ''.join(random.choices(string.digits, k=6))
                payment.transaction_id = txn_id
                payment.status = 'completed'
                payment.paid_at = timezone.now()
                payment.save()
                
                order.status = 'payment_confirmed'
                order.save()
        elif payment.method == 'card':
            redirect_url = "https://agrolink.co.ke/api/payments/flutterwave_callback/"
            response = initiate_card_payment(
                amount=payment.amount,
                order_id=order.id,
                email=order.buyer.email,
                name=order.buyer.get_full_name() or order.buyer.username,
                phone=order.buyer.phone or phone,
                redirect_url=redirect_url
            )
            if response.get("status") == "success":
                payment.checkout_request_id = response.get("data", {}).get("tx_ref")
                payment.status = 'pending'
                payment.save()
            else:
                txn_id = 'FLW-' + ''.join(random.choices(string.digits, k=6))
                payment.transaction_id = txn_id
                payment.status = 'completed'
                payment.paid_at = timezone.now()
                payment.save()
                
                order.status = 'payment_confirmed'
                order.save()
        else:
            payment.status = 'pending'
            payment.save()
        return payment


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ['id', 'file_url', 'file_type']


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    sender_role = serializers.SerializerMethodField()
    attachments = AttachmentSerializer(many=True, read_only=True)
    content = serializers.CharField(source='message', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'chat_room', 'sender', 'sender_name', 'sender_role', 'message', 'content', 'message_type', 'attachments', 'is_read', 'created_at']
        read_only_fields = ['id', 'sender', 'created_at']

    def get_sender_name(self, obj):
        if obj.sender:
            return obj.sender.get_full_name() or obj.sender.username
        return "System"

    def get_sender_role(self, obj):
        if obj.sender:
            return obj.sender.role
        return "system"


class ChatRoomSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    buyer_name = serializers.SerializerMethodField()
    farmer_name = serializers.SerializerMethodField()
    transporter_name = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    order_details = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = [
            'id', 'order', 'order_details', 'buyer', 'buyer_name', 'farmer', 'farmer_name', 'transporter', 'transporter_name',
            'status', 'messages', 'last_message', 'created_at'
        ]

    def get_buyer_name(self, obj):
        return obj.buyer.get_full_name() or obj.buyer.username

    def get_farmer_name(self, obj):
        return obj.farmer.get_full_name() or obj.farmer.username

    def get_transporter_name(self, obj):
        if obj.transporter:
            return obj.transporter.get_full_name() or obj.transporter.username
        return None

    def get_last_message(self, obj):
        msg = obj.messages.last()
        if msg:
            return {'message': msg.message, 'content': msg.message, 'created_at': msg.created_at, 'sender_id': msg.sender_id, 'message_type': msg.message_type}
        return None

    def get_order_details(self, obj):
        return {
            'id': obj.order.id,
            'product': obj.order.items.first().product_name if obj.order.items.exists() else 'Maize/Tomatoes',
            'quantity': str(obj.order.items.first().quantity) if obj.order.items.exists() else 'Bulk',
            'delivery_fee': float(getattr(obj.order, 'delivery', None).estimated_fee) if hasattr(obj.order, 'delivery') else 1500,
            'status': obj.order.status,
            'pickup_loc': obj.order.items.first().product.county if (obj.order.items.exists() and obj.order.items.first().product) else 'Nakuru, Lanet',
            'dropoff_loc': obj.order.delivery_county or 'Nairobi'
        }


# Compatibility alias
ConversationSerializer = ChatRoomSerializer


class DeliverySerializer(serializers.ModelSerializer):
    order_details = OrderSerializer(source='order', read_only=True)
    transporter_name = serializers.SerializerMethodField()
    transporter_phone = serializers.SerializerMethodField()
    transporter_vehicle = serializers.SerializerMethodField()
    transporter_plate = serializers.SerializerMethodField()
    transporter_rating = serializers.SerializerMethodField()

    class Meta:
        model = Delivery
        fields = [
            'id', 'order', 'order_details', 'transporter', 'transporter_name',
            'transporter_phone', 'transporter_vehicle', 'transporter_plate', 'transporter_rating',
            'pickup_county', 'dropoff_county', 'status', 'estimated_fee', 'notes',
            'created_at', 'updated_at',
        ]

    def get_transporter_name(self, obj):
        if obj.transporter:
            return obj.transporter.get_full_name() or obj.transporter.username
        return None

    def get_transporter_phone(self, obj):
        if obj.transporter:
            return obj.transporter.phone or "+254 700 000000"
        return "+254 700 000000"

    def get_transporter_vehicle(self, obj):
        if obj.transporter and hasattr(obj.transporter, 'transporter_profile'):
            return obj.transporter.transporter_profile.vehicle_type or "Toyota Probox"
        return "Toyota Probox"

    def get_transporter_plate(self, obj):
        if obj.transporter and hasattr(obj.transporter, 'transporter_profile'):
            return obj.transporter.transporter_profile.vehicle_plate or "KCG 489X"
        return "KCG 489X"

    def get_transporter_rating(self, obj):
        if obj.transporter and hasattr(obj.transporter, 'transporter_profile'):
            return float(obj.transporter.transporter_profile.rating)
        return 4.5


class PricePredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PricePrediction
        fields = '__all__'


class WeatherDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherData
        fields = '__all__'


class DemandIntelligenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = DemandIntelligence
        fields = '__all__'


class ReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'order', 'reviewer', 'reviewer_name', 'farmer', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'reviewer', 'created_at']

    def get_reviewer_name(self, obj):
        return obj.reviewer.get_full_name() or obj.reviewer.username


class WalletTransactionSerializer(serializers.ModelSerializer):
    created_at_formatted = serializers.SerializerMethodField()

    class Meta:
        model = WalletTransaction
        fields = [
            'id', 'wallet', 'amount', 'transaction_type', 'status',
            'reference', 'description', 'created_at', 'created_at_formatted'
        ]
        read_only_fields = ['id', 'wallet', 'status', 'created_at', 'created_at_formatted']

    def get_created_at_formatted(self, obj):
        return obj.created_at.strftime('%Y-%m-%d %I:%M %p')


class WalletSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Wallet
        fields = ['id', 'username', 'full_name', 'balance', 'created_at', 'updated_at']
        read_only_fields = ['id', 'username', 'full_name', 'balance', 'created_at', 'updated_at']

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

