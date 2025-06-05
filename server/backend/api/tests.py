from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import Cafe, Table, MenuItem, Order, OrderItem

# ✅ Cool terminal colors
GREEN = "\033[92m"
RESET = "\033[0m"


class APICRUDTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.cafe = Cafe.objects.create(
            name="Test Cafe", location="Bhilai", owner_id="owner123")
        self.table = Table.objects.create(cafe=self.cafe, number=1)
        self.menu_item = MenuItem.objects.create(
            cafe=self.cafe, name="Pizza", price=99.99)
        self.order = Order.objects.create(table=self.table, cafe=self.cafe)
        self.order_item = OrderItem.objects.create(
            order=self.order, item=self.menu_item, quantity=2)

    def test_cafe_crud(self):
        print(f"{GREEN}Running Cafe API test...{RESET}")
        res = self.client.get("/api/cafes/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_table_crud(self):
        print(f"{GREEN}Running Table API test...{RESET}")
        res = self.client.get("/api/tables/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_menu_item_crud(self):
        print(f"{GREEN}Running MenuItem API test...{RESET}")
        res = self.client.get("/api/menu-items/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_order_crud(self):
        print(f"{GREEN}Running Order API test...{RESET}")
        res = self.client.get("/api/orders/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_order_item_crud(self):
        print(f"{GREEN}Running OrderItem API test...{RESET}")
        res = self.client.get("/api/order-items/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
