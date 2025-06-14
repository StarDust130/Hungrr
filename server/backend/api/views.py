from rest_framework.pagination import PageNumberPagination
from collections import OrderedDict, defaultdict 
from rest_framework import viewsets
from .models import Cafe, Table, MenuItem, Order , OrderItem , Category
from .serializers import CafeInfoSerializer, MenuItemSerializer
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status



#! Views for Customers 😋

#! Get Cafes info in menu page 🐼
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
    
#! 📦 API to get special menu items for a cafe   
@api_view(['GET'])
def get_special_menu_items(request, slug):
    try:
        cafe = Cafe.objects.get(slug=slug, is_active=True)
        special_items = MenuItem.objects.filter(
            cafe=cafe, is_active=True, isSpecial=True
        ).order_by('-id')[:6]  # or [:10]

        serializer = MenuItemSerializer(special_items, many=True)
        return Response({
            "success": True,
            "items": serializer.data
        })
    except Cafe.DoesNotExist:
        return Response({"detail": "Cafe not found"}, status=404)
   

# 📦 Pagination 
class MenuPagination(PageNumberPagination):
    page_size = 10  # show 10 items at a time
    page_size_query_param = 'page_size'


#! 📦 API to get all menu with pagination infinte scroll in frontend
@api_view(['GET'])
def get_cafe_menu(request, slug):
    try:
        cafe = Cafe.objects.get(slug=slug, is_active=True)

        # Get all active items
        items = MenuItem.objects.filter(cafe=cafe, is_active=True)

        # Group items by category name
        grouped = defaultdict(list)
        for item in items:
            grouped[item.category.name].append(item)

        # Sort category names
        categories = sorted(grouped.keys())

        # Get category index from query, default = 0
        category_index = int(request.GET.get("category_index", 0))

        if category_index >= len(categories):
            return Response({}, status=204)  # No more categories

        category_name = categories[category_index]
        category_items = grouped[category_name]

        # Serialize items
        serializer = MenuItemSerializer(category_items, many=True)

        # Final structure
        return Response({
            category_name: serializer.data
        })

    except Cafe.DoesNotExist:
        return Response({"detail": "Cafe not found"}, status=404)
    except Exception as e:
        return Response({"detail": str(e)}, status=500)
