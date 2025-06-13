from rest_framework import serializers
from .models import Cafe, Table, MenuItem, Order , OrderItem


class CafeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cafe
        fields = 'name', 'tagline', 'bannerUrl', 'rating', 'reviews', 'openingTime' , "slug"
        read_only_fields = ('is_active',)


class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = '__all__'


class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = '__all__'


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = '__all__'