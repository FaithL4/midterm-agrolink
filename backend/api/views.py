from django.db.models import Q, Count, Sum, Avg
from django.contrib.auth import get_user_model
from rest_framework import viewsets, status, generics, serializers
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import (
    FarmerProfile, BuyerProfile, TransporterProfile, Category, Product,
    Order, Payment, ChatRoom, Message, Attachment, Delivery,
    PricePrediction, WeatherData, DemandIntelligence, Review,
    Wallet, WalletTransaction,
)
from .serializers import (
    UserSerializer, RegisterSerializer, FarmerProfileSerializer,
    CategorySerializer, ProductSerializer, OrderSerializer, CreateOrderSerializer,
    ProcessPaymentSerializer, ChatRoomSerializer, MessageSerializer,
    DeliverySerializer, PricePredictionSerializer, WeatherDataSerializer,
    DemandIntelligenceSerializer, ReviewSerializer,
    WalletSerializer, WalletTransactionSerializer,
)
from .permissions import IsFarmer, IsBuyer, IsTransporter, IsAdmin

from .ai.predictions import predict_price, get_farming_advisory
from .ai.weather import get_weather

User = get_user_model()


class CustomTokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['email'] = user.email
        return token

    def validate(self, attrs):
        username = attrs.get('username')
        user = User.objects.filter(Q(username=username) | Q(email=username)).first()
        if not user:
            raise serializers.ValidationError({"detail": "This email does not exist. Please sign up."})
            
        # Make sure authentication passes by mapping email login to username
        attrs['username'] = user.username

        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data


