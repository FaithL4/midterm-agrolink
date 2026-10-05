from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    User, FarmerProfile, BuyerProfile, TransporterProfile, Category, Product,
    Order, OrderItem, Payment, Conversation, Message, Delivery,
    PricePrediction, WeatherData, DemandIntelligence, Review,
)


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'role', 'county', 'is_active']
    list_filter = ['role', 'county']
    fieldsets = UserAdmin.fieldsets + (
        ('AgroLink', {'fields': ('role', 'phone', 'county', 'avatar')}),
    )


admin.site.register(FarmerProfile)
admin.site.register(BuyerProfile)
admin.site.register(TransporterProfile)
admin.site.register(Category)
admin.site.register(Product)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Payment)
admin.site.register(Conversation)
admin.site.register(Message)
admin.site.register(Delivery)
admin.site.register(PricePrediction)
admin.site.register(WeatherData)
admin.site.register(DemandIntelligence)
admin.site.register(Review)
