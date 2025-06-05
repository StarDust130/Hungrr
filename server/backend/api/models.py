from django.db import models
import uuid

#! 🧁 Cafe Model
class Cafe(models.Model):
    name = models.CharField(max_length=100)
    location = models.TextField()
    # Clerk User ID or internal user FK
    owner_id = models.CharField(max_length=200)
    # 🔒 For soft delete or disabling
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    


    def __str__(self):
        return self.name


#! 🍽️ Table Model
class Table(models.Model):
    cafe = models.ForeignKey(
        Cafe, on_delete=models.CASCADE, related_name='tables')
    number = models.IntegerField()
    qr_token = models.UUIDField(
        default=uuid.uuid4, unique=True, editable=False)  # 🔐 Safer for QR links
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Table {self.number} - {self.cafe.name}"
   

#! 📝 MenuItem Model
class MenuItem(models.Model):
    cafe = models.ForeignKey(
        Cafe, on_delete=models.CASCADE, related_name='menu_items')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='menu_items/', blank=True, null=True)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    is_available = models.BooleanField(default=True)
    # 💡 Useful if item temporarily removed
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} - ₹{self.price}"


#! 🧾 Order Model
class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),          # New order
        ('accepted', 'Accepted'),        # Owner accepted
        ('preparing', 'Preparing'),      # Kitchen preparing
        ('ready', 'Ready to Serve'),     # Ready for waiter
        ('served', 'Served'),            # Delivered
        ('completed', 'Completed'),      # All done
    ]
    table = models.ForeignKey(
        Table, on_delete=models.CASCADE, related_name='orders')
    cafe = models.ForeignKey(
        Cafe, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(
        max_length=50, choices=STATUS_CHOICES, default='pending')
    total_price = models.DecimalField(
        max_digits=8, decimal_places=2, default=0.00)
    paid = models.BooleanField(default=False)
    cafe = models.ForeignKey(Cafe, on_delete=models.CASCADE, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} - {self.status}"


#! 🍔 OrderItem (Bridge for Order ↔ MenuItem with quantity)
class OrderItem(models.Model):
    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name='order_items')
    item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} x {self.item.name}"