class CustomTokenView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def me_view(request):
    user = request.user
    
    if request.method == 'DELETE':
        user.delete()
        return Response({'message': 'Account deleted successfully.'}, status=200)
    
    if request.method == 'PATCH':
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        if current_password and new_password:
            if not user.check_password(current_password):
                return Response({'error': 'Current password is incorrect.'}, status=400)
            user.set_password(new_password)
            user.save()
            return Response({'message': 'Password updated successfully.'})
            
        # 1. Update basic user details
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
        else:
            return Response(serializer.errors, status=400)
            
        # 2. Update nested profile details if provided
        profile_data = request.data.get('profile')
        if profile_data:
            if user.role == 'farmer' and hasattr(user, 'farmer_profile'):
                profile_serializer = FarmerProfileSerializer(user.farmer_profile, data=profile_data, partial=True)
                if profile_serializer.is_valid():
                    profile_serializer.save()
            elif user.role == 'buyer' and hasattr(user, 'buyer_profile'):
                from .serializers import BuyerProfileSerializer
                profile_serializer = BuyerProfileSerializer(user.buyer_profile, data=profile_data, partial=True)
                if profile_serializer.is_valid():
                    profile_serializer.save()
            elif user.role == 'transporter' and hasattr(user, 'transporter_profile'):
                from .serializers import TransporterProfileSerializer
                profile_serializer = TransporterProfileSerializer(user.transporter_profile, data=profile_data, partial=True)
                if profile_serializer.is_valid():
                    profile_serializer.save()

    data = UserSerializer(user).data
    if user.role == 'farmer' and hasattr(user, 'farmer_profile'):
        data['profile'] = FarmerProfileSerializer(user.farmer_profile).data
    elif user.role == 'buyer' and hasattr(user, 'buyer_profile'):
        from .serializers import BuyerProfileSerializer
        data['profile'] = BuyerProfileSerializer(user.buyer_profile).data
    elif user.role == 'transporter' and hasattr(user, 'transporter_profile'):
        from .serializers import TransporterProfileSerializer
        data['profile'] = TransporterProfileSerializer(user.transporter_profile).data
    return Response(data)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    queryset = Product.objects.all()

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'featured']:
            return [AllowAny()]
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsFarmer()]
        if self.action in ['approve', 'reject']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and (user.role == 'admin' or user.is_superuser):
            qs = Product.objects.all().select_related('farmer', 'category')
        else:
            qs = Product.objects.filter(is_active=True, approval_status='approved').select_related('farmer', 'category')
            
        search = self.request.query_params.get('search', '')
        category = self.request.query_params.get('category', '')
        county = self.request.query_params.get('county', '')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')

        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(description__icontains=search))
        if category:
            qs = qs.filter(category__slug=category)
        if county:
            qs = qs.filter(county__icontains=county)
        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)
        return qs.order_by('-is_featured', '-created_at')

    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user, approval_status='approved')

    def perform_update(self, serializer):
        serializer.save(approval_status='approved')


    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def featured(self, request):
        products = Product.objects.filter(is_featured=True, is_active=True, approval_status='approved')[:6]
        return Response(ProductSerializer(products, many=True).data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsFarmer])
    def mine(self, request):
        products = Product.objects.filter(farmer=request.user)
        return Response(ProductSerializer(products, many=True).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def approve(self, request, pk=None):
        product = self.get_object()
        product.approval_status = 'approved'
        product.rejection_reason = ''
        product.save()
        return Response(ProductSerializer(product).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def reject(self, request, pk=None):
        product = self.get_object()
        reason = request.data.get('reason', '').strip()
        product.approval_status = 'rejected'
        product.rejection_reason = reason
        product.save()
        return Response(ProductSerializer(product).data)



class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    queryset = Order.objects.all()

    def get_queryset(self):
        user = self.request.user
        if user.role == 'buyer':
            return Order.objects.filter(buyer=user).prefetch_related('items', 'payment')
        if user.role == 'farmer':
            return Order.objects.filter(farmer=user).prefetch_related('items', 'payment')
        if user.role == 'admin' or user.is_superuser:
            return Order.objects.all().prefetch_related('items', 'payment')
        return Order.objects.none()

    def create(self, request, *args, **kwargs):
        import sys
        sys.stderr.write(f"\n[DEBUG ORDER CREATION] Request Data: {request.data}\n")
        serializer = CreateOrderSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            sys.stderr.write(f"[DEBUG ORDER CREATION] Validation Errors: {serializer.errors}\n")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        order = serializer.save()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        order = self.get_object()
        if request.user.role != 'farmer' or order.farmer != request.user:
            return Response({'error': 'Not authorized'}, status=403)
        order.status = 'accepted'
        order.save()
        
        # Create system message
        for chat in order.chat_rooms.all():
            Message.objects.create(
                chat_room=chat,
                sender=None,
                message="Order Accepted",
                message_type='system'
            )
            
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        order = self.get_object()
        if request.user.role != 'farmer' or order.farmer != request.user:
            return Response({'error': 'Not authorized'}, status=403)
        order.status = 'rejected'
        order.save()
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        order = self.get_object()
        if order.buyer != request.user:
            return Response({'error': 'Not authorized'}, status=403)
        serializer = ProcessPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment = serializer.save(order)
        return Response({
            'message': 'Payment processed successfully' if payment.status == 'completed' else 'Payment pending on delivery',
            'transaction_id': payment.transaction_id,
            'payment': {'method': payment.method, 'status': payment.status, 'amount': str(payment.amount), 'checkout_request_id': payment.checkout_request_id},
        })

    @action(detail=True, methods=['post'])
    def simulate_mpesa_callback(self, request, pk=None):
        order = self.get_object()
        payment = getattr(order, 'payment', None)
        if not payment:
            from .models import Payment
            payment = Payment.objects.create(
                order=order,
                amount=order.total_amount,
                method='mpesa',
                status='pending'
            )
            
        checkout_request_id = payment.checkout_request_id or f"ws_CO_simulated_{order.id}"
        payment.checkout_request_id = checkout_request_id
        payment.save()
        
        import random
        import string
        from django.utils import timezone
        receipt = 'AGR' + ''.join(random.choices(string.digits, k=6))
        
        payment.status = 'completed'
        payment.transaction_id = receipt
        payment.paid_at = timezone.now()
        payment.save()
        
        order.status = 'payment_confirmed'
        order.save()
        return Response({
            'message': 'Simulated Safaricom Callback handled successfully!',
            'transaction_id': receipt,
            'payment': {'transaction_id': receipt, 'status': 'completed', 'paid_at': str(payment.paid_at)}
        })

    @action(detail=True, methods=['post'])
    def simulate_flutterwave_callback(self, request, pk=None):
        order = self.get_object()
        payment = getattr(order, 'payment', None)
        if not payment:
            from .models import Payment
            payment = Payment.objects.create(
                order=order,
                amount=order.total_amount,
                method='flutterwave',
                status='pending'
            )
            
        checkout_request_id = payment.checkout_request_id or f"AGR-FLW-{order.id}"
        payment.checkout_request_id = checkout_request_id
        payment.save()
        
        import random
        import string
        from django.utils import timezone
        flw_ref = 'FLW-' + ''.join(random.choices(string.digits, k=6))
        
        payment.status = 'completed'
        payment.transaction_id = flw_ref
        payment.paid_at = timezone.now()
        payment.save()
        
        order.status = 'payment_confirmed'
        order.save()
        return Response({
            'message': 'Simulated Flutterwave Webhook handled successfully!',
            'transaction_id': flw_ref,
            'payment': {'transaction_id': flw_ref, 'status': 'completed', 'paid_at': str(payment.paid_at)}
        })

    @action(detail=True, methods=['post'])
    def mark_ready(self, request, pk=None):
        order = self.get_object()
        if request.user.role != 'farmer' or order.farmer != request.user:
            return Response({'error': 'Not authorized'}, status=403)
        order.status = 'ready_for_pickup'
        order.save()
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['post'])
    def update_stage(self, request, pk=None):
        order = self.get_object()
        stage = request.data.get('stage')
        valid_stages = ['accepted', 'rejected', 'payment_confirmed', 'preparing', 'ready_for_pickup', 'picked_up', 'in_transit', 'delivered', 'completed', 'cancelled']
        if stage not in valid_stages:
            return Response({'error': 'Invalid stage'}, status=400)
        order.status = stage
        order.save()
        sync_order_chat_status(order, stage)
        return Response(OrderSerializer(order).data)


def sync_order_chat_status(order, status):
    for chat in order.chat_rooms.all():
        msg_text = ""
        if status == 'accepted':
            msg_text = "Order Accepted"
        elif status == 'ready_for_pickup':
            msg_text = "Products Prepared"
        elif status == 'picked_up' or status == 'product_collected':
            msg_text = "Products Picked Up"
        elif status == 'in_transit':
            msg_text = "Delivery Started"
        elif status == 'delivered' or status == 'completed':
            msg_text = "Delivery Completed"
            chat.status = 'archived'
            chat.save()
            
        if msg_text:
            Message.objects.create(
                chat_room=chat,
                sender=None,
                message=msg_text,
                message_type='system'
            )


class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticated]
    queryset = ChatRoom.objects.all()

    def get_queryset(self):
        user = self.request.user
        return ChatRoom.objects.filter(
            Q(buyer=user) | Q(farmer=user) | Q(transporter=user)
        ).prefetch_related('messages', 'messages__attachments').select_related('buyer', 'farmer', 'transporter', 'order')

    def create(self, request, *args, **kwargs):
        order_id = request.data.get('order_id')
        if not order_id:
            order = Order.objects.filter(buyer=request.user, farmer_id=request.data.get('farmer_id')).first()
        else:
            order = Order.objects.filter(id=order_id).first()

        if not order:
            return Response({'error': 'Order not found'}, status=400)

        conv, _ = ChatRoom.objects.get_or_create(
            order=order,
            buyer=order.buyer,
            farmer=order.farmer,
        )
        return Response(ChatRoomSerializer(conv).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        conv = self.get_object()
        if conv.status == 'archived':
            return Response({'error': 'Cannot send messages to an archived chat room.'}, status=400)

        content = request.data.get('content', '').strip()
        message_type = request.data.get('message_type', 'text')
        attachment_url = request.data.get('attachment_url', '')

        if not content and not attachment_url:
            return Response({'error': 'Message content or attachment required'}, status=400)

        msg = Message.objects.create(
            chat_room=conv,
            sender=request.user,
            message=content,
            message_type=message_type
        )
        if attachment_url:
            Attachment.objects.create(
                message=msg,
                file_url=attachment_url,
                file_type='image' if message_type == 'image' else 'file'
            )
        return Response(MessageSerializer(msg).data, status=201)


class DeliveryViewSet(viewsets.ModelViewSet):
    serializer_class = DeliverySerializer
    permission_classes = [IsAuthenticated]
    queryset = Delivery.objects.all()

    def get_queryset(self):
        user = self.request.user
        if user.role == 'transporter':
            status_filter = self.request.query_params.get('status')
            qs = Delivery.objects.all().select_related('order', 'transporter')
            if status_filter == 'available':
                return qs.filter(status='pending', transporter__isnull=True)
            return qs.filter(transporter=user)
        if user.role == 'farmer':
            return Delivery.objects.filter(order__farmer=user)
        if user.role == 'buyer':
            return Delivery.objects.filter(order__buyer=user)
        return Delivery.objects.all()

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsTransporter])
    def accept(self, request, pk=None):
        delivery = self.get_object()
        if delivery.transporter:
            return Response({'error': 'Already assigned'}, status=400)
        delivery.transporter = request.user
        delivery.status = 'accepted'
        delivery.save()
        delivery.order.status = 'accepted'
        delivery.order.save()
        
        # Add transporter to chat room and emit system message
        for chat in delivery.order.chat_rooms.all():
            chat.transporter = request.user
            chat.save()
            Message.objects.create(
                chat_room=chat,
                sender=None,
                message="Transporter Assigned",
                message_type='system'
            )
            
        return Response(DeliverySerializer(delivery).data)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        delivery = self.get_object()
        new_status = request.data.get('status')
        
        # Accept all transporter delivery status steps
        valid = [
            'accepted', 
            'travelling_to_pickup', 
            'picked_up', 
            'in_transit', 
            'arrived', 
            'delivered', 
            'cancelled'
        ]
        if new_status not in valid:
            return Response({'error': f'Invalid status: {new_status}'}, status=400)
            
        delivery.status = new_status
        delivery.save()
        
        # Synchronize corresponding order status
        if new_status == 'delivered':
            order = delivery.order
            order.status = 'delivered'
            order.save()
            
            # Settlement Payout Trigger
            from django.db import transaction
            with transaction.atomic():
                # 1. Payout Transporter Delivery Fee
                if delivery.transporter:
                    transporter_wallet, _ = Wallet.objects.get_or_create(user=delivery.transporter)
                    transporter_wallet.balance += delivery.estimated_fee
                    transporter_wallet.save()
                    WalletTransaction.objects.create(
                        wallet=transporter_wallet,
                        transaction_type='payout',
                        amount=delivery.estimated_fee,
                        reference=f"PAY-DEL-{delivery.id}",
                        status='completed',
                        description=f"Delivery fee for cargo DEL-{delivery.id}"
                    )
                
                # 2. Payout Farmer Product Amount
                farmer = order.farmer
                farmer_wallet, _ = Wallet.objects.get_or_create(user=farmer)
                farmer_wallet.balance += order.total_amount
                farmer_wallet.save()
                WalletTransaction.objects.create(
                    wallet=farmer_wallet,
                    transaction_type='deposit',
                    amount=order.total_amount,
                    reference=f"PAY-ORD-{order.id}",
                    status='completed',
                    description=f"Sales payout for order #{order.id}"
                )
        elif new_status == 'picked_up' or new_status == 'product_collected':
            delivery.order.status = 'picked_up'
            delivery.order.save()
        elif new_status == 'in_transit':
            delivery.order.status = 'in_transit'
            delivery.order.save()
        elif new_status == 'cancelled':
            delivery.order.status = 'cancelled'
            delivery.order.save()
            
        sync_order_chat_status(delivery.order, new_status)
        return Response(DeliverySerializer(delivery).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def predict_price_view(request):
    crop = request.query_params.get('crop', 'maize')
    county = request.query_params.get('county', 'Nakuru')
    weeks = int(request.query_params.get('weeks', 3))
    result = predict_price(crop, county, weeks)
    for k, v in result.items():
        if hasattr(v, 'quantize'):
            result[k] = float(v)
    return Response(result)


@api_view(['GET'])
@permission_classes([AllowAny])
def farming_advisory_view(request):
    crop = request.query_params.get('crop', 'maize')
    county = request.query_params.get('county', 'Nakuru')
    return Response(get_farming_advisory(crop, county))


@api_view(['GET'])
@permission_classes([AllowAny])
def weather_view(request):
    county = request.query_params.get('county', 'Nakuru')
    result = get_weather(county)
    result['temperature'] = float(result['temperature'])
    result['rainfall_mm'] = float(result['rainfall_mm'])
    return Response(result)


class PricePredictionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PricePrediction.objects.all().order_by('-created_at')
    serializer_class = PricePredictionSerializer
    permission_classes = [AllowAny]


class WeatherDataViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = WeatherData.objects.all().order_by('-created_at')
    serializer_class = WeatherDataSerializer
    permission_classes = [AllowAny]


class DemandIntelligenceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DemandIntelligence.objects.all()
    serializer_class = DemandIntelligenceSerializer
    permission_classes = [AllowAny]


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        review = serializer.save(reviewer=self.request.user)
        farmer_profile = review.farmer.farmer_profile
        avg = Review.objects.filter(farmer=review.farmer).aggregate(Avg('rating'))['rating__avg']
        if avg:
            farmer_profile.reliability_score = min(100, float(avg) * 20)
            farmer_profile.save()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    user = request.user
    data = {}

    if user.role == 'farmer':
        profile = getattr(user, 'farmer_profile', None)
        farmer_products = Product.objects.filter(farmer=user, is_active=True)
        data = {
            'products_count': farmer_products.count(),
            'available_products_count': farmer_products.filter(quantity_available__gt=20).count(),
            'low_stock_products_count': farmer_products.filter(quantity_available__gte=1, quantity_available__lte=20).count(),
            'out_of_stock_products_count': farmer_products.filter(quantity_available=0).count(),
            'pending_orders': Order.objects.filter(farmer=user, status='pending').count(),
            'total_orders': Order.objects.filter(farmer=user).count(),
            'revenue': Order.objects.filter(farmer=user).aggregate(
                total=Sum('total_amount'))['total'] or 0,
            'reliability_score': float(profile.reliability_score) if profile else 80,
        }
        weather = get_weather(user.county or 'Nakuru')
        weather['temperature'] = float(weather['temperature'])
        weather['rainfall_mm'] = float(weather['rainfall_mm'])
        data['weather'] = weather
        data['demand'] = list(DemandIntelligence.objects.filter(
            county__iexact=user.county)[:5].values()) if user.county else []

    elif user.role == 'buyer':
        data = {
            'orders_count': Order.objects.filter(buyer=user).count(),
            'pending_orders': Order.objects.filter(buyer=user, status='pending').count(),
            'total_spent': Order.objects.filter(buyer=user).aggregate(
                total=Sum('total_amount'))['total'] or 0,
        }

    elif user.role == 'transporter':
        data = {
            'active_deliveries': Delivery.objects.filter(transporter=user, status__in=['accepted', 'picked_up', 'in_transit']).count(),
            'completed_deliveries': Delivery.objects.filter(transporter=user, status='delivered').count(),
            'available_jobs': Delivery.objects.filter(status='pending', transporter__isnull=True).count(),
        }

    elif user.role == 'admin' or user.is_superuser:
        data = {
            'users_count': User.objects.count(),
            'farmers_count': User.objects.filter(role='farmer').count(),
            'buyers_count': User.objects.filter(role='buyer').count(),
            'products_count': Product.objects.filter(is_active=True).count(),
            'orders_count': Order.objects.count(),
            'revenue': Order.objects.filter(status='delivered').aggregate(
                total=Sum('total_amount'))['total'] or 0,
            'orders_by_status': list(
                Order.objects.values('status').annotate(count=Count('id'))
            ),
        }

    return Response(data)


from django.core.mail import send_mail
from django.conf import settings
import random
import string
from django.utils import timezone
from datetime import timedelta
import secrets

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password_view(request):
    from django.conf import settings
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email address is required.'}, status=400)
    
    user = User.objects.filter(email=email).first()
    if not user:
        return Response({'error': 'No user found with this email address'}, status=404)
        
    import random
    import string
    token = ''.join(random.choices(string.digits, k=6))
    user.otp_code = token
    user.otp_expires_at = timezone.now() + timedelta(minutes=15)
    user.save()
    
    # Print the reset code unconditionally for verification convenience
    import sys
    sys.stderr.write(f"\n=================== [DEBUG] PASSWORD RESET CODE ===================\n")
    sys.stderr.write(f"Email: {email}\n")
    sys.stderr.write(f"Reset Code (OTP): {token}\n")
    sys.stderr.write(f"====================================================================\n\n")
    sys.stderr.flush()

    
    subject = 'Reset Your Password'
    message_text = f"""Hello {user.username},

We received a request to reset your AgroLink password.

Your password reset code is:

{token}

This code expires in 15 minutes."""

    html_message = f"""
    <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <p>Hello {user.username},</p>
      <p>We received a request to reset your AgroLink password.</p>
      <p>Please enter the following reset code to update your password:</p>
      
      <div style="margin: 25px 0; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: 900; letter-spacing: 4px; text-align: center; color: #15803d;">
        {token}
      </div>
      
      <p style="font-size: 11px; color: #666;">This code expires in 15 minutes.</p>
    </div>
    """


    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'AgroLink <agrolink98@gmail.com>')
    
    try:
        send_mail(
            subject=subject,
            message=message_text,
            from_email=from_email,
            recipient_list=[email],
            fail_silently=False,
            html_message=html_message
        )
        return Response({'message': 'Reset code sent to your email successfully.'})
    except Exception as e:
        import sys
        sys.stderr.write(f"\n[BREVO SMTP ERROR] Failed to send reset code: {e}\n")
        sys.stderr.write(f"\n=================== BREVO SMTP RESET FALLBACK FOR {email} ===================\n")
        sys.stderr.write(f"Reset Code (OTP): {token}\n")
        sys.stderr.write(f"================================================-----------------------------\n\n")
        return Response({
            'message': 'Failed to send via Brevo SMTP. Reset Code printed to console log.',
            'reset_code_simulated': token
        })


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp_view(request):
    email = request.data.get('email')
    token = request.data.get('token') or request.data.get('otp')
    if not email or not token:
        return Response({'error': 'Email and Token are required'}, status=400)
        
    user = User.objects.filter(email=email).first()
    if not user or user.otp_code != token:
        return Response({'error': 'Invalid or expired reset token'}, status=400)
        
    if user.otp_expires_at < timezone.now():
        return Response({'error': 'Reset token has expired'}, status=400)
        
    return Response({'message': 'Reset token verified successfully'})

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_view(request):
    email = request.data.get('email')
    token = request.data.get('token') or request.data.get('otp')
    password = request.data.get('password')
    if not email or not token or not password:
        return Response({'error': 'Email, Token, and password are required'}, status=400)
        
    user = User.objects.filter(email=email).first()
    if not user or user.otp_code != token:
        return Response({'error': 'Invalid or expired reset token'}, status=400)
        
    if user.otp_expires_at < timezone.now():
        return Response({'error': 'Reset token has expired'}, status=400)
        
    user.set_password(password)
    user.otp_code = None
    user.otp_expires_at = None
    user.save()
    
    return Response({'message': 'Password reset successfully'})

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email_view(request):
    token = request.data.get('token')
    email = request.data.get('email')
    if not token:
        return Response({'error': 'Verification code/token is required'}, status=400)
        
    if email:
        user = User.objects.filter(email=email, email_verification_token=token).first()
    else:
        user = User.objects.filter(email_verification_token=token).first()
        
    if not user:
        return Response({'error': 'Invalid or expired verification code'}, status=400)
        
    user.is_email_verified = True
    user.is_active = True
    user.email_verification_token = None
    user.save()

    
    return Response({'message': 'Email verified successfully. You can now log in.'})



class UserManagementViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        return Response(UserSerializer(user).data)


from django.http import JsonResponse

def api_root_welcome(request):
    return JsonResponse({
        "name": "AgroLink API Gateway",
        "description": "Smart Farmer Marketplace & Crop Intelligence System Backend Services",
        "status": "operational",
        "api_root": "/api/",
        "admin_panel": "/admin/"
    })


from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def mpesa_callback_view(request):
    """
    Safaricom CallBackURL receives Lipa Na M-Pesa callbacks here.
    """
    data = request.data
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"M-Pesa Callback received payload: {data}")
    
    try:
        callback = data.get('Body', {}).get('stkCallback', {})
        result_code = callback.get('ResultCode')
        checkout_request_id = callback.get('CheckoutRequestID')
        
        # Locate the payment using checkout_request_id
        payment = Payment.objects.filter(checkout_request_id=checkout_request_id).last()
        if payment:
            if result_code == 0:
                metadata = callback.get('CallbackMetadata', {}).get('Item', [])
                receipt = None
                phone = None
                for item in metadata:
                    name = item.get('Name')
                    val = item.get('Value')
                    if name == 'MpesaReceiptNumber':
                        receipt = val
                    elif name == 'PhoneNumber':
                        phone = val
                
                payment.status = 'completed'
                payment.transaction_id = receipt or payment.transaction_id
                payment.paid_at = timezone.now()
                if phone:
                    payment.phone_number = str(phone)
                payment.save()
                
                order = payment.order
                order.status = 'payment_confirmed'
                order.save()
            else:
                payment.status = 'failed'
                payment.save()
    except Exception as e:
        logger.error(f"Error handling M-Pesa callback: {e}")
        
    return Response({"ResultCode": 0, "ResultDesc": "Success"})


