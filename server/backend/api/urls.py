
from django.urls import path
from .views import get_all_cafes , get_cafe_by_id, create_cafe, update_cafe, delete_cafe

urlpatterns = [
    #! Cafes URLs ☕
    path('cafes/', get_all_cafes, name='get_all_cafes'), # Get
    path('cafes/<int:cafe_id>/', get_cafe_by_id, name='get _cafe_by_id'), # Get
    path('cafes/create/', create_cafe, name='create_cafe'), # Post
    path('cafes/update/<int:cafe_id>/', update_cafe, name='update_cafe'), # Put or Patch
    path('cafes/delete/<int:cafe_id>/', delete_cafe, name='delete_cafe'), # Delete(soft delete)

    #! Tables URLs 🍽️


]
         