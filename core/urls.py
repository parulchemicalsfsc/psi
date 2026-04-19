from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('about/', views.about, name='about'),
    path('capabilities/', views.capabilities, name='capabilities'),
    path('industries/', views.industries, name='industries'),
    path('blog/', views.blog, name='blog'),
    path('gallery/', views.gallery, name='gallery'),
    path('careers/', views.careers, name='careers'),
    path('contact/', views.contact, name='contact'),
    path('quote/', views.quote, name='quote'),
    path('book-meeting/', views.book_meeting, name='book_meeting'),
]
