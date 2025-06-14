
from django.urls import path
from .views import get_cafe_info_by_slug, get_cafe_menu, get_special_menu_items



urlpatterns = [
    path('cafe_info/<slug:slug>/', get_cafe_info_by_slug, name='get-cafe-info'),
    path('cafe_menu/<slug:slug>/special/',
         get_special_menu_items, name='get-cafe-special-menu'),
    path('cafe_menu/<slug:slug>/', get_cafe_menu,
         name='get-cafe-menu-by-category'),


]