
from django.urls import path
from .views import get_cafe_info_by_slug



urlpatterns = [
    path('cafe_info/<slug:slug>/', get_cafe_info_by_slug, name='get-cafe-info')

]