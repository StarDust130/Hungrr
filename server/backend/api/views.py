from rest_framework import viewsets
from .models import Cafe, Table, MenuItem, Order , OrderItem
from .serializers import CafeInfoSerializer, TableSerializer, MenuItemSerializer, OrderSerializer, OrderItemSerializer
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status


#! Views for Customers 😋

#! Get Cafes info in menu page
@api_view(['GET'])
def get_cafe_info_by_slug(request, slug):
    try:
        cafe = Cafe.objects.get(slug=slug, is_active=True)
        serializer = CafeInfoSerializer(cafe)
        return Response({
            "success": True,
            "data": serializer.data
        })
    except Cafe.DoesNotExist:
        return Response({
            "success": False,
            "message": "Cafe not found"
        }, status=status.HTTP_404_NOT_FOUND)
