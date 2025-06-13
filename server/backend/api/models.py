from django.db import models
import uuid


# 🧁 Cafe Model
class Cafe(models.Model):
    # Using Clerk for auth, so store Clerk user ID directly
    owner_id = models.CharField(
        max_length=200,
        help_text='Clerk user ID who owns this cafe'
    )
    name = models.CharField(max_length=50)
    slug = models.SlugField(max_length=60, unique=True, blank=True)
    tagline = models.CharField(max_length=100, blank=True)
    banner_url = models.URLField(max_length=200, blank=True)
    location = models.TextField()
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=4.7)
    reviews = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

# 🍽️ Table Model
class Table(models.Model):
    cafe = models.ForeignKey(
        Cafe,
        on_delete=models.CASCADE,
        related_name='tables'
    )
    number = models.PositiveIntegerField()
    qr_token = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('cafe', 'number')

    def __str__(self):
        return f"Table {self.number} — {self.cafe.name}"

# 🍴 Category Model for menu grouping


class Category(models.Model):
    cafe = models.ForeignKey(
        Cafe,
        on_delete=models.CASCADE,
        related_name='categories'
    )
    name = models.CharField(max_length=50)

    class Meta:
        unique_together = ('cafe', 'name')

    def __str__(self):
        return f"{self.name} ({self.cafe.name})"

# 🍽️ MenuItem Model


class MenuItem(models.Model):
    cafe = models.ForeignKey(
        Cafe,
        on_delete=models.CASCADE,
        related_name='menu_items'
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='items'
    )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    food_image_url = models.URLField(
        max_length=200, 
        blank=True,
        null=True,
        help_text='URL of the food image'
    )
    price = models.DecimalField(max_digits=8, decimal_places=2)

    DIETARY_CHOICES = [
        ('veg', 'Veg'),
        ('non_veg', 'Non-Veg'),
        ('vegan', 'Vegan'),
    ]
    dietary = models.CharField(
        max_length=20,
        choices=DIETARY_CHOICES,
        blank=True,
        null=True
    )
    is_available = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} — ₹{self.price}"

# 🧾 Order Model


class Order(models.Model):
    PAYMENT_METHODS = [
        ('counter', 'Pay at Counter'),
        ('online', 'Online Payment'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('preparing', 'Preparing'),
        ('ready', 'Ready'),
        ('completed', 'Completed'),
    ]

    # Linking via Table ensures we know which table this order belongs to
    table = models.ForeignKey(
        Table,
        on_delete=models.CASCADE,
        related_name='orders'
    )
    cafe = models.ForeignKey(
        Cafe,
        on_delete=models.CASCADE,
        related_name='orders'
    )
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHODS,
        default='counter'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    total_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00
    )
    paid = models.BooleanField(default=False)
    payment_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} — {self.status}"

# 🍔 OrderItem (Bridge between Order & MenuItem)


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='order_items'
    )
    item = models.ForeignKey(
        MenuItem,
        on_delete=models.CASCADE,
        related_name='order_items'
    )
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} x {self.item.name}"

# 🫦 Bill Model


class Bill(models.Model):
    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name='bill'
    )
    issued_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Bill for Order #{self.order.id}"


# :TODO For Razorpay
# # ✨ Payment Record (optional for audit)
# class Payment(models.Model):
#     bill = models.ForeignKey(
#         Bill,
#         on_delete=models.CASCADE,
#         related_name='payments'
#     )
#     transaction_id = models.CharField(max_length=100, unique=True)
#     method = models.CharField(max_length=20, choices=Order.PAYMENT_METHODS)
#     amount = models.DecimalField(max_digits=10, decimal_places=2)
#     success = models.BooleanField(default=False)
#     timestamp = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"Payment {self.transaction_id} — {'Success' if self.success else 'Failed'}"


# User :TODO (later)
# class User(models.Model):
#     USER_TYPE_CHOICES = [
#         ('customer', 'Customer'),
#         ('owner', 'Cafe Owner'),
#         ('chief', 'Chief'),
#         ('staff', 'Cafe Staff'),
#         ('superadmin', 'Super Admin'),
#     ]
#     # Using Clerk for auth, so store Clerk user ID directly
#     clerk_user_id = models.CharField(max_length=200, unique=True)
#     name = models.CharField(max_length=100)
#     email = models.EmailField(unique=True)
#     profile_picture = models.URLField(max_length=200, blank=True, null=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     def __str__(self):
#         return self.name