@csrf_exempt
@api_view(['POST', 'GET'])
@permission_classes([AllowAny])
def flutterwave_callback_view(request):
    """
    Flutterwave receives webhook alerts or redirect payments here.
    """
    status = request.data.get('status') or request.query_params.get('status')
    tx_ref = request.data.get('tx_ref') or request.query_params.get('tx_ref')
    transaction_id = request.data.get('transaction_id') or request.query_params.get('transaction_id')
    
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"Flutterwave Callback details: status={status}, tx_ref={tx_ref}, txn_id={transaction_id}")
    
    try:
        payment = Payment.objects.filter(checkout_request_id=tx_ref).last()
        if payment:
            if status in ['successful', 'completed']:
                payment.status = 'completed'
                payment.transaction_id = transaction_id or payment.transaction_id
                payment.paid_at = timezone.now()
                payment.save()
                
                order = payment.order
                order.status = 'payment_confirmed'
                order.save()
            else:
                payment.status = 'failed'
                payment.save()
    except Exception as e:
        logger.error(f"Error handling Flutterwave callback: {e}")
        
    return Response({"status": "success", "message": "Callback processed"})


class WalletViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def get_wallet(self, user):
        wallet, _ = Wallet.objects.get_or_create(user=user)
        return wallet

    def list(self, request):
        wallet = self.get_wallet(request.user)
        return Response(WalletSerializer(wallet).data)

    @action(detail=False, methods=['get'])
    def transactions(self, request):
        wallet = self.get_wallet(request.user)
        txs = wallet.transactions.all()
        return Response(WalletTransactionSerializer(txs, many=True).data)

    @action(detail=False, methods=['post'])
    def deposit(self, request):
        from decimal import Decimal
        amount = request.data.get('amount')
        method = request.data.get('method', 'mpesa')
        phone = request.data.get('phone_number', '')
        
        if not amount or float(amount) <= 0:
            return Response({'error': 'Amount must be greater than zero'}, status=400)
            
        wallet = self.get_wallet(request.user)
        amount_decimal = Decimal(str(amount))
        
        wallet.balance += amount_decimal
        wallet.save()
        
        import uuid
        ref = f"DEP-{uuid.uuid4().hex[:8].upper()}"
        
        tx = WalletTransaction.objects.create(
            wallet=wallet,
            amount=amount_decimal,
            transaction_type='deposit',
            status='completed',
            reference=ref,
            description=f"Deposited via {method.upper()}" + (f" ({phone})" if phone else "")
        )
        
        return Response({
            'message': 'Deposit successful',
            'wallet': WalletSerializer(wallet).data,
            'transaction': WalletTransactionSerializer(tx).data
        })

    @action(detail=False, methods=['post'])
    def withdraw(self, request):
        from decimal import Decimal
        amount = request.data.get('amount')
        method = request.data.get('method', 'bank')
        target = request.data.get('target', '')
        
        if not amount or float(amount) <= 0:
            return Response({'error': 'Amount must be greater than zero'}, status=400)
            
        wallet = self.get_wallet(request.user)
        amount_decimal = Decimal(str(amount))
        
        if wallet.balance < amount_decimal:
            return Response({'error': 'Insufficient funds'}, status=400)
            
        wallet.balance -= amount_decimal
        wallet.save()
        
        import uuid
        ref = f"WTH-{uuid.uuid4().hex[:8].upper()}"
        
        tx = WalletTransaction.objects.create(
            wallet=wallet,
            amount=amount_decimal,
            transaction_type='withdrawal',
            status='completed',
            reference=ref,
            description=f"Withdrawn to {method.upper()}: {target}"
        )
        
        return Response({
            'message': 'Withdrawal successful',
            'wallet': WalletSerializer(wallet).data,
            'transaction': WalletTransactionSerializer(tx).data
        })


from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import default_storage
from django.conf import settings
import os

class ImageUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file uploaded'}, status=400)
        
        # Save the file using Django's default storage
        filename = default_storage.save(os.path.join('products', file_obj.name), file_obj)
        file_url = request.build_absolute_uri(settings.MEDIA_URL + filename)
        return Response({'image_url': file_url}, status=200)



