from rest_framework import viewsets
from .models import Cafe, Table, MenuItem, Order
from .serializers import CafeSerializer, TableSerializer, MenuItemSerializer, OrderSerializer
from rest_framework.response import Response
from rest_framework.decorators import api_view

#! Cafes Views 🧁

# Get all cafes ☕
@api_view(['GET'])
def get_all_cafes(request):
    cafes = Cafe.objects.all()
    serializer = CafeSerializer(cafes, many=True)
    return Response(serializer.data)

# Get a single cafe by ID 🥤
@api_view(['GET'])
def get_cafe_by_id(request, cafe_id):
    try:
        cafe = Cafe.objects.get(id=cafe_id)
        serializer = CafeSerializer(cafe)
        return Response(serializer.data)
    except Cafe.DoesNotExist:
        return Response({"error": "Cafe not found"}, status=404)
    
# Create a new cafe 🏪
@api_view(['POST'])
def create_cafe(request):
    serializer = CafeSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

# Update an existing cafe info🏠
@api_view(['PUT', 'PATCH'])
def update_cafe(request, cafe_id):
    try:
        cafe = Cafe.objects.get(id=cafe_id)
        partial = request.method == 'PATCH'
        serializer = CafeSerializer(cafe, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    except Cafe.DoesNotExist:
        return Response({"error": "Cafe not found 😢"}, status=404)

    
# Delete a cafe (is_active = False) 🗑️
@api_view(['DELETE'])
def delete_cafe(request, cafe_id):
    try:
        cafe = Cafe.objects.get(id=cafe_id)
        cafe.is_active = False
        cafe.save()
        return Response({"message": "Cafe deleted successfully 🥳"}, status=204)
    except Cafe.DoesNotExist:
        return Response({"error": "Cafe not found"}, status=404)


#! Tables Views 🍽️