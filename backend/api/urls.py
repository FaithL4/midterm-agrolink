from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CustomTokenView, RegisterView, me_view, CategoryViewSet, ProductViewSet,
    OrderViewSet, ConversationViewSet, DeliveryViewSet, PricePredictionViewSet,
    WeatherDataViewSet, DemandIntelligenceViewSet, ReviewViewSet,
    predict_price_view, farming_advisory_view, weather_view, dashboard_stats,
    UserManagementViewSet, forgot_password_view, mpesa_callback_view, flutterwave_callback_view,
    verify_otp_view, reset_password_view, verify_email_view,
    WalletViewSet, ImageUploadView,
)

router = DefaultRouter()
router.register('categories', CategoryViewSet)
router.register('products', ProductViewSet)
router.register('orders', OrderViewSet, basename='order')
router.register('conversations', ConversationViewSet, basename='conversation')
router.register('deliveries', DeliveryViewSet, basename='delivery')
router.register('predictions', PricePredictionViewSet)
router.register('weather-data', WeatherDataViewSet)
router.register('demand', DemandIntelligenceViewSet)
router.register('reviews', ReviewViewSet)
router.register('users', UserManagementViewSet, basename='user-mgmt')
router.register('wallet', WalletViewSet, basename='wallet')


urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', CustomTokenView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', me_view, name='me'),
    path('auth/forgot-password/', forgot_password_view, name='forgot_password'),
    path('auth/verify-otp/', verify_otp_view, name='verify_otp'),
    path('auth/reset-password/', reset_password_view, name='reset_password'),
    path('auth/verify-email/', verify_email_view, name='verify_email'),
    path('ai/predict/', predict_price_view, name='predict'),
    path('ai/advisory/', farming_advisory_view, name='advisory'),
    path('ai/weather/', weather_view, name='weather'),
    path('dashboard/stats/', dashboard_stats, name='dashboard-stats'),
    path('payments/mpesa_callback/', mpesa_callback_view, name='mpesa_callback'),
    path('payments/flutterwave_callback/', flutterwave_callback_view, name='flutterwave_callback'),
    path('upload/', ImageUploadView.as_view(), name='image_upload'),
    path('', include(router.urls)),
]
