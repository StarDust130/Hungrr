from rest_framework import serializers
from .models import Cafe, Table, MenuItem, Order , OrderItem

#! Cafe Info Serializer 😌
class CafeInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cafe
        fields = 'name', 'tagline', 'bannerUrl', 'rating', 'reviews', 'openingTime'  , "slug"
        read_only_fields = ('is_active',)


#! Menu Item Serializer 😚
class MenuItemSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    isSpecial = serializers.SerializerMethodField()

    class Meta:
        model = MenuItem
        fields = [
            "id", "name", "price", "description",
            "image", "rating", "tags", "dietary", "isSpecial"
        ]

    def get_image(self, obj):
        return obj.food_image_url or ""

    def get_rating(self, obj):
        # Just return fixed rating for now or calculate from reviews later
        return 4.9

    def get_tags(self, obj):
        tags = []
        if obj.dietary == "vegan":
            tags.append("Vegan")
        if obj.isSpecial:
            tags.append("Bestseller")  # You can customize this later
        return tags

    def get_isSpecial(self, obj):
        return obj.isSpecial if hasattr(obj, 'isSpecial') else False
