from django.urls import path
from . import views

urlpatterns = [
    path('', views.lobby),
    path('room/', views.room),
    path('get-token/', views.getToken),
    path('create-member/', views.createUser),
    path('get-member/', views.getMember),
    path('delete-member/', views.deletMember)
]
