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

# Get all tables in a cafe 🍽️
@api_view(['GET'])
def get_all_tables(request):
    tables = Table.objects.all()
    serializer = TableSerializer(tables, many=True)
    return Response(serializer.data)

# Get a single table by ID 🍽️
@api_view(['GET'])
def get_table_by_id(request, table_id):
    try:
        table = Table.objects.get(id=table_id)
        serializer = TableSerializer(table)
        return Response(serializer.data)
    except Table.DoesNotExist:
        return Response({"error": "Table not found"}, status=404)

# Create a new table in a cafe 🍽️
@api_view(['POST'])
def create_table(request):
    serializer = TableSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

# Update an existing table info 🍽️
@api_view(['PUT', 'PATCH'])
def update_table(request, table_id):
    try:
        table = Table.objects.get(id=table_id)
        partial = request.method == 'PATCH'
        serializer = TableSerializer(table, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    except Table.DoesNotExist:
        return Response({"error": "Table not found"}, status=404)

# Delete a table (is_active = False) 🍽️
@api_view(['DELETE'])
def delete_table(request, table_id):
    try:
        table = Table.objects.get(id=table_id)
        table.is_active = False
        table.save()
        return Response({"message": "Table deleted successfully"}, status=204)
    except Table.DoesNotExist:
        return Response({"error": "Table not found"}, status=404)
    
#! 📝 MenuItem 
# Get all menu items in a cafe 🍽️
@api_view(['GET'])
def get_all_menu_items(request):
    menu_items = MenuItem.objects.all()
    serializer = MenuItemSerializer(menu_items, many=True)
    return Response(serializer.data)

# Get a single menu item by ID 🍽️
@api_view(['GET'])
def get_menu_item_by_id(request, item_id):
    try:
        menu_item = MenuItem.objects.get(id=item_id)
        serializer = MenuItemSerializer(menu_item)
        return Response(serializer.data)
    except MenuItem.DoesNotExist:
        return Response({"error": "Menu item not found"}, status=404)
    

# Create a new menu item in a cafe 🍽️
@api_view(['POST'])
def create_menu_item(request):
    serializer = MenuItemSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

# Update an existing menu item info 🍽️
@api_view(['PUT', 'PATCH'])
def update_menu_item(request, item_id):
    try:
        menu_item = MenuItem.objects.get(id=item_id)
        partial = request.method == 'PATCH'
        serializer = MenuItemSerializer(menu_item, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    except MenuItem.DoesNotExist:
        return Response({"error": "Menu item not found"}, status=404)


# Delete a menu item (is_active = False) 🍽️
@api_view(['DELETE'])
def delete_menu_item(request, item_id):
    try:
        menu_item = MenuItem.objects.get(id=item_id)
        menu_item.is_active = False
        menu_item.save()
        return Response({"message": "Menu item deleted successfully"}, status=204)
    except MenuItem.DoesNotExist:
        return Response({"error": "Menu item not found"}, status=404)
    
    