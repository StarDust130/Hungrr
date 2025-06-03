from django.db import models

#! Cafe Model 🧁
class Cafe(models.Model):
    name = models.CharField(max_length=100)
    location = models.TextField()
    owner_id = models.CharField(max_length=200)  # Clerk user ID

#! Table Model 🍽️
class Table(models.Model):
    cafe = models.ForeignKey(Cafe, on_delete=models.CASCADE)
    number = models.IntegerField()
    qr_token = models.CharField(max_length=100, unique=True)

#! MenuItem Model 📝
class MenuItem(models.Model):
    cafe = models.ForeignKey(Cafe, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='menu_items/', blank=True, null=True)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    is_available = models.BooleanField(default=True)

#! Order Model 😇
class Order(models.Model):
    table = models.ForeignKey(Table, on_delete=models.CASCADE)
    items = models.ManyToManyField(MenuItem)
    status = models.CharField(max_length=50, choices=[
        ('pending', 'Pending'),
        ('preparing', 'Preparing'),
        ('served', 'Served'),
    ], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    paid = models.BooleanField(default=False)
