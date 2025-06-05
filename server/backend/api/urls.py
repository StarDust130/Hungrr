
from django.urls import path
from .views import get_all_cafes , get_cafe_by_id, create_cafe, get_table_by_id, update_cafe, delete_cafe , get_all_tables , get_all_menu_items, get_menu_item_by_id, create_menu_item, update_menu_item, delete_menu_item


urlpatterns = [
    #! Cafes URLs ☕
    path('cafes/', get_all_cafes, name='get_all_cafes'), # Get
    path('cafes/<int:cafe_id>/', get_cafe_by_id, name='get _cafe_by_id'), # Get
    path('cafes/create/', create_cafe, name='create_cafe'), # Post
    path('cafes/update/<int:cafe_id>/', update_cafe, name='update_cafe'), # Put or Patch
    path('cafes/delete/<int:cafe_id>/', delete_cafe, name='delete_cafe'), # Delete(soft delete)

    #! Tables URLs 🍽️
    path('tables/', get_all_tables, name='get_all_tables'), # Get
    path('tables/<int:table_id>/', get_table_by_id, name='get_table_by_id'), # Get
    path('tables/create/', create_cafe, name='create_table'), # Post
    path('tables/update/<int:table_id>/', update_cafe, name='update_table'), # Put or Patch
    path('tables/delete/<int:table_id>/', delete_cafe, name='delete_table'), # Delete(soft delete)

    
    #! Menu Items URLs 🍽️
    path('menu-items/', get_all_menu_items, name='get_all_menu_items'), # Get
    path('menu-items/<int:item_id>/', get_menu_item_by_id, name='get_menu_item_by_id'), # Get
    path('menu-items/create/', create_menu_item, name='create_menu_item'), # Post
    path('menu-items/update/<int:item_id>/', update_menu_item, name='update_menu_item'), # Put or Patch
    path('menu-items/delete/<int:item_id>/', delete_menu_item, name='delete_menu_item'), # Delete(soft delete)

    #! Orders URLs 📝


]
         