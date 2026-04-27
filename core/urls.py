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
    path('capabilities/press-shop/', views.press_shop, name='press_shop'),
    path('capabilities/tool-shop/', views.tool_shop, name='tool_shop'),
    path('capabilities/fabrication-shop/', views.fabrication_shop, name='fabrication_shop'),
    path('capabilities/cutting-bending-shop/', views.cutting_bending_shop, name='cutting_bending_shop'),
    path('capabilities/cnc-shop/', views.cnc_shop, name='cnc_shop'),
    path('capabilities/paint-shop/', views.paint_shop, name='paint_shop'),
    path('capabilities/measuring-inspection/', views.measuring, name='measuring'),
]
