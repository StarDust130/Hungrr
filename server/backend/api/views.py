from .models import Cafe, Table, MenuItem, Order
from .serializers import CafeSerializer, TableSerializer, MenuItemSerializer, OrderSerializer

# Create your views here.

from rest_framework import viewsets
from .models import Cafe, Table, MenuItem, Order
from .serializers import CafeSerializer, TableSerializer, MenuItemSerializer, OrderSerializer


class CafeViewSet(viewsets.ModelViewSet):
    queryset = Cafe.objects.all()
    serializer_class = CafeSerializer


class TableViewSet(viewsets.ModelViewSet):
    queryset = Table.objects.all()
    serializer_class = TableSerializer


class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
